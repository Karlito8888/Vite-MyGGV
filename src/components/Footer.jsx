import HamburgerButton from './HamburgerButton'
import ThemeToggle from './ThemeToggle'
import "../styles/Footer.css";

function Footer({ onMenuToggle, isSidebarOpen = false }) {
  return (
    <footer className="footer">
        <div className="footer-content">
          <HamburgerButton 
            onToggle={onMenuToggle}
            isOpen={isSidebarOpen}
          />
          <p>&copy; {new Date().getFullYear()} - MyGGV -  Garden Grove Village</p>
          <ThemeToggle />
        </div>
    </footer>
  );
}

export default Footer;
