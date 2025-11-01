const API_BASE = '/api';
class APIError extends Error {
    constructor(code, message, statusCode) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'APIError';
    }
}
// Callback for handling auth errors - will be set by AuthContext
let onAuthError = null;
export function setAuthErrorHandler(handler) {
    onAuthError = handler;
}
async function request(endpoint, options = {}) {
    const token = localStorage.getItem('jwt');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });
    const data = await response.json();
    if (!response.ok) {
        const error = new APIError(data.error?.code || 'UNKNOWN_ERROR', data.error?.message || 'An error occurred', response.status);
        // Handle authentication errors (401) - token expired or invalid
        if (response.status === 401 && onAuthError) {
            console.warn('Authentication error detected - logging out');
            onAuthError();
        }
        throw error;
    }
    return data;
}
export const api = {
    // Registration & Password login
    register: (phoneE164, password) => request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ phoneE164, password }),
    }),
    loginInitiate: (phoneE164, password) => request('/auth/login/initiate', {
        method: 'POST',
        body: JSON.stringify({ phoneE164, password }),
    }),
    loginVerify: (phoneE164, code) => request('/auth/login/verify', {
        method: 'POST',
        body: JSON.stringify({ phoneE164, code }),
    }),
    // Auth
    sendOTP: (phoneE164) => request('/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({ phoneE164 }),
    }),
    verifyOTP: (phoneE164, code) => request('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phoneE164, code }),
    }),
    // Profile
    getMe: () => request('/profile/me'),
    updateState: (stateCode) => request('/profile/state', {
        method: 'POST',
        body: JSON.stringify({ stateCode }),
    }),
    updateLanguage: (preferredLang) => request('/profile/language', {
        method: 'POST',
        body: JSON.stringify({ preferredLang }),
    }),
    // Consent
    createConsent: (purpose) => request('/consent', {
        method: 'POST',
        body: JSON.stringify({ purpose }),
    }),
    getConsents: () => request('/consent'),
    // Transactions
    getTransactions: (page = 1, limit = 20) => request(`/transactions?page=${page}&limit=${limit}`),
    remit: (amount, counterparty) => request('/transactions/remit', {
        method: 'POST',
        body: JSON.stringify({ amount, counterparty }),
    }),
    // Score
    getScore: () => request('/score'),
    // Loan
    requestLoan: (amount) => request('/loan/request', {
        method: 'POST',
        body: JSON.stringify({ amount }),
    }),
    acceptLoan: (loanId) => request('/loan/accept', {
        method: 'POST',
        body: JSON.stringify({ loanId }),
    }),
    repayLoan: (loanId, amount) => request('/loan/repay', {
        method: 'POST',
        body: JSON.stringify({ loanId, amount }),
    }),
    getActiveLoan: () => request('/loan/active'),
    // Admin
    seedData: (months, amount, counterparty) => request(`/admin/seed?months=${months}&amount=${amount}&counterparty=${counterparty}`),
    togglePoorNetwork: (enabled) => request('/admin/poor-network-toggle', {
        method: 'POST',
        body: JSON.stringify({ enabled }),
    }),
    // SafeSend
    getMerchants: (stateCode, verified) => request(`/safesend/merchants?${stateCode ? `stateCode=${stateCode}&` : ''}${verified !== undefined ? `verified=${verified}` : ''}`),
    createMerchant: (name, phoneE164, category, stateCode) => request('/safesend/merchants', {
        method: 'POST',
        body: JSON.stringify({ name, phoneE164, category, stateCode }),
    }),
    verifyMerchant: (merchantId) => request(`/safesend/merchants/${merchantId}/verify`, {
        method: 'POST',
    }),
    createSafeSend: (merchantId, amount, goal, lockReason) => request('/safesend/escrow', {
        method: 'POST',
        body: JSON.stringify({ merchantId, amount, goal, lockReason }),
    }),
    getMySafeSends: (page = 1, limit = 20) => request(`/safesend/escrow/my?page=${page}&limit=${limit}`),
    getMerchantSafeSends: (merchantId, page = 1, limit = 20) => request(`/safesend/escrow/merchant/${merchantId}?page=${page}&limit=${limit}`),
    getSafeSendDetails: (escrowId) => request(`/safesend/escrow/${escrowId}`),
    submitProof: (escrowId, proofUrl, description) => request('/safesend/proof', {
        method: 'POST',
        body: JSON.stringify({ escrowId, proofUrl, description }),
    }),
    getPendingProofs: (page = 1, limit = 20) => request(`/safesend/proof/pending?page=${page}&limit=${limit}`),
    reviewProof: (proofId, approved, rejectionReason) => request('/safesend/proof/review', {
        method: 'POST',
        body: JSON.stringify({ proofId, approved, rejectionReason }),
    }),
    refundSafeSend: (escrowId) => request('/safesend/escrow/refund', {
        method: 'POST',
        body: JSON.stringify({ escrowId }),
    }),
};
export { APIError };
//# sourceMappingURL=api.js.map