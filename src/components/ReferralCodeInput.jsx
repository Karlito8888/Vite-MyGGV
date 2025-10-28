import { useState } from 'react';
import { toast } from 'react-toastify';
import { referralService } from '../services/referralService';
import Button from './ui/Button';
import Input from './ui/Input';
import Card, { CardContent } from './ui/Card';
import '../styles/ReferralCodeInput.css';

export default function ReferralCodeInput({ onSuccess }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [successApplied, setSuccessApplied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);

    try {
      console.log('Submitting referral code:', code.trim());
      const result = await referralService.validateReferralCode(code.trim());
      console.log('Result:', result);

      if (result.valid) {
        toast.success(result.message || '🎉 Referral code applied successfully!');
        setCode('');
        setShowInput(false);
        setSuccessApplied(true);
        if (onSuccess) onSuccess(result);
      } else {
        toast.error(result.error || 'Invalid referral code');
      }
    } catch (error) {
      console.error('Error validating referral code:', error);
      // Friendly error messages
      let errorMessage = 'Unable to validate referral code. Please try again.';
      
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (successApplied) {
    return (
      <Card className="referral-code-input-container">
        <CardContent>
          <div className="referral-success-badge">
            ✅ Referral code applied!
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!showInput) {
    return (
      <div className="referral-code-input-container">
        <Button
          variant="outline"
          onClick={() => setShowInput(true)}
          fullWidth
        >
          🎁 Have a referral code?
        </Button>
      </div>
    );
  }

  return (
    <Card className="referral-code-input-container">
      <CardContent>
        <form onSubmit={handleSubmit} className="referral-code-form">
          <div className="referral-code-input-group">
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              disabled={loading}
              maxLength={20}
            />
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={!code.trim()}
            >
              Apply
            </Button>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setShowInput(false);
              setCode('');
            }}
            fullWidth
          >
            Cancel
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
