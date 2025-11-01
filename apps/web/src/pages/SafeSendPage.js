import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Layout } from '../components/Layout';
export default function SafeSendPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [view, setView] = useState('list');
    const [selectedMerchantId, setSelectedMerchantId] = useState('');
    const [amount, setAmount] = useState('');
    const [goal, setGoal] = useState('school_fees');
    const [lockReason, setLockReason] = useState('');
    const [error, setError] = useState('');
    const { data: merchantsData } = useQuery({
        queryKey: ['merchants', { verified: true }],
        queryFn: () => api.getMerchants(undefined, true),
    });
    const { data: safeSendsData, isLoading: loadingSafeSends } = useQuery({
        queryKey: ['my-safesends'],
        queryFn: () => api.getMySafeSends(1, 20),
    });
    const createMutation = useMutation({
        mutationFn: ({ merchantId, amount, goal, lockReason }) => api.createSafeSend(merchantId, amount, goal, lockReason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-safesends'] });
            setView('list');
            setAmount('');
            setLockReason('');
            setError('');
        },
        onError: (err) => {
            setError(err.message || 'Failed to create SafeSend');
        },
    });
    const handleCreate = (e) => {
        e.preventDefault();
        setError('');
        const amountNum = parseInt(amount);
        if (!amountNum || amountNum <= 0) {
            setError('Please enter a valid amount');
            return;
        }
        if (!selectedMerchantId) {
            setError('Please select a merchant');
            return;
        }
        createMutation.mutate({
            merchantId: selectedMerchantId,
            amount: amountNum,
            goal,
            lockReason: lockReason || undefined,
        });
    };
    const getStatusBadge = (status) => {
        const badges = {
            pending: { text: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
            awaiting_proof: { text: 'Awaiting Proof', className: 'bg-blue-100 text-blue-800' },
            under_review: { text: 'Under Review', className: 'bg-purple-100 text-purple-800' },
            released: { text: 'Released', className: 'bg-green-100 text-green-800' },
            refunded: { text: 'Refunded', className: 'bg-gray-100 text-gray-800' },
            rejected: { text: 'Rejected', className: 'bg-red-100 text-red-800' },
        };
        const badge = badges[status] || badges.pending;
        return (_jsx("span", { className: `px-2 py-1 text-xs font-semibold rounded ${badge.className}`, children: badge.text }));
    };
    const getGoalLabel = (goalKey) => {
        const goals = {
            school_fees: 'School Fees',
            groceries: 'Groceries',
            rent: 'Rent',
            medical: 'Medical',
            utilities: 'Utilities',
            other: 'Other',
        };
        return goals[goalKey] || goalKey;
    };
    if (view === 'create') {
        return (_jsxs(Layout, { title: "Create SafeSend", children: [_jsx("button", { onClick: () => setView('list'), className: "btn-secondary mb-4", children: "\u2190 Back to List" }), _jsxs("form", { onSubmit: handleCreate, className: "card space-y-4", children: [_jsx("h2", { className: "text-xl font-bold", children: "Send Money Safely" }), _jsx("p", { className: "text-sm text-gray-600", children: "Lock funds for a specific purpose. Money is only released when merchant provides proof." }), error && (_jsx("div", { className: "p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm", children: error })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Select Merchant" }), _jsxs("select", { value: selectedMerchantId, onChange: (e) => setSelectedMerchantId(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500", required: true, children: [_jsx("option", { value: "", children: "-- Choose Merchant --" }), merchantsData?.merchants.map((merchant) => (_jsxs("option", { value: merchant._id, children: [merchant.name, " - ", merchant.category] }, merchant._id)))] }), merchantsData?.merchants.length === 0 && (_jsxs("div", { className: "mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded", children: [_jsx("p", { className: "text-sm text-yellow-800 font-semibold mb-2", children: "\u26A0\uFE0F No verified merchants available yet" }), _jsxs("p", { className: "text-sm text-yellow-800 mb-2", children: ["Merchants must be ", _jsx("strong", { children: "verified" }), " before they can receive SafeSend payments."] }), _jsxs("p", { className: "text-sm text-yellow-800", children: ["If you've created a merchant, go to the", ' ', _jsx("button", { type: "button", onClick: () => navigate('/admin'), className: "underline font-medium hover:text-yellow-900", children: "Admin Panel" }), ' ', "and click the ", _jsx("strong", { children: "\"Verify\"" }), " button next to the merchant."] })] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Amount (\u20B9)" }), _jsx("input", { type: "number", value: amount, onChange: (e) => setAmount(e.target.value), placeholder: "1000", className: "w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Purpose" }), _jsxs("select", { value: goal, onChange: (e) => setGoal(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500", required: true, children: [_jsx("option", { value: "school_fees", children: "School Fees" }), _jsx("option", { value: "groceries", children: "Groceries" }), _jsx("option", { value: "rent", children: "Rent" }), _jsx("option", { value: "medical", children: "Medical" }), _jsx("option", { value: "utilities", children: "Utilities" }), _jsx("option", { value: "other", children: "Other" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Notes (Optional)" }), _jsx("textarea", { value: lockReason, onChange: (e) => setLockReason(e.target.value), placeholder: "Additional notes about this payment...", className: "w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500", rows: 3 })] }), _jsx("button", { type: "submit", className: "btn-primary w-full", disabled: createMutation.isPending, children: createMutation.isPending ? 'Creating...' : 'Create SafeSend' })] })] }));
    }
    return (_jsxs(Layout, { title: "SafeSend", children: [_jsxs("div", { className: "mb-4 flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-bold", children: "Your SafeSend Transfers" }), _jsx("button", { onClick: () => setView('create'), className: "btn-primary", children: "+ New SafeSend" })] }), _jsxs("div", { className: "mb-4 p-4 bg-blue-50 border border-blue-200 rounded", children: [_jsx("h3", { className: "font-semibold text-blue-900 mb-1", children: "What is SafeSend?" }), _jsx("p", { className: "text-sm text-blue-800", children: "SafeSend locks your money for a specific purpose (school fees, groceries, etc.). The merchant can only receive funds after submitting proof of purchase. If proof is rejected or not submitted, you can get a refund." })] }), loadingSafeSends ? (_jsx("div", { className: "text-center py-8", children: "Loading..." })) : !safeSendsData?.escrows.length ? (_jsxs("div", { className: "card text-center py-8", children: [_jsx("p", { className: "text-gray-600 mb-4", children: "No SafeSend transfers yet" }), _jsx("button", { onClick: () => setView('create'), className: "btn-primary", children: "Create Your First SafeSend" })] })) : (_jsx("div", { className: "space-y-3", children: safeSendsData.escrows.map((escrow) => (_jsxs("div", { className: "card cursor-pointer hover:shadow-lg transition-shadow", onClick: () => navigate(`/safesend/${escrow._id}`), children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-semibold text-lg", children: ["\u20B9", escrow.amount.toLocaleString()] }), _jsx("p", { className: "text-sm text-gray-600", children: getGoalLabel(escrow.goal) })] }), getStatusBadge(escrow.status)] }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Created: ", new Date(escrow.createdAt).toLocaleDateString()] })] }, escrow._id))) })), _jsx("div", { className: "mt-6", children: _jsx("button", { onClick: () => navigate('/'), className: "btn-secondary w-full", children: "Back to Home" }) })] }));
}
//# sourceMappingURL=SafeSendPage.js.map