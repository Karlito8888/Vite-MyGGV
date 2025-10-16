import { supabase } from '../utils/supabase'
import { avatarService } from './avatarService'
import { getProfileAssociations } from './profileLocationAssociationsService'

export const onboardingService = {
  async getAvailableBlocks() {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('block')
        .is('deleted_at', null)
        .order('block')

      if (error) throw error
      
      // Get unique blocks
      const uniqueBlocks = [...new Set(data?.map(item => item.block) || [])]
      
      return {
        success: true,
        data: uniqueBlocks
      }
    } catch (error) {
      console.error('Error fetching available blocks:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  async getLotsByBlock(block) {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('lot')
        .eq('block', block)
        .is('deleted_at', null)
        .order('lot')

      if (error) throw error
      
      const lots = data?.map(item => item.lot) || []
      
      return {
        success: true,
        data: lots
      }
    } catch (error) {
      console.error('Error fetching lots for block:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  async getOnboardingStatus(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .single()

      if (error) throw error
      
      return {
        success: true,
        onboardingCompleted: data?.onboarding_completed || false
      }
    } catch (error) {
      console.error('Error fetching onboarding status:', error)
      return {
        success: false,
        error: error.message,
        onboardingCompleted: false
      }
    }
  },

  async getProfileData(userId) {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      // Get location data using the existing service layer
      let block = ''
      let lot = ''

      try {
        const { data: associations, error: associationError } = await getProfileAssociations(userId)
        
        if (!associationError && associations && associations.length > 0) {
          const locationData = associations[0].location
          if (locationData) {
            block = locationData.block || ''
            lot = locationData.lot || ''
          }
        }
      } catch (err) {
        // Silently handle errors - location data is optional for onboarding
        console.warn('Error fetching location data:', err)
      }

      const result = {
        username: profileData?.username || '',
        avatar_url: profileData?.avatar_url || '',
        block,
        lot
      }
      
      return {
        success: true,
        data: result
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
      return {
        success: false,
        error: error.message,
        data: { username: '', avatar_url: '', block: '', lot: '' }
      }
    }
  },

  async completeOnboarding(userId, profileData) {
    try {
      // Extract profile fields and location fields
      const { username, avatar_url, avatar_file, block, lot } = profileData
      
      let finalAvatarUrl = avatar_url

      // Handle avatar file upload if provided
      if (avatar_file && !avatar_url) {
        const uploadResult = await avatarService.uploadAvatar(userId, avatar_file)
        if (uploadResult.success) {
          finalAvatarUrl = uploadResult.data.url
        } else {
          console.error('Avatar upload failed:', uploadResult.error)
          // Continue with onboarding even if avatar upload fails
        }
      }
      
      // Update profile with username and avatar first
      const profileUpdateData = {
        username,
        avatar_url: finalAvatarUrl,
        updated_at: new Date().toISOString()
      }

      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', userId)
        .select()
        .single()

      if (profileError) throw profileError

      // Handle location assignment using the optimized workflow
      const { data: locationResult, error: locationError } = await supabase
        .rpc('handle_onboarding_location_assignment', {
          p_user_id: userId,
          p_block: block.trim(),
          p_lot: lot.trim(),
          p_request_message: 'I would like to be associated with this location during onboarding'
        })

      if (locationError) throw locationError

      // Determine if onboarding should be completed now or later
      const assignmentType = locationResult.assignment_type
      let shouldCompleteOnboarding = false

      if (assignmentType === 'direct') {
        // Direct assignment - complete onboarding now
        shouldCompleteOnboarding = true
      } else if (assignmentType === 'request') {
        // Request sent - don't complete onboarding yet
        shouldCompleteOnboarding = false
      }

      if (shouldCompleteOnboarding) {
        // Complete onboarding
        const { error: finalUpdateError } = await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', userId)

        if (finalUpdateError) throw finalUpdateError

        return {
          success: true,
          data: updatedProfile,
          locationResult: {
            type: 'direct_assignment',
            message: 'Location assigned and onboarding completed successfully',
            details: locationResult.result
          }
        }
      } else {
        // Onboarding pending approval
        return {
          success: true,
          data: updatedProfile,
          locationResult: {
            type: 'pending_approval',
            message: 'Location request sent. Onboarding will be completed after owner approval.',
            details: locationResult.result,
            note: 'You can continue using the app, but some features may be limited until location is approved.'
          }
        }
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // New method to check location availability before onboarding
  async checkLocationAvailability(block, lot) {
    try {
      const { data, error } = await supabase
        .rpc('check_location_availability', {
          p_block: block.trim(),
          p_lot: lot.trim()
        })

      if (error) throw error

      return {
        success: true,
        data: data
      }
    } catch (error) {
      console.error('Error checking location availability:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // New method to get user's location requests
  async getUserLocationRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('location_association_requests')
        .select(`
          id,
          status,
          created_at,
          approved_at,
          rejected_at,
          locations:block, lot,
          approver:profiles!location_association_requests_approver_id_fkey(
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('requester_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        success: true,
        data: data
      }
    } catch (error) {
      console.error('Error fetching location requests:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // New method for owners to get their pending requests
  async getOwnerPendingRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('location_association_requests')
        .select(`
          id,
          status,
          created_at,
          locations:block, lot,
          requester:profiles!location_association_requests_requester_id_fkey(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('approver_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        success: true,
        data: data
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // New method to respond to location requests
  async respondToLocationRequest(requestId, approve, responseMessage = null) {
    try {
      const { data, error } = await supabase
        .rpc('respond_to_location_request', {
          p_request_id: requestId,
          p_approve: approve,
          p_response_message: responseMessage
        })

      if (error) throw error

      return {
        success: true,
        data: data
      }
    } catch (error) {
      console.error('Error responding to location request:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
    * Handle location assignment during onboarding
    * @param {string} userId - User ID
    * @param {Object} data - Onboarding data including block, lot, and avatar
    * @returns {Promise<Object>} Result with assignment details
    */
  async handleLocationAssignment(userId, data) {
    try {
      const { username, avatar_url, avatar_file, block, lot } = data
      
      let finalAvatarUrl = avatar_url

      // Handle avatar file upload if provided
      if (avatar_file && !avatar_url) {
        const uploadResult = await avatarService.uploadAvatar(userId, avatar_file)
        if (uploadResult.success) {
          finalAvatarUrl = uploadResult.data.url
        } else {
          console.error('Avatar upload failed:', uploadResult.error)
          // Continue with onboarding even if avatar upload fails
        }
      }

      // Update profile with username and avatar
      const profileUpdateData = {
        username,
        avatar_url: finalAvatarUrl,
        updated_at: new Date().toISOString()
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', userId)

      if (profileError) throw profileError

      // Handle location assignment
      const { data: result, error } = await supabase.rpc('handle_onboarding_location_assignment', {
        p_user_id: userId,
        p_block: block,
        p_lot: lot
      })

      if (error) throw error

      return {
        success: true,
        data: result
      }
    } catch (error) {
      console.error('Error handling location assignment:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Check if user should be redirected to home
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Whether redirect is needed
   */
  async checkRedirectNeeded(userId) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('redirect_to_home')
        .eq('id', userId)
        .single()

      if (error) throw error

      return profile?.redirect_to_home || false
    } catch (error) {
      console.error('Error checking redirect status:', error)
      return false
    }
  },

  /**
   * Clear redirect flag after handling
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async clearRedirectFlag(userId) {
    try {
      const { error } = await supabase.rpc('clear_redirect_flag', {
        user_id: userId
      })

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error clearing redirect flag:', error)
      return false
    }
  }


}