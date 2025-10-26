import Card, { CardHeader, CardContent } from '../components/ui/Card'
import '../styles/Infos.css'

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
            <span className="page-title-icon">ℹ️ </span>
            Village Information
          </h2>
        </div>

        {/* Grid des cartes d'informations */}
        <div className="info-cards-grid">
          {/* Carte Poste de Garde */}
          <Card className="info-card guard-post" hover>
            <CardHeader>
              <span className="info-card-icon">🛡️</span>
              <h3>Guard Post</h3>
            </CardHeader>
            <CardContent>
              <div className="info-item">
                <span className="info-item-icon">📞</span>
                <div className="info-item-text">
                  <div className="info-label">Emergency Contact</div>
                  <div className="info-value">+63 912 345 6789</div>
                </div>
              </div>
              <div className="info-item">
                <span className="info-item-icon">🕐</span>
                <div className="info-item-text">
                  <div className="info-label">Available</div>
                  <div className="info-value">24/7</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte ClubHouse Office */}
          <Card className="info-card clubhouse-office" hover>
            <CardHeader>
              <span className="info-card-icon">🏢</span>
              <h3>ClubHouse Office</h3>
            </CardHeader>
            <CardContent>
              <div className="info-item">
                <span className="info-item-icon">📅</span>
                <div className="info-item-text">
                  <div className="info-label">Weekdays</div>
                  <div className="info-value">8:00 AM - 5:00 PM</div>
                </div>
              </div>
              <div className="info-item">
                <span className="info-item-icon">📅</span>
                <div className="info-item-text">
                  <div className="info-label">Weekends</div>
                  <div className="info-value">9:00 AM - 3:00 PM</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte Piscine */}
          <Card className="info-card swimming-pool" hover>
            <CardHeader>
              <span className="info-card-icon">🏊‍♂️</span>
              <h3>Swimming Pool</h3>
            </CardHeader>
            <CardContent>
              <div className="info-item">
                <span className="info-item-icon">☀️</span>
                <div className="info-item-text">
                  <div className="info-label">Daily Hours</div>
                  <div className="info-value">6:00 AM - 10:00 PM</div>
                </div>
              </div>
              <div className="info-item">
                <span className="info-item-icon">🏊‍♀️</span>
                <div className="info-item-text">
                  <div className="info-label">Adult Swimming</div>
                  <div className="info-value">5:00 AM - 7:00 AM</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte Église */}
          <Card className="info-card village-church" hover>
            <CardHeader>
              <span className="info-card-icon">⛪</span>
              <h3>Village Church</h3>
            </CardHeader>
            <CardContent>
              <div className="info-item">
                <span className="info-item-icon">🙏</span>
                <div className="info-item-text">
                  <div className="info-label">Sunday Service</div>
                  <div className="info-value">8:00 AM & 5:00 PM</div>
                </div>
              </div>
              <div className="info-item">
                <span className="info-item-icon">📖</span>
                <div className="info-item-text">
                  <div className="info-label">Bible Study</div>
                  <div className="info-value">Wednesday 7:00 PM</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte Contact MyGGV Team */}
          <Card className="info-card mygvv-contact" hover>
            <CardHeader>
              <span className="info-card-icon">📱</span>
              <h3>MyGGV Team</h3>
            </CardHeader>
            <CardContent>
              <div className="info-item">
                <span className="info-item-icon">
                  <img
                    src="/icons/viber.png"
                    alt="Viber"
                    className="viber-icon"
                  />
                </span>
                <div className="info-item-text">
                  <div className="info-label">Viber</div>
                  <div className="info-value">
                    <a
                      href={viberLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="viber-link"
                    >
                      Chat on Viber
                    </a>
                  </div>
                </div>
              </div>
              <div className="info-item">
                <span className="info-item-icon">ℹ️</span>
                <div className="info-item-text">
                  <div className="info-label">Help</div>
                  <div className="info-value">Click to chat with the MyGGV team</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
