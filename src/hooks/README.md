# Hooks Directory

Ce dossier contient tous les hooks personnalisés de l'application pour la logique réutilisable.

## Structure

```
src/hooks/
├── index.js              # Point d'entrée centralisé pour tous les hooks
├── README.md             # Documentation du dossier
└── usePreloadData.js     # Hooks de préchargement (icônes)
```

## Utilisation

### Import centralisé
```jsx
// Recommandé : import depuis le point d'entrée centralisé
import { useUser, usePresence, usePreloadIcons } from '../hooks'

// Au lieu de :
import { useUser } from '../contexts/UserContext'
import { usePreloadIcons } from './usePreloadData'
```

### Utilisation dans les composants
```jsx
import { useUser, usePreloadIcons } from '../hooks'

function MyComponent() {
  const { user, profile, loading, isAuthenticated } = useUser()
  
  // Précharger les icônes en arrière-plan
  usePreloadIcons()
  
  if (loading) return <div>Loading...</div>
  
  return <div>Hello {user?.email} - {profile?.full_name}</div>
}
```

## Hooks disponibles

### Hooks d'authentification
- **useUser()** : État d'authentification utilisateur (depuis UserContext)

### Hooks de présence
- **usePresence()** : Statut de présence en temps réel (depuis PresenceContext)

### Hooks de préchargement
- **usePreloadIcons()** : Précharge les icônes communes de l'app

### Hooks PWA et Tab Recovery
- **usePageVisibility()** : Détecte la visibilité de la page (tab switch)
- **usePWATabRecovery()** : Récupération automatique après changement d'onglet
- **useRealtimeConnection()** : Gestion d'une connexion Realtime avec auto-reconnexion
- **useGlobalRealtimeManager()** : Gestion globale de toutes les connexions Realtime

### Hooks de carte
- **useMapConfig()** : Configuration de la carte MapLibre
- **useUserLocations()** : Gestion des localisations utilisateur

### Hooks PWA
- **usePWAInstall()** : Gestion de l'installation de la PWA

## Types de hooks

### 1. Hooks de contexte (re-exportés)
Hooks qui proviennent des contextes mais sont centralisés ici pour faciliter l'import.

### 2. Hooks utilitaires
Hooks qui encapsulent de la logique réutilisable (préchargement, API calls, etc.).

### 3. Hooks composés
Hooks qui combinent plusieurs autres hooks pour des cas d'usage spécifiques.

## Bonnes pratiques

1. **Import centralisé** : Utilisez `src/hooks/index.js`
2. **Documentation** : Documentez chaque hook dans `index.js`
3. **Nommage** : Préfixe `use` obligatoire
4. **Séparation** : Un fichier par famille de hooks
5. **Tests** : Testez les hooks complexes
6. **TypeScript** : Typez les hooks si applicable

## Ajout d'un nouveau hook

1. **Hook simple** : Ajouter directement dans un fichier existant
2. **Famille de hooks** : Créer un nouveau fichier `useNewFeature.js`
3. **Export** : Ajouter l'export dans `index.js`
4. **Documentation** : Documenter dans `index.js`
5. **Tests** : Ajouter des tests si nécessaire

## Exemple de nouveau hook

```jsx
// src/hooks/useLocalStorage.js
import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}
```

Puis l'ajouter dans `index.js` :
```jsx
export { useLocalStorage } from './useLocalStorage'
```