import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Layout } from '../components/Layout';
export default function LoanPage() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [amount, setAmount] = useState('');
    const [decision, setDecision] = useState(null);
    const { data: activeLoanData } = useQuery({
        queryKey: ['activeLoan'],
        queryFn: api.getActiveLoan,
    });
    const requestMutation = useMutation({
        mutationFn: (amt) => api.requestLoan(amt),
        onSuccess: data => {
            setDecision(data);
        },
    });
    const acceptMutation = useMutation({
        mutationFn: (loanId) => api.acceptLoan(loanId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activeLoan'] });
            queryClient.invalidateQueries({ queryKey: ['me'] });
            setDecision(null);
            setAmount('');
        },
    });
    const [repayAmount, setRepayAmount] = useState('');
    const repayMutation = useMutation({
        mutationFn: () => api.repayLoan(activeLoanData.activeLoan.loanId, parseInt(repayAmount)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activeLoan'] });
            queryClient.invalidateQueries({ queryKey: ['me'] });
            setRepayAmount('');
            alert(t('loan.repaymentSuccess'));
        },
    });
    const handleRequest = (e) => {
        e.preventDefault();
        requestMutation.mutate(parseInt(amount));
    };
    // Show active loan if exists
    if (activeLoanData?.activeLoan) {
        const loan = activeLoanData.activeLoan;
        return (_jsx(Layout, { title: t('loan.title'), showBack: true, children: _jsxs("div", { className: "card", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: t('loan.activeLoan') }), _jsxs("div", { className: "space-y-3 mb-6", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: t('loan.principal') }), _jsxs("span", { className: "font-bold", children: [t('common.rupees'), loan.principal] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: t('loan.totalRepayment') }), _jsxs("span", { className: "font-bold", children: [t('common.rupees'), loan.totalDue] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: t('loan.remaining') }), _jsxs("span", { className: "font-bold text-primary-600", children: [t('common.rupees'), loan.remaining] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: t('loan.term') }), _jsxs("span", { children: [loan.termDays, " ", t('loan.days')] })] })] }), _jsxs("div", { className: "border-t pt-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: t('loan.repaymentAmount') }), _jsx("input", { type: "number", className: "input mb-4", placeholder: "0", value: repayAmount, onChange: e => setRepayAmount(e.target.value), max: loan.remaining }), _jsx("button", { className: "btn btn-primary w-full", onClick: () => repayMutation.mutate(), disabled: !repayAmount || repayMutation.isPending, children: repayMutation.isPending ? t('common.loading') : t('loan.makeRepayment') })] })] }) }));
    }
    // Show decision result if exists
    if (decision) {
        if (decision.decision === 'rejected') {
            return (_jsx(Layout, { title: t('loan.title'), showBack: true, children: _jsxs("div", { className: "card text-center", children: [_jsx("div", { className: "text-6xl mb-4", children: "\u26A0\uFE0F" }), _jsx("h2", { className: "text-2xl font-bold text-red-600 mb-4", children: t('loan.rejected') }), _jsxs("p", { className: "text-gray-600 mb-6", children: ["Band: ", decision.band] }), _jsx("button", { className: "btn btn-secondary w-full", onClick: () => {
                                setDecision(null);
                                setAmount('');
                            }, children: t('common.back') })] }) }));
        }
        return (_jsx(Layout, { title: t('loan.title'), showBack: true, children: _jsxs("div", { className: "card", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83C\uDF89" }), _jsx("h2", { className: "text-2xl font-bold text-green-600", children: t('loan.approved') })] }), _jsxs("div", { className: "space-y-3 mb-6", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: t('loan.amount') }), _jsxs("span", { className: "font-bold", children: [t('common.rupees'), decision.offer.amount] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: t('loan.interest') }), _jsxs("span", { children: [decision.offer.apr, "%"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: t('loan.term') }), _jsxs("span", { children: [decision.offer.termDays, " ", t('loan.days')] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: t('loan.totalRepayment') }), _jsxs("span", { className: "font-bold text-primary-600", children: [t('common.rupees'), decision.offer.estimatedEMI] })] })] }), _jsx("button", { className: "btn btn-primary btn-lg w-full", onClick: () => acceptMutation.mutate(decision.offer.loanId), disabled: acceptMutation.isPending, children: acceptMutation.isPending ? t('common.loading') : t('loan.acceptOffer') })] }) }));
    }
    // Show loan request form
    return (_jsx(Layout, { title: t('loan.title'), showBack: true, children: _jsxs("form", { onSubmit: handleRequest, className: "card", children: [_jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: t('loan.amount') }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-4 top-3.5 text-gray-500", children: t('common.rupees') }), _jsx("input", { type: "number", className: "input pl-10", placeholder: t('loan.amountPlaceholder'), value: amount, onChange: e => setAmount(e.target.value), required: true, min: "1000", max: "5000" })] })] }), _jsx("button", { type: "submit", className: "btn btn-primary btn-lg w-full", disabled: requestMutation.isPending, children: requestMutation.isPending ? t('common.loading') : t('loan.checkEligibility') }), requestMutation.isError && (_jsx("p", { className: "text-red-600 text-sm mt-4", children: requestMutation.error.message }))] }) }));
}
//# sourceMappingURL=LoanPage.js.map