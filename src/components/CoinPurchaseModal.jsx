import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { useUser } from '../contexts'
import { COIN_PACKAGES, createGCashPayment } from '../services/paymentService'
import Button from './ui/Button'
import styles from './CoinPurchaseModal.module.css'

function CoinPurchaseModal({ isOpen, onClose }) {
  const { profile } = useUser()
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('select') // 'select' | 'processing' | 'redirecting'

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg)
  }

  const handlePurchase = async () => {
    if (!selectedPackage || !profile) return

    setLoading(true)
    setStep('processing')

    try {
      // Créer le paiement via Supabase Edge Function
      const result = await createGCashPayment(selectedPackage.id, profile.id)

      if (!result.success) {
        throw new Error(result.error)
      }

      // Rediriger vers GCash
      if (result.checkout_url) {
        setStep('redirecting')
        toast.info('Redirecting to GCash...')
        
        // Rediriger vers GCash
        window.location.href = result.checkout_url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      toast.error(error.message || 'Failed to initiate payment')
      setLoading(false)
      setStep('select')
    }
  }

  const handleClose = () => {
    if (!loading) {
      setSelectedPackage(null)
      setStep('select')
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`modal-overlay ${styles.modalOverlay}`}
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={`modal-content ${styles.coinPurchaseModal}`}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            style={{
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
            }}
          >
            <div className="modal-header">
              <h2>💰 Buy Coins</h2>
              <button className="modal-close" onClick={handleClose} disabled={loading}>
                ×
              </button>
            </div>

            <div className="modal-body">
          {step === 'select' && (
            <>
              <p className={styles.modalDescription}>
                Choose a coin package to purchase with GCash
              </p>

              <div className={styles.coinPackages}>
                {COIN_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`${styles.coinPackage} ${selectedPackage?.id === pkg.id ? styles.selected : ''} ${pkg.popular ? styles.popular : ''}`}
                    onClick={() => handleSelectPackage(pkg)}
                  >
                    {pkg.popular && <div className={styles.popularBadge}>Most Popular</div>}
                    <div className={styles.packageIcon}>🪙</div>
                    <div className={styles.packageCoins}>{pkg.coins} Coins</div>
                    <div className={styles.packagePrice}>₱{pkg.price}</div>
                    <div className={styles.packageRate}>₱{(pkg.price / pkg.coins).toFixed(2)} per coin</div>
                  </div>
                ))}
              </div>

              {selectedPackage && (
                <div className={styles.purchaseSummary}>
                  <div className={styles.summaryRow}>
                    <span>Package:</span>
                    <strong>{selectedPackage.label}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Amount:</span>
                    <strong>₱{selectedPackage.price}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Payment Method:</span>
                    <strong>GCash</strong>
                  </div>
                  <div className={styles.summaryNote}>
                    <small>💳 You'll be redirected to GCash to complete payment</small>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 'processing' && (
            <div className={styles.processingState}>
              <div className={styles.spinner}></div>
              <p>Creating payment...</p>
            </div>
          )}

          {step === 'redirecting' && (
            <div className={styles.processingState}>
              <div className={styles.spinner}></div>
              <p>Redirecting to GCash...</p>
              <small>Please wait...</small>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step === 'select' && (
            <>
              <Button variant="secondary" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handlePurchase}
                disabled={!selectedPackage || loading}
                loading={loading}
              >
                Pay with GCash
              </Button>
            </>
          )}
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CoinPurchaseModal
