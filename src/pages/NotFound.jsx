import { useNavigate } from 'react-router'
import Button from '../components/ui/Button'
import PageTransition from '../components/PageTransition'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="page-container">
      <PageTransition>
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
      </PageTransition>
    </div>
  )
}

export default NotFound
