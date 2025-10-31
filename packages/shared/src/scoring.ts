import { REASON_CODES, SCORE_BANDS } from './constants.js';
import type { ScoringSignals, ScoringResult, ReasonCode } from './types.js';

const BASE_SCORE = 580;

export function computeScore(signals: ScoringSignals): ScoringResult {
  let score = BASE_SCORE;
  const reasonCodes: ReasonCode[] = [];

  // R1: +10 per completed monthly remittance ≥ ₹2,000 in last 6 months (cap +60)
  if (signals.monthsRemitted2000Plus > 0) {
    const remittanceBonus = Math.min(signals.monthsRemitted2000Plus * 10, 60);
    score += remittanceBonus;
    reasonCodes.push(REASON_CODES.R1_REM_HISTORY);
  }

  // R2: +15 if std-dev of last 3 months' remittances < 25% of mean
  if (
    signals.last3MonthsMean > 0 &&
    signals.last3MonthsStdDev < signals.last3MonthsMean * 0.25
  ) {
    score += 15;
    reasonCodes.push(REASON_CODES.R2_STABILITY);
  }

  // R5: +10 if same counterparty repeated in ≥3 different months in last 6 months
  if (signals.repeatedCounterpartyMonths >= 3) {
    score += 10;
    reasonCodes.push(REASON_CODES.R5_COUNTERPARTY_STABILITY);
  }

  // R3: +20 on first fully paid loan
  if (signals.firstLoanRepaid) {
    score += 20;
    reasonCodes.push(REASON_CODES.R3_FIRST_TIMER);
  }

  // R4: −50 on any default
  if (signals.defaulted) {
    score -= 50;
    reasonCodes.push(REASON_CODES.R4_DEFAULT_RISK);
  }

  // Determine band
  let band: 'A' | 'B' | 'C';
  if (score >= 680) {
    band = SCORE_BANDS.A;
  } else if (score >= 630) {
    band = SCORE_BANDS.B;
  } else {
    band = SCORE_BANDS.C;
  }

  return {
    score,
    band,
    reasonCodes,
  };
}

export function calculateEMI(principal: number, apr: number, termDays: number): number {
  // Simple interest calculation for short-term loans
  const interest = (principal * apr * termDays) / (365 * 100);
  const totalAmount = principal + interest;
  return Math.ceil(totalAmount);
}

