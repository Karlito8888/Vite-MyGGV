import { useState, useEffect } from 'react'
import { Clock as ClockIcon } from 'lucide-react'

function Clock({ showIcon = true, showDate = false, className = '' }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = () => {
    return time.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Manila'
    })
  }

  const formatDate = () => {
    return time.toLocaleDateString('en-PH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Manila'
    })
  }

  return (
    <div className={`clock ${className}`}>
      {showIcon && <ClockIcon size={16} />}
      <div className="clock-content">
        <span className="clock-time">{formatTime()}</span>
        {showDate && <span className="clock-date">{formatDate()}</span>}
      </div>
    </div>
  )
}

export default Clock
