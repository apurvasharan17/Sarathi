const API_BASE = '/api';

class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('jwt');

  const headers: HeadersInit = {
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
    throw new APIError(
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.message || 'An error occurred',
      response.status
    );
  }

  return data;
}

export const api = {
  // Auth
  sendOTP: (phoneE164: string) =>
    request('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phoneE164 }),
    }),

  verifyOTP: (phoneE164: string, code: string) =>
    request<{
      jwt: string;
      sarathiId: string;
      profile: {
        userId: string;
        phoneE164: string;
        preferredLang: string;
        stateCode: string;
        kycStatus: string;
      };
    }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phoneE164, code }),
    }),

  // Profile
  getMe: () =>
    request<{
      user: {
        userId: string;
        phoneE164: string;
        sarathiId: string;
        preferredLang: string;
        stateCode: string;
        kycStatus: string;
        isAdmin: boolean;
      };
      latestScore: {
        score: number;
        band: string;
        reasonCodes: string[];
      } | null;
      activeLoan: {
        loanId: string;
        principal: number;
        apr: number;
        termDays: number;
        status: string;
        disbursedAt: Date;
      } | null;
    }>('/profile/me'),

  updateState: (stateCode: string) =>
    request<{ stateCode: string }>('/profile/state', {
      method: 'POST',
      body: JSON.stringify({ stateCode }),
    }),

  updateLanguage: (preferredLang: string) =>
    request<{ preferredLang: string }>('/profile/language', {
      method: 'POST',
      body: JSON.stringify({ preferredLang }),
    }),

  // Consent
  createConsent: (purpose: string) =>
    request<{
      consentId: string;
      tokenPreview: string;
      validTill: Date;
    }>('/consent', {
      method: 'POST',
      body: JSON.stringify({ purpose }),
    }),

  getConsents: () =>
    request<{
      consents: Array<{
        consentId: string;
        purpose: string;
        validTill: Date;
        revoked: boolean;
        createdAt: Date;
      }>;
    }>('/consent'),

  // Transactions
  getTransactions: (page: number = 1, limit: number = 20) =>
    request<{
      transactions: Array<{
        id: string;
        type: string;
        amount: number;
        counterparty?: string;
        stateCode: string;
        status: string;
        createdAt: Date;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/transactions?page=${page}&limit=${limit}`),

  remit: (amount: number, counterparty: string) =>
    request<{
      id: string;
      status: string;
      amount: number;
      createdAt: Date;
    }>('/transactions/remit', {
      method: 'POST',
      body: JSON.stringify({ amount, counterparty }),
    }),

  // Score
  getScore: () =>
    request<{
      current: {
        score: number;
        band: string;
        reasonCodes: string[];
      };
      history: Array<{
        score: number;
        band: string;
        reasonCodes: string[];
        createdAt: Date;
      }>;
    }>('/score'),

  // Loan
  requestLoan: (amount: number) =>
    request<{
      decision: 'approved' | 'rejected';
      band: string;
      reasonCodes: string[];
      offer?: {
        loanId: string;
        amount: number;
        apr: number;
        termDays: number;
        estimatedEMI: number;
        dueDate: Date;
      };
    }>('/loan/request', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  acceptLoan: (loanId: string) =>
    request<{
      status: string;
      disbursedAt: Date;
    }>('/loan/accept', {
      method: 'POST',
      body: JSON.stringify({ loanId }),
    }),

  repayLoan: (loanId: string, amount: number) =>
    request<{
      status: string;
      remaining: number;
      transactionId: string;
    }>('/loan/repay', {
      method: 'POST',
      body: JSON.stringify({ loanId, amount }),
    }),

  getActiveLoan: () =>
    request<{
      activeLoan: {
        loanId: string;
        principal: number;
        apr: number;
        termDays: number;
        status: string;
        disbursedAt: Date;
        totalDue: number;
        totalRepaid: number;
        remaining: number;
      } | null;
    }>('/loan/active'),

  // Admin
  seedData: (months: number, amount: number, counterparty: string) =>
    request<{
      inserted: number;
      score: {
        score: number;
        band: string;
        reasonCodes: string[];
      };
    }>(`/admin/seed?months=${months}&amount=${amount}&counterparty=${counterparty}`),

  togglePoorNetwork: (enabled: boolean) =>
    request<{ enabled: boolean }>('/admin/poor-network-toggle', {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    }),
};

export { APIError };

