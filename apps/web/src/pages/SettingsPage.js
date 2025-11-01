import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { INDIAN_STATES } from '@sarathi/shared';
export default function SettingsPage() {
    const { t, i18n } = useTranslation();
    const { logout } = useAuth();
    const queryClient = useQueryClient();
    const { data } = useQuery({
        queryKey: ['me'],
        queryFn: api.getMe,
    });
    const updateStateMutation = useMutation({
        mutationFn: (stateCode) => api.updateState(stateCode),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['me'] });
        },
    });
    const updateLanguageMutation = useMutation({
        mutationFn: (lang) => api.updateLanguage(lang),
        onSuccess: (_, lang) => {
            i18n.changeLanguage(lang);
            queryClient.invalidateQueries({ queryKey: ['me'] });
        },
    });
    return (_jsx(Layout, { title: t('settings.title'), showBack: true, children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "card", children: [_jsx("h3", { className: "font-bold mb-3", children: t('settings.language') }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { className: `flex-1 py-2 px-4 rounded-lg border-2 ${i18n.language === 'en'
                                        ? 'border-primary-600 bg-primary-50'
                                        : 'border-gray-300'}`, onClick: () => updateLanguageMutation.mutate('en'), children: t('auth.english') }), _jsx("button", { className: `flex-1 py-2 px-4 rounded-lg border-2 ${i18n.language === 'hi'
                                        ? 'border-primary-600 bg-primary-50'
                                        : 'border-gray-300'}`, onClick: () => updateLanguageMutation.mutate('hi'), children: t('auth.hindi') })] })] }), _jsxs("div", { className: "card", children: [_jsx("h3", { className: "font-bold mb-3", children: t('settings.state') }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: t('settings.selectState') }), _jsx("select", { className: "input", value: data?.user.stateCode, onChange: e => updateStateMutation.mutate(e.target.value), children: Object.entries(INDIAN_STATES).map(([code, name]) => (_jsx("option", { value: code, children: name }, code))) })] }), _jsx("div", { className: "card", children: _jsx("button", { className: "btn btn-secondary w-full", onClick: logout, children: t('settings.logout') }) })] }) }));
}
//# sourceMappingURL=SettingsPage.js.map