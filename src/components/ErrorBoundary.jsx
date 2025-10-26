import { Component } from 'react'
import Button from './ui/Button'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h2>Something went wrong</h2>
          <Button 
            onClick={() => window.location.reload()}
            variant="primary"
            style={{ marginTop: '1rem' }}
          >
            Reload
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
