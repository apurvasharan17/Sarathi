import { Router } from 'express';
import { RemitSchema, PaginationSchema } from '@sarathi/shared';
import { authenticateUser, AuthRequest } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validateRequest.js';
import { TransactionModel } from '../models/Transaction.js';
import { UserModel } from '../models/User.js';
import { EventModel } from '../models/Event.js';
import { recomputeAndSaveScore } from '../services/scoring.js';
import { smsProvider } from '../services/sms/index.js';

const router = Router();

router.use(authenticateUser);

router.get('/', validateQuery(PaginationSchema), async (req: AuthRequest, res, next) => {
  try {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const skip = (page - 1) * limit;

    const transactions = await TransactionModel.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await TransactionModel.countDocuments({ userId: req.user!.userId });

    res.json({
      transactions: transactions.map(t => ({
        id: t._id.toString(),
        type: t.type,
        amount: t.amount,
        counterparty: t.counterparty,
        stateCode: t.stateCode,
        status: t.status,
        createdAt: t.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/remit', validateBody(RemitSchema), async (req: AuthRequest, res, next) => {
  try {
    const { amount, counterparty } = req.body;
    const userId = req.user!.userId;

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create transaction
    const transaction = await TransactionModel.create({
      userId,
      type: 'remit',
      amount,
      counterparty,
      stateCode: user.stateCode,
      status: 'success',
    });

    // Create event
    await EventModel.create({
      userId,
      topic: 'transaction.remit',
      payload: { transactionId: transaction._id.toString(), amount, counterparty },
    });

    // Send SMS receipt
    const message = `Sarathi: Money sent successfully. Amount: ₹${amount}. Transaction ID: ${transaction._id.toString().substring(0, 8)}.`;
    await smsProvider.send(user.phoneE164, message);

    // Recompute score
    await recomputeAndSaveScore(userId);

    res.json({
      id: transaction._id.toString(),
      status: transaction.status,
      amount: transaction.amount,
      createdAt: transaction.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

