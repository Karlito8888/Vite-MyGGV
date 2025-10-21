# Authentication Helpers Documentation

## Overview

`authHelpers.js` provides a collection of utility functions for handling authentication in the application. These helpers are built on top of Supabase Auth and follow modern best practices for JWT verification with asymmetric signing keys.

## Key Principles

### Why `getUser()` instead of `getSession()` or `getClaims()`?

This module uses `supabase.auth.getUser()` as the primary authentication method because:

1. **Security**: `getUser()` validates the JWT against the Supabase Auth server, ensuring the token hasn't been tampered with
2. **Compatibility**: Works with asymmetric JWT signing keys (RSA, Elliptic Curves) which are the modern standard
3. **Future-proof**: `getSession()` is deprecated and will be removed in future Supabase versions
4. **Fresh data**: Always returns up-to-date user information from the server

### Authentication Flow

```
User Login → JWT Token Stored → getUser() validates JWT → User Data Retrieved
```

## Fonctions principales

### `getCurrentUserWithClaims()`

**Objectif** : Fonction principale pour obtenir l'utilisateur authentifié actuel avec validation complète.

**Retourne** : 
```javascript
{
  user: Object | null,  // Objet utilisateur avec toutes les propriétés
  error: Error | null,  // Erreur si l'authentification a échoué
  method: 'getUser'     // Méthode utilisée pour le suivi
}
```

**Structure de l'objet utilisateur** :
```javascript
{
  id: string,              // UUID utilisateur
  email: string | null,    // Email utilisateur
  role: string,            // 'authenticated' ou 'anon'
  aud: string,             // Claim audience
  exp: number | null,      // Timestamp d'expiration
  iat: number | null,      // Timestamp de création
  iss: string | null,      // Émetteur
  session_id: string | null,
  is_anonymous: boolean,
  app_metadata: Object,    // Métadonnées d'application
  user_metadata: Object,   // Métadonnées définies par l'utilisateur
  phone: string | null
}
```

**Utilisation** :
```javascript
const { user, error } = await getCurrentUserWithClaims()

if (error) {
  console.error('Authentication failed:', error)
  return
}

if (user) {
  console.log('User authenticated:', user.email)
}
```

