import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SendOTPSchema, VerifyOTPSchema } from '@sarathi/shared';
import { validateBody } from '../middleware/validateRequest.js';
import { sendOTP, verifyOTP } from '../services/otp.js';
import { UserModel } from '../models/User.js';
import { signJWT } from '../utils/jwt.js';
import { EventModel } from '../models/Event.js';
import { getLatestScore, recomputeAndSaveScore } from '../services/scoring.js';
import { logger } from '../config/logger.js';

const router = Router();

router.post('/otp/send', validateBody(SendOTPSchema), async (req, res, next) => {
  try {
    const { phoneE164 } = req.body;
    await sendOTP(phoneE164);

    // Log event
    const user = await UserModel.findOne({ phoneE164 });
    if (user) {
      await EventModel.create({
        userId: user._id.toString(),
        topic: 'otp.sent',
        payload: { phoneE164 },
      });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/otp/verify', validateBody(VerifyOTPSchema), async (req, res, next) => {
  try {
    const { phoneE164, code } = req.body;
    await verifyOTP(phoneE164, code);

    // Find or create user
    let user = await UserModel.findOne({ phoneE164 });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const sarathiId = uuidv4();
      user = await UserModel.create({
        phoneE164,
        sarathiId,
        preferredLang: 'en',
        stateCode: 'DL', // Default to Delhi
        kycStatus: 'none',
        isAdmin: false,
      });
      logger.info({ userId: user._id, sarathiId }, 'New user created');
    }

    // Generate JWT
    const jwt = signJWT({
      userId: user._id.toString(),
      sarathiId: user.sarathiId,
      phoneE164: user.phoneE164,
    });

    // Get or compute score
    let score = await getLatestScore(user._id.toString());
    if (!score) {
      score = await recomputeAndSaveScore(user._id.toString());
    }

    // Log event
    await EventModel.create({
      userId: user._id.toString(),
      topic: 'auth.login',
      payload: { phoneE164, isNewUser },
    });

    res.json({
      jwt,
      sarathiId: user.sarathiId,
      profile: {
        userId: user._id.toString(),
        phoneE164: user.phoneE164,
        preferredLang: user.preferredLang,
        stateCode: user.stateCode,
        kycStatus: user.kycStatus,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

