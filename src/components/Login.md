# Documentation - Login.jsx

## Overview
Composant d'authentification complet offrant connexion/inscription par email/mot de passe, OAuth (Google, Facebook), et réinitialisation de mot de passe. Gère la redirection automatique vers l'onboarding après authentification réussie.

## Authentication Flow

```
Utilisateur arrive sur /login
  ↓
Vérification si déjà authentifié (useEffect)
  ↓
Si authentifié → Redirection vers /onboarding
  ↓
Si non authentifié → Affichage du formulaire
  ↓
L'utilisateur choisit :
  ├── Email/Password → handleAuth (sign in/up)
  ├── OAuth (Google/Facebook) → handleSocialSignIn
  └── Mot de passe oublié → handleForgotPassword
  ↓
Authentification Supabase
  ↓
Succès → UserContext se met à jour → useEffect déclenche la redirection
  ↓
Erreur → Affichage d'un message d'erreur convivial
```

## State Management

```jsx
const [loading, setLoading] = useState(false)             // État de chargement
const [error, setError] = useState(null)                  // Messages d'erreur
const [success, setSuccess] = useState(null)              // Messages de succès
const [resetSent, setResetSent] = useState(false)         // Confirmation envoi email reset
const [showResetForm, setShowResetForm] = useState(false) // Basculer vers formulaire reset
const [isSignUp, setIsSignUp] = useState(false)           // Mode inscription/connexion
```

## Gestion des formulaires avec React Hook Form

### Formulaire d'authentification (connexion/inscription)
```jsx
const {
  register: registerAuth,
  handleSubmit: handleSubmitAuth,
  formState: { errors: authErrors },
  reset: resetAuth,
  getValues: getAuthValues,
} = useForm({
  resolver: zodResolver(authSchema),
  defaultValues: { email: '', password: '' }
})
```

### Formulaire de réinitialisation de mot de passe
```jsx
const {
  register: registerReset,
  handleSubmit: handleSubmitReset,
  formState: { errors: resetErrors },
  reset: resetResetForm,
  setValue: setResetValue,
} = useForm({
  resolver: zodResolver(resetSchema),
  defaultValues: { email: '' }
})
```

## Fonctionnalités clés

### 1. Logging conditionnel pour le développement
```jsx
const log = import.meta.env.DEV ? console.log : () => {}
```
Les logs ne sont actifs qu'en mode développement, automatiquement désactivés en production.

### 2. Messages d'erreur conviviaux
```jsx
const ERROR_MESSAGES = {
  'Invalid login credentials': 'Invalid email or password',
  'Email not confirmed': 'Please confirm your email address',
  'Too many requests': 'Too many attempts. Please try again later',
  'User not found': 'No account found with this email',
  'User already registered': 'An account with this email already exists',
  'Password should be at least 6 characters': 'Password must be at least 6 characters long',
  'Signup requires a valid password': 'Please enter a valid password',
}

const getErrorMessage = (error) => {
  return ERROR_MESSAGES[error] || error || 'An unexpected error occurred'
}
```
Mappe les codes d'erreur Supabase vers des messages clairs et conviviaux.

### 3. Redirection automatique
```jsx
useEffect(() => {
  if (user && !authLoading) {
    navigate('/onboarding', { replace: true })
  }
}, [user, authLoading, navigate])
```
Redirige les utilisateurs authentifiés vers l'onboarding. Utilise `replace: true` pour empêcher le retour vers login.

### 4. Validation avec Zod
```jsx
const authSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

const resetSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
})
```
Validation côté client avec des messages d'erreur personnalisés.

## Méthodes d'authentification

### Connexion/Inscription par Email/Mot de passe
```jsx
const handleAuth = async (data) => {
  const action = isSignUp ? 'sign up' : 'sign in'
  setLoading(true)
  setError(null)
  setSuccess(null)
  setResetSent(false)

  try {
    let result
    if (isSignUp) {
      result = await signUpUser(data.email, data.password)
    } else {
      result = await signInUser(data.email, data.password)
    }

    if (result.error) {
      setError(getErrorMessage(result.error.message))
    } else {
      if (isSignUp) {
        setSuccess('Account created! Please check your email to confirm your account.')
      }
      // La redirection est gérée par useEffect pour la connexion
    }
  } catch (err) {
    setError('An unexpected error occurred')
  }

  setLoading(false)
}
```

