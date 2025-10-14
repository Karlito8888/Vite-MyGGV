import { useState, useEffect, useCallback, useMemo } from 'react'
import '../styles/Header.css'
import ggvLogo from '../assets/img/ggv.png'
import { useAuth } from '../utils/useAuth'
import { listActiveHeaderMessages } from '../services/messagesHeaderService'

function Header() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await listActiveHeaderMessages()
      if (error) {
        // console.error('Header messages error:', error)
        setError(error)
        setMessages([])
      } else {
        setMessages(data || [])
      }
    } catch (err) {
      // console.error('Header messages fetch error:', err)
      setError(err)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchMessages()
    } else {
      setMessages([])
      setError(null)
      setLoading(false)
      setCurrentMessageIndex(0)
    }
  }, [user, fetchMessages])

  // Message rotation effect
  useEffect(() => {
    if (messages.length > 1) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length)
      }, 4000) // 4 seconds per message

      return () => clearInterval(interval)
    }
  }, [messages.length])

  const currentMessage = useMemo(() => {
    if (messages.length === 0) return null
    return messages[currentMessageIndex]
  }, [messages, currentMessageIndex])

  return (
    <header className="header">
      <div className="container">
        <div className="header-content df wh100">
          {user ? (
            loading ? (
              <div className="header-carousel">
                <div className="carousel-message carousel-loading">Loading messages...</div>
              </div>
            ) : error ? (
              <div className="header-carousel">
                <div className="carousel-message carousel-error">Unable to load messages</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="header-carousel">
                <div className="carousel-message carousel-empty">Welcome to MyGGV!</div>
              </div>
            ) : (
              <div className="header-carousel">
                <div className="carousel-message carousel-active">
                  {currentMessage.message}
                </div>
              </div>
            )
          ) : (
            <>
              <img src={ggvLogo} alt="MyGGV" className="header-logo" />
              <h1 className="sr-only">MyGGV</h1>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header