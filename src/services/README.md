# Supabase CRUD Services

Centralized service layer for all database operations using Supabase SDK. Each service respects Row Level Security (RLS) policies defined in the database.

## Architecture

- **One service per table**: Each database table has its own dedicated service module
- **Consistent patterns**: All services follow the same CRUD patterns
- **RLS enforcement**: Security is enforced by Supabase RLS policies
- **Error handling**: All functions return `{ data, error }` format
- **JSDoc documentation**: Every function is documented with types and descriptions

## Service Response Format

All service functions return a consistent response format:

```javascript
{
  data: Object|Array|null,  // Result data (null on error)
  error: Error|null          // Error object (null on success)
}
```

## Usage Examples

### Basic CRUD Operations

```javascript
import { listProfiles, getProfileById, updateProfile } from './services/profilesService'

// List all profiles
const { data: profiles, error } = await listProfiles()
if (error) {
  // Handle error
} else {
  // Use profiles data
}

// Get specific profile
const { data: profile, error: profileError } = await getProfileById(userId)

// Update profile
const { data: updated, error: updateError } = await updateProfile(userId, {
  full_name: 'John Doe',
  description: 'Updated bio'
})
```

### Category Services

```javascript
import { 
  listBusinessInsideCategories, 
  createBusinessInsideCategory 
} from './services/businessInsideCategoriesService'

// List active categories
const { data: categories } = await listBusinessInsideCategories()

// Create new category (requires authentication)
const { data: newCategory, error } = await createBusinessInsideCategory({
  name: 'Restaurants',
  description: 'Food and dining establishments',
  icon: 'restaurant'
})
```

### Business Services

```javascript
import { 
  listActiveBusinessesInside,
  listMyBusinessesInside,
  createBusinessInside,
  updateBusinessInside,
  deleteBusinessInside
} from './services/userBusinessInsideService'

// List all active businesses
const { data: businesses } = await listActiveBusinessesInside()

// List user's own businesses
const { data: myBusinesses } = await listMyBusinessesInside(userId)

// Create business (RLS ensures profile_id matches auth.uid())
const { data: business, error } = await createBusinessInside({
  profile_id: userId,
  category_id: categoryId,
  business_name: 'My Business',
  description: 'Business description',
  is_active: true
})

// Update business
const { data: updated } = await updateBusinessInside(businessId, {
  description: 'Updated description'
})

// Delete business
const { data: deleted } = await deleteBusinessInside(businessId)
```

### Marketplace Services

```javascript
import { 
  listActiveListings,
  createListing,
  markListingAsSold,
  searchListings
} from './services/marketplaceListingsService'

// List active listings
const { data: listings } = await listActiveListings()

// Create listing
const { data: listing } = await createListing({
  profile_id: userId,
  title: 'Laptop for Sale',
  description: 'Barely used laptop',
  price: 25000,
  currency: 'PHP',
  listing_type: 'selling',
  category: 'Electronics'
})

// Mark as sold
await markListingAsSold(listingId)

// Search listings
const { data: results } = await searchListings('laptop')
```

### Messaging Services

```javascript
import { 
  sendPrivateMessage,
  getConversationMessages,
  markMessageAsRead,
  subscribeToPrivateMessages
} from './services/privateMessagesService'

// Send private message
const { data: message } = await sendPrivateMessage({
  receiver_id: otherUserId,
  message: 'Hello!',
  message_type: 'text'
})

// Get conversation
const { data: messages } = await getConversationMessages(userId, otherUserId)

// Mark as read
await markMessageAsRead(messageId)

// Real-time subscription
const subscription = subscribeToPrivateMessages(userId, (newMessage) => {
  // Handle new message
})

// Cleanup
subscription.unsubscribe()
```

### Location Services

