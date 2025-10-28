import { supabase } from '../utils/supabase'

/**
 * Packages de coins disponibles
 */
export const COIN_PACKAGES = [
  { id: 'small', coins: 10, price: 50, label: '10 Coins', popular: false },
  { id: 'medium', coins: 25, price: 100, label: '25 Coins', popular: true },
  { id: 'large', coins: 60, price: 200, label: '60 Coins', popular: false },
  { id: 'mega', coins: 150, price: 500, label: '150 Coins', popular: false },
]

/**
 * Créer un paiement GCash via Supabase Edge Function
 */
export async function createGCashPayment(packageId, userId) {
  try {
    const coinPackage = COIN_PACKAGES.find(p => p.id === packageId)
    if (!coinPackage) {
      throw new Error('Invalid package')
    }

    // Récupérer le token d'authentification
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Not authenticated')
    }

    // Appeler la Edge Function Supabase avec le token
    const { data, error } = await supabase.functions.invoke('create-gcash-payment', {
      body: {
        package_id: packageId,
        user_id: userId,
        coins: coinPackage.coins,
        amount: coinPackage.price,
        return_url: `${window.location.origin}/money?payment=success`
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) {
      console.error('Edge Function error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      throw error
    }

    console.log('Edge Function response data:', data)

    if (!data.success) {
      console.error('Payment failed:', data)
      throw new Error(data.error || 'Payment creation failed')
    }

    return {
      success: true,
      transaction_id: data.transaction_id,
      checkout_url: data.checkout_url
    }
  } catch (error) {
    console.error('Error creating GCash payment:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Récupérer l'historique des transactions d'un utilisateur
 */
export async function getUserTransactions(userId) {
  try {
    const { data, error } = await supabase
      .from('coin_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, transactions: data }
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return { success: false, error: error.message }
  }
}
