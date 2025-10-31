import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneE164, setPhoneE164] = useState('');
  const [otp, setOtp] = useState('');
  const [language, setLanguage] = useState(i18n.language);

  const sendOTPMutation = useMutation({
    mutationFn: () => api.sendOTP(phoneE164),
    onSuccess: () => {
      setStep('otp');
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: () => api.verifyOTP(phoneE164, otp),
    onSuccess: data => {
      login(data.jwt, data.sarathiId);
      i18n.changeLanguage(data.profile.preferredLang);
      navigate('/home');
    },
  });

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">{t('app.name')}</h1>
          <p className="text-gray-600 mt-2">{t('app.tagline')}</p>
        </div>

        {/* Language Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('auth.selectLanguage')}
          </label>
          <div className="flex gap-3">
            <button
              className={`flex-1 py-2 px-4 rounded-lg border-2 ${
                language === 'en'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-300 bg-white'
              }`}
              onClick={() => handleLanguageChange('en')}
            >
              {t('auth.english')}
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg border-2 ${
                language === 'hi'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-300 bg-white'
              }`}
              onClick={() => handleLanguageChange('hi')}
            >
              {t('auth.hindi')}
            </button>
          </div>
        </div>

        {step === 'phone' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.phone')}
            </label>
            <input
              type="tel"
              className="input mb-4"
              placeholder={t('auth.phonePlaceholder')}
              value={phoneE164}
              onChange={e => setPhoneE164(e.target.value)}
            />
            <button
              className="btn btn-primary btn-lg w-full"
              onClick={() => sendOTPMutation.mutate()}
              disabled={sendOTPMutation.isPending}
            >
              {sendOTPMutation.isPending ? t('common.loading') : t('auth.sendOTP')}
            </button>
            {sendOTPMutation.isError && (
              <p className="text-red-600 text-sm mt-2">
                {(sendOTPMutation.error as Error).message}
              </p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.verifyOTP')}
            </label>
            <input
              type="text"
              className="input mb-4"
              placeholder={t('auth.otpPlaceholder')}
              value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
            />
            <button
              className="btn btn-primary btn-lg w-full"
              onClick={() => verifyOTPMutation.mutate()}
              disabled={verifyOTPMutation.isPending}
            >
              {verifyOTPMutation.isPending ? t('common.loading') : t('auth.verifyOTP')}
            </button>
            {verifyOTPMutation.isError && (
              <p className="text-red-600 text-sm mt-2">
                {(verifyOTPMutation.error as Error).message}
              </p>
            )}
            <button
              className="btn btn-secondary w-full mt-3"
              onClick={() => setStep('phone')}
            >
              {t('common.back')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