```javascript
import { 
  listLocations,
  getLocationByBlockLot,
  createLocation  // Admin only
} from './services/locationsService'

// List all locations
const { data: locations } = await listLocations()

// Find location by block and lot
const { data: location } = await getLocationByBlockLot('A', '123')

// Create location (admin only, RLS enforced)
const { data: newLocation } = await createLocation({
  block: 'B',
  lot: '456',
  coordinates: { type: 'Point', coordinates: [120.0, 14.0] }
})
```

### Forum Services

```javascript
import { listForums, createForum } from './services/forumsService'
import { listThreads, createThread } from './services/threadsService'

// List forums
const { data: forums } = await listForums()

// Create forum (requires authentication)
const { data: forum } = await createForum({
  title: 'General Discussion',
  description: 'Talk about anything'
})

// List threads in forum
const { data: threads } = await listThreads(forumId)

// Create thread
const { data: thread } = await createThread({
  forum_id: forumId,
  title: 'Welcome to the forum!'
})
```

## Error Handling Patterns

### Basic Error Handling

```javascript
const { data, error } = await someServiceFunction()

if (error) {
  // Handle error (show toast, etc.)
  return
}

// Use data
```

### Try-Catch for Additional Safety

```javascript
try {
  const { data, error } = await someServiceFunction()
  
  if (error) throw error
  
  // Use data
  return data
} catch (err) {
  // Handle error
}
```

### React Component Example

```javascript
import { useState, useEffect } from 'react'
import { listActiveBusinessesInside } from './services/userBusinessInsideService'

function BusinessList() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadBusinesses() {
      const { data, error } = await listActiveBusinessesInside()
      
      if (error) {
        setError(error.message)
      } else {
        setBusinesses(data)
      }
      
      setLoading(false)
    }

    loadBusinesses()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {businesses.map(business => (
        <div key={business.id}>{business.business_name}</div>
      ))}
    </div>
  )
}
```

## RLS Policy Summary

### Public Read Access
- All category tables
- `profiles`
- `locations`
- `forums`, `threads`
- Active marketplace listings
- Active businesses and services

### Owner-Only Write Access
- `profiles` (own profile)
- `user_business_inside`, `user_business_outside` (own businesses)
- `user_services` (own services)
- `marketplace_listings` (own listings)
- `private_messages` (as sender)
- `chat` (own messages)

### Admin-Only Access
- `locations` (create, update, delete)
- All statistics (read all)

### Special Access Patterns
- **Private messages**: Sender or receiver can read
- **Location associations**: Owner or admin can manage
- **Conversation deletions**: User-specific soft deletes

## Base Service Utilities

The `baseService.js` module provides common utilities:

```javascript
import { executeQuery, getCurrentUser, isAdmin } from './baseService'

// Execute query with error handling
const result = await executeQuery(supabaseQuery)

// Get current user
const { user, error } = await getCurrentUser()

// Check admin status
const adminStatus = await isAdmin()
```

## Best Practices

1. **Always check for errors** before using data
2. **Use RLS policies** instead of manual permission checks
3. **Keep services simple** - one responsibility per function
4. **Document RLS policies** at the top of each service file
5. **Use JSDoc comments** for all exported functions
6. **Return consistent format** - always `{ data, error }`
7. **Let Supabase handle auth** - RLS enforces security automatically

## Service Index

### Categories
- `businessInsideCategoriesService.js`
- `businessOutsideCategoriesService.js`
- `serviceCategoriesService.js`

### Profiles & Users
- `profilesService.js`
- `userStatisticsService.js`

### Locations
- `locationsService.js`
- `profileLocationAssociationsService.js`
- `locationAssociationRequestsService.js`

### Businesses
- `userBusinessInsideService.js`
- `userBusinessOutsideService.js`
- `userServicesService.js`

### Marketplace
- `marketplaceListingsService.js`

### Messaging
- `chatService.js`
- `privateMessagesService.js`
- `messagesHeaderService.js`
- `conversationDeletionsService.js`
- `conversationCleanupNotificationsService.js`

### Forums
- `forumsService.js`
- `threadsService.js`

### Base Utilities
- `baseService.js`
