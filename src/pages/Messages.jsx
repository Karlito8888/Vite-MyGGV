import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { z } from 'zod'
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { createHeaderMessage } from '../services/messagesHeaderService'
import { useUser } from '../contexts'
import PageTransition from '../components/PageTransition'
import styles from '../styles/Messages.module.css'

const DURATION_OPTIONS = [
  { hours: 12, coins: 1, label: '12 hours' },
  { hours: 24, coins: 2, label: '24 hours' },
  { hours: 168, coins: 10, label: '1 week' }
]

const MAX_MESSAGE_LENGTH = 70

const headerMessageSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(MAX_MESSAGE_LENGTH, `Message must not exceed ${MAX_MESSAGE_LENGTH} characters`)
})

function Messages() {
  const { profile, refreshProfile } = useUser()
  const [headerMessage, setHeaderMessage] = useState('')
  const [selectedDuration, setSelectedDuration] = useState(12)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedOption = DURATION_OPTIONS.find(opt => opt.hours === selectedDuration)
  const userCoins = profile?.coins || 0
  const hasEnoughCoins = userCoins >= (selectedOption?.coins || 0)

  const handlePublishHeaderMessage = async (e) => {
    e.preventDefault()
    setError('')

    // Validate message with Zod
    const validation = headerMessageSchema.safeParse({ message: headerMessage })
    if (!validation.success) {
      const errorMessage = validation.error.errors[0].message
      setError(errorMessage)
      toast.error(errorMessage)
      return
    }

    if (!hasEnoughCoins) {
      const errorMessage = `Insufficient coins. You need ${selectedOption.coins} coins but only have ${userCoins}`
      setError(errorMessage)
      toast.error(errorMessage)
      return
    }

    setLoading(true)

    const { data, error: publishError } = await createHeaderMessage({
      message: headerMessage,
      duration_hours: selectedDuration
    })

    setLoading(false)

    if (publishError) {
      setError(publishError.message || 'Error publishing message')
      toast.error(publishError.message || 'Error publishing message')
    } else if (data && data.success) {
      setHeaderMessage('')
      await refreshProfile()
      toast.success(
        <div>
          Message published successfully!
          <br />
          New balance: {data.new_balance} coins
        </div>
      )
    } else {
      setError(data?.error || 'Failed to publish message')
      toast.error(data?.error || 'Failed to publish message')
    }
  }

  const remainingChars = MAX_MESSAGE_LENGTH - headerMessage.length
  const isMessageTooLong = headerMessage.length > MAX_MESSAGE_LENGTH

  return (
    <PageTransition>
      <div className="page-container">
        <div className="page-content">
          <div className="page-header">
            <h2>Messages</h2>
            <p className="page-subtitle">Post a message, or check your private messages</p>
          </div>

          <div className={styles.messagesGrid}>
            {/* Card 1: Publish header message */}
            <Card className={styles.messageCard}>
              <CardHeader>
                <CardTitle>📢 Public Message</CardTitle>
                <CardDescription>
                  Post a public message in the banner ☝️
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profile && (
                  <div className={styles.coinsBalance}>
                    <span className={styles.coinsIcon}>🪙</span>
                    <span className={styles.coinsText}>Your balance: <strong>{userCoins} coins</strong></span>
                  </div>
                )}

                <form onSubmit={handlePublishHeaderMessage} className={styles.messageForm}>
                  <div className={styles.messageInputWrapper}>
                    <Input
                      as="textarea"
                      label="Your message (max 70 characters)"
                      placeholder="Write your message here..."
                      value={headerMessage}
                      onChange={(e) => setHeaderMessage(e.target.value)}
                      error={error}
                      rows={4}
                      required
                      maxLength={MAX_MESSAGE_LENGTH}
                    />
                    <div className={`${styles.characterCounter} ${isMessageTooLong ? styles.error : remainingChars < 10 ? styles.warning : ''}`}>
                      {remainingChars} / {MAX_MESSAGE_LENGTH} characters remaining
                    </div>
                  </div>

                  <div className={styles.durationSelector}>
                    <label className={styles.durationLabel}>Duration</label>
                    <div className={styles.durationOptions}>
                      {DURATION_OPTIONS.map((option) => (
                        <button
                          key={option.hours}
                          type="button"
                          className={`${styles.durationOption} ${selectedDuration === option.hours ? styles.active : ''} ${userCoins < option.coins ? styles.disabled : ''}`}
                          onClick={() => setSelectedDuration(option.hours)}
                          disabled={userCoins < option.coins}
                        >
                          <span className={styles.durationTime}>{option.label}</span>
                          <span className={styles.durationCost}>
                            🪙 {option.coins} {option.coins === 1 ? 'coin' : 'coins'}
                          </span>
                          {userCoins < option.coins && (
                            <span className={styles.durationInsufficient}>Insufficient</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={loading}
                    disabled={!profile || !hasEnoughCoins || isMessageTooLong || !headerMessage.trim()}
                  >
                    Publish for {selectedOption?.coins} {selectedOption?.coins === 1 ? 'coin' : 'coins'}
                  </Button>

                  {!profile && (
                    <p className={styles.messageWarning}>
                      You must be logged in to publish a message
                    </p>
                  )}

                  {profile && !hasEnoughCoins && (
                    <p className={styles.messageWarning}>
                      You need {selectedOption?.coins} coins to publish this message
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Card 2: Private messages */}
            <Card className={styles.messageCard} hover>
              <CardHeader>
                <CardTitle>💬 Private Messages</CardTitle>
                <CardDescription>
                  View and manage your private conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.privateMessagesInfo}>
                  <p className={styles.infoText}>
                    Access your private messaging to exchange with other users confidentially.
                  </p>
                  <ul className={styles.featuresList}>
                    <li>✓ Real-time conversations</li>
                    <li>✓ New message notifications</li>
                    <li>✓ Complete history</li>
                  </ul>
                </div>
                {profile ? (
                  <Link to="/private-messages" className="btn btn-secondary btn-full">
                    Open Messaging
                  </Link>
                ) : (
                  <Button
                    variant="secondary"
                    fullWidth
                    disabled
                  >
                    Open Messaging
                  </Button>
                )}
                {!profile && (
                  <p className={styles.messageWarning}>
                    You must be logged in to access your messages
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default Messages