import { Router } from 'express';
import { LoanRequestSchema, LoanAcceptSchema, LoanRepaySchema, LOAN_LIMITS, calculateEMI } from '@sarathi/shared';
import { authenticateUser, AuthRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validateRequest.js';
import { LoanModel } from '../models/Loan.js';
import { TransactionModel } from '../models/Transaction.js';
import { UserModel } from '../models/User.js';
import { EventModel } from '../models/Event.js';
import { getLatestScore, recomputeAndSaveScore } from '../services/scoring.js';
import { smsProvider } from '../services/sms/index.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

const router = Router();

router.use(authenticateUser);

router.post('/request', validateBody(LoanRequestSchema), async (req: AuthRequest, res, next) => {
  try {
    const { amount } = req.body;
    const userId = req.user!.userId;

    // Check for active loan
    const activeLoan = await LoanModel.findOne({
      userId,
      status: { $in: ['approved', 'disbursed'] },
    });

    if (activeLoan) {
      throw new AppError(ErrorCodes.ACTIVE_LOAN_EXISTS, 'You already have an active loan', 400);
    }

    // Get current score
    const scoreResult = await getLatestScore(userId);
    if (!scoreResult) {
      throw new AppError(ErrorCodes.LOAN_REJECTED, 'Unable to assess creditworthiness', 400);
    }

    const { score, band, reasonCodes } = scoreResult;

    // Decision logic
    let decision: 'approved' | 'rejected' = 'rejected';
    let offer: { amount: number; apr: number; termDays: number; estimatedEMI: number; dueDate: Date } | undefined;

    if (band === 'A' && amount <= LOAN_LIMITS.BAND_A.maxAmount) {
      decision = 'approved';
      const termDays = amount === 5000 ? LOAN_LIMITS.BAND_A.termDays60 : LOAN_LIMITS.BAND_A.termDays30;
      const estimatedEMI = calculateEMI(amount, LOAN_LIMITS.BAND_A.apr, termDays);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + termDays);

      offer = {
        amount,
        apr: LOAN_LIMITS.BAND_A.apr,
        termDays,
        estimatedEMI,
        dueDate,
      };
    } else if (band === 'B' && amount <= LOAN_LIMITS.BAND_B.maxAmount) {
      decision = 'approved';
      const estimatedEMI = calculateEMI(amount, LOAN_LIMITS.BAND_B.apr, LOAN_LIMITS.BAND_B.termDays);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + LOAN_LIMITS.BAND_B.termDays);

      offer = {
        amount,
        apr: LOAN_LIMITS.BAND_B.apr,
        termDays: LOAN_LIMITS.BAND_B.termDays,
        estimatedEMI,
        dueDate,
      };
    } else if (band === 'C' && amount <= LOAN_LIMITS.BAND_C.maxAmount && score >= LOAN_LIMITS.BAND_C.minScore) {
      // Additional check: ≥3 monthly remittances
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const remittances = await TransactionModel.find({
        userId,
        type: 'remit',
        status: 'success',
        createdAt: { $gte: sixMonthsAgo },
      });

      const monthlyRemittances = new Map<string, boolean>();
      for (const tx of remittances) {
        const monthKey = `${tx.createdAt.getFullYear()}-${tx.createdAt.getMonth()}`;
        monthlyRemittances.set(monthKey, true);
      }

      if (monthlyRemittances.size >= LOAN_LIMITS.BAND_C.minRemittances) {
        decision = 'approved';
        const estimatedEMI = calculateEMI(amount, LOAN_LIMITS.BAND_C.apr, LOAN_LIMITS.BAND_C.termDays);
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + LOAN_LIMITS.BAND_C.termDays);

        offer = {
          amount,
          apr: LOAN_LIMITS.BAND_C.apr,
          termDays: LOAN_LIMITS.BAND_C.termDays,
          estimatedEMI,
          dueDate,
        };
      }
    }

    // Create loan record
    let loan;
    if (decision === 'approved' && offer) {
      loan = await LoanModel.create({
        userId,
        principal: offer.amount,
        apr: offer.apr,
        termDays: offer.termDays,
        status: 'preapproved',
      });

      // Send SMS
      const user = await UserModel.findById(userId);
      if (user) {
        const message = `Sarathi: Loan approved! Amount: ₹${offer.amount}. Term: ${offer.termDays} days. Accept in the app.`;
        await smsProvider.send(user.phoneE164, message);
      }
    } else {
      loan = await LoanModel.create({
        userId,
        principal: amount,
        apr: 0,
        termDays: 0,
        status: 'rejected',
      });
    }

    // Create event
    await EventModel.create({
      userId,
      topic: 'loan.decision',
      payload: { loanId: loan._id.toString(), decision, amount, band },
    });

    res.json({
      decision,
      band,
      reasonCodes,
      offer: decision === 'approved' ? { ...offer, loanId: loan._id.toString() } : undefined,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/accept', validateBody(LoanAcceptSchema), async (req: AuthRequest, res, next) => {
  try {
    const { loanId } = req.body;
    const userId = req.user!.userId;

    const loan = await LoanModel.findOne({ _id: loanId, userId });
    if (!loan) {
      throw new AppError(ErrorCodes.LOAN_NOT_FOUND, 'Loan not found', 404);
    }

    if (loan.status !== 'preapproved') {
      throw new AppError(ErrorCodes.INVALID_INPUT, 'Loan cannot be accepted', 400);
    }

    // Update loan status
    loan.status = 'approved';
    loan.approvedAt = new Date();
    await loan.save();

    // Mock disbursal - create transaction
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError(ErrorCodes.NOT_FOUND, 'User not found', 404);
    }

    const transaction = await TransactionModel.create({
      userId,
      type: 'loan_disbursal',
      amount: loan.principal,
      stateCode: user.stateCode,
      status: 'success',
    });

    // Update loan to disbursed
    loan.status = 'disbursed';
    loan.disbursedAt = new Date();
    await loan.save();

    // Send SMS
    const message = `Sarathi: Loan disbursed! Amount: ₹${loan.principal} will be credited shortly. Repay within ${loan.termDays} days.`;
    await smsProvider.send(user.phoneE164, message);

    // Create event
    await EventModel.create({
      userId,
      topic: 'loan.disbursed',
      payload: { loanId: loan._id.toString(), amount: loan.principal, transactionId: transaction._id.toString() },
    });

    res.json({
      status: loan.status,
      disbursedAt: loan.disbursedAt,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/repay', validateBody(LoanRepaySchema), async (req: AuthRequest, res, next) => {
  try {
    const { loanId, amount } = req.body;
    const userId = req.user!.userId;

    const loan = await LoanModel.findOne({ _id: loanId, userId });
    if (!loan) {
      throw new AppError(ErrorCodes.LOAN_NOT_FOUND, 'Loan not found', 404);
    }

    if (loan.status !== 'disbursed') {
      throw new AppError(ErrorCodes.INVALID_INPUT, 'Loan is not active', 400);
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError(ErrorCodes.NOT_FOUND, 'User not found', 404);
    }

    // Calculate total due
    const totalDue = calculateEMI(loan.principal, loan.apr, loan.termDays);

    // Get existing repayments
    const repayments = await TransactionModel.find({
      userId,
      type: 'repay',
      status: 'success',
    });

    const totalRepaid = repayments.reduce((sum, tx) => sum + tx.amount, 0);
    const remaining = totalDue - totalRepaid;

    if (amount > remaining) {
      throw new AppError(ErrorCodes.INVALID_INPUT, 'Repayment amount exceeds remaining balance', 400);
    }

    // Create repayment transaction
    const transaction = await TransactionModel.create({
      userId,
      type: 'repay',
      amount,
      stateCode: user.stateCode,
      status: 'success',
    });

    // Check if fully repaid
    const newRemaining = remaining - amount;
    if (newRemaining <= 0) {
      loan.status = 'repaid';
      loan.repaidAt = new Date();
      await loan.save();

      // Recompute score (first loan repaid bonus)
      await recomputeAndSaveScore(userId);

      const message = `Sarathi: Loan repaid in full! Amount: ₹${amount}. Your credit score has been updated.`;
      await smsProvider.send(user.phoneE164, message);

      await EventModel.create({
        userId,
        topic: 'loan.repaid',
        payload: { loanId: loan._id.toString(), transactionId: transaction._id.toString() },
      });
    } else {
      const message = `Sarathi: Repayment received! Amount: ₹${amount}. Remaining: ₹${newRemaining.toFixed(0)}.`;
      await smsProvider.send(user.phoneE164, message);

      await EventModel.create({
        userId,
        topic: 'loan.partial_repay',
        payload: { loanId: loan._id.toString(), amount, remaining: newRemaining, transactionId: transaction._id.toString() },
      });
    }

    res.json({
      status: loan.status,
      remaining: newRemaining,
      transactionId: transaction._id.toString(),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/active', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const activeLoan = await LoanModel.findOne({
      userId,
      status: { $in: ['approved', 'disbursed'] },
    });

    if (!activeLoan) {
      return res.json({ activeLoan: null });
    }

    const totalDue = calculateEMI(activeLoan.principal, activeLoan.apr, activeLoan.termDays);
    const repayments = await TransactionModel.find({
      userId,
      type: 'repay',
      status: 'success',
    });
    const totalRepaid = repayments.reduce((sum, tx) => sum + tx.amount, 0);

    res.json({
      activeLoan: {
        loanId: activeLoan._id.toString(),
        principal: activeLoan.principal,
        apr: activeLoan.apr,
        termDays: activeLoan.termDays,
        status: activeLoan.status,
        disbursedAt: activeLoan.disbursedAt,
        totalDue,
        totalRepaid,
        remaining: totalDue - totalRepaid,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

