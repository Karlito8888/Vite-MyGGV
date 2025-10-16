import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './utils/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
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

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Login />} />
          <Route path="login" element={<Login />} />
          <Route 
            path="onboarding" 
            element={<Onboarding />} 
          />
          <Route 
            path="home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="messages" 
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="games" 
            element={
              <ProtectedRoute>
                <Games />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="infos" 
            element={
              <ProtectedRoute>
                <Infos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="money" 
            element={
              <ProtectedRoute>
                <Money />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="weather" 
            element={
              <ProtectedRoute>
                <Weather />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="marketplace" 
            element={
              <ProtectedRoute>
                <Marketplace />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="location-requests" 
            element={
              <ProtectedRoute>
                <LocationRequests />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App