# UpdatePassword Page

## Description
Page de mise à jour du mot de passe après réinitialisation par email. Gère la validation de session de récupération et permet à l'utilisateur de définir un nouveau mot de passe.

## Fonctionnalités
- Validation automatique de session de récupération de mot de passe
- Formulaire sécurisé avec confirmation de mot de passe
- Validation en temps réel avec Zod et React Hook Form
- Gestion des sessions expirées avec redirection
- Messages d'erreur conviviaux
- Redirection automatique après succès

## États du composant

```jsx
const [loading, setLoading] = useState(false)             // État de chargement
const [error, setError] = useState(null)                  // Messages d'erreur
const [success, setSuccess] = useState(false)             // Indicateur de succès
const [isValidSession, setIsValidSession] = useState(false) // Session valide
const [sessionChecked, setSessionChecked] = useState(false) // Vérification terminée
```

## Validation avec Zod

```jsx
const updatePasswordSchema = z.object({
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
        .string()
        .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})
```

## Gestion des sessions d'authentification

### Événements écoutés
- `PASSWORD_RECOVERY` : Détection d'une session de récupération valide
- `SIGNED_IN` : Vérification si c'est une session de récupération
- `SIGNED_OUT` : Invalidation de la session

### Vérification de session
```jsx
useEffect(() => {
    // Écoute des changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
            setIsValidSession(true)
            setSessionChecked(true)
        } else if (event === 'SIGNED_IN' && session) {
            // Vérification si c'est une session de récupération
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setIsValidSession(true)
                setSessionChecked(true)
            }
        }
    })

    // Vérification de la session actuelle au montage
    const checkCurrentSession = async () => {
        const { data: { session }, error } = await supabase.auth.getSession()
        setIsValidSession(!!session && !error)
        setSessionChecked(true)
    }

    checkCurrentSession()
    return () => subscription.unsubscribe()
}, [])
```

## Fonctions principales

### `handleUpdatePassword(data)`
Met à jour le mot de passe utilisateur via `updateUserPassword()`.

```jsx
const handleUpdatePassword = async (data) => {
    setLoading(true)
    setError(null)

    try {
        const result = await updateUserPassword(data.password)

        if (result.error) {
            setError(getErrorMessage(result.error.message))
        } else {
            setSuccess(true)
            reset()
            // Redirection automatique après 2 secondes
            setTimeout(() => {
                navigate('/login', { replace: true })
            }, 2000)
        }
    } catch (err) {
        setError('An unexpected error occurred')
    }

    setLoading(false)
}
```

### `handleBackToLogin()`
Redirection vers la page de connexion.

```jsx
const handleBackToLogin = () => {
    navigate('/login', { replace: true })
}
```

## Messages d'erreur personnalisés

```jsx
const ERROR_MESSAGES = {
    'New password should be different from the old password': 'New password must be different from your current password',
    'Password should be at least 6 characters': 'Password must be at least 6 characters long',
    'Auth session missing!': 'Session expired. Please request a new password reset link',
    'Invalid refresh token': 'Session expired. Please request a new password reset link',
}

const getErrorMessage = (error) => {
    return ERROR_MESSAGES[error] || error || 'An unexpected error occurred'
}
```

## États d'affichage

### 1. Chargement de vérification de session
```jsx
if (!sessionChecked) {
    return (
        <div className="login-container">
            <Card>
                <CardContent>
                    <div className="login-message">
                        <div className="login-spinner" />
                        Verifying session...
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
```

### 2. Session invalide
```jsx
if (!isValidSession) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Invalid Session</CardTitle>
                <CardDescription>
                    Your password reset session has expired or is invalid.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="login-message login-message-error">
                    Please request a new password reset link from the login page.
                </div>
                <button onClick={handleBackToLogin}>
                    Back to Login
                </button>
            </CardContent>
        </Card>
    )
}
```

### 3. Formulaire de mise à jour
Interface avec deux champs de mot de passe et validation en temps réel.

### 4. Confirmation de succès
```jsx
{success ? (
    <div className="login-form-section">
        <div className="login-message login-message-success">
            Password updated successfully! Redirecting to login...
        </div>
        <button onClick={handleBackToLogin}>
            Go to Login Now
        </button>
    </div>
) : (
    // Formulaire de mise à jour
)}
```

## Flux utilisateur

1. **Arrivée sur la page** : L'utilisateur clique sur le lien de réinitialisation reçu par email
2. **Vérification de session** : Validation automatique de la session de récupération
3. **Affichage du formulaire** : Si la session est valide, affichage du formulaire
4. **Saisie des mots de passe** : L'utilisateur saisit et confirme son nouveau mot de passe
5. **Validation** : Validation côté client avec Zod
6. **Soumission** : Appel à `updateUserPassword()` via authHelpers
7. **Succès** : Message de confirmation et redirection automatique vers `/login`
8. **Erreur** : Affichage du message d'erreur approprié

## Sécurité

- Validation de session obligatoire avant affichage du formulaire
- Pas de stockage du mot de passe en état après soumission
- Messages d'erreur qui ne révèlent pas d'informations sensibles
- Redirection automatique après succès pour éviter la réutilisation
- Gestion des sessions expirées avec messages clairs

## Dépendances

### Externes
- `react` - useState, useEffect
- `react-router` - useNavigate
- `react-hook-form` - useForm
- `@hookform/resolvers/zod` - zodResolver
- `zod` - Validation des schémas

### Internes
- `../utils/supabase` - Client Supabase
- `../utils/authHelpers` - updateUserPassword
- `../components/ui/Card` - Composants Card
- `../components/ui/Input` - Composant Input
- `../styles/login.css` - Styles partagés avec Login

## Classes CSS utilisées

- `login-container` - Conteneur principal
- `login-wrapper` - Wrapper du contenu
- `login-header` - En-tête avec logo
- `login-logo` - Logo GGV
- `login-title-section` - Section titre
- `login-form` - Formulaire
- `login-button` - Boutons
- `login-button-primary` - Bouton principal
- `login-button-outline` - Bouton secondaire
- `login-button-full` - Bouton pleine largeur
- `login-button-flex` - Container flex pour boutons
- `login-message` - Messages d'état
- `login-message-error` - Messages d'erreur
- `login-message-success` - Messages de succès
- `login-spinner` - Spinner de chargement

## Logging

Utilise le logging conditionnel pour le développement :
```jsx
const log = import.meta.env.DEV ? console.log : () => { }
```

Logs détaillés pour :
- Événements d'authentification
- Vérifications de session
- Résultats de mise à jour de mot de passe
- Erreurs et exceptions

## Accessibilité

- Labels appropriés pour les champs de mot de passe
- Messages d'erreur associés aux champs
- Navigation clavier supportée
- Contraste approprié pour les états d'erreur/succès
- Annonces visuelles des changements d'état