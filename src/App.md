# Documentation - App.jsx

## Vue d'ensemble
Composant racine de l'application qui définit la structure de routage avec lazy loading et gestion 404.

## Structure du code

```jsx
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Login from './components/Login'
import ProtectedRoute from './components/ProtectedRoute'

// Lazy loading des pages
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Home = lazy(() => import('./pages/Home'))
const Profile = lazy(() => import('./pages/Profile'))
const Messages = lazy(() => import('./pages/Messages'))
const Games = lazy(() => import('./pages/Games'))
const Infos = lazy(() => import('./pages/Infos'))
const Money = lazy(() => import('./pages/Money'))
const Weather = lazy(() => import('./pages/Weather'))
const Marketplace = lazy(() => import('./pages/Marketplace'))
const LocationRequests = lazy(() => import('./pages/LocationRequests'))
const NotFound = lazy(() => import('./pages/NotFound'))

const protectedRoutes = [
  { path: 'home', element: Home },
  { path: 'profile', element: Profile },
  { path: 'messages', element: Messages },
  { path: 'games', element: Games },
  { path: 'infos', element: Infos },
  { path: 'money', element: Money },
  { path: 'weather', element: Weather },
  { path: 'marketplace', element: Marketplace },
  { path: 'location-requests', element: LocationRequests }
]

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Login />} />
          <Route path="login" element={<Login />} />
          <Route path="onboarding" element={<Onboarding />} />
          {protectedRoutes.map(({ path, element: Element }) => (
            <Route
              key={path}
              path={path}
              element={<ProtectedRoute><Element /></ProtectedRoute>}
            />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
```

## Architecture de routage

```
Layout
├── / (index) → Login
├── /login → Login
├── /onboarding → Onboarding (lazy)
├── Routes protégées (lazy + ProtectedRoute)
│   ├── /home → Home
│   ├── /profile → Profile
│   ├── /messages → Messages
│   ├── /games → Games
│   ├── /infos → Infos
│   ├── /money → Money
│   ├── /weather → Weather
│   ├── /marketplace → Marketplace
│   └── /location-requests → LocationRequests
└── /* → NotFound (404)
```

## Flux de navigation

```
Non authentifié: / → Login → /onboarding → /home
Authentifié: Accès direct aux routes protégées
URL invalide: /* → NotFound
```

## Optimisations

### Lazy loading
Toutes les pages chargées à la demande:
- Réduction du bundle initial
- Code splitting automatique

### Suspense
Fallback global pendant le chargement:
```jsx
<Suspense fallback={<div>Loading...</div>}>
```

### Route 404
Gestion des URLs invalides:
```jsx
<Route path="*" element={<NotFound />} />
```

## Dépendances

### Externes
- `react` - lazy, Suspense
- `react-router` - Routes, Route

### Internes - Composants
- `./components/Layout` - Wrapper commun
- `./components/Login` - Page de connexion (non lazy)
- `./components/ProtectedRoute` - HOC de protection

### Internes - Pages (lazy)
- `./pages/Onboarding`
- `./pages/Home`
- `./pages/Profile`
- `./pages/Messages`
- `./pages/Games`
- `./pages/Infos`
- `./pages/Money`
- `./pages/Weather`
- `./pages/Marketplace`
- `./pages/LocationRequests`
- `./pages/NotFound`

## Caractéristiques

### React Router v7
- Import depuis `react-router`
- Routes imbriquées avec Layout
- Route index et wildcard

### Protection
- Routes protégées par ProtectedRoute
- Login et Onboarding publics

### Performance
- ✅ Lazy loading
- ✅ Code splitting
- ✅ Bundle minimal

## Patterns

- Code Splitting avec lazy/Suspense
- Configuration centralisée (protectedRoutes)
- Mapping dynamique des routes

## Compatibilité

- React: 19.2.0
- React Router: 7.9.4
