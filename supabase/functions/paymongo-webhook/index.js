/* global Deno */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Vérifier que c'est une requête POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parser le webhook payload
    const payload = await req.json()
    console.log('Webhook received:', payload)

    // Vérifier le type d'événement
    const eventType = payload.data?.attributes?.type

    if (!eventType) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Créer le client Supabase avec service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Traiter selon le type d'événement
    switch (eventType) {
      case 'payment.paid': {
        // Paiement réussi
        const paymentIntent = payload.data.attributes.data
        const paymentIntentId = paymentIntent.id

        console.log('Processing successful payment:', paymentIntentId)

        // Appeler la fonction Supabase pour traiter le paiement
        const { data, error } = await supabase.rpc('process_successful_payment', {
          p_payment_intent_id: paymentIntentId,
          p_payment_data: paymentIntent
        })

        if (error) {
          console.error('Error processing payment:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to process payment', details: error }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('Payment processed successfully:', data)

        return new Response(
          JSON.stringify({ success: true, data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'payment.failed': {
        // Paiement échoué
        const paymentIntent = payload.data.attributes.data
        const paymentIntentId = paymentIntent.id

        console.log('Processing failed payment:', paymentIntentId)

        const { data, error } = await supabase.rpc('mark_payment_failed', {
          p_payment_intent_id: paymentIntentId,
          p_payment_data: paymentIntent
        })

        if (error) {
          console.error('Error marking payment as failed:', error)
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        // Événement non géré
        console.log('Unhandled event type:', eventType)
        return new Response(
          JSON.stringify({ success: true, message: 'Event received but not processed' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
