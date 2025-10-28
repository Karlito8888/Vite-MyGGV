import { useEffect, useState } from 'react';

export function useReferralCode() {
  const [referralCode, setReferralCode] = useState(() => {
    // Initialize from sessionStorage
    return sessionStorage.getItem('referral_code') || null;
  });

  useEffect(() => {
    // Check URL params for referral code
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
      const upperCode = refCode.toUpperCase();
      
      // Store in sessionStorage for later use
      sessionStorage.setItem('referral_code', upperCode);
      
      // Clean URL without reloading
      const url = new URL(window.location);
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url);
      
      // Set state in next tick to avoid cascading renders
      setTimeout(() => setReferralCode(upperCode), 0);
    }
  }, []);

  const clearReferralCode = () => {
    setReferralCode(null);
    sessionStorage.removeItem('referral_code');
  };

  return { referralCode, clearReferralCode };
}
