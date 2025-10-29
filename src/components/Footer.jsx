import HamburgerButton from './HamburgerButton'
import ThemeToggle from './ThemeToggle'
import styles from "./Footer.module.css";

function Footer({ onMenuToggle, isSidebarOpen = false }) {
  return (
    <footer className={styles.footer}>
        <div className={styles.footerContent}>
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
