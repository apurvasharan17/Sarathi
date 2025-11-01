import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Layout } from '../components/Layout';
export default function AdminPage() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [months, setMonths] = useState('6');
    const [amount, setAmount] = useState('2500');
    const [counterparty, setCounterparty] = useState('+919999999999');
    // Merchant form
    const [merchantName, setMerchantName] = useState('');
    const [merchantPhone, setMerchantPhone] = useState('');
    const [merchantCategory, setMerchantCategory] = useState('');
    const [merchantState, setMerchantState] = useState('DL');
    const [showMerchantForm, setShowMerchantForm] = useState(false);
    const { data: merchantsData } = useQuery({
        queryKey: ['all-merchants'],
        queryFn: () => api.getMerchants(),
    });
    const { data: pendingProofsData } = useQuery({
        queryKey: ['pending-proofs'],
        queryFn: () => api.getPendingProofs(1, 10),
    });
    const seedMutation = useMutation({
        mutationFn: () => api.seedData(parseInt(months), parseInt(amount), counterparty),
        onSuccess: data => {
            alert(`${t('admin.seedSuccess')}\nScore: ${data.score.score} (${data.score.band})`);
        },
    });
    const createMerchantMutation = useMutation({
        mutationFn: () => api.createMerchant(merchantName, merchantPhone, merchantCategory, merchantState),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-merchants'] });
            setMerchantName('');
            setMerchantPhone('');
            setMerchantCategory('');
            setShowMerchantForm(false);
            alert('✅ Merchant created successfully!\n\n⚠️ Don\'t forget to click the "Verify" button to make this merchant available in SafeSend.');
        },
        onError: (err) => {
            if (err.statusCode === 403) {
                alert('Access denied: You need admin privileges to create merchants.\n\nPlease contact an administrator to grant you admin access.');
            }
            else if (err.statusCode === 401) {
                alert('Your session has expired. You will be redirected to login.');
            }
            else {
                alert(`Failed to create merchant: ${err.message || 'Unknown error'}`);
            }
        },
    });
    const verifyMerchantMutation = useMutation({
        mutationFn: (merchantId) => api.verifyMerchant(merchantId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-merchants'] });
            alert('Merchant verified successfully!');
        },
    });
    const reviewProofMutation = useMutation({
        mutationFn: ({ proofId, approved, rejectionReason }) => api.reviewProof(proofId, approved, rejectionReason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-proofs'] });
            alert('Proof reviewed successfully!');
        },
        onError: (err) => {
            alert(`Failed to review proof: ${err.message || 'Unknown error'}`);
        },
    });
    return (_jsxs(Layout, { title: t('admin.title'), showBack: true, children: [_jsxs("div", { className: "card mb-4", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: t('admin.seedData') }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: t('admin.months') }), _jsx("input", { type: "number", className: "input", value: months, onChange: e => setMonths(e.target.value), min: "1", max: "12" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: t('admin.amount') }), _jsx("input", { type: "number", className: "input", value: amount, onChange: e => setAmount(e.target.value), min: "1000" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: t('sendMoney.counterparty') }), _jsx("input", { type: "tel", className: "input", value: counterparty, onChange: e => setCounterparty(e.target.value) })] }), _jsx("button", { className: "btn btn-primary w-full", onClick: () => seedMutation.mutate(), disabled: seedMutation.isPending, children: seedMutation.isPending ? t('common.loading') : t('admin.seed') }), seedMutation.isError && (_jsx("p", { className: "text-red-600 text-sm", children: seedMutation.error.message }))] })] }), _jsxs("div", { className: "card mb-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold", children: "Manage Merchants" }), _jsx("p", { className: "text-xs text-gray-600 mt-1", children: "Create and verify merchants for SafeSend" })] }), _jsx("button", { onClick: () => setShowMerchantForm(!showMerchantForm), className: "btn-secondary text-sm", children: showMerchantForm ? 'Cancel' : '+ Add Merchant' })] }), _jsx("div", { className: "mb-4 p-3 bg-blue-50 border border-blue-200 rounded", children: _jsxs("p", { className: "text-sm text-blue-800", children: [_jsx("strong", { children: "\uD83D\uDCA1 Tip:" }), " After creating a merchant, click the ", _jsx("strong", { children: "\"Verify\"" }), " button to make them available for SafeSend payments. Only verified merchants appear in the SafeSend feature."] }) }), showMerchantForm && (_jsxs("div", { className: "mb-4 p-4 bg-gray-50 rounded space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Merchant Name *" }), _jsx("input", { type: "text", placeholder: "e.g., ABC School", value: merchantName, onChange: e => setMerchantName(e.target.value), className: "input w-full", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Phone Number *" }), _jsx("input", { type: "tel", placeholder: "+919876543210", value: merchantPhone, onChange: e => setMerchantPhone(e.target.value), className: "input w-full", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Category *" }), _jsx("input", { type: "text", placeholder: "e.g., School, Grocery, Medical", value: merchantCategory, onChange: e => setMerchantCategory(e.target.value), className: "input w-full", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "State Code (2 letters) *" }), _jsx("input", { type: "text", placeholder: "e.g., DL, MH, KA", value: merchantState, onChange: e => setMerchantState(e.target.value.toUpperCase()), className: "input w-full", maxLength: 2, required: true })] }), createMerchantMutation.isError && (_jsx("div", { className: "p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm", children: createMerchantMutation.error?.message || 'Failed to create merchant' })), _jsx("button", { onClick: () => {
                                    if (!merchantName.trim()) {
                                        alert('Please enter merchant name');
                                        return;
                                    }
                                    if (!merchantPhone.trim() || !merchantPhone.match(/^\+91[6-9]\d{9}$/)) {
                                        alert('Please enter valid Indian phone number (format: +919876543210)');
                                        return;
                                    }
                                    if (!merchantCategory.trim()) {
                                        alert('Please enter category');
                                        return;
                                    }
                                    if (!merchantState.trim() || merchantState.length !== 2) {
                                        alert('Please enter valid 2-letter state code (e.g., DL, MH)');
                                        return;
                                    }
                                    createMerchantMutation.mutate();
                                }, disabled: createMerchantMutation.isPending, className: "btn-primary w-full", children: createMerchantMutation.isPending ? 'Creating...' : 'Create Merchant (Unverified)' })] })), merchantsData?.merchants && merchantsData.merchants.length > 0 ? (_jsx("div", { className: "space-y-2", children: merchantsData.merchants.map(merchant => (_jsxs("div", { className: "flex justify-between items-center p-3 border rounded hover:bg-gray-50", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium", children: merchant.name }), _jsxs("p", { className: "text-sm text-gray-600", children: [merchant.category, " \u2022 ", merchant.phoneE164, " \u2022 ", merchant.stateCode] })] }), !merchant.verified ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded", children: "Unverified" }), _jsx("button", { onClick: () => verifyMerchantMutation.mutate(merchant._id), disabled: verifyMerchantMutation.isPending, className: "btn-primary text-sm whitespace-nowrap", children: verifyMerchantMutation.isPending ? 'Verifying...' : 'Verify →' })] })) : (_jsx("span", { className: "px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded", children: "\u2713 Verified" }))] }, merchant._id))) })) : (_jsx("div", { className: "text-center py-6 text-gray-500 border rounded bg-gray-50", children: _jsx("p", { className: "text-sm", children: "No merchants yet. Click \"+ Add Merchant\" to create one." }) }))] }), pendingProofsData && pendingProofsData.proofs.length > 0 && (_jsxs("div", { className: "card", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: "Pending Proof Reviews" }), _jsx("div", { className: "space-y-3", children: pendingProofsData.proofs.map(proof => (_jsxs("div", { className: "border rounded p-3", children: [_jsx("a", { href: proof.proofUrl, target: "_blank", rel: "noopener noreferrer", className: "text-primary-600 hover:underline font-medium mb-2 block", children: "View Proof \u2192" }), proof.description && (_jsx("p", { className: "text-sm text-gray-700 mb-2", children: proof.description })), _jsxs("p", { className: "text-xs text-gray-500 mb-3", children: ["Escrow: ", proof.escrowId, " \u2022 Submitted: ", new Date(proof.createdAt).toLocaleString()] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => reviewProofMutation.mutate({ proofId: proof._id, approved: true }), disabled: reviewProofMutation.isPending, className: "btn-primary flex-1 text-sm", children: "Approve" }), _jsx("button", { onClick: () => {
                                                const rejectionReason = prompt('Rejection reason:');
                                                if (rejectionReason) {
                                                    reviewProofMutation.mutate({
                                                        proofId: proof._id,
                                                        approved: false,
                                                        rejectionReason,
                                                    });
                                                }
                                            }, disabled: reviewProofMutation.isPending, className: "btn-secondary flex-1 text-sm", children: "Reject" })] })] }, proof._id))) })] }))] }));
}
//# sourceMappingURL=AdminPage.js.map