# Documentation - main.jsx

## Vue d'ensemble
Point d'entrée principal de l'application React 19. Configuration minimale avec StrictMode, ErrorBoundary et React Router v7.

## Structure du code

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './styles/index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Failed to find the root element')
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)
```

## Flux d'exécution

```
index.html (root element)
  ↓
Validation de l'élément root
  ↓
createRoot
  ↓
StrictMode
  ↓
ErrorBoundary
  ↓
BrowserRouter
  ↓
App
```

## Composants

- **StrictMode**: Vérifications de développement React 19
- **ErrorBoundary**: Capture les erreurs de l'arbre de composants
- **BrowserRouter**: Contexte de routage React Router v7
- **App**: Composant racine

## Dépendances

### Externes
- `react` - StrictMode
- `react-dom/client` - createRoot
- `react-router` - BrowserRouter

### Internes
- `./App.jsx` - Composant principal
- `./components/ErrorBoundary.jsx` - Gestion des erreurs
- `./styles/index.css` - Styles globaux

## Caractéristiques

### React 19
- API `createRoot` standard
- Support du rendu concurrent
- Batching automatique
- StrictMode activé

### React Router v7
- Import depuis `react-router`
- BrowserRouter avec API History
- URLs propres sans hash

### Validation
- Vérification de l'existence de l'élément root
- Erreur explicite si manquant

## Compatibilité

- React: 19.2.0
- React Router: 7.9.4
- Navigateurs: ES6+ modernes
