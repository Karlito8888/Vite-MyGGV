import { useState } from 'react'
import { toast } from 'react-toastify'
import { useUser } from '../contexts'
import { COIN_PACKAGES, createGCashPayment } from '../services/paymentService'
import Button from './ui/Button'
import '../styles/CoinPurchaseModal.css'

function CoinPurchaseModal({ isOpen, onClose }) {
  const { profile } = useUser()
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('select') // 'select' | 'processing' | 'redirecting'

  if (!isOpen) return null

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
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content coin-purchase-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💰 Buy Coins</h2>
          <button className="modal-close" onClick={handleClose} disabled={loading}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {step === 'select' && (
            <>
              <p className="modal-description">
                Choose a coin package to purchase with GCash
              </p>

              <div className="coin-packages">
                {COIN_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`coin-package ${selectedPackage?.id === pkg.id ? 'selected' : ''} ${pkg.popular ? 'popular' : ''}`}
                    onClick={() => handleSelectPackage(pkg)}
                  >
                    {pkg.popular && <div className="popular-badge">Most Popular</div>}
                    <div className="package-icon">🪙</div>
                    <div className="package-coins">{pkg.coins} Coins</div>
                    <div className="package-price">₱{pkg.price}</div>
                    <div className="package-rate">₱{(pkg.price / pkg.coins).toFixed(2)} per coin</div>
                  </div>
                ))}
              </div>

              {selectedPackage && (
                <div className="purchase-summary">
                  <div className="summary-row">
                    <span>Package:</span>
                    <strong>{selectedPackage.label}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Amount:</span>
                    <strong>₱{selectedPackage.price}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Payment Method:</span>
                    <strong>GCash</strong>
                  </div>
                  <div className="summary-note">
                    <small>💳 You'll be redirected to GCash to complete payment</small>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 'processing' && (
            <div className="processing-state">
              <div className="spinner"></div>
              <p>Creating payment...</p>
            </div>
          )}

          {step === 'redirecting' && (
            <div className="processing-state">
              <div className="spinner"></div>
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
      </div>
    </div>
  )
}

export default CoinPurchaseModal
