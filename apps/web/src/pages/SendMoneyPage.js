import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Layout } from '../components/Layout';
export default function SendMoneyPage() {
    const { t } = useTranslation();
    const [amount, setAmount] = useState('');
    const [counterparty, setCounterparty] = useState('');
    const [success, setSuccess] = useState(false);
    const [txId, setTxId] = useState('');
    const remitMutation = useMutation({
        mutationFn: () => api.remit(parseInt(amount), counterparty),
        onSuccess: data => {
            setTxId(data.id);
            setSuccess(true);
        },
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        remitMutation.mutate();
    };
    if (success) {
        return (_jsx(Layout, { title: t('sendMoney.title'), showBack: true, children: _jsxs("div", { className: "card text-center", children: [_jsx("div", { className: "text-6xl mb-4", children: "\u2713" }), _jsx("h2", { className: "text-2xl font-bold text-green-600 mb-2", children: t('sendMoney.success') }), _jsxs("div", { className: "mt-6 text-left", children: [_jsx("p", { className: "text-sm text-gray-600", children: t('sendMoney.receipt') }), _jsxs("div", { className: "mt-4 bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { className: "flex justify-between mb-2", children: [_jsx("span", { className: "text-gray-600", children: t('sendMoney.amount') }), _jsxs("span", { className: "font-bold", children: [t('common.rupees'), amount] })] }), _jsxs("div", { className: "flex justify-between mb-2", children: [_jsx("span", { className: "text-gray-600", children: t('sendMoney.counterparty') }), _jsx("span", { className: "font-mono text-sm", children: counterparty })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: t('sendMoney.transactionId') }), _jsxs("span", { className: "font-mono text-xs", children: [txId.substring(0, 12), "..."] })] })] })] }), _jsx("button", { className: "btn btn-primary w-full mt-6", onClick: () => {
                            setSuccess(false);
                            setAmount('');
                            setCounterparty('');
                        }, children: t('common.close') })] }) }));
    }
    return (_jsx(Layout, { title: t('sendMoney.title'), showBack: true, children: _jsxs("form", { onSubmit: handleSubmit, className: "card", children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: t('sendMoney.amount') }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-4 top-3.5 text-gray-500", children: t('common.rupees') }), _jsx("input", { type: "number", className: "input pl-10", placeholder: t('sendMoney.amountPlaceholder'), value: amount, onChange: e => setAmount(e.target.value), required: true, min: "1", max: "50000" })] })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: t('sendMoney.counterparty') }), _jsx("input", { type: "tel", className: "input", placeholder: t('sendMoney.counterpartyPlaceholder'), value: counterparty, onChange: e => setCounterparty(e.target.value), required: true })] }), _jsx("button", { type: "submit", className: "btn btn-primary btn-lg w-full", disabled: remitMutation.isPending, children: remitMutation.isPending ? t('common.loading') : t('sendMoney.send') }), remitMutation.isError && (_jsx("p", { className: "text-red-600 text-sm mt-4", children: remitMutation.error.message }))] }) }));
}
//# sourceMappingURL=SendMoneyPage.js.map