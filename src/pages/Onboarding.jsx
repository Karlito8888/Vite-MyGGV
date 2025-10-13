import { useNavigate } from 'react-router-dom'
import '../styles/Onboarding.css'

function Onboarding() {
  const navigate = useNavigate()

  const handleComplete = () => {
    navigate('/home')
  }

  return (
    <div className="onboarding-page">
      <div className="container">
        <div className="onboarding-content">
          <h1>Welcome to Your PWA App!</h1>
          <p className="onboarding-subtitle">
            Let's get you set up with a quick tour
          </p>
          
          <div className="onboarding-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Get Started</h3>
                <p>This is your personal PWA app designed for the best mobile experience.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Stay Connected</h3>
                <p>Access your data anytime, anywhere with offline support.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Ready to Go</h3>
                <p>You're all set! Let's start using your app.</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleComplete}
            className="btn btn-primary"
            style={{ width: '100%', maxWidth: '300px', margin: '2rem auto 0', display: 'block' }}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
}

export default Onboarding