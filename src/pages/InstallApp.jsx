import { usePWAInstall } from '../hooks/usePWAInstall'
import PageTransition from '../components/PageTransition'
import styles from '../styles/InstallApp.module.css'

/**
 * Install App Page
 * Simple page with a button to trigger PWA installation
 */
function InstallApp() {
  const {
    isInstallable,
    isInstalled,
    promptInstall
  } = usePWAInstall()

  const handleInstall = async () => {
    const result = await promptInstall()
    if (result) {
      // Installation accepted
      console.log('PWA installation accepted')
    }
  }

  return (
    <PageTransition>
      <div className="page-container">
        <div className="page-content">
          <div className="page-header">
            <h2>Install MyGGV</h2>
            <p className="page-subtitle">Get the app on your device</p>
          </div>

          <div className={styles.content}>
            {isInstalled ? (
              // Already installed
              <div className={styles.card}>
                <div className={styles.iconSuccess}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h3>App Already Installed</h3>
                <p>MyGGV is already installed on your device. You can access it from your home screen.</p>
              </div>
            ) : (
              // Can install or show instructions
              <div className={styles.card}>
                <div className={styles.iconContainer}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </div>
                {/* <h3>Install MyGGV</h3>
                <p>Install MyGGV on your device for quick access and a better experience.</p> */}

                <ul className={styles.features}>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Instant access from your home screen</span>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Works offline</span>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Native app-like experience</span>
                  </li>
                </ul>

                {isInstallable ? (
                  <button className="btn-primary" onClick={handleInstall}>
                    Install App
                  </button>
                ) : (
                  <div className={styles.manualInstructions}>
                    <p className={styles.instructionText}>
                      To install this app, use your browser's menu and select "Add to Home Screen" or "Install App".
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default InstallApp
