/* global Deno */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PAYMONGO_SECRET_KEY = Deno.env.get('PAYMONGO_SECRET_KEY')
const PAYMONGO_API_URL = 'https://api.paymongo.com/v1'

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('Missing authorization header')
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Créer le client Supabase avec service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // Créer un client pour vérifier le JWT de l'utilisateur
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: authHeader }
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Vérifier l'utilisateur avec le JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('Auth error:', userError?.message || 'No user found')
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          details: userError?.message || 'Invalid or expired token'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User authenticated:', user.id)

    // Créer un client avec service role pour les opérations DB
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parser le body
    const { package_id, user_id, coins, amount, return_url } = await req.json()

    // Vérifier que l'utilisateur correspond
    if (user.id !== user_id) {
      return new Response(
        JSON.stringify({ error: 'User mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Creating payment for user:', user_id, 'package:', package_id)

    // Créer une transaction en attente dans Supabase
    const { data: transaction, error: txError } = await supabase
      .from('coin_transactions')
      .insert({
        user_id: user_id,
        package_id: package_id,
        coins_amount: coins,
        price_amount: amount,
        currency: 'PHP',
        status: 'pending',
        payment_method: 'gcash'
      })
      .select()
      .single()

    if (txError) {
      console.error('Error creating transaction:', txError)
      throw new Error('Failed to create transaction')
    }

    console.log('Transaction created:', transaction.id)

    // Vérifier que la clé PayMongo est configurée
    if (!PAYMONGO_SECRET_KEY) {
      console.error('PAYMONGO_SECRET_KEY is not set!')
      throw new Error('PayMongo secret key is not configured')
    }

    console.log('PayMongo key configured:', PAYMONGO_SECRET_KEY.substring(0, 10) + '...')
    console.log('Creating payment intent for amount:', amount * 100, 'centavos')

    // Créer le Payment Intent avec PayMongo
    const paymentIntentResponse = await fetch(`${PAYMONGO_API_URL}/payment_intents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amount * 100, // Convertir en centavos
            currency: 'PHP',
            payment_method_allowed: ['gcash'],
            description: `Purchase ${coins} coins`,
            statement_descriptor: 'Coin Purchase',
            metadata: {
              transaction_id: transaction.id,
              user_id: user_id,
              package_id: package_id,
              coins: String(coins)
            }
          }
        }
      })
    })

    if (!paymentIntentResponse.ok) {
      const error = await paymentIntentResponse.json()
      console.error('PayMongo error:', error)
      throw new Error(error.errors?.[0]?.detail || 'Payment creation failed')
    }

    const paymentIntent = await paymentIntentResponse.json()
    console.log('Payment intent created:', paymentIntent.data.id)

    // Créer le Payment Method pour GCash
    const paymentMethodResponse = await fetch(`${PAYMONGO_API_URL}/payment_methods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`
      },
      body: JSON.stringify({
        data: {
          attributes: {
            type: 'gcash'
          }
        }
      })
    })

    if (!paymentMethodResponse.ok) {
      const error = await paymentMethodResponse.json()
      console.error('Payment method error:', error)
      throw new Error(error.errors?.[0]?.detail || 'Payment method creation failed')
    }

    const paymentMethod = await paymentMethodResponse.json()
    console.log('Payment method created:', paymentMethod.data.id)

    // Attacher le Payment Method au Payment Intent
    const attachResponse = await fetch(
      `${PAYMONGO_API_URL}/payment_intents/${paymentIntent.data.id}/attach`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`
        },
        body: JSON.stringify({
          data: {
            attributes: {
              payment_method: paymentMethod.data.id,
              return_url: return_url
            }
          }
        })
      }
    )

    if (!attachResponse.ok) {
      const error = await attachResponse.json()
      console.error('Attach error:', error)
      throw new Error(error.errors?.[0]?.detail || 'Payment attachment failed')
    }

    const attachedIntent = await attachResponse.json()
    const checkoutUrl = attachedIntent.data.attributes.next_action?.redirect?.url

    console.log('Payment attached, checkout URL:', checkoutUrl)

    // Mettre à jour la transaction avec le payment_intent_id
    await supabase
      .from('coin_transactions')
      .update({
        payment_intent_id: paymentIntent.data.id,
        payment_data: attachedIntent.data
      })
      .eq('id', transaction.id)

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transaction.id,
        checkout_url: checkoutUrl
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    console.error('Error stack:', error.stack)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.stack,
        type: error.constructor.name
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