### Connexion OAuth (Google, Facebook)
```jsx
const handleSocialSignIn = async (provider) => {
  setError(null)
  setResetSent(false)

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
      },
    })

    if (error) {
      setError(getErrorMessage(error.message))
    }
  } catch (err) {
    setError('An unexpected error occurred during OAuth sign in')
  }
}
```

### Réinitialisation de mot de passe
```jsx
const handleForgotPassword = async (data) => {
  setLoading(true)
  setError(null)
  setResetSent(false)

  try {
    const result = await resetPasswordForEmail(data.email)

    if (result.error) {
      setError(getErrorMessage(result.error.message))
    } else {
      setResetSent(true)
      setShowResetForm(false)
    }
  } catch (err) {
    setError('An unexpected error occurred')
  }

  setLoading(false)
}
```

Utilise la méthode `resetPasswordForEmail()` de Supabase. Envoie un email avec un lien vers `/update-password`.

## Structure de l'interface

### Mode principal (Connexion/Inscription)
```
┌─────────────────────────────────┐
│         Logo GGV                │
│     Welcome to MyGGV            │
├─────────────────────────────────┤
│  ┌───────────────────────────┐ │
│  │                           │ │
│  │ [Google] [Facebook]       │ │ ← Authentification sociale prioritaire
│  │                           │ │
│  │ ─── Or sign in/up with ── │ │
│  │                           │ │
│  │ [Sign In] [Sign Up]       │ │ ← Basculement mode
│  │                           │ │
│  │ Email: [_____________]    │ │
│  │ Password: [__________]    │ │
│  │                           │ │
│  │ [Sign In/Create Account]  │ │
│  │                           │ │
│  │ Forgot password? (si Sign In) │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

### Mode réinitialisation de mot de passe
```
┌─────────────────────────────────┐
│         Logo GGV                │
│     Welcome to MyGGV            │
├─────────────────────────────────┤
│  ┌───────────────────────────┐ │
│  │ Reset Password            │ │
│  │ Enter your email to       │ │
│  │ receive a reset link      │ │
│  │                           │ │
│  │ Email: [_____________]    │ │
│  │                           │ │
│  │ [Send Reset Link] [Cancel]│ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

## Dépendances

### Externes
- `react` - useState, useEffect
- `react-router` - useNavigate
- `react-hook-form` - useForm
- `@hookform/resolvers/zod` - zodResolver
- `zod` - Validation des schémas

### Internes
- `../utils/supabase` - Client Supabase
- `../utils/authHelpers` - signUpUser, signInUser, resetPasswordForEmail
- `../contexts/UserContext` - useUser hook

### Composants UI
- `./ui/Card` - Card, CardHeader, CardTitle, CardDescription, CardContent
- `./ui/Input` - Input
- `../styles/login.css` - Styles spécifiques

## Flux de réinitialisation de mot de passe

1. L'utilisateur clique sur "Forgot password?" (uniquement en mode Sign In)
2. Le formulaire bascule en mode reset (`showResetForm = true`)
3. L'email du formulaire principal est automatiquement copié dans le formulaire reset
4. L'utilisateur saisit/confirme son email et soumet
5. Supabase envoie un email avec un lien vers `/update-password`
6. Message de succès affiché, retour au mode sign-in
7. L'utilisateur clique sur le lien dans l'email → redirection vers `/update-password`
8. L'utilisateur met à jour son mot de passe sur cette page

## Gestion des erreurs

Toutes les erreurs sont traitées via `getErrorMessage()` qui :
- Mappe les erreurs Supabase connues vers des messages conviviaux
- Utilise le message d'erreur original si non mappé
- Fournit un message générique si l'erreur est indéfinie

Les états d'erreur sont effacés quand :
- L'utilisateur bascule entre les formulaires (Sign In/Sign Up)
- L'utilisateur initie une nouvelle tentative d'authentification
- L'utilisateur clique sur Cancel dans le formulaire reset
- L'utilisateur bascule vers le formulaire reset

