# Layout

Composant racine de la structure de l'application, gérant la disposition globale et les providers de contexte.

## Responsabilités

- Fournir les contexts globaux (UserContext, PresenceContext)
- Gérer la structure de layout (Header, Sidebar, Footer, contenu principal)
- Contrôler l'état d'ouverture/fermeture de la sidebar
- Rendre le contenu des routes via React Router

## Structure

Le composant est divisé en deux parties :

### Layout (wrapper)
Encapsule l'application avec les providers de contexte dans le bon ordre :
1. `UserProvider` : Authentification (doit être en premier)
2. `PresenceProvider` : Présence en temps réel (dépend de UserContext)

### LayoutContent (contenu)
Gère la structure visuelle et l'état de la sidebar.

## API

### Props
Aucune prop externe. Le composant est autonome.

### État interne
- `isSidebarOpen` (boolean) : État d'ouverture de la sidebar

### Callbacks mémoïsés
- `toggleSidebar()` : Inverse l'état de la sidebar
- `closeSidebar()` : Ferme la sidebar

## Structure HTML

```
<UserProvider>
  <PresenceProvider>
    <div className="app-layout">
      <Header />
      <Sidebar isOpen={...} onClose={...} />
      <main className="main-content">
        <Outlet /> <!-- Contenu des routes -->
      </main>
      <Footer onMenuToggle={...} isSidebarOpen={...} />
    </div>
  </PresenceProvider>
</UserProvider>
```

## Optimisations

1. **Séparation des providers** : Les providers sont isolés dans un composant parent pour éviter les re-renders inutiles lors des changements d'état de la sidebar

2. **Mémoïsation des callbacks** : `toggleSidebar` et `closeSidebar` sont mémoïsés avec `useCallback` pour éviter de recréer les fonctions à chaque render

3. **État local** : L'état de la sidebar est géré localement plutôt que dans un contexte global, car il n'est utilisé que par les composants enfants directs

## Utilisation

```jsx
import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/profile', element: <Profile /> },
      // ... autres routes
    ]
  }
])
```

## Dépendances

- `react-router` : Pour le système de routing (`Outlet`)
- `UserContext` : Context d'authentification
- `PresenceContext` : Context de présence en temps réel
- Composants enfants : `Header`, `Footer`, `Sidebar`

## Notes

- Le composant doit être utilisé comme élément racine dans React Router
- L'ordre des providers est important : UserProvider doit envelopper PresenceProvider
- Les routes enfants sont rendues via `<Outlet />` dans le `<main>`
