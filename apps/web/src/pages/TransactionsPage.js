import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Layout } from '../components/Layout';
export default function TransactionsPage() {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const { data, isLoading } = useQuery({
        queryKey: ['transactions', page],
        queryFn: () => api.getTransactions(page),
    });
    if (isLoading) {
        return (_jsx(Layout, { title: t('transactions.title'), showBack: true, children: _jsx("div", { className: "text-center py-20", children: t('common.loading') }) }));
    }
    if (!data?.transactions.length) {
        return (_jsx(Layout, { title: t('transactions.title'), showBack: true, children: _jsx("div", { className: "card text-center", children: _jsx("p", { className: "text-gray-600", children: t('transactions.empty') }) }) }));
    }
    const typeLabels = {
        remit: 'transactions.type.remit',
        repay: 'transactions.type.repay',
        loan_disbursal: 'transactions.type.loan_disbursal',
    };
    const statusColors = {
        success: 'text-green-600 bg-green-50',
        failed: 'text-red-600 bg-red-50',
        pending: 'text-yellow-600 bg-yellow-50',
    };
    return (_jsxs(Layout, { title: t('transactions.title'), showBack: true, children: [_jsx("div", { className: "space-y-3", children: data.transactions.map(tx => (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-bold text-lg", children: [t('common.rupees'), tx.amount] }), _jsx("p", { className: "text-sm text-gray-600", children: t(typeLabels[tx.type]) })] }), _jsx("span", { className: `px-3 py-1 rounded-full text-xs font-bold ${statusColors[tx.status]}`, children: t(`transactions.status.${tx.status}`) })] }), tx.counterparty && (_jsxs("p", { className: "text-sm text-gray-500 mb-1", children: ["To: ", tx.counterparty] })), _jsx("p", { className: "text-xs text-gray-400", children: new Date(tx.createdAt).toLocaleString() })] }, tx.id))) }), data.pagination.totalPages > 1 && (_jsxs("div", { className: "flex justify-center gap-2 mt-6", children: [_jsxs("button", { className: "btn btn-secondary", onClick: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1, children: ["\u2190 ", t('common.back')] }), _jsxs("span", { className: "px-4 py-2 text-gray-600", children: [page, " / ", data.pagination.totalPages] }), _jsxs("button", { className: "btn btn-secondary", onClick: () => setPage(p => p + 1), disabled: page >= data.pagination.totalPages, children: [t('common.next'), " \u2192"] })] }))] }));
}
//# sourceMappingURL=TransactionsPage.js.map