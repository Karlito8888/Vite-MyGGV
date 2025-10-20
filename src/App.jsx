import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './components/Login'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import Games from './pages/Games'
import Infos from './pages/Infos'
import Money from './pages/Money'
import Weather from './pages/Weather'
import Marketplace from './pages/Marketplace'
import LocationRequests from './pages/LocationRequests'
import ProtectedRoute from './components/ProtectedRoute'

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
      </Route>
    </Routes>
  )
}

export default App