# Guide d'Authentification - Intégration Supabase SignUp

## Nouvelles Fonctionnalités

### 1. Toggle Sign In / Sign Up
- Interface moderne avec un switch élégant entre connexion et inscription
- Transition fluide entre les deux modes
- Design cohérent avec le style existant

### 2. Fonction SignUp Intégrée
- Utilise `supabase.auth.signUp()` selon les meilleures pratiques
- Gestion automatique de la redirection après confirmation email
- Messages d'erreur spécifiques au signup

### 3. Gestion des Erreurs Améliorée
- Messages d'erreur personnalisés pour le signup
- Distinction claire entre erreurs de connexion et d'inscription
- Feedback utilisateur approprié

## Utilisation

### Interface Utilisateur
1. L'utilisateur voit un toggle en haut du formulaire
2. Par défaut, le mode "Sign In" est sélectionné
3. Cliquer sur "Sign Up" change le mode d'inscription
4. Le formulaire s'adapte automatiquement (boutons, messages, etc.)

### Flux d'Inscription
1. L'utilisateur sélectionne "Sign Up"
2. Saisit email et mot de passe
3. Clique sur "Create Account"
4. Reçoit un message de confirmation
5. Doit confirmer son email avant de pouvoir se connecter

### Flux de Connexion
1. L'utilisateur sélectionne "Sign In" (par défaut)
2. Saisit ses identifiants
3. Clique sur "Sign In"
4. Est redirigé vers l'onboarding si authentifié

## Fonctions Ajoutées

### `signUpUser(email, password, options)`
- Crée un nouveau compte utilisateur
- Configure automatiquement la redirection vers `/onboarding`
- Retourne `{data, error}` pour une gestion cohérente

### `signInUser(email, password)`
- Connecte un utilisateur existant
- Gestion d'erreur unifiée
- Retourne `{data, error}` pour une gestion cohérente

## Configuration Supabase

### Redirection Email
Les emails de confirmation redirigent vers `/onboarding` après validation.

### Gestion des Erreurs
- "User already registered" : Compte existant
- "Invalid login credentials" : Identifiants incorrects
- "Email not confirmed" : Email non confirmé
- "Password should be at least 6 characters" : Mot de passe trop court

## Styles CSS

### Classes Ajoutées
- `.login-toggle-section` : Container du toggle
- `.login-toggle-container` : Style du toggle
- `.login-toggle-button` : Boutons du toggle
- `.login-toggle-button.active` : État actif du toggle

### Animations
- Transitions fluides entre les modes
- Hover effects sur les boutons du toggle
- Cohérence avec les animations existantes

## Sécurité

### Meilleures Pratiques Implémentées
- Validation côté client avec Zod
- Gestion sécurisée des erreurs
- Redirection automatique après authentification
- Confirmation email obligatoire pour les nouveaux comptes

### Configuration Recommandée
- RLS (Row Level Security) activé sur Supabase
- Politiques d'accès appropriées
- Rate limiting configuré