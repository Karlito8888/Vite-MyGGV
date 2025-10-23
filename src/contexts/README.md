# Contexts Directory

Ce dossier contient tous les contextes React de l'application pour la gestion d'état global.

## Structure

```
src/contexts/
├── index.js              # Point d'entrée centralisé pour tous les contextes
├── README.md             # Documentation du dossier
├── UserContext.jsx       # Contexte d'authentification utilisateur
├── UserContext.md        # Documentation du UserContext
├── PresenceContext.jsx   # Contexte de présence en temps réel
└── PresenceContext.md    # Documentation du PresenceContext
```

## Utilisation

### Import centralisé
```jsx
// Recommandé : import depuis le point d'entrée centralisé
import { UserProvider, useUser, PresenceProvider, usePresence } from '../contexts'

// Au lieu de :
import { useUser } from '../contexts/UserContext'
import { usePresence } from '../contexts/PresenceContext'
```

### Configuration des providers
```jsx
// App.jsx ou main.jsx
import { UserProvider, PresenceProvider } from './contexts'

function App() {
  return (
    <UserProvider>
      <PresenceProvider>
        {/* Votre application */}
      </PresenceProvider>
    </UserProvider>
  )
}
```

## Contextes disponibles

### UserContext
- **Objectif** : Gestion de l'authentification utilisateur
- **Fonctionnalités** : Session, événements auth, état utilisateur
- **Hook** : `useUser()`
- **Provider** : `UserProvider`

### PresenceContext
- **Objectif** : Gestion de la présence en temps réel
- **Fonctionnalités** : Statut online/offline, canal de présence
- **Hook** : `usePresence()`
- **Provider** : `PresenceProvider`
- **Dépendance** : Nécessite UserProvider

## Bonnes pratiques

1. **Ordre des providers** : UserProvider doit envelopper PresenceProvider
2. **Import centralisé** : Utilisez `src/contexts/index.js`
3. **Documentation** : Chaque contexte a sa documentation `.md`
4. **Hooks personnalisés** : Chaque contexte exporte son hook dédié
5. **Gestion d'erreur** : Les hooks vérifient la présence du contexte

## Ajout d'un nouveau contexte

1. Créer le fichier `NewContext.jsx`
2. Créer la documentation `NewContext.md`
3. Exporter depuis `index.js`
4. Mettre à jour ce README
5. Ajouter la documentation dans `index.js`