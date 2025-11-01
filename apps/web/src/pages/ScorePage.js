import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Layout } from '../components/Layout';
const reasonCodeLabels = {
    R1_REM_HISTORY: 'score.goodHistory',
    R2_STABILITY: 'score.stability',
    R3_FIRST_TIMER: 'score.firstLoan',
    R4_DEFAULT_RISK: 'score.defaultRisk',
    R5_COUNTERPARTY_STABILITY: 'score.counterparty',
};
export default function ScorePage() {
    const { t } = useTranslation();
    const { data, isLoading } = useQuery({
        queryKey: ['score'],
        queryFn: api.getScore,
    });
    if (isLoading) {
        return (_jsx(Layout, { title: t('score.title'), showBack: true, children: _jsx("div", { className: "text-center py-20", children: t('common.loading') }) }));
    }
    const bandColors = {
        A: 'text-green-600 bg-green-50',
        B: 'text-yellow-600 bg-yellow-50',
        C: 'text-red-600 bg-red-50',
    };
    return (_jsxs(Layout, { title: t('score.title'), showBack: true, children: [_jsxs("div", { className: "card text-center mb-6", children: [_jsx("p", { className: "text-gray-600 mb-2", children: t('score.yourScore') }), _jsx("div", { className: "text-6xl font-bold text-primary-600 mb-4", children: data?.current.score }), _jsx("div", { className: `inline-block px-6 py-2 rounded-full font-bold ${bandColors[data?.current.band || 'C']}`, children: t('score.band', { band: data?.current.band }) })] }), data?.current.reasonCodes && data.current.reasonCodes.length > 0 && (_jsxs("div", { className: "card mb-6", children: [_jsx("h3", { className: "text-lg font-bold mb-4", children: t('score.reasons') }), _jsx("ul", { className: "space-y-2", children: data.current.reasonCodes.slice(0, 3).map(code => (_jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-primary-600 mr-2", children: "\u2022" }), _jsx("span", { className: "text-gray-700", children: t(reasonCodeLabels[code] || code) })] }, code))) })] })), data?.history && data.history.length > 1 && (_jsxs("div", { className: "card", children: [_jsx("h3", { className: "text-lg font-bold mb-4", children: t('score.history') }), _jsx("div", { className: "space-y-3", children: data.history.slice(0, 5).map((item, idx) => (_jsxs("div", { className: "flex items-center justify-between py-2 border-b", children: [_jsxs("div", { children: [_jsx("span", { className: "font-bold", children: item.score }), _jsxs("span", { className: "ml-2 text-sm text-gray-600", children: ["(", item.band, ")"] })] }), _jsx("span", { className: "text-sm text-gray-500", children: new Date(item.createdAt).toLocaleDateString() })] }, idx))) })] }))] }));
}
//# sourceMappingURL=ScorePage.js.map