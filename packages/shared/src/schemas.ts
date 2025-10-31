import { z } from 'zod';
import { LANGUAGE, LOAN_STATUS, TRANSACTION_TYPE, TRANSACTION_STATUS } from './constants.js';

// Auth schemas
export const SendOTPSchema = z.object({
  phoneE164: z.string().regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number'),
});

export const VerifyOTPSchema = z.object({
  phoneE164: z.string().regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number'),
  code: z.string().length(6, 'OTP must be 6 digits'),
});

// Profile schemas
export const UpdateStateSchema = z.object({
  stateCode: z.string().length(2, 'State code must be 2 characters'),
});

export const UpdateLanguageSchema = z.object({
  preferredLang: z.enum([LANGUAGE.EN, LANGUAGE.HI]),
});

// Consent schema
export const CreateConsentSchema = z.object({
  purpose: z.string().min(1).max(200),
});

// Transaction schemas
export const RemitSchema = z.object({
  amount: z.number().int().positive().max(50000, 'Amount cannot exceed ₹50,000'),
  counterparty: z.string().regex(/^\+91[6-9]\d{9}$/, 'Invalid phone number'),
});

// Loan schemas
export const LoanRequestSchema = z.object({
  amount: z.number().int().positive().max(5000, 'Amount cannot exceed ₹5,000'),
});

export const LoanAcceptSchema = z.object({
  loanId: z.string(),
});

export const LoanRepaySchema = z.object({
  loanId: z.string(),
  amount: z.number().int().positive(),
});

// Admin schemas
export const AdminSeedSchema = z.object({
  months: z.number().int().min(1).max(12).optional().default(6),
  amount: z.number().int().positive().optional().default(2500),
  counterparty: z.string().regex(/^\+91[6-9]\d{9}$/).optional().default('+919999999999'),
});

export const AdminPoorNetworkToggleSchema = z.object({
  enabled: z.boolean(),
});

// Query schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// Response type helpers
export type SendOTPInput = z.infer<typeof SendOTPSchema>;
export type VerifyOTPInput = z.infer<typeof VerifyOTPSchema>;
export type UpdateStateInput = z.infer<typeof UpdateStateSchema>;
export type UpdateLanguageInput = z.infer<typeof UpdateLanguageSchema>;
export type CreateConsentInput = z.infer<typeof CreateConsentSchema>;
export type RemitInput = z.infer<typeof RemitSchema>;
export type LoanRequestInput = z.infer<typeof LoanRequestSchema>;
export type LoanAcceptInput = z.infer<typeof LoanAcceptSchema>;
export type LoanRepayInput = z.infer<typeof LoanRepaySchema>;
export type AdminSeedInput = z.infer<typeof AdminSeedSchema>;
export type AdminPoorNetworkToggleInput = z.infer<typeof AdminPoorNetworkToggleSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;

