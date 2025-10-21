# Documentation - ErrorBoundary.jsx

## Vue d'ensemble
Composant React minimaliste qui capture les erreurs dans son arbre de composants et affiche une UI de secours simple.

## Structure du code

```jsx
import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h2>Something went wrong</h2>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              cursor: 'pointer'
            }}
          >
            Reload
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
```

## Fonctionnement

```
Erreur dans composant enfant
  ↓
getDerivedStateFromError() → hasError: true
  ↓
componentDidCatch() → console.error()
  ↓
render() → UI de secours
```

## Dépendances

- `react` - Component (class component)

## Interface utilisateur

UI de secours minimaliste:
- Message "Something went wrong"
- Bouton "Reload" pour rafraîchir la page
- Centré verticalement et horizontalement
- Inline styles (pas de dépendance CSS)

## Caractéristiques

### Class Component
- Requis pour Error Boundaries
- Lifecycle methods: getDerivedStateFromError, componentDidCatch
- State: `{ hasError: false }`

### Logging
- Console.error pour toutes les erreurs capturées
- Pas de distinction dev/prod
- Pas de service de monitoring

## Types d'erreurs

### ✅ Capturées
- Erreurs dans le rendu des composants enfants
- Erreurs dans les lifecycle methods
- Erreurs dans les constructeurs

### ❌ Non capturées
- Erreurs dans les event handlers
- Erreurs asynchrones
- Erreurs dans le SSR

## Utilisation

```jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

## Compatibilité

- React: 19.2.0 (compatible depuis React 16.0)
- Navigateurs: Tous les navigateurs modernes
