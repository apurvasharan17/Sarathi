import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Layout } from '../components/Layout';
export default function SafeSendDetailsPage() {
    const { escrowId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [proofUrl, setProofUrl] = useState('');
    const [proofDescription, setProofDescription] = useState('');
    const [showProofForm, setShowProofForm] = useState(false);
    const [error, setError] = useState('');
    const { data, isLoading } = useQuery({
        queryKey: ['safesend-details', escrowId],
        queryFn: () => api.getSafeSendDetails(escrowId),
        enabled: !!escrowId,
    });
    const submitProofMutation = useMutation({
        mutationFn: () => api.submitProof(escrowId, proofUrl, proofDescription || undefined),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['safesend-details', escrowId] });
            setProofUrl('');
            setProofDescription('');
            setShowProofForm(false);
            setError('');
        },
        onError: (err) => {
            setError(err.message || 'Failed to submit proof');
        },
    });
    const handleSubmitProof = (e) => {
        e.preventDefault();
        setError('');
        if (!proofUrl.trim()) {
            setError('Please enter a proof URL');
            return;
        }
        try {
            new URL(proofUrl);
        }
        catch {
            setError('Please enter a valid URL');
            return;
        }
        submitProofMutation.mutate();
    };
    if (isLoading) {
        return (_jsx(Layout, { children: _jsx("div", { className: "text-center py-20", children: "Loading..." }) }));
    }
    if (!data) {
        return (_jsx(Layout, { children: _jsxs("div", { className: "text-center py-20", children: [_jsx("p", { className: "text-red-600 mb-4", children: "SafeSend not found" }), _jsx("button", { onClick: () => navigate('/safesend'), className: "btn-primary", children: "Back to SafeSend" })] }) }));
    }
    const { escrow, proofs, merchant } = data;
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
        return (_jsx("span", { className: `px-3 py-1 text-sm font-semibold rounded ${badge.className}`, children: badge.text }));
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
    return (_jsxs(Layout, { title: "SafeSend Details", children: [_jsx("button", { onClick: () => navigate('/safesend'), className: "btn-secondary mb-4", children: "\u2190 Back to SafeSend List" }), _jsxs("div", { className: "card mb-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-bold text-primary-600", children: ["\u20B9", escrow.amount.toLocaleString()] }), _jsx("p", { className: "text-gray-600", children: getGoalLabel(escrow.goal) })] }), getStatusBadge(escrow.status)] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Merchant:" }), _jsx("span", { className: "font-medium", children: merchant.name })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Category:" }), _jsx("span", { children: merchant.category })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Merchant Phone:" }), _jsx("span", { children: merchant.phoneE164 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Created:" }), _jsx("span", { children: new Date(escrow.createdAt).toLocaleString() })] }), escrow.releasedAt && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Released:" }), _jsx("span", { className: "text-green-600 font-medium", children: new Date(escrow.releasedAt).toLocaleString() })] })), escrow.refundedAt && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Refunded:" }), _jsx("span", { className: "text-gray-600 font-medium", children: new Date(escrow.refundedAt).toLocaleString() })] })), escrow.lockReason && (_jsxs("div", { className: "mt-3 pt-3 border-t", children: [_jsx("p", { className: "text-gray-600 text-xs mb-1", children: "Notes:" }), _jsx("p", { className: "text-sm", children: escrow.lockReason })] }))] })] }), escrow.status === 'awaiting_proof' && (_jsx("div", { className: "card bg-blue-50 border-blue-200 mb-4", children: _jsx("p", { className: "text-sm text-blue-800", children: "\uD83D\uDD12 Funds are locked. Waiting for merchant to submit proof of purchase." }) })), escrow.status === 'under_review' && (_jsx("div", { className: "card bg-purple-50 border-purple-200 mb-4", children: _jsx("p", { className: "text-sm text-purple-800", children: "\uD83D\uDC40 Merchant has submitted proof. Admin is reviewing it." }) })), escrow.status === 'released' && (_jsx("div", { className: "card bg-green-50 border-green-200 mb-4", children: _jsx("p", { className: "text-sm text-green-800", children: "\u2705 Funds released to merchant! Proof was verified and approved." }) })), escrow.status === 'refunded' && (_jsx("div", { className: "card bg-gray-50 border-gray-200 mb-4", children: _jsx("p", { className: "text-sm text-gray-800", children: "\u21A9\uFE0F Funds have been refunded to your account." }) })), escrow.status === 'awaiting_proof' && showProofForm && (_jsxs("div", { className: "card mb-4", children: [_jsx("h3", { className: "font-bold mb-3", children: "Submit Proof of Purchase" }), error && (_jsx("div", { className: "p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm mb-3", children: error })), _jsxs("form", { onSubmit: handleSubmitProof, className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Proof URL (Receipt/Photo)" }), _jsx("input", { type: "url", value: proofUrl, onChange: (e) => setProofUrl(e.target.value), placeholder: "https://example.com/receipt.jpg", className: "w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500", required: true }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Upload your receipt/photo to a service like Imgur, Google Drive, or Dropbox and paste the link here" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description (Optional)" }), _jsx("textarea", { value: proofDescription, onChange: (e) => setProofDescription(e.target.value), placeholder: "Details about the purchase...", className: "w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500", rows: 3 })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "submit", className: "btn-primary flex-1", disabled: submitProofMutation.isPending, children: submitProofMutation.isPending ? 'Submitting...' : 'Submit Proof' }), _jsx("button", { type: "button", onClick: () => setShowProofForm(false), className: "btn-secondary", children: "Cancel" })] })] })] })), proofs.length > 0 && (_jsxs("div", { className: "card", children: [_jsx("h3", { className: "font-bold mb-3", children: "Proof Submissions" }), _jsx("div", { className: "space-y-3", children: proofs.map((proof) => (_jsxs("div", { className: "border rounded p-3", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("a", { href: proof.proofUrl, target: "_blank", rel: "noopener noreferrer", className: "text-primary-600 hover:underline font-medium text-sm", children: "View Proof \u2192" }), _jsx("span", { className: `px-2 py-1 text-xs rounded ${proof.status === 'approved'
                                                ? 'bg-green-100 text-green-800'
                                                : proof.status === 'rejected'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'}`, children: proof.status })] }), proof.description && (_jsx("p", { className: "text-sm text-gray-700 mb-2", children: proof.description })), proof.rejectionReason && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded p-2 mt-2", children: _jsxs("p", { className: "text-xs text-red-800", children: [_jsx("strong", { children: "Rejection Reason:" }), " ", proof.rejectionReason] }) })), _jsxs("p", { className: "text-xs text-gray-500 mt-2", children: ["Submitted: ", new Date(proof.createdAt).toLocaleString(), proof.reviewedAt && ` • Reviewed: ${new Date(proof.reviewedAt).toLocaleString()}`] })] }, proof._id))) })] })), escrow.status === 'awaiting_proof' && !showProofForm && proofs.length === 0 && (_jsx("button", { onClick: () => setShowProofForm(true), className: "btn-primary w-full mt-4", children: "Submit Proof of Purchase" }))] }));
}
//# sourceMappingURL=SafeSendDetailsPage.js.map