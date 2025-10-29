import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { useUser } from '../contexts'
import { canCollectDailyCoin, collectDailyCoin } from '../services/profilesService'
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import ReferralModal from '../components/ReferralModal'
import ReferralCodeInput from '../components/ReferralCodeInput'
import styles from '../styles/Money.module.css'

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

        <div className={styles.moneyGrid}>
          {/* Card 1: Coin Balance */}
          <Card className={`${styles.moneyCard} ${styles.balanceCard}`}>
            <CardHeader>
              <CardTitle>💰 Your Balance</CardTitle>
              {/* <CardDescription>
                Current coin balance
              </CardDescription> */}
            </CardHeader>
            <CardContent>
              <div className={styles.balanceDisplay}>
                <span className={styles.balanceIcon}>🪙</span>
                <span className={styles.balanceAmount}>{userCoins}</span>
                <span className={styles.balanceLabel}>coins</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Daily Collection */}
          <Card className={`${styles.moneyCard} ${styles.collectionCard}`}>
            <CardHeader>
              <CardTitle>🎁 Daily Reward</CardTitle>
              <CardDescription>
                Collect 1 free coin every day
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checkingStatus ? (
                <div className={styles.collectionStatus}>
                  <p className={styles.statusText}>Checking status...</p>
                </div>
              ) : collectionStatus?.can_collect ? (
                <div className={styles.collectionAvailable}>
                  <div className={styles.rewardDisplay}>
                    <span className={styles.rewardIcon}>🎁</span>
                    <span className={styles.rewardText}>+1 coin available!</span>
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
                <div className={styles.collectionUnavailable}>
                  <div className={styles.statusInfo}>
                    <p className={styles.statusText}>✅ Already collected today</p>
                    {collectionStatus?.last_collection && (
                      <p className={styles.lastCollection}>
                        Last collection: {new Date(collectionStatus.last_collection).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className={styles.nextCollection}>
                    <p className={styles.nextLabel}>Next collection in:</p>
                    <p className={styles.countdown}>{timeUntilNext}</p>
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
                <p className={styles.warningText}>
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
          <Card className={`${styles.moneyCard} ${styles.referralCard}`}>
            <CardHeader>
              <CardTitle>🎁 Invite Friends</CardTitle>
              <CardDescription>
                Earn 10 coins for each friend who joins!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.referralInfo}>
                <div className={styles.referralIcon}>👥</div>
                <p className={styles.referralText}>
                  Share your referral code with friends. When they complete their profile, you both get bonus coins!
                </p>
                <div className={styles.referralRewards}>
                  <div className={styles.rewardItem}>
                    <span className={styles.rewardEmoji}>🎉</span>
                    <div>
                      <strong>You get 10 coins</strong>
                      <p>For each successful referral</p>
                    </div>
                  </div>
                  <div className={styles.rewardItem}>
                    <span className={styles.rewardEmoji}>🎁</span>
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

                {/* Only show referral code input if user hasn't been referred yet and within 48h window */}
                {profile && !profile.referred_by && (() => {
                  const REFERRAL_WINDOW_HOURS = 48;
                  const createdAt = new Date(profile.created_at);
                  const now = new Date();
                  const hoursSinceRegistration = (now - createdAt) / (1000 * 60 * 60);
                  const isWithinWindow = hoursSinceRegistration <= REFERRAL_WINDOW_HOURS;
                  const hoursRemaining = Math.max(0, REFERRAL_WINDOW_HOURS - hoursSinceRegistration);

                  return isWithinWindow ? (
                    <div style={{ marginTop: '1rem' }}>
                      {hoursRemaining < 24 && (
                        <p style={{
                          fontSize: '0.85rem',
                          color: '#ff6b6b',
                          textAlign: 'center',
                          marginBottom: '0.75rem',
                          fontWeight: '500'
                        }}>
                          ⏰ Only {Math.floor(hoursRemaining)} hours left to use a referral code!
                        </p>
                      )}
                      <ReferralCodeInput
                        onSuccess={() => {
                          toast.success('🎉 Referral code applied! You both received 10 coins!');
                          refreshProfile();
                        }}
                      />
                    </div>
                  ) : null;
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Coming Soon - Rewarded Videos */}
          <Card className={styles.moneyCard}>
            <CardHeader>
              <CardTitle>🎬 Coming Soon</CardTitle>
              <CardDescription>
                More ways to earn coins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.comingSoonContent}>
                <div className={styles.comingSoonIcon}>📺</div>
                <h3 className={styles.comingSoonTitle}>Rewarded Videos</h3>
                <p className={styles.comingSoonText}>
                  Based on the success of this app, we'll introduce rewarded video ads where you can watch short videos to earn coins... and maybe more !
                </p>
                <div className={styles.comingSoonFeatures}>
                  <div className={styles.featureItem}>
                    <span>🎥</span>
                    <span>Watch short videos</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span>🪙</span>
                    <span>Earn bonus coins...</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span>⚡</span>
                    <span>Quick & easy rewards</span>
                  </div>
                </div>
                <div className={styles.comingSoonBadge}>
                  <span>🚀 Coming Soon</span>
                </div>
              </div>
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