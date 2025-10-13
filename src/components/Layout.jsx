import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ThemeToggle from './ThemeToggle'

function Layout() {
  return (
    <div className="app-layout">
      <ThemeToggle />
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout