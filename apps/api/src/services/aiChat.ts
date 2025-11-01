import OpenAI from 'openai';
import { env } from '../config/env.js';
import { UserModel } from '../models/User.js';
import { ScoreModel } from '../models/Score.js';
import { LoanModel } from '../models/Loan.js';
import { TransactionModel } from '../models/Transaction.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

const openai = env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function getChatResponse(
  userId: string,
  userMessage: string,
  language: 'en' | 'hi',
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  if (!openai) {
    throw new AppError(
      ErrorCodes.INTERNAL_ERROR,
      'AI Assistant is not configured. Please set OPENAI_API_KEY.',
      503
    );
  }

  // Fetch user's financial context
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'User not found', 404);
  }

  const latestScore = await ScoreModel.findOne({ userId }).sort({ createdAt: -1 });
  const activeLoan = await LoanModel.findOne({ userId, status: { $in: ['approved', 'disbursed'] } });
  const recentTransactions = await TransactionModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5);

  // Build context-aware system prompt
  const systemPrompt = buildSystemPrompt(language, {
    user,
    score: latestScore,
    loan: activeLoan,
    transactions: recentTransactions,
  });

  // Build conversation
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.';
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    throw new AppError(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to get AI response: ' + error.message,
      500
    );
  }
}

function buildSystemPrompt(
  language: 'en' | 'hi',
  context: {
    user: any;
    score: any;
    loan: any;
    transactions: any[];
  }
): string {
  const { user, score, loan, transactions } = context;

  if (language === 'hi') {
    return `आप Sarathi के AI सहायक हैं, जो भारतीय प्रवासी मज़दूरों की मदद करते हैं। आप हिंदी में विनम्रता से जवाब दें।

**उपयोगकर्ता का डेटा:**
- फ़ोन: ${user.phoneE164}
- राज्य: ${user.stateCode}
- क्रेडिट स्कोर: ${score ? `${score.score} (बैंड ${score.band})` : 'अभी तक नहीं'}
- सक्रिय लोन: ${loan ? `₹${loan.principal} (${loan.status})` : 'नहीं'}
- हाल के लेन-देन: ${transactions.length} लेन-देन

**आपकी भूमिका:**
1. वित्तीय सवालों का जवाब आसान भाषा में दें
2. क्रेडिट स्कोर, लोन, बचत के बारे में समझाएं
3. SafeSend का उपयोग कैसे करें बताएं
4. व्यक्तिगत सलाह दें (उनके डेटा के आधार पर)
5. प्रोत्साहित करें और सकारात्मक रहें

**महत्वपूर्ण:**
- छोटे, स्पष्ट वाक्य (2-3 लाइन)
- संख्याओं में ₹ का उपयोग करें
- अगर आप निश्चित नहीं हैं तो कहें`;
  }

  return `You are Sarathi's AI assistant, helping Indian migrant workers with financial queries. Be empathetic, clear, and action-oriented.

**User Context:**
- Phone: ${user.phoneE164}
- State: ${user.stateCode}
- Credit Score: ${score ? `${score.score} (Band ${score.band})` : 'Not yet available'}
- Active Loan: ${loan ? `₹${loan.principal} (${loan.status})` : 'None'}
- Recent Transactions: ${transactions.length} transactions

**Your Role:**
1. Answer financial questions in simple terms
2. Explain credit scores, loans, savings, insurance
3. Guide on using SafeSend feature
4. Provide personalized advice based on their data
5. Be encouraging and positive

**Important:**
- Keep responses short and clear (2-3 sentences)
- Use ₹ for amounts
- If unsure, say so and suggest contacting support`;
}