## États de succès

### Succès de connexion (Sign In)
- Pas de retour visuel nécessaire
- UserContext se met à jour automatiquement
- useEffect déclenche la redirection vers /onboarding

### Succès d'inscription (Sign Up)
- Message de succès vert : "Account created! Please check your email to confirm your account."
- L'utilisateur doit confirmer son email avant de pouvoir se connecter

### Succès de réinitialisation de mot de passe
- Message de succès vert : "Password reset email sent! Check your inbox."
- Retour automatique au mode sign-in
- Le message persiste jusqu'à la prochaine action

## États de chargement

- Sign In : Bouton affiche "Signing in..." avec spinner
- Sign Up : Bouton affiche "Creating account..." avec spinner
- Password Reset : Bouton affiche "Sending..." avec spinner
- Tous les inputs de formulaire désactivés pendant le chargement
- Bouton Cancel désactivé pendant la réinitialisation de mot de passe
- Spinner CSS animé affiché à côté du texte

## Classes CSS principales

- `login-container` - Conteneur principal
- `login-wrapper` - Wrapper du contenu
- `login-header` - En-tête avec logo
- `login-logo` - Image du logo GGV
- `login-title-section` - Section titre
- `login-form-section` - Section formulaire
- `login-social-section` - Section boutons sociaux
- `login-social-button` - Boutons OAuth
- `login-divider` - Séparateur "Or sign in/up with email"
- `login-toggle-section` - Section basculement Sign In/Sign Up
- `login-toggle-container` - Conteneur des boutons toggle
- `login-toggle-button` - Boutons Sign In/Sign Up
- `login-form` - Formulaire principal
- `login-reset-form` - Formulaire de reset
- `login-button` - Boutons génériques
- `login-button-primary` - Bouton principal
- `login-button-outline` - Bouton secondaire
- `login-button-full` - Bouton pleine largeur
- `login-button-flex` - Container flex pour boutons
- `login-message` - Messages d'état
- `login-message-error` - Messages d'erreur
- `login-message-success` - Messages de succès
- `login-spinner` - Spinner de chargement
- `login-forgot-password` - Section mot de passe oublié
- `login-forgot-link` - Lien mot de passe oublié

## Fonctionnalités de sécurité

- Utilise Supabase Auth (sécurisé par défaut)
- Pas de stockage des mots de passe dans l'état après soumission
- HTTPS requis pour OAuth
- Validation email via Zod et React Hook Form
- Limitation de débit côté serveur via Supabase
- Validation côté client avec messages d'erreur personnalisés
- Gestion sécurisée des erreurs sans exposition d'informations sensibles

## Accessibilité

- Labels associés aux inputs via le composant Input
- Validation et messages d'erreur clairs
- HTML sémantique (form, button elements)
- Navigation clavier supportée
- Messages d'état annoncés visuellement
- Contraste approprié pour les états d'erreur/succès

## Configuration requise

### Tableau de bord Supabase
1. Activer l'authentification email/mot de passe
2. Configurer les fournisseurs OAuth (Google, Facebook)
3. Ajouter les URLs de redirection :
   - `${origin}/onboarding` (OAuth)
   - `${origin}/update-password` (réinitialisation mot de passe)
4. Configurer les modèles d'email pour la réinitialisation

### Application
- La page `/update-password` existe déjà pour gérer les mises à jour de mot de passe
- UserContext gère correctement l'état d'authentification
- authHelpers fournit toutes les fonctions nécessaires

## Fonctionnalités implémentées

✅ Connexion/Inscription par email/mot de passe
✅ Authentification OAuth (Google, Facebook)  
✅ Réinitialisation de mot de passe
✅ Page de mise à jour de mot de passe (`/update-password`)
✅ Validation des formulaires avec Zod
✅ Gestion des erreurs et messages de succès
✅ Redirection automatique après authentification
✅ Interface responsive avec composants UI personnalisés

## Compatibilité

- React: 19.2.0+
- Supabase: v2+
- React Router: 7.9.4+
- React Hook Form: Compatible
- Zod: Compatible
- Navigateurs : Tous les navigateurs modernes
- Mobile : Interface responsive
