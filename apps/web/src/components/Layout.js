import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
export function Layout({ children, title, showBack, backgroundImageUrl, backgroundOverlayOpacity = 0.9, }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const hasBackground = Boolean(backgroundImageUrl);
    const overlayAlpha = Math.min(Math.max(backgroundOverlayOpacity, 0), 1);
    const containerStyle = hasBackground
        ? {
            backgroundImage: `linear-gradient(rgba(255,255,255,${overlayAlpha}), rgba(255,255,255,${overlayAlpha})), url(${backgroundImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        }
        : undefined;
    const containerClassName = `min-h-screen relative ${hasBackground ? 'bg-cover bg-center bg-no-repeat' : 'bg-gray-50'}`;
    const headerClassName = hasBackground
        ? 'bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-white/30 text-primary-700'
        : 'bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 text-gray-900 border-b border-gray-100';
    const backButtonHoverClass = hasBackground ? 'hover:bg-primary-100 text-primary-700' : 'hover:bg-gray-100';
    const mainClassName = `max-w-4xl mx-auto px-4 py-6 ${hasBackground ? 'bg-white/90 rounded-2xl shadow-lg mt-6 backdrop-blur-sm' : ''}`;
    return (_jsxs("div", { className: containerClassName, style: containerStyle, children: [!hasBackground && (_jsxs(_Fragment, { children: [_jsx("div", { className: "absolute inset-0 -z-10 bg-gradient-to-br from-orange-50 via-blue-50 to-orange-100 animate-gradient-slow", style: { backgroundSize: '200% 200%' } }), _jsx("div", { className: "absolute -z-10 top-16 -left-8 w-56 h-56 rounded-full bg-orange-200/40 blur-3xl animate-float-slow" }), _jsx("div", { className: "absolute -z-10 bottom-10 -right-8 w-56 h-56 rounded-full bg-primary-200/40 blur-3xl animate-float-slow", style: { animationDelay: '1.5s' } })] })), _jsx("header", { className: headerClassName, children: _jsxs("div", { className: "max-w-4xl mx-auto px-4 py-4 flex items-center", children: [showBack && (_jsxs("button", { onClick: () => navigate(-1), className: `mr-3 p-2 rounded-lg transition-colors ${backButtonHoverClass}`, children: ["\u2190 ", t('common.back')] })), _jsx("h1", { className: "text-xl font-semibold tracking-tight brand-wordmark", children: title || t('app.name') })] }) }), _jsx("main", { className: `${mainClassName} animate-fade-in`, children: children })] }));
}
//# sourceMappingURL=Layout.js.map