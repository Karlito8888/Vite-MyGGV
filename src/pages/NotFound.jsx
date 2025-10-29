import { useNavigate } from 'react-router'
import Button from '../components/ui/Button'
import styles from '../styles/NotFound.module.css'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-not-found">
          <h1>404</h1>
          <p>Page not found</p>
          <Button
            onClick={() => navigate('/home')}
            variant="primary"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
