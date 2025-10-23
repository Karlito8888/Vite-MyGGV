import { useEffect, useState } from 'react'
import { onboardingService } from '../services/onboardingService'
import { useUser } from '../contexts'
import '../styles/LocationRequests.css'

function LocationRequests() {
  const { user } = useUser()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState({})



  useEffect(() => {
    if (!user) return

    const fetchRequests = async () => {
      try {
        const result = await onboardingService.getOwnerPendingRequests(user.id)
        if (result.success) {
          setRequests(result.data)
        }
      } catch (error) {
        console.error('Error fetching requests:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [user])

  const handleResponse = async (requestId, approve) => {
    setProcessing(prev => ({ ...prev, [requestId]: true }))
    
    try {
      const result = await onboardingService.respondToLocationRequest(requestId, approve)
      if (result.success) {
        // Remove the request from the list
        setRequests(prev => prev.filter(req => req.id !== requestId))
        
        // Show success message
        alert(result.data.message || `Request ${approve ? 'approved' : 'denied'} successfully!`)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error responding to request:', error)
      alert('An error occurred while processing your request')
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="location-requests-container">
        <div className="loading">Loading location requests...</div>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="location-requests-container">
        <div className="no-requests">
          <h2>🏠 Location Requests</h2>
          <p>You don't have any pending location requests.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="location-requests-container">
      <h2>🏠 Pending Location Requests</h2>
      <p className="subtitle">Review requests from users who want to be associated with your locations</p>
      
      <div className="requests-list">
        {requests.map((request) => (
          <div key={request.id} className="request-card">
            <div className="request-header">
              <div className="location-info">
                <h3>📍 {request.locations.block} {request.locations.lot}</h3>
                <p className="request-date">Requested on {new Date(request.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="requester-info">
              <div className="requester-avatar">
                {request.requester.avatar_url ? (
                  <img src={request.requester.avatar_url} alt="Avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {request.requester.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="requester-details">
                <h4>{request.requester.username || 'Unknown User'}</h4>
                <p>{request.requester.full_name || ''}</p>
              </div>
            </div>
            
            <div className="request-actions">
              <button
                className="btn btn-deny"
                onClick={() => handleResponse(request.id, false)}
                disabled={processing[request.id]}
              >
                {processing[request.id] ? 'Processing...' : '❌ Deny'}
              </button>
              <button
                className="btn btn-approve"
                onClick={() => handleResponse(request.id, true)}
                disabled={processing[request.id]}
              >
                {processing[request.id] ? 'Processing...' : '✅ Approve'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="info-section">
        <h3>ℹ️ What happens when you approve?</h3>
        <ul>
          <li>The user will be associated with your location</li>
          <li>The user's onboarding will be completed</li>
          <li>Both of you will receive notifications</li>
          <li>You remain the primary owner of the location</li>
        </ul>
      </div>
    </div>
  )
}

export default LocationRequests