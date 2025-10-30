import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useUser } from '../contexts'
import { locationRequestsService } from '../services/locationRequestsService'
import Card, { CardHeader, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Avatar from '../components/Avatar'
import PageTransition from '../components/PageTransition'
import { ClimbingBoxLoader } from 'react-spinners'
import styles from '../styles/LocationRequests.module.css'

function LocationRequests() {
  const { user } = useUser()
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [filter, setFilter] = useState('pending') // 'pending', 'approved', 'rejected', 'all'
  const [processingId, setProcessingId] = useState(null)

  // Fetch requests
  const fetchRequests = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const statusFilter = filter === 'all' ? null : filter
      const result = await locationRequestsService.getAllRequests(user.id, statusFilter)

      if (result.success) {
        setRequests(result.data)
      } else {
        toast.error(result.error || 'Failed to load requests')
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('An error occurred while loading requests')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filter])

  // Real-time subscription
  useEffect(() => {
    if (!user) return

    const subscription = locationRequestsService.subscribeToRequests(
      user.id,
      (payload) => {

        // Refresh requests when there's a change
        fetchRequests()

        // Show notification for new requests
        if (payload.eventType === 'INSERT') {
          toast.info('📬 New location request received!')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleApprove = async (requestId) => {
    setIsProcessing(true)
    setProcessingId(requestId)
    try {
      const result = await locationRequestsService.approveRequest(requestId, user.id)

      if (result.success) {
        toast.success('✅ Request approved! User has been added to the location.')
        // Refresh the list
        await fetchRequests()
      } else {
        toast.error(result.error || 'Failed to approve request')
      }
    } catch (error) {
      console.error('Error approving request:', error)
      toast.error('An error occurred while approving the request')
    } finally {
      setIsProcessing(false)
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId) => {
    setIsProcessing(true)
    setProcessingId(requestId)
    try {
      const result = await locationRequestsService.rejectRequest(requestId, user.id)

      if (result.success) {
        toast.success('❌ Request rejected.')
        // Refresh the list
        await fetchRequests()
      } else {
        toast.error(result.error || 'Failed to reject request')
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('An error occurred while rejecting the request')
    } finally {
      setIsProcessing(false)
      setProcessingId(null)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

    return date.toLocaleDateString()
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length

  if (isLoading) {
    return (
      <PageTransition>
        <div className={styles.locationRequestsPage}>
          <div className="container-centered">
            <div className="loader-wrapper">
              <ClimbingBoxLoader color="var(--color-primary)" size={20} loading={true} />
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className={styles.locationRequestsPage}>
        <div className={styles.container}>
          <div className={styles.requestsHeader}>
            <h1>Location Requests</h1>
            {pendingCount > 0 && (
              <span className={styles.pendingBadge}>{pendingCount} pending</span>
            )}
          </div>

          <div className={styles.filterTabs}>
            <button
              className={`${styles.filterTab} ${filter === 'pending' ? styles.active : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
              {pendingCount > 0 && <span className={styles.tabCount}>{pendingCount}</span>}
            </button>
            <button
              className={`${styles.filterTab} ${filter === 'approved' ? styles.active : ''}`}
              onClick={() => setFilter('approved')}
            >
              Approved
            </button>
            <button
              className={`${styles.filterTab} ${filter === 'rejected' ? styles.active : ''}`}
              onClick={() => setFilter('rejected')}
            >
              Rejected
            </button>
            <button
              className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
          </div>

          <div className={styles.requestsList}>
            {requests.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📭</div>
                <h3>No {filter !== 'all' ? filter : ''} requests</h3>
                <p>
                  {filter === 'pending'
                    ? "You don't have any pending location requests at the moment."
                    : `No ${filter} requests found.`}
                </p>
              </div>
            ) : (
              requests.map((request) => {
                const isRequestProcessing = processingId === request.request_id
                const isDisabled = isProcessing || isRequestProcessing

                return (
                  <Card key={request.request_id} hover className={styles.locationRequestCard}>
                    <CardHeader>
                      <div className={styles.requesterInfo}>
                        <Avatar
                          src={request.requester_avatar_url}
                          fallback={request.requester_username?.[0] || 'U'}
                          size="medium"
                        />
                        <div className={styles.requesterDetails}>
                          <h3>{request.requester_full_name || request.requester_username}</h3>
                          <p className="username">@{request.requester_username}</p>
                        </div>
                      </div>
                      <div className={styles.requestTime}>
                        {formatDate(request.created_at)}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className={styles.requestBody}>
                        <div className={styles.locationInfo}>
                          <span className={styles.locationLabel}>Requesting access to:</span>
                          <span className={styles.locationValue}>
                            Block {request.location_block}, Lot {request.location_lot}
                          </span>
                        </div>
                      </div>

                      <div className={styles.requestActions}>
                        <Button
                          variant="danger"
                          onClick={() => handleReject(request.request_id)}
                          disabled={isDisabled}
                          loading={isRequestProcessing}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => handleApprove(request.request_id)}
                          disabled={isDisabled}
                          loading={isRequestProcessing}
                        >
                          Approve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default LocationRequests
