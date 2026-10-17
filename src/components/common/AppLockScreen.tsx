import React, { useState, useEffect } from 'react';
import { ContractorAccount } from '../../types';
import { Lock, Fingerprint, User, ArrowLeft, LogOut } from 'lucide-react';
import { verifyCredential, hashCredential } from '../../utils/cryptoUtils';
import { db } from '../../core/db/database';

interface AppLockScreenProps {
  account: ContractorAccount;
  onUnlock: () => void;
  onLogOut: () => void;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({
  account,
  onUnlock,
  onLogOut,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  // Rate Limiting Countdown (Defense in Depth)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            setErrorMsg('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lockoutTimer]);

  // SEC-DEF-004 FIX: Never auto-unlock based solely on API detection.
  const handleBiometricPrompt = () => {
    setErrorMsg(
      account.language === 'hi'
        ? 'बायोमेट्रिक सेंसर केवल नेटिव एंड्रॉइड ऐप में समर्थित है। कृपया पिन दर्ज करें।'
        : 'Native biometric sensor requires Android app. Please enter your security PIN.'
    );
  };

  const verifyPinValue = async (candidatePin: string) => {
    if (lockoutTimer > 0 || isVerifying) return;
    setIsVerifying(true);
    setErrorMsg('');

    try {
      const targetPinLock = account.pinLock || '';
      let verifyRes = await verifyCredential(candidatePin, targetPinLock);
      let isCorruptedPinLockRecovered = false;

      // Narrowly scoped recovery: If pinLock verification fails and the account has distinct credentials,
      // verify the candidate against the account's master registration password.
      if (!verifyRes.isValid && targetPinLock && account.password && targetPinLock !== account.password) {
        const passwordVerifyRes = await verifyCredential(candidatePin, account.password);
        if (passwordVerifyRes.isValid) {
          verifyRes = passwordVerifyRes;
          isCorruptedPinLockRecovered = true;
        }
      } else if (!targetPinLock && account.password) {
        // Fallback when no pinLock was ever configured
        verifyRes = await verifyCredential(candidatePin, account.password);
      }

      if (verifyRes.isValid) {
        setFailedAttempts(0);

        // SEC-DEF-001: Seamless auto-migration of legacy plaintext PIN to PBKDF2
        if (verifyRes.isLegacy) {
          const upgradedHash = await hashCredential(candidatePin);
          await db.account.update(account.id, {
            pinLock: upgradedHash,
            password: account.password ? upgradedHash : upgradedHash,
          });
          account.pinLock = upgradedHash;
        } else if (isCorruptedPinLockRecovered) {
          // Repair corrupted pinLock using verified candidate without altering other account fields
          const repairedHash = await hashCredential(candidatePin);
          await db.account.update(account.id, {
            pinLock: repairedHash,
          });
          account.pinLock = repairedHash;
        }

        onUnlock();
      } else {
        const nextFailed = failedAttempts + 1;
        setFailedAttempts(nextFailed);
        if (nextFailed >= 5) {
          setLockoutTimer(30);
          setErrorMsg(
            account.language === 'hi'
              ? '5 बार गलत पिन! सुरक्षा कारणों से 30 सेकंड प्रतीक्षा करें।'
              : '5 incorrect attempts! Locked for 30 seconds.'
          );
        } else {
          setErrorMsg(
            account.language === 'hi'
              ? `गलत पिन दर्ज किया गया! (${5 - nextFailed} प्रयास शेष)`
              : `Incorrect PIN. (${5 - nextFailed} attempts remaining)`
          );
        }
        setPin('');
      }
    } catch (err) {
      console.error('PIN verification error:', err);
      setErrorMsg('Verification error occurred. Please try again.');
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length >= 4) {
      verifyPinValue(pin);
    }
  };

  const handleDigitPress = (digit: string) => {
    if (lockoutTimer > 0 || isVerifying) return;
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length >= 4) {
        verifyPinValue(newPin);
      }
    }
  };

