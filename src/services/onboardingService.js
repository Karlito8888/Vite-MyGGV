import { supabase } from '../utils/supabase'
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
      
      // Sort blocks numerically if they are numbers, otherwise alphabetically
      const sortedBlocks = uniqueBlocks.sort((a, b) => {
        const numA = parseInt(a, 10)
        const numB = parseInt(b, 10)
        
        // If both are valid numbers, sort numerically
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB
        }
        
        // Otherwise, sort alphabetically
        return String(a).localeCompare(String(b))
      })
      
      return {
        success: true,
        data: sortedBlocks
      }
    } catch (error) {

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
      
      // Sort lots numerically if they are numbers, otherwise alphabetically
      const sortedLots = lots.sort((a, b) => {
        const numA = parseInt(a, 10)
        const numB = parseInt(b, 10)
        
        // If both are valid numbers, sort numerically
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB
        }
        
        // Otherwise, sort alphabetically
        return String(a).localeCompare(String(b))
      })
      
      return {
        success: true,
        data: sortedLots
      }
    } catch (error) {

      return {
        success: false,
        error: error.message,
        data: []
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
      } catch {
        // Silently handle errors - location data is optional for onboarding
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

      return {
        success: false,
        error: error.message,
        data: { username: '', avatar_url: '', block: '', lot: '' }
      }
    }
  },

  async completeOnboarding(userId, profileData) {
    try {
      // Validate required fields
      if (!userId) {
        throw new Error('User ID is required for onboarding')
      }
      
      if (!profileData) {
        throw new Error('Profile data is required for onboarding')
      }

      const { username, avatar_url, block, lot } = profileData
      
      // Validate username
      if (!username || username.trim().length === 0) {
        throw new Error('Username is required')
      }

      // Validate avatar_url
      if (!avatar_url || avatar_url.trim().length === 0) {
        throw new Error('Profile picture is required')
      }

      // Validate location fields
      if (!block || block.trim().length === 0) {
        throw new Error('Block is required')
      }

      if (!lot || lot.trim().length === 0) {
        throw new Error('Lot is required')
      }
      
      // Update profile with username and avatar first
      const profileUpdateData = {
        username: username.trim(),
        avatar_url: avatar_url.trim(),
        updated_at: new Date().toISOString()
      }



      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', userId)
        .select()
        .single()

      if (profileError) {
  
        throw new Error(`Failed to update profile: ${profileError.message}`)
      }



      // Handle location assignment using the optimized workflow


      const { data: locationResult, error: locationError } = await supabase
        .rpc('handle_onboarding_location_assignment', {
          p_user_id: userId,
          p_block: block.trim(),
          p_lot: lot.trim(),
          p_request_message: 'I would like to be associated with this location during onboarding'
        })

      if (locationError) {
  
        throw new Error(`Failed to assign location: ${locationError.message}`)
      }



      // Determine if onboarding should be completed now or later
      const assignmentType = locationResult.assignment_type
      let shouldCompleteOnboarding = false

      if (assignmentType === 'direct') {
        // Direct assignment - complete onboarding now
        shouldCompleteOnboarding = true

      } else if (assignmentType === 'request') {
        // Request sent - ALSO complete onboarding to allow app access
        // The trigger will handle the rest when approved
        shouldCompleteOnboarding = true

      } else {

        // Default to completing onboarding for safety
        shouldCompleteOnboarding = true
      }

      if (shouldCompleteOnboarding) {
        // Complete onboarding


        const { error: finalUpdateError } = await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', userId)

        if (finalUpdateError) {

          throw new Error(`Failed to complete onboarding: ${finalUpdateError.message}`)
        }



        return {
          success: true,
          data: updatedProfile,
          locationResult: {
            type: assignmentType === 'direct' ? 'direct_assignment' : 'pending_approval',
            message: assignmentType === 'direct' 
              ? 'Location assigned and onboarding completed successfully'
              : 'Location request sent. You can use the app while waiting for approval.',
            details: locationResult.result
          }
        }
      } else {
        // This shouldn't happen anymore, but keep as fallback

        return {
          success: true,
          data: updatedProfile,
          locationResult: {
            type: 'pending_approval',
            message: 'Location request sent. Onboarding will be completed after owner approval.',
            details: locationResult.result
          }
        }
      }
    } catch (error) {

      return {
        success: false,
        error: error.message || 'An unknown error occurred during onboarding'
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

      return {
        success: false,
        error: error.message
      }
    }
  },





}