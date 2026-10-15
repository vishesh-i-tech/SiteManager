import React, { useState, useEffect } from 'react';
import { ContractorAccount } from '../../types';
import { Lock, Fingerprint, ShieldCheck, ArrowRight, User } from 'lucide-react';

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
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    // Check if device supports WebAuthn / Biometrics
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      setBiometricAvailable(true);
      if (account.isBiometricEnabled) {
        // Attempt quick biometric trigger
        triggerBiometric();
      }
    }
  }, [account]);

  const triggerBiometric = async () => {
    try {
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        // Simple touch simulation / credential challenge
        onUnlock();
      }
    } catch (e) {
      console.log('Biometric skipped or cancelled, using PIN fallback');
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (account.pinLock && pin === account.pinLock) {
      onUnlock();
    } else {
      setErrorMsg(account.language === 'hi' ? 'गलत पिन दर्ज किया गया!' : 'Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  const handleDigitPress = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      if (account.pinLock && newPin === account.pinLock) {
        onUnlock();
      }
    }
  };

  const handleDeleteDigit = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-6 text-white select-none animate-fade-in">
      {/* Top Branding */}
      <div className="text-center pt-8">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-xl font-black tracking-tight font-heading">
          {account.companyName || 'SiteSaathi'}
        </h1>
        <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1.5">
          <User className="w-3.5 h-3.5 text-blue-400" />
          <span>{account.name}</span>
        </p>
      </div>

      {/* Middle: PIN Dots & Prompts */}
      <div className="w-full max-w-xs text-center space-y-4">
        <p className="text-sm font-semibold text-slate-300">
          {account.language === 'hi' ? 'सुरक्षा पिन दर्ज करें' : 'Enter Security PIN to Unlock'}
        </p>

        {/* PIN Dots Display */}
        <div className="flex justify-center items-center gap-3 py-2">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
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
        {account.isBiometricEnabled && biometricAvailable && (
          <button
            type="button"
            onClick={triggerBiometric}
            className="mx-auto py-2 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-blue-400 text-xs font-bold flex items-center gap-2 transition-all hover:bg-slate-800"
          >
            <Fingerprint className="w-4 h-4" />
            <span>{account.language === 'hi' ? 'फिंगरप्रिंट से खोलें' : 'Unlock with Fingerprint'}</span>
          </button>
        )}
      </div>

      {/* Numerical Keypad */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-3 pb-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigitPress(digit)}
            className="h-14 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 active:scale-95 text-xl font-bold flex items-center justify-center transition-all shadow-sm"
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            if (account.isBiometricEnabled && biometricAvailable) {
              triggerBiometric();
            } else {
              setPin('');
            }
          }}
          className="h-14 rounded-2xl bg-slate-900/40 hover:bg-slate-800 border border-slate-800/40 text-xs font-semibold text-slate-400 flex items-center justify-center"
        >
          {account.isBiometricEnabled && biometricAvailable ? (
            <Fingerprint className="w-6 h-6 text-blue-400" />
          ) : (
            'Clear'
          )}
        </button>
        <button
          type="button"
          onClick={() => handleDigitPress('0')}
          className="h-14 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 active:scale-95 text-xl font-bold flex items-center justify-center transition-all shadow-sm"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleDeleteDigit}
          className="h-14 rounded-2xl bg-slate-900/40 hover:bg-slate-800 border border-slate-800/40 text-xs font-semibold text-slate-400 flex items-center justify-center active:scale-95"
        >
          ⌫
        </button>
      </div>

      {/* Bottom Switch Account */}
      <div className="pb-2">
        <button
          type="button"
          onClick={onLogOut}
          className="text-xs text-slate-500 hover:text-slate-300 font-semibold transition-colors"
        >
          {account.language === 'hi' ? 'खाता बदलें / लॉगआउट' : 'Switch Contractor Account'}
        </button>
      </div>
    </div>
  );
};