  const handleDeleteDigit = () => {
    if (lockoutTimer > 0 || isVerifying) return;
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-4 sm:p-6 text-white select-none animate-fade-in overflow-y-auto">
      {/* Top Navigation Bar: Back to Login / Switch Account */}
      <div className="w-full max-w-xs flex items-center justify-between pt-1 pb-2">
        <button
          type="button"
          onClick={onLogOut}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
          <span>{account.language === 'hi' ? 'लॉगिन पर जाएं' : 'Back to Login'}</span>
        </button>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SiteSaathi</span>
        </div>
      </div>

      {/* Top Branding */}
      <div className="text-center pt-1 pb-1">
        <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Lock className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-lg font-black tracking-tight font-heading">
          {account.companyName || 'SiteSaathi'}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5 flex items-center justify-center gap-1.5">
          <User className="w-3.5 h-3.5 text-blue-400" />
          <span>{account.name}</span>
        </p>
      </div>

      {/* Middle: PIN Dots & Prompts */}
      <div className="w-full max-w-xs text-center space-y-3 py-1">
        <p className="text-xs sm:text-sm font-semibold text-slate-300">
          {account.language === 'hi' ? 'सुरक्षा पिन दर्ज करें' : 'Enter Security PIN to Unlock'}
        </p>

        {/* PIN Dots Display */}
        <div className="flex justify-center items-center gap-3 py-1">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all duration-200 border-2 ${
                pin.length > idx
                  ? 'bg-blue-500 border-blue-500 scale-110 shadow-md shadow-blue-500/50'
                  : 'bg-transparent border-slate-700'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-400 font-semibold animate-pulse">{errorMsg}</p>
        )}

        {/* Biometric Unlock Button (If Enabled) */}
        {account.isBiometricEnabled && (
          <button
            type="button"
            onClick={handleBiometricPrompt}
            className="mx-auto py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-blue-400 text-xs font-bold flex items-center gap-2 transition-all hover:bg-slate-800"
          >
            <Fingerprint className="w-4 h-4" />
            <span>{account.language === 'hi' ? 'फिंगरप्रिंट से खोलें' : 'Unlock with Fingerprint'}</span>
          </button>
        )}
      </div>

      {/* Numerical Keypad */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-2.5 sm:gap-3 py-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={lockoutTimer > 0 || isVerifying}
            onClick={() => handleDigitPress(digit)}
            className={`h-12 sm:h-14 rounded-2xl border active:scale-95 text-lg sm:text-xl font-bold flex items-center justify-center transition-all shadow-sm ${
              lockoutTimer > 0 || isVerifying
                ? 'bg-slate-900/40 text-slate-600 border-slate-800/40 cursor-not-allowed'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800/80 text-white'
            }`}
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          disabled={lockoutTimer > 0 || isVerifying}
          onClick={() => {
            if (account.isBiometricEnabled) {
              handleBiometricPrompt();
            } else {
              setPin('');
            }
          }}
          className="h-12 sm:h-14 rounded-2xl bg-slate-900/40 hover:bg-slate-800 border border-slate-800/40 text-xs font-semibold text-slate-400 flex items-center justify-center disabled:opacity-50"
        >
          {account.isBiometricEnabled ? (
            <Fingerprint className="w-5 h-5 text-blue-400" />
          ) : (
            'Clear'
          )}
        </button>
        <button
          type="button"
          disabled={lockoutTimer > 0 || isVerifying}
          onClick={() => handleDigitPress('0')}
          className={`h-12 sm:h-14 rounded-2xl border active:scale-95 text-lg sm:text-xl font-bold flex items-center justify-center transition-all shadow-sm ${
            lockoutTimer > 0 || isVerifying
              ? 'bg-slate-900/40 text-slate-600 border-slate-800/40 cursor-not-allowed'
              : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800/80 text-white'
          }`}
        >
          0
        </button>
        <button
          type="button"
          disabled={lockoutTimer > 0 || isVerifying}
          onClick={handleDeleteDigit}
          className="h-12 sm:h-14 rounded-2xl bg-slate-900/40 hover:bg-slate-800 border border-slate-800/40 text-xs font-semibold text-slate-400 flex items-center justify-center active:scale-95 disabled:opacity-50"
        >
          ⌫
        </button>
      </div>

      {/* Bottom Switch Account */}
      <div className="pt-2 pb-2 w-full max-w-xs text-center">
        <button
          type="button"
          onClick={onLogOut}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5 text-blue-400" />
          <span>{account.language === 'hi' ? 'खाता बदलें / मुख्य लॉगिन' : 'Switch Contractor Account / Sign In'}</span>
        </button>
      </div>
    </div>
  );
};
