import { supabase } from './baseService';

export const referralService = {
  // Get current user's referral code
  async getMyReferralCode() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('referral_code, username, full_name')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  // Validate and apply referral code
  async validateReferralCode(referralCode) {
    // Get current claims to ensure we have a valid token (recommandé par Supabase)
    const { data: claims, error: claimsError } = await supabase.auth.getClaims();

    if (claimsError || !claims) {
      throw new Error('You must be logged in to use a referral code');
    }

    // Le client Supabase gère automatiquement l'access token, pas besoin de le passer manuellement
    const { data, error } = await supabase.functions.invoke('validate-referral', {
      body: { referralCode }
    });

    if (error) throw error;
    return data;
  },

  // Get user's referral stats
  async getReferralStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('referrals')
      .select(`
        id,
        status,
        referrer_reward,
        completed_at,
        created_at,
        referred:referred_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const stats = {
      total: data.length,
      completed: data.filter(r => r.status === 'completed').length,
      pending: data.filter(r => r.status === 'pending').length,
      totalEarned: data
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.referrer_reward || 0), 0),
      referrals: data
    };

    return stats;
  },

  // Generate share text and URL
  generateShareContent(referralCode) {
    const appUrl = window.location.origin;
    const shareUrl = `${appUrl}?ref=${referralCode}`;
    const shareText = `Join me on this awesome app! Use my referral code ${referralCode} and we both get bonus coins! 🎁`;

    return { shareUrl, shareText };
  },

  // Share via Web Share API
  async shareReferral(referralCode) {
    const { shareUrl, shareText } = this.generateShareContent(referralCode);

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me!',
          text: shareText,
          url: shareUrl
        });
        return { success: true, method: 'native' };
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
        return { success: false, error };
      }
    } else {
      // Fallback: copy to clipboard
      const textToCopy = `${shareText}\n${shareUrl}`;

      try {
        // Try modern clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(textToCopy);
          return { success: true, method: 'clipboard' };
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = textToCopy;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.select();
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);

          if (successful) {
            return { success: true, method: 'clipboard' };
          } else {
            return { success: false, error: new Error('Copy command failed') };
          }
        }
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        return { success: false, error };
      }
    }
  }
};
