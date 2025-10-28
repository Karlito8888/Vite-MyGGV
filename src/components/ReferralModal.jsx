import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import { referralService } from '../services/referralService';
import Button from './ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import '../styles/ReferralModal.css';

export default function ReferralModal({ isOpen, onClose }) {
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [codeData, statsData] = await Promise.all([
          referralService.getMyReferralCode(),
          referralService.getReferralStats()
        ]);
        setReferralCode(codeData.referral_code);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading referral data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen]);

  const handleShare = async () => {
    try {
      const result = await referralService.shareReferral(referralCode);
      if (result.success) {
        if (result.method === 'clipboard') {
          toast.success('📋 Copied to clipboard!');
        } else {
          toast.success('✅ Shared successfully!');
        }
      } else {
        toast.error('Failed to share');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share');
    }
  };

  const handleCopyCode = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(referralCode);
        toast.success('📋 Code copied!');
      } else {
        // Fallback for older browsers or non-HTTPS
        const textArea = document.createElement('textarea');
        textArea.value = referralCode;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          toast.success('📋 Code copied!');
        } catch {
          toast.error('Failed to copy');
        }
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Error copying code:', error);
      toast.error('Failed to copy');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="referral-modal-overlay" onClick={onClose}>
      <Card className="referral-modal" onClick={(e) => e.stopPropagation()}>
        <button className="referral-modal-close" onClick={onClose}>×</button>

        <CardHeader>
          <CardTitle>📱 Share this App</CardTitle>
          <CardDescription>
            Share the QR code and your referral code. You both earn 10 coins!
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="referral-loading">Loading...</div>
          ) : (
            <>
              {/* QR Code Section */}
              <div className="referral-qr-section">
                <div className="qr-code-container">
                  <QRCodeSVG
                    value={window.location.origin}
                    size={200}
                    level="H"
                    marginSize={true}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                <p className="qr-instruction">
                  Scan to open the app
                </p>
              </div>

              {/* Referral Code Section */}
              <div className="referral-code-section">
                <label>Your referral code</label>
                <div className="referral-code-display">
                  <span className="referral-code">{referralCode}</span>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={handleCopyCode}
                    title="Copy code"
                  >
                    📋
                  </Button>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.75rem', textAlign: 'center', lineHeight: '1.5' }}>
                  Your friend enters this code on the <strong>Money page</strong> after signing up
                </p>
              </div>

              {/* Stats Section */}
              {stats && (
                <div className="referral-stats">
                  <div className="referral-stat-item">
                    <div className="referral-stat-value">{stats.completed}</div>
                    <div className="referral-stat-label">Successful referrals</div>
                  </div>
                  <div className="referral-stat-item">
                    <div className="referral-stat-value">{stats.pending}</div>
                    <div className="referral-stat-label">Pending</div>
                  </div>
                  <div className="referral-stat-item">
                    <div className="referral-stat-value">{stats.totalEarned}</div>
                    <div className="referral-stat-label">Coins earned</div>
                  </div>
                </div>
              )}

              {/* How it works */}
              <div className="referral-how-it-works">
                <h3>How it works</h3>
                <ol>
                  <li>Share your code with friends</li>
                  <li>They sign up and complete their profile</li>
                  <li>You both get <strong>10 coins</strong>! 🎉</li>
                </ol>
              </div>

              {/* Share Button */}
              <Button 
                variant="primary" 
                onClick={handleShare}
                fullWidth
                elevated
              >
                📤 Share my code
              </Button>

              {/* Recent Referrals */}
              {stats && stats.referrals.length > 0 && (
                <div className="referral-list">
                  <h3>Your recent referrals</h3>
                  {stats.referrals.slice(0, 5).map((referral) => (
                    <Card key={referral.id} className="referral-list-item" hover>
                      <div className="referral-list-avatar">
                        {referral.referred?.avatar_url ? (
                          <img src={referral.referred.avatar_url} alt="" />
                        ) : (
                          <div className="referral-list-avatar-placeholder">
                            {(referral.referred?.username || referral.referred?.full_name || '?')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="referral-list-info">
                        <div className="referral-list-name">
                          {referral.referred?.username || referral.referred?.full_name || 'User'}
                        </div>
                        <div className="referral-list-date">
                          {new Date(referral.created_at).toLocaleDateString('en-US')}
                        </div>
                      </div>
                      <div className={`referral-list-status ${referral.status}`}>
                        {referral.status === 'completed' ? '✓ Completed' : '⏳ Pending'}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
