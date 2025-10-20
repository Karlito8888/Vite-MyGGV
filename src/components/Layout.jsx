import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import { UserProvider } from '../contexts/UserContext'
import { PresenceProvider } from '../utils/PresenceContext'

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <UserProvider>
      <PresenceProvider>
        <div className="app-layout">
          <Header />
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          <main className="main-content">
            <Outlet />
          </main>
          <Footer onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        </div>
      </PresenceProvider>
    </UserProvider>
  )
}

export default Layout