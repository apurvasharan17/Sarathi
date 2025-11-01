declare class APIError extends Error {
    code: string;
    statusCode: number;
    constructor(code: string, message: string, statusCode: number);
}
export declare function setAuthErrorHandler(handler: () => void): void;
export declare const api: {
    register: (phoneE164: string, password: string) => Promise<unknown>;
    loginInitiate: (phoneE164: string, password: string) => Promise<unknown>;
    loginVerify: (phoneE164: string, code: string) => Promise<{
        jwt: string;
        sarathiId: string;
        profile: {
            userId: string;
            phoneE164: string;
            preferredLang: string;
            stateCode: string;
            kycStatus: string;
            isAdmin?: boolean;
        };
    }>;
    sendOTP: (phoneE164: string) => Promise<unknown>;
    verifyOTP: (phoneE164: string, code: string) => Promise<{
        jwt: string;
        sarathiId: string;
        profile: {
            userId: string;
            phoneE164: string;
            preferredLang: string;
            stateCode: string;
            kycStatus: string;
        };
    }>;
    getMe: () => Promise<{
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
    }>;
    updateState: (stateCode: string) => Promise<{
        stateCode: string;
    }>;
    updateLanguage: (preferredLang: string) => Promise<{
        preferredLang: string;
    }>;
    createConsent: (purpose: string) => Promise<{
        consentId: string;
        tokenPreview: string;
        validTill: Date;
    }>;
    getConsents: () => Promise<{
        consents: Array<{
            consentId: string;
            purpose: string;
            validTill: Date;
            revoked: boolean;
            createdAt: Date;
        }>;
    }>;
    getTransactions: (page?: number, limit?: number) => Promise<{
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
    }>;
    remit: (amount: number, counterparty: string) => Promise<{
        id: string;
        status: string;
        amount: number;
        createdAt: Date;
    }>;
    getScore: () => Promise<{
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
    }>;
    requestLoan: (amount: number) => Promise<{
        decision: "approved" | "rejected";
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
    }>;
    acceptLoan: (loanId: string) => Promise<{
        status: string;
        disbursedAt: Date;
    }>;
    repayLoan: (loanId: string, amount: number) => Promise<{
        status: string;
        remaining: number;
        transactionId: string;
    }>;
    getActiveLoan: () => Promise<{
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
    }>;
    seedData: (months: number, amount: number, counterparty: string) => Promise<{
        inserted: number;
        score: {
            score: number;
            band: string;
            reasonCodes: string[];
        };
    }>;
    togglePoorNetwork: (enabled: boolean) => Promise<{
        enabled: boolean;
    }>;
    getMerchants: (stateCode?: string, verified?: boolean) => Promise<{
        merchants: Array<{
            _id: string;
            name: string;
            phoneE164: string;
            category: string;
            verified: boolean;
            stateCode: string;
        }>;
    }>;
    createMerchant: (name: string, phoneE164: string, category: string, stateCode: string) => Promise<{
        merchant: {
            _id: string;
            name: string;
            phoneE164: string;
            category: string;
            verified: boolean;
            stateCode: string;
        };
    }>;
    verifyMerchant: (merchantId: string) => Promise<{
        merchant: {
            _id: string;
            name: string;
            verified: boolean;
        };
    }>;
    createSafeSend: (merchantId: string, amount: number, goal: string, lockReason?: string) => Promise<{
        escrow: {
            _id: string;
            senderId: string;
            merchantId: string;
            amount: number;
            goal: string;
            status: string;
            createdAt: Date;
        };
    }>;
    getMySafeSends: (page?: number, limit?: number) => Promise<{
        escrows: Array<{
            _id: string;
            merchantId: string;
            amount: number;
            goal: string;
            status: string;
            createdAt: Date;
        }>;
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getMerchantSafeSends: (merchantId: string, page?: number, limit?: number) => Promise<{
        escrows: Array<{
            _id: string;
            senderId: string;
            amount: number;
            goal: string;
            status: string;
            createdAt: Date;
        }>;
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getSafeSendDetails: (escrowId: string) => Promise<{
        escrow: {
            _id: string;
            senderId: string;
            merchantId: string;
            amount: number;
            goal: string;
            status: string;
            lockReason?: string;
            releasedAt?: Date;
            refundedAt?: Date;
            createdAt: Date;
        };
        proofs: Array<{
            _id: string;
            proofUrl: string;
            description?: string;
            status: string;
            reviewedAt?: Date;
            rejectionReason?: string;
            createdAt: Date;
        }>;
        merchant: {
            _id: string;
            name: string;
            phoneE164: string;
            category: string;
        };
    }>;
    submitProof: (escrowId: string, proofUrl: string, description?: string) => Promise<{
        proof: {
            _id: string;
            escrowId: string;
            proofUrl: string;
            status: string;
            createdAt: Date;
        };
    }>;
    getPendingProofs: (page?: number, limit?: number) => Promise<{
        proofs: Array<{
            _id: string;
            escrowId: string;
            merchantId: string;
            proofUrl: string;
            description?: string;
            status: string;
            createdAt: Date;
        }>;
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    reviewProof: (proofId: string, approved: boolean, rejectionReason?: string) => Promise<{
        proof: {
            _id: string;
            status: string;
            reviewedAt: Date;
        };
        escrow: {
            _id: string;
            status: string;
            releasedAt?: Date;
        };
    }>;
    refundSafeSend: (escrowId: string) => Promise<{
        escrow: {
            _id: string;
            status: string;
            refundedAt: Date;
        };
    }>;
};
export { APIError };
//# sourceMappingURL=api.d.ts.map