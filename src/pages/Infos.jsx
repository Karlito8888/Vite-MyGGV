import Card, { CardHeader, CardContent } from '../components/ui/Card'
import styles from '../styles/Infos.module.css'

const viberNumber = import.meta.env.VITE_CONTACT_VIBER_NUMBER
const viberLink = viberNumber
  ? `viber://chat?number=${encodeURIComponent(viberNumber)}`
  : '#'

export default function Infos() {
  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-header">
          <h2>
            <span className={styles.pageTitleIcon}>ℹ️ </span>
            Village Information
          </h2>
        </div>

        {/* Grid des cartes d'informations */}
        <div className={styles.infoCardsGrid}>
          {/* Carte Poste de Garde */}
          <Card className={`${styles.infoCard} ${styles.guardPost}`} hover>
            <CardHeader>
              <span className={styles.infoCardIcon}>🛡️</span>
              <h3 className={styles.cardTitle}>Guard Post</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.infoItem}>
                <span className={styles.infoItemIcon}>📞</span>
                <div className={styles.infoItemText}>
                  <div className={styles.infoLabel}>Emergency Contact</div>
                  <div className={styles.infoValue}>+63 912 345 6789</div>
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoItemIcon}>🕐</span>
                <div className={styles.infoItemText}>
                  <div className={styles.infoLabel}>Available</div>
                  <div className={styles.infoValue}>24/7</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte ClubHouse Office */}
          <Card className={`${styles.infoCard} ${styles.clubhouseOffice}`} hover>
            <CardHeader>
              <span className={styles.infoCardIcon}>🏢</span>
              <h3 className={styles.cardTitle}>ClubHouse Office</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.infoItem}>
                <span className={styles.infoItemIcon}>📅</span>
                <div className={styles.infoItemText}>
                  <div className={styles.infoLabel}>Weekdays</div>
                  <div className={styles.infoValue}>8:00 AM - 5:00 PM</div>
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoItemIcon}>📅</span>
                <div className={styles.infoItemText}>
                  <div className={styles.infoLabel}>Weekends</div>
                  <div className={styles.infoValue}>9:00 AM - 3:00 PM</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte Piscine */}
          <Card className={`${styles.infoCard} ${styles.swimmingPool}`} hover>
            <CardHeader>
              <span className={styles.infoCardIcon}>🏊‍♂️</span>
              <h3 className={styles.cardTitle}>Swimming Pool</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.infoItem}>
                <span className={styles.infoItemIcon}>☀️</span>
                <div className={styles.infoItemText}>
                  <div className={styles.infoLabel}>Daily Hours</div>
                  <div className={styles.infoValue}>6:00 AM - 10:00 PM</div>
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoItemIcon}>🏊‍♀️</span>
                <div className={styles.infoItemText}>
                  <div className={styles.infoLabel}>Adult Swimming</div>
                  <div className={styles.infoValue}>5:00 AM - 7:00 AM</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte Église */}
          <Card className={`${styles.infoCard} ${styles.villageChurch}`} hover>
            <CardHeader>
              <span className={styles.infoCardIcon}>⛪</span>
              <h3 className={styles.cardTitle}>Village Church</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.infoItem}>
                <span className={styles.infoItemIcon}>🙏</span>
                <div className={styles.infoItemText}>
                  <div className={styles.infoLabel}>Sunday Service</div>
                  <div className={styles.infoValue}>8:00 AM & 5:00 PM</div>
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoItemIcon}>📖</span>
                <div className={styles.infoItemText}>
                  <div className={styles.infoLabel}>Bible Study</div>
                  <div className={styles.infoValue}>Wednesday 7:00 PM</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte Contact MyGGV Team */}
          <Card className={`${styles.infoCard} ${styles.mygvvContact}`} hover>
            <CardHeader>
              <span className={styles.infoCardIcon}>📱</span>
              <h3 className={styles.cardTitle}>MyGGV Team</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.infoItem}>
                <span className={styles.infoItemIcon}>
                  <img
                    src="/icons/viber.png"
                    alt="Viber"
                    className={styles.viberIcon}
                  />
                </span>
                <div className={styles.infoItemText}>
                  <div className={styles.infoLabel}>Viber</div>
                  <div className={styles.infoValue}>
                    <a
                      href={viberLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.viberLink}
                    >
                      Chat on Viber
                    </a>
                  </div>
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoItemIcon}>ℹ️</span>
                <div className={styles.infoItemText}>
                  <div className={styles.infoLabel}>Help</div>
                  <div className={styles.infoValue}>Click to chat with the MyGGV team</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
