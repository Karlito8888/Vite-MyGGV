# Design Document: Header Realtime Subscription

## Current Implementation Analysis

### Header Component Structure
- Uses `useAuth` hook to get authenticated user
- Fetches messages via `listActiveHeaderMessages()` service function
- Displays messages in a carousel with transitions
- Has loading, error, and empty states
- Already has proper React hooks structure (useEffect, useState, useCallback)

### Messages Header Table Structure
```sql
CREATE TABLE public.messages_header (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  coins_spent integer DEFAULT 0,
  expires_at timestamp with time zone,
  CONSTRAINT messages_header_pkey PRIMARY KEY (id),
  CONSTRAINT messages_header_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
```

### Current Service Function
- `listActiveHeaderMessages()` filters non-expired messages
- Orders by `created_at` descending
- Includes user profile data via join
- Uses RLS policies for access control

## Proposed Implementation

### Realtime Subscription Pattern
Based on Supabase documentation, the JavaScript pattern is:

```javascript
const channel = supabase
  .channel('header-messages-changes')
  .on(
    'postgres_changes',
    {
      event: '*', // Listen to INSERT, UPDATE, DELETE
      schema: 'public', 
      table: 'messages_header'
    },
    (payload) => {
      // Handle the change
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

### Integration Strategy

1. **Subscription Setup**: Add realtime subscription alongside existing fetch logic
2. **State Management**: Use existing `messages` state, update it when changes arrive
3. **Lifecycle Management**: Setup in `useEffect`, cleanup on unmount
4. **Error Handling**: Handle subscription errors gracefully
5. **Filtering**: RLS will automatically filter based on user authentication

### Component Changes

#### New State Variables
```javascript
const [subscription, setSubscription] = useState(null)
const [subscriptionError, setSubscriptionError] = useState(null)
```

#### Enhanced useEffect for Realtime
```javascript
useEffect(() => {
  if (user) {
    fetchMessages()
    
    // Setup realtime subscription
    const channel = supabase
      .channel('header-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages_header'
        },
        (payload) => {
          // Refetch messages on any change
          fetchMessages()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setSubscriptionError(null)
        } else if (status === 'CHANNEL_ERROR') {
          setSubscriptionError('Realtime connection failed')
        }
      })
    
    setSubscription(channel)
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  } else {
    // Cleanup when user logs out
    if (subscription) {
      supabase.removeChannel(subscription)
      setSubscription(null)
    }
    setMessages([])
    setError(null)
    setLoading(false)
    setCurrentMessageIndex(0)
  }
}, [user, fetchMessages])
```

### Benefits of This Approach

1. **Simple Integration**: Leverages existing `fetchMessages()` function
2. **RLS Compliance**: Database automatically filters based on user context
3. **Minimal Changes**: Doesn't disrupt existing carousel logic
4. **Error Resilient**: Falls back to manual fetch if realtime fails
5. **Performance**: Only refetches when actual changes occur

### Considerations

1. **Network Usage**: Realtime connections use persistent WebSocket
2. **Mobile Data**: Should be considered for mobile users
3. **Connection State**: Handle offline/online scenarios
4. **Subscription Limits**: Be aware of Supabase connection limits

## Testing Strategy

### Manual Testing
1. Create new message in database → Header updates immediately
2. Update existing message → Header reflects changes  
3. Delete message → Header removes message
4. Navigate away/back → Subscription properly cleaned up
5. Logout/login → Subscription state correctly managed

### Error Scenarios
1. Network disconnect → Graceful fallback
2. Subscription failure → Error state displayed
3. Database permissions → RLS blocks unauthorized access