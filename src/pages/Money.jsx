import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { useUser } from '../contexts'
import { canCollectDailyCoin, collectDailyCoin } from '../services/profilesService'
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import ReferralModal from '../components/ReferralModal'
import ReferralCodeInput from '../components/ReferralCodeInput'
import '../styles/Money.css'

function Money() {
  const { profile, refreshProfile } = useUser()
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [collectionStatus, setCollectionStatus] = useState(null)
  const [timeUntilNext, setTimeUntilNext] = useState('')
  const [showReferralModal, setShowReferralModal] = useState(false)

  const checkCollectionStatus = useCallback(async () => {
    if (!profile) return

    setCheckingStatus(true)
    const { data, error } = await canCollectDailyCoin()
    setCheckingStatus(false)

    if (error) {
      console.error('Error checking collection status:', error)
      return
    }

    setCollectionStatus(data)
  }, [profile])

  const handleCollectCoin = async () => {
    setLoading(true)

    const { data, error } = await collectDailyCoin()

    setLoading(false)

    if (error) {
      toast.error(error.message || 'Failed to collect daily coin')
      return
    }

    if (data && data.success) {
      toast.success(`🪙 +1 coin collected! New balance: ${data.new_balance} coins`)
      await refreshProfile()
      await checkCollectionStatus()
    }
  }

  // Check collection status on mount and when profile changes
  useEffect(() => {
    if (profile) {
      checkCollectionStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  // Check for payment success/failure in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paymentStatus = params.get('payment')

    if (paymentStatus === 'success') {
      toast.success('🎉 Payment successful! Your coins have been added.')
      refreshProfile()
      // Clean URL
      window.history.replaceState({}, '', '/money')
    } else if (paymentStatus === 'failed') {
      toast.error('Payment failed. Please try again.')
      // Clean URL
      window.history.replaceState({}, '', '/money')
    }
  }, [refreshProfile])

  // Update countdown timer
  useEffect(() => {
    if (!collectionStatus?.next_collection_at) return

    const updateCountdown = () => {
      const now = new Date()
      const next = new Date(collectionStatus.next_collection_at)
      const diff = next - now

      if (diff <= 0) {
        setTimeUntilNext('Available now!')
        checkCollectionStatus() // Recheck status
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeUntilNext(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [collectionStatus, checkCollectionStatus])

  const userCoins = profile?.coins || 0

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-header">
          <h2>Money</h2>
          <p className="page-subtitle">Manage your coins and collect daily rewards</p>
        </div>

        <div className="money-grid">
          {/* Card 1: Coin Balance */}
          <Card className="money-card balance-card">
            <CardHeader>
              <CardTitle>💰 Your Balance</CardTitle>
              <CardDescription>
                Current coin balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="balance-display">
                <span className="balance-icon">🪙</span>
                <span className="balance-amount">{userCoins}</span>
                <span className="balance-label">coins</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Daily Collection */}
          <Card className="money-card collection-card">
            <CardHeader>
              <CardTitle>🎁 Daily Reward</CardTitle>
              <CardDescription>
                Collect 1 free coin every day
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checkingStatus ? (
                <div className="collection-status">
                  <p className="status-text">Checking status...</p>
                </div>
              ) : collectionStatus?.can_collect ? (
                <div className="collection-available">
                  <div className="reward-display">
                    <span className="reward-icon">🎁</span>
                    <span className="reward-text">+1 coin available!</span>
                  </div>
                  <Button
                    variant="primary"
                    fullWidth
                    loading={loading}
                    onClick={handleCollectCoin}
                    disabled={!profile}
                  >
                    Collect Daily Coin
                  </Button>
                </div>
              ) : (
                <div className="collection-unavailable">
                  <div className="status-info">
                    <p className="status-text">✅ Already collected today</p>
                    {collectionStatus?.last_collection && (
                      <p className="last-collection">
                        Last collection: {new Date(collectionStatus.last_collection).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="next-collection">
                    <p className="next-label">Next collection in:</p>
                    <p className="countdown">{timeUntilNext}</p>
                  </div>
                  <Button
                    variant="secondary"
                    fullWidth
                    disabled
                  >
                    Come Back Tomorrow
                  </Button>
                </div>
              )}

              {!profile && (
                <p className="warning-text">
                  You must be logged in to collect coins
                </p>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Buy Coins - TEMPORARILY DISABLED */}
          {/* <Card className="money-card purchase-card">
            <CardHeader>
              <CardTitle>💳 Buy Coins</CardTitle>
              <CardDescription>
                Purchase coins instantly with GCash
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="purchase-info">
                <div className="purchase-icon">🪙</div>
                <p className="purchase-text">
                  Get more coins instantly! Pay securely with GCash and receive your coins immediately.
                </p>
                <div className="purchase-features">
                  <div className="feature-item">
                    <span>⚡</span>
                    <span>Instant delivery</span>
                  </div>
                  <div className="feature-item">
                    <span>🔒</span>
                    <span>Secure payment</span>
                  </div>
                  <div className="feature-item">
                    <span>💰</span>
                    <span>Best value packages</span>
                  </div>
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setShowPurchaseModal(true)}
                  disabled={!profile}
                >
                  Buy Coins with GCash
                </Button>
              </div>
            </CardContent>
          </Card> */}

          {/* Card 4: Referral Program */}
          <Card className="money-card referral-card">
            <CardHeader>
              <CardTitle>🎁 Invite Friends</CardTitle>
              <CardDescription>
                Earn 10 coins for each friend who joins!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="referral-info">
                <div className="referral-icon">👥</div>
                <p className="referral-text">
                  Share your referral code with friends. When they complete their profile, you both get bonus coins!
                </p>
                <div className="referral-rewards">
                  <div className="reward-item">
                    <span className="reward-emoji">🎉</span>
                    <div>
                      <strong>You get 10 coins</strong>
                      <p>For each successful referral</p>
                    </div>
                  </div>
                  <div className="reward-item">
                    <span className="reward-emoji">🎁</span>
                    <div>
                      <strong>They get 10 coins</strong>
                      <p>Welcome bonus for new users</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setShowReferralModal(true)}
                  disabled={!profile}
                >
                  📱 Share this app with a QR
                </Button>

                {/* Only show referral code input if user hasn't been referred yet */}
                {profile && !profile.referred_by && (
                  <ReferralCodeInput
                    onSuccess={() => {
                      toast.success('🎉 Referral code applied! You\'ll get 10 bonus coins when you complete your profile.');
                      refreshProfile();
                    }}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 5: How to Earn */}
          <Card className="money-card info-card">
            <CardHeader>
              <CardTitle>📊 How to Earn Coins</CardTitle>
              <CardDescription>
                Free ways to get more coins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="earn-list">
                <li className="earn-item">
                  <span className="earn-icon">🎁</span>
                  <div className="earn-details">
                    <strong>Daily Collection</strong>
                    <p>Collect 1 free coin every day</p>
                  </div>
                </li>
                <li className="earn-item">
                  <span className="earn-icon">👥</span>
                  <div className="earn-details">
                    <strong>Refer Friends</strong>
                    <p>Earn 10 coins per referral</p>
                  </div>
                </li>
                <li className="earn-item">
                  <span className="earn-icon">🏆</span>
                  <div className="earn-details">
                    <strong>Achievements</strong>
                    <p>Complete challenges for rewards</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <ReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
      />
    </div>
  )
}

export default Money