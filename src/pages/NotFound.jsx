import { useNavigate } from 'react-router'
import Button from '../components/ui/Button'
import PageTransition from '../components/PageTransition'

function NotFound() {
  const navigate = useNavigate()

  return (
    <PageTransition>
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
    </PageTransition>
  )
}

export default NotFound
