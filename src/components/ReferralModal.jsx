import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { referralService } from '../services/referralService';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import styles from './ReferralModal.module.css';

export default function ReferralModal({ isOpen, onClose }) {
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const codeData = await referralService.getMyReferralCode();
        setReferralCode(codeData.referral_code);
      } catch (error) {
        console.error('Error loading referral data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen]);



  if (!isOpen) return null;

  return (
    <div className={styles.referralModalOverlay} onClick={onClose}>
      <Card className={styles.referralModal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.referralModalClose} onClick={onClose}>×</button>

        <CardHeader>
          <CardTitle>📱 Share this App</CardTitle>
          <CardDescription>
            Share the QR code and your referral code. You both earn 10 coins!
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className={styles.referralLoading}>Loading...</div>
          ) : (
            <>
              {/* QR Code Section */}
              <div className={styles.referralQrSection}>
                <div className={styles.qrCodeContainer}>
                  <QRCodeSVG
                    value={window.location.origin}
                    size={200}
                    level="H"
                    marginSize={true}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                <p className={styles.qrInstruction}>
                  Scan to open the app
                </p>
              </div>

              {/* Referral Code Section */}
              <div className={styles.referralCodeSection}>
                <label>Your referral code</label>
                <div className={styles.referralCodeDisplay}>
                  <span className={styles.referralCode}>{referralCode}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.75rem', textAlign: 'center', lineHeight: '1.5' }}>
                  Your friend enters this code on the <strong>Money page</strong> after signing up
                </p>
              </div>

              {/* How it works */}
              <div className={styles.referralHowItWorks}>
                <h3>How it works</h3>
                <ol>
                  <li>Share your QR code and referral code with friends</li>
                  <li>They scan the QR or download the app and sign up</li>
                  <li>After completing their profile, they go to the <strong>Money page</strong></li>
                  <li>They enter your code <strong>within 48 hours</strong> of registration</li>
                  <li>You both instantly get <strong>10 coins</strong>! 🎉</li>
                </ol>
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.75rem', fontStyle: 'italic' }}>
                  ⏰ Important: Referral codes must be used within 48 hours of account creation
                </p>
              </div>


            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
