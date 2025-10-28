import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create admin client for all operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header to identify the user
    const authHeader = req.headers.get('Authorization');
    let user = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );
      const { data } = await supabaseClient.auth.getUser(token);
      user = data?.user;
    }

    if (!user) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Not authenticated' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { referralCode } = await req.json();

    if (!referralCode) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Please enter a referral code' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Find user with this referral code
    const { data: referrer, error: referrerError } = await supabaseAdmin
      .from('profiles')
      .select('id, username, full_name, referral_code, coins')
      .eq('referral_code', referralCode.toUpperCase())
      .single();

    if (referrerError || !referrer) {
      return new Response(
        JSON.stringify({ valid: false, error: 'This referral code doesn\'t exist. Please check and try again.' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user is trying to use their own code
    if (referrer.id === user.id) {
      return new Response(
        JSON.stringify({ valid: false, error: 'You can\'t use your own referral code 😊' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get current user profile
    const { data: currentUser, error: currentUserError } = await supabaseAdmin
      .from('profiles')
      .select('id, referred_by, onboarding_completed, coins')
      .eq('id', user.id)
      .single();

    if (currentUserError || !currentUser) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Unable to find your profile. Please try again.' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user was already referred
    if (currentUser.referred_by) {
      return new Response(
        JSON.stringify({ valid: false, error: 'You\'ve already used a referral code!' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if onboarding is completed
    if (!currentUser.onboarding_completed) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Please complete your profile setup first before using a referral code.' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const referrerReward = 10;
    const referredReward = 10;

    // Update user profile with referrer
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ referred_by: referrer.id })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return new Response(
        JSON.stringify({ valid: false, error: 'Something went wrong. Please try again later.' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Add coins to referrer
    const { error: referrerCoinsError } = await supabaseAdmin
      .from('profiles')
      .update({ coins: referrer.coins + referrerReward })
      .eq('id', referrer.id);

    if (referrerCoinsError) {
      console.error('Error updating referrer coins:', referrerCoinsError);
    }

    // Add coins to referred user
    const { error: referredCoinsError } = await supabaseAdmin
      .from('profiles')
      .update({ coins: currentUser.coins + referredReward })
      .eq('id', user.id);

    if (referredCoinsError) {
      console.error('Error updating referred coins:', referredCoinsError);
    }

    // Create completed referral record
    const { error: referralError } = await supabaseAdmin
      .from('referrals')
      .insert({
        referrer_id: referrer.id,
        referred_id: user.id,
        referral_code: referralCode.toUpperCase(),
        status: 'completed',
        referrer_reward: referrerReward,
        referred_reward: referredReward,
        completed_at: new Date().toISOString()
      });

    if (referralError) {
      console.error('Error creating referral:', referralError);
    }

    // Log transaction for referrer
    await supabaseAdmin.from('coins_transactions').insert({
      user_id: referrer.id,
      amount: referrerReward,
      operation_type: 'add',
      reason: 'Referral reward - New user joined',
      previous_balance: referrer.coins,
      new_balance: referrer.coins + referrerReward,
      metadata: {
        referred_user_id: user.id,
        referral_code: referralCode.toUpperCase()
      }
    });

    // Log transaction for referred user
    await supabaseAdmin.from('coins_transactions').insert({
      user_id: user.id,
      amount: referredReward,
      operation_type: 'add',
      reason: 'Welcome bonus - Referred by friend',
      previous_balance: currentUser.coins,
      new_balance: currentUser.coins + referredReward,
      metadata: {
        referrer_id: referrer.id,
        referral_code: referralCode.toUpperCase()
      }
    });

    return new Response(
      JSON.stringify({
        valid: true,
        referrer: {
          username: referrer.username,
          fullName: referrer.full_name
        },
        message: `You were referred by ${referrer.username || referrer.full_name}! You both received 10 coins.`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'An unexpected error occurred. Please try again.' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