**Comportement spécial** :
- Retourne `{ user: null, error: null }` quand l'utilisateur n'est pas connecté (pas un état d'erreur)
- Ne log que les vraies erreurs, pas `AuthSessionMissingError` qui est attendu

---

### `extractUserFromClaims(claims)`

**Purpose**: Legacy function to extract user information from JWT claims structure.

**Parameters**:
- `claims` (Object): JWT claims object

**Returns**: User object or `null` if invalid

**Note**: This function is maintained for backward compatibility but is not the primary method for getting user data.

---

### `isValidClaims(claims)`

**Purpose**: Verify if JWT claims are valid and not expired.

**Parameters**:
- `claims` (Object): JWT claims with `exp` and `sub` properties

**Returns**: `boolean` - `true` if claims are valid and not expired

**Usage**:
```javascript
const claims = { sub: 'user-id', exp: 1234567890 }
if (isValidClaims(claims)) {
  // Claims are valid
}
```

---

### `getUserIdFromClaims()`

**Purpose**: Quick way to get just the user ID without full user object.

**Returns**: `Promise<string | null>` - User ID or null

**Usage**:
```javascript
const userId = await getUserIdFromClaims()
if (userId) {
  // User is authenticated
}
```

**Use Case**: Useful for quick authentication checks where you only need the ID.

---

### `getAuthenticatedUserId()`

**Purpose**: Get user ID with explicit error handling.

**Returns**: 
```javascript
{
  userId: string | null,
  error: Error | null
}
```

**Usage**:
```javascript
const { userId, error } = await getAuthenticatedUserId()

if (error) {
  console.error('Not authenticated')
  return
}

// Use userId
```

---

### `getUserClaims()`

**Purpose**: Get user data in a claims-like structure for backward compatibility.

**Returns**: 
```javascript
{
  data: { claims: Object | null },
  error: Object | null
}
```

**Note**: Despite the name, this function uses `getUser()` internally. The name is kept for backward compatibility.

---

### `getUser()`

**Purpose**: Direct wrapper around `supabase.auth.getUser()`.

**Returns**: 
```javascript
{
  data: { user: Object | null },
  error: Object | null
}
```

**Usage**:
```javascript
const { data, error } = await getUser()

if (error) {
  console.error('Error:', error)
  return
}

if (data.user) {
  console.log('User:', data.user.email)
}
```

---

### `isAuthenticated()`

**Purpose**: Simple boolean check if user is authenticated.

**Returns**: `Promise<boolean>`

**Usage**:
```javascript
if (await isAuthenticated()) {
  // User is logged in
} else {
  // User is not logged in
}
```

**Use Case**: Perfect for conditional rendering or route guards.

---

### `getUserEmail()`

**Purpose**: Get just the user's email address.

**Returns**: `Promise<string | null>`

**Usage**:
```javascript
const email = await getUserEmail()
if (email) {
  console.log('User email:', email)
}
```

---

### `getUserRole()`

**Purpose**: Get the user's role from their profile or app metadata.

**Returns**: `Promise<string | null>`

**Usage**:
```javascript
const role = await getUserRole()
if (role === 'admin') {
  // Show admin features
}
```

**Note**: Checks both `user.role` and `user.app_metadata.role`.

---

### `handleAuthError(error)`

**Purpose**: Standardize error handling across authentication operations.

**Parameters**:
- `error` (Object): Error object from Supabase Auth

**Returns**: 
```javascript
{
  message: string,  // Human-readable error message
  code: string,     // Error code for programmatic handling
  status: number    // HTTP status code if available
}
```

**Usage**:
```javascript
try {
  await supabase.auth.signIn(credentials)
} catch (error) {
  const { message, code } = handleAuthError(error)
  console.error(`[${code}] ${message}`)
}
```

## Integration Examples

### With React Context

```javascript
// UserContext.jsx
import { getCurrentUserWithClaims } from '../utils/authHelpers'

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const { user: authUser } = await getCurrentUserWithClaims()
      setUser(authUser)
      setLoading(false)
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { user: authUser } = await getCurrentUserWithClaims()
          setUser(authUser)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}
```

### Protected Route

```javascript
import { isAuthenticated } from '../utils/authHelpers'

export function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await isAuthenticated()
      setAuthenticated(isAuth)
      setChecking(false)
      
      if (!isAuth) {
        navigate('/login')
      }
    }

    checkAuth()
  }, [navigate])

  if (checking) return <div>Loading...</div>

  return authenticated ? children : null
}
```

### Quick User ID Check

```javascript
import { getUserIdFromClaims } from '../utils/authHelpers'

async function saveUserPreference(preference) {
  const userId = await getUserIdFromClaims()
  
  if (!userId) {
    throw new Error('User must be authenticated')
  }

  await supabase
    .from('preferences')
    .upsert({ user_id: userId, ...preference })
}
```

## Migration Guide

### From `getSession()` to `getUser()`

**Before**:
```javascript
const { data: { session } } = await supabase.auth.getSession()
const user = session?.user
```

**After**:
```javascript
const { user } = await getCurrentUserWithClaims()
```

### From `getClaims()` to `getUser()`

**Before**:
```javascript
const { data: { claims } } = await supabase.auth.getClaims()
const userId = claims?.sub
```

**After**:
```javascript
const userId = await getUserIdFromClaims()
```

## Best Practices

1. **Use `getCurrentUserWithClaims()` for full user data**: This is the primary function for getting authenticated user information.

2. **Use `isAuthenticated()` for simple checks**: When you only need to know if someone is logged in.

3. **Use `getUserIdFromClaims()` for quick ID access**: When you only need the user ID for database queries.

4. **Handle the "not logged in" state gracefully**: Remember that `user: null` is not an error, it's a valid state.

5. **Don't cache user data too long**: These functions fetch fresh data from the server, which is good for security.

6. **Use in combination with `onAuthStateChange`**: Listen for auth state changes to keep your UI in sync.

## Performance Considerations

- `getUser()` makes a network request to validate the JWT
- For frequently called code, consider caching the result in React state/context
- Use `getUserIdFromClaims()` instead of `getCurrentUserWithClaims()` when you only need the ID
- The `isAuthenticated()` function is lightweight but still makes a network call

## Security Notes

- All functions use `getUser()` which validates JWTs server-side
- Compatible with asymmetric JWT signing keys (RSA, Elliptic Curves)
- No JWT secrets are exposed to the client
- Tokens are automatically validated on each call
- `AuthSessionMissingError` is handled gracefully as a non-error state

## Troubleshooting

### "Auth session missing" error

This is normal when the user is not logged in. The helpers handle this gracefully and return `null` instead of throwing an error.

### User data is stale

Call `getCurrentUserWithClaims()` again to fetch fresh data from the server.

### Performance issues

If you're calling these functions too frequently, consider:
1. Caching the result in React state/context
2. Using `onAuthStateChange` to update only when auth state changes
3. Using lighter functions like `getUserIdFromClaims()` when you don't need full user data

## Related Documentation

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [JWT Signing Keys](https://supabase.com/docs/guides/auth/signing-keys)
- [Server-Side Auth](https://supabase.com/docs/guides/auth/server-side)
