import { useState, useCallback } from 'react'
import { Outlet } from 'react-router'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import { UserProvider } from '../contexts/UserContext'
import { PresenceProvider } from '../contexts/PresenceContext'

function Layout() {
  return (
    <UserProvider>
      <PresenceProvider>
        <LayoutContent />
      </PresenceProvider>
    </UserProvider>
  )
}

function LayoutContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false)
  }, [])

  return (
    <div className="app-layout">
      <Header />
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />
    </div>
  )
}

export default Layout