import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import '../styles/Header.css'
import ggvLogo from '../assets/img/ggv.png'
import { useAuth } from '../utils/useAuth'
import { listActiveHeaderMessages } from '../services/messagesHeaderService'
import { supabase } from '../utils/supabase'

function Header() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [transitionState, setTransitionState] = useState('idle') // 'idle', 'fading-out', 'fading-in'
  const subscriptionRef = useRef(null)
  const [subscriptionError, setSubscriptionError] = useState(null)

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
      
      // Setup realtime subscription
      const channel = supabase
        .channel('header-messages')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages_header'
          },
          (_payload) => {
            // Refetch messages on any change
            fetchMessages()
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setSubscriptionError(null)
          } else if (status === 'CHANNEL_ERROR') {
            setSubscriptionError('Realtime connection failed')
          }
        })
      
      subscriptionRef.current = channel
      
      return () => {
        if (channel) {
          supabase.removeChannel(channel)
        }
      }
    } else {
      // Cleanup when user logs out
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
        subscriptionRef.current = null
      }
      setMessages([])
      setError(null)
      setSubscriptionError(null)
      setLoading(false)
      setCurrentMessageIndex(0)
    }
  }, [user, fetchMessages])

  // Message rotation effect with transitions
  useEffect(() => {
    if (messages.length > 1) {
      const interval = setInterval(() => {
        // Start fade-out transition
        setTransitionState('fading-out')
        
        // After fade-out completes, change message and start fade-in
        setTimeout(() => {
          setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length)
          setTransitionState('fading-in')
          
          // After fade-in completes, return to idle
          setTimeout(() => {
            setTransitionState('idle')
          }, 300) // fade-in duration
        }, 300) // fade-out duration
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
            ) : error || subscriptionError ? (
              <div className="header-carousel">
                <div className="carousel-message carousel-error">
                  {subscriptionError || 'Unable to load messages'}
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="header-carousel">
                <div className="carousel-message carousel-empty">Welcome to MyGGV!</div>
              </div>
            ) : (
              <div className="header-carousel">
                <div className={`carousel-message carousel-active ${transitionState}`}>
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