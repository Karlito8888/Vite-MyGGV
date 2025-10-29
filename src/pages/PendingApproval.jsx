import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../utils/supabase'
import { useUser } from '../contexts'
import { ClimbingBoxLoader } from 'react-spinners'
import Button from '../components/ui/Button'
import styles from '../styles/PendingApproval.module.css'

function PendingApproval() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [requestInfo, setRequestInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [checkingStatus, setCheckingStatus] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const checkApprovalStatus = async () => {
      try {
        // Check if onboarding is completed
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()

        if (profile?.onboarding_completed) {
          // Onboarding completed, redirect to home
          navigate('/home', { replace: true })
          return
        }

        // Get request information
        const { data: requests } = await supabase
          .rpc('get_my_location_requests', {
            p_requester_id: user.id
          })

        if (requests && requests.length > 0) {
          const pendingRequest = requests.find(r => r.status === 'pending')
          if (pendingRequest) {
            setRequestInfo(pendingRequest)
          } else {
            // No pending request, check if rejected
            const rejectedRequest = requests.find(r => r.status === 'rejected')
            if (rejectedRequest) {
              setRequestInfo(rejectedRequest)
            }
          }
        }
      } catch (error) {
        console.error('Error checking approval status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkApprovalStatus()

    // Set up real-time subscription to check for approval
    console.log('[REALTIME] 🔌 Subscribing to approval_status channel')
    const subscription = supabase
      .channel('approval_status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new.onboarding_completed) {
            navigate('/home', { replace: true })
          }
        }
      )
      .subscribe((status) => {
        console.log('[REALTIME] 📡 Approval status channel status:', status)
      })

    return () => {
      console.log('[REALTIME] 🔌 Unsubscribing from approval_status channel')
      subscription.unsubscribe()
    }
  }, [user, navigate])

  const handleCheckStatus = async () => {
    setCheckingStatus(true)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (profile?.onboarding_completed) {
        navigate('/home', { replace: true })
      } else {
        // Refresh request info
        const { data: requests } = await supabase
          .rpc('get_my_location_requests', {
            p_requester_id: user.id
          })

        if (requests && requests.length > 0) {
          const pendingRequest = requests.find(r => r.status === 'pending')
          if (pendingRequest) {
            setRequestInfo(pendingRequest)
          }
        }
      }
    } catch (error) {
      console.error('Error checking status:', error)
    } finally {
      setCheckingStatus(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  if (isLoading) {
    return (
      <div className="page-container page-centered">
        <div className="page-content">
          <div className="loader-wrapper">
            <ClimbingBoxLoader color="var(--color-primary)" size={20} loading={true} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container page-centered">
      <div className="page-content">
        <div className={styles.pendingApprovalContent}>
          <div className={styles.iconContainer}>
            {requestInfo?.status === 'rejected' ? '❌' : '⏳'}
          </div>

          <h1>
            {requestInfo?.status === 'rejected'
              ? 'Request Rejected'
              : 'Waiting for Approval'}
          </h1>

          {requestInfo?.status === 'rejected' ? (
            <>
              <p className={styles.message}>
                Unfortunately, your request to join <strong>Block {requestInfo.location_block}, Lot {requestInfo.location_lot}</strong> has been rejected by the owner.
              </p>
              <p className={styles.subMessage}>
                Please contact the owner or try a different location.
              </p>
            </>
          ) : (
            <>
              <p className={styles.message}>
                Your request to join <strong>Block {requestInfo?.location_block}, Lot {requestInfo?.location_lot}</strong> is pending approval from the owner.
              </p>
              <p className={styles.subMessage}>
                You will receive access to the app once the owner approves your request. This page will automatically update when your request is processed.
              </p>
            </>
          )}

          <div className={styles.actions}>
            <Button
              variant="primary"
              onClick={handleCheckStatus}
              disabled={checkingStatus}
              loading={checkingStatus}
            >
              Check Status
            </Button>
            <Button
              variant="secondary"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>

          <div className={styles.infoBox}>
            <p>
              <strong>What happens next?</strong>
            </p>
            <ul>
              <li>The owner will review your request</li>
              <li>You'll be notified once a decision is made</li>
              <li>If approved, you'll gain immediate access to the app</li>
              <li>If rejected, you can try requesting a different location</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PendingApproval
