import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
    // Modes and steps
    const [mode, setMode] = useState('login');
    const [loginStep, setLoginStep] = useState('credentials');
    // Form state
    const [phoneE164, setPhoneE164] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [language, setLanguage] = useState(i18n.language);
    // Mutations
    const registerMutation = useMutation({
        mutationFn: () => api.register(phoneE164, password),
        onSuccess: () => {
            setMode('login');
            setLoginStep('credentials');
        },
    });
    const loginInitiateMutation = useMutation({
        mutationFn: () => api.loginInitiate(phoneE164, password),
        onSuccess: () => {
            setLoginStep('otp');
        },
    });
    const loginVerifyMutation = useMutation({
        mutationFn: () => api.loginVerify(phoneE164, otp),
        onSuccess: data => {
            login(data.jwt, data.sarathiId);
            i18n.changeLanguage(data.profile.preferredLang);
            navigate('/home');
        },
    });
    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        i18n.changeLanguage(lang);
    };
    return (_jsxs("div", { className: "min-h-screen flex items-center justify-center px-4 relative overflow-hidden", style: {
            backgroundImage: 'url(/images/login-background.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }, children: [_jsx("div", { className: "absolute inset-0 bg-black/40" }), _jsxs("div", { className: "card max-w-md w-full bg-white/98 backdrop-blur-sm shadow-2xl relative z-10", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-primary-600", children: t('app.name') }), _jsx("p", { className: "text-gray-600 mt-2", children: t('app.tagline') })] }), _jsxs("div", { className: "mb-6 grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg", children: [_jsx("button", { className: `py-2 rounded-md text-sm font-medium transition-colors ${mode === 'login' ? 'bg-white shadow text-primary-700' : 'text-gray-600 hover:text-gray-900'}`, onClick: () => setMode('login'), children: t('auth.login') }), _jsx("button", { className: `py-2 rounded-md text-sm font-medium transition-colors ${mode === 'register' ? 'bg-white shadow text-primary-700' : 'text-gray-600 hover:text-gray-900'}`, onClick: () => setMode('register'), children: t('auth.register') })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: t('auth.selectLanguage') }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { className: `flex-1 py-2 px-4 rounded-lg border-2 ${language === 'en'
                                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                                            : 'border-gray-300 bg-white'}`, onClick: () => handleLanguageChange('en'), children: t('auth.english') }), _jsx("button", { className: `flex-1 py-2 px-4 rounded-lg border-2 ${language === 'hi'
                                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                                            : 'border-gray-300 bg-white'}`, onClick: () => handleLanguageChange('hi'), children: t('auth.hindi') })] })] }), mode === 'login' && (_jsx(_Fragment, { children: loginStep === 'credentials' ? (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: t('auth.phone') }), _jsx("input", { type: "tel", className: "input mb-4", placeholder: t('auth.phonePlaceholder'), value: phoneE164, onChange: e => setPhoneE164(e.target.value) }), _jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: t('auth.password') || 'Password' }), _jsx("input", { type: "password", className: "input mb-4", placeholder: t('auth.password') || 'Password', value: password, onChange: e => setPassword(e.target.value) }), _jsx("button", { className: "btn btn-primary btn-lg w-full", onClick: () => loginInitiateMutation.mutate(), disabled: loginInitiateMutation.isPending, children: loginInitiateMutation.isPending ? t('common.loading') : (t('auth.sendOTP') || 'Send OTP') }), loginInitiateMutation.isError && (_jsx("p", { className: "text-red-600 text-sm mt-2", children: loginInitiateMutation.error.message }))] })) : (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: t('auth.verifyOTP') }), _jsx("input", { type: "text", className: "input mb-4", placeholder: t('auth.otpPlaceholder'), value: otp, onChange: e => setOtp(e.target.value), maxLength: 6 }), _jsx("button", { className: "btn btn-primary btn-lg w-full", onClick: () => loginVerifyMutation.mutate(), disabled: loginVerifyMutation.isPending, children: loginVerifyMutation.isPending ? t('common.loading') : t('auth.verifyOTP') }), loginVerifyMutation.isError && (_jsx("p", { className: "text-red-600 text-sm mt-2", children: loginVerifyMutation.error.message })), _jsx("button", { className: "btn btn-secondary w-full mt-3", onClick: () => setLoginStep('credentials'), children: t('common.back') })] })) })), mode === 'register' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: t('auth.phone') }), _jsx("input", { type: "tel", className: "input mb-4", placeholder: t('auth.phonePlaceholder'), value: phoneE164, onChange: e => setPhoneE164(e.target.value) }), _jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: t('auth.password') || 'Password' }), _jsx("input", { type: "password", className: "input mb-4", placeholder: t('auth.password') || 'Password', value: password, onChange: e => setPassword(e.target.value) }), _jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: t('auth.confirmPassword') || 'Confirm Password' }), _jsx("input", { type: "password", className: "input mb-4", placeholder: t('auth.confirmPassword') || 'Confirm Password', value: confirmPassword, onChange: e => setConfirmPassword(e.target.value) }), _jsx("button", { className: "btn btn-primary btn-lg w-full", onClick: () => {
                                    if (password !== confirmPassword) {
                                        alert('Passwords do not match');
                                        return;
                                    }
                                    registerMutation.mutate();
                                }, disabled: registerMutation.isPending, children: registerMutation.isPending ? t('common.loading') : (t('auth.register') || 'Register') }), registerMutation.isError && (_jsx("p", { className: "text-red-600 text-sm mt-2", children: registerMutation.error.message }))] }))] })] }));
}
//# sourceMappingURL=LoginPage.js.map