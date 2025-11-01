import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Layout } from '../components/Layout';
export default function HomePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data, isLoading } = useQuery({
        queryKey: ['me'],
        queryFn: api.getMe,
    });
    if (isLoading) {
        return (_jsx(Layout, { children: _jsx("div", { className: "text-center py-20", children: t('common.loading') }) }));
    }
    const tiles = [
        { number: 1, label: t('home.tiles.sendMoney'), path: '/send-money' },
        { number: 2, label: t('home.tiles.creditScore'), path: '/score' },
        { number: 3, label: t('home.tiles.loan'), path: '/loan', badge: data?.activeLoan ? '!' : null },
        { number: 4, label: 'SafeSend', path: '/safesend' },
        { number: 5, label: t('home.tiles.transactions'), path: '/transactions' },
        { number: 6, label: t('home.tiles.changeState'), path: '/settings' },
        { number: 7, label: t('home.tiles.help'), path: '/admin' },
    ];
    return (_jsxs(Layout, { title: t('app.name'), children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: t('home.welcome', { name: data?.user.sarathiId.substring(0, 8) }) }), _jsx("p", { className: "text-gray-600", children: t('home.sarathiId', { id: data?.user.sarathiId }) }), data?.latestScore && (_jsx("div", { className: "mt-4 card", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: t('score.title') }), _jsx("p", { className: "text-3xl font-bold text-primary-600", children: data.latestScore.score })] }), _jsx("div", { className: "text-right", children: _jsx("p", { className: "text-sm text-gray-600", children: t('score.band', { band: data.latestScore.band }) }) })] }) }))] }), _jsx("div", { className: "grid grid-cols-2 gap-4 sm:gap-5", children: tiles.map(tile => (_jsxs("div", { className: "tile relative", onClick: () => navigate(tile.path), children: [tile.badge && (_jsx("span", { className: "absolute top-3 right-3 badge", children: tile.badge })), _jsx("div", { className: "tile-number", children: tile.number }), _jsx("div", { className: "tile-label", children: tile.label })] }, tile.number))) })] }));
}
//# sourceMappingURL=HomePage.js.map