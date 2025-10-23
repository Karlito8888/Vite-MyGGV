# UserContext

Context React pour gérer l'authentification et l'état utilisateur de l'application via Supabase Auth.

## Responsabilités

- Gérer l'état d'authentification de l'utilisateur
- Initialiser la session au chargement de l'application
- Écouter les changements d'état d'authentification (login/logout/recovery)
- Fournir les informations utilisateur enrichies avec les claims personnalisés
- Nettoyer les données utilisateur lors de la déconnexion

## API

### Provider

```jsx
<UserProvider>
  {children}
</UserProvider>
```

### Hook

```jsx
const { user, profile, loading, profileLoading, initialized, isAuthenticated, refreshProfile } = useUser()
```

**Valeurs retournées :**
- `user` (object | null) : Objet utilisateur avec claims personnalisés, ou null si non connecté
- `profile` (object | null) : Données complètes du profil utilisateur depuis la table profiles
- `loading` (boolean) : Indique si l'authentification est en cours de chargement
- `profileLoading` (boolean) : Indique si les données du profil sont en cours de chargement
- `initialized` (boolean) : Indique si l'initialisation de l'auth est terminée
- `isAuthenticated` (boolean) : Raccourci pour vérifier si un utilisateur est connecté (`!!user`)
- `refreshProfile` (function) : Fonction pour recharger manuellement les données du profil

## Fonctionnement

1. **Initialisation** : Au montage, récupère l'utilisateur actuel via `getCurrentUserWithClaims()`

2. **Écoute des événements** : S'abonne aux changements d'état d'authentification Supabase :
   - `INITIAL_SESSION` : Gère la session initiale au chargement
   - `SIGNED_IN` : Récupère les données utilisateur enrichies
   - `SIGNED_OUT` : Réinitialise l'état utilisateur et nettoie le localStorage
   - `PASSWORD_RECOVERY` : Gère la récupération de mot de passe
   - `TOKEN_REFRESHED` : Met à jour les données utilisateur après rafraîchissement
   - `USER_UPDATED` : Met à jour les informations utilisateur

3. **Cleanup** : Désabonne proprement l'écouteur d'événements au démontage

## Gestion des événements d'authentification

### INITIAL_SESSION
- Traite la session existante au chargement de l'application
- Récupère les données utilisateur si une session valide existe

### SIGNED_IN
- Déclenché lors de la connexion utilisateur
- Met à jour l'état utilisateur avec les données complètes

### SIGNED_OUT
- Déclenché lors de la déconnexion
- Nettoie l'état utilisateur et supprime les préférences du localStorage

### PASSWORD_RECOVERY
- Déclenché lors de l'initiation d'une récupération de mot de passe
- Logs l'événement pour le débogage

### TOKEN_REFRESHED
- Déclenché lors du rafraîchissement automatique du token
- Met à jour les données utilisateur si nécessaire

### USER_UPDATED
- Déclenché lors de la mise à jour des informations utilisateur
- Rafraîchit les données utilisateur dans le contexte

## Dépendances

- `supabase` : Client Supabase pour l'authentification
- `getCurrentUserWithClaims` : Helper pour récupérer l'utilisateur avec ses claims personnalisés

## Utilisation

```jsx
import { useUser } from '../contexts/UserContext'

function MyComponent() {
  const { user, loading, isAuthenticated } = useUser()
  
  if (loading) return <div>Chargement...</div>
  
  if (!isAuthenticated) return <div>Non connecté</div>
  
  return <div>Bonjour {user.email}</div>
}
```

## États du cycle de vie

1. **Initial** : `loading: true`, `initialized: false`, `user: null`
2. **Chargement** : Récupération de la session en cours
3. **Initialisé** : `loading: false`, `initialized: true`, `user: object | null`
4. **Connecté** : `isAuthenticated: true`, `user: object`
5. **Déconnecté** : `isAuthenticated: false`, `user: null`

## Gestion des erreurs

- Les erreurs d'authentification sont loggées dans la console avec le contexte
- Les erreurs lors du traitement des événements sont capturées et loggées
- L'état utilisateur est réinitialisé à `null` en cas d'erreur

## Notes

- Le provider doit être placé à la racine de l'application ou au niveau du Layout
- L'état `initialized` permet de différencier le chargement initial d'un état non-authentifié
- Le localStorage est automatiquement nettoyé lors de la déconnexion
- Tous les événements d'authentification sont gérés de manière exhaustive
