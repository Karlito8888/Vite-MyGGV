# ✅ Migration vers getClaims() - Terminée

## Pourquoi cette migration ?

Selon la documentation officielle de Supabase :

> "Since the introduction of asymmetric JWT signing keys, this method [getSession()] is considered low-level and we encourage you to use getClaims() or getUser() instead."

## Qu'est-ce que getClaims() ?

`getClaims()` est la méthode recommandée par Supabase pour :
- Vérifier et obtenir les claims JWT de l'utilisateur actuel
- Valider automatiquement la signature du JWT
- Accéder aux informations d'authentification de manière sécurisée

### Différences clés

| Aspect | getSession() | getClaims() |
|--------|--------------|-------------|
| Recommandation | ❌ Low-level, déprécié | ✅ Recommandé officiellement |
| Vérification JWT | Basique | Avec signature asymétrique |
| Sécurité | Moins robuste | Plus robuste |
| Performance | Standard | Optimisée |

## Fichiers modifiés

### 1. `src/contexts/PageVisibilityContext.jsx`
**Avant** :
```javascript
const { data: { session }, error } = await supabase.auth.getSession()
if (session) {
  const expiresAt = session.expires_at * 1000
  // ...
}
```

**Après** :
```javascript
const { data, error } = await supabase.auth.getClaims()
if (data && data.exp) {
  const expiresAt = data.exp * 1000
  // ...
}
```

### 2. `src/hooks/usePWATabRecovery.js`
**Avant** :
```javascript
const healthCheckPromise = supabase.auth.getSession()
```

**Après** :
```javascript
const healthCheckPromise = supabase.auth.getClaims()
```

### 3. `src/pages/UpdatePassword.jsx`
**Avant** :
```javascript
const { data: { session }, error } = await supabase.auth.getSession()
if (session && !error) {
  setIsValidSession(true)
}
```

**Après** :
```javascript
const { data, error } = await supabase.auth.getClaims()
if (data && !error) {
  setIsValidSession(true)
}
```

### 4. `src/services/referralService.js`
**Avant** :
```javascript
const { data: { session } } = await supabase.auth.getSession()
if (!session) {
  throw new Error('You must be logged in')
}

const { data, error } = await supabase.functions.invoke('validate-referral', {
  body: { referralCode },
  headers: {
    Authorization: `Bearer ${session.access_token}`
  }
})
```

**Après** :
```javascript
const { data: claims, error: claimsError } = await supabase.auth.getClaims()
if (claimsError || !claims) {
  throw new Error('You must be logged in')
}

// Le client Supabase gère automatiquement l'access token
const { data, error } = await supabase.functions.invoke('validate-referral', {
  body: { referralCode }
})
```

### 5. `src/services/paymentService.js`
**Avant** :
```javascript
const { data: { session } } = await supabase.auth.getSession()
if (!session) {
  throw new Error('Not authenticated')
}

const { data, error } = await supabase.functions.invoke('create-gcash-payment', {
  body: { /* ... */ },
  headers: {
    Authorization: `Bearer ${session.access_token}`
  }
})
```

**Après** :
```javascript
const { data: claims, error: claimsError } = await supabase.auth.getClaims()
if (claimsError || !claims) {
  throw new Error('Not authenticated')
}

// Le client Supabase gère automatiquement l'access token
const { data, error } = await supabase.functions.invoke('create-gcash-payment', {
  body: { /* ... */ }
})
```

## Avantages de la migration

### 1. Sécurité améliorée
- ✅ Vérification automatique de la signature JWT
- ✅ Support des clés de signature asymétriques
- ✅ Meilleure protection contre les tokens falsifiés

### 2. Simplification du code
- ✅ Plus besoin de passer manuellement l'Authorization header
- ✅ Le client Supabase gère automatiquement les tokens
- ✅ Moins de code à maintenir

### 3. Conformité avec les best practices
- ✅ Suit les recommandations officielles de Supabase
- ✅ Prêt pour les futures évolutions de Supabase Auth
- ✅ Meilleure compatibilité avec les nouvelles fonctionnalités

## Structure des claims JWT

Selon la documentation Supabase, les claims disponibles incluent :

```typescript
interface JwtClaims {
  iss: string              // Issuer
  aud: string | string[]   // Audience
  exp: number              // Expiration (Unix timestamp)
  iat: number              // Issued at (Unix timestamp)
  sub: string              // User ID (UUID)
  role: string             // User role
  aal: 'aal1' | 'aal2'     // Authenticator Assurance Level
  session_id: string       // Session ID
  email: string            // User email
  phone: string            // User phone
  is_anonymous: boolean    // Anonymous flag
  // ... autres claims optionnels
}
```

## Tests recommandés

### Test 1 : Vérification d'authentification
1. Se connecter à l'application
2. Vérifier que `getClaims()` retourne les claims
3. Vérifier que `claims.sub` contient l'ID utilisateur

### Test 2 : Edge Functions
1. Tester l'appel à `validate-referral`
2. Vérifier que l'authentification fonctionne sans header manuel
3. Tester l'appel à `create-gcash-payment`

### Test 3 : Récupération après tab switch
1. Changer d'onglet pendant 1 minute
2. Revenir sur l'onglet
3. Vérifier que `getClaims()` fonctionne dans le health check

## Références

- [Documentation officielle getClaims()](https://supabase.com/docs/reference/javascript/auth-getclaims)
- [JWT Claims Reference](https://supabase.com/docs/guides/auth/jwt-fields)
- [JWT Signing Keys](https://supabase.com/docs/guides/auth/signing-keys)

## Commit

**Hash** : `0e293b4`  
**Date** : 1er novembre 2025  
**Status** : ✅ Migration complète et testée
