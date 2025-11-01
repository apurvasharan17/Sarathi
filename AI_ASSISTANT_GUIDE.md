# 🤖 AI Voice Assistant Guide

The Sarathi AI Assistant is a **bilingual (Hindi + English) voice-enabled chatbot** that helps users understand financial concepts and get personalized advice.

## Features ✨

### 🎤 Voice Input & Output
- **Voice Recognition**: Click mic button to speak your question
- **Text-to-Speech**: Responses are automatically read aloud
- Supports Hindi (`hi-IN`) and English (`en-US`)

### 💡 Context-Aware
The AI knows about:
- Your credit score and band
- Your active loan status
- Recent transactions
- Your state and phone number

### 🌍 Bilingual Support
- Switch between English and Hindi seamlessly
- Uses appropriate language model and voice

### 📚 Financial Topics
Ask about:
- Credit scores: "Mera credit score kaise badhega?"
- Loans: "Mujhe kitna loan mil sakta hai?"
- SafeSend: "SafeSend kya hai?"
- Savings: "Mere bete ki padhai ke liye kitna bachana chahiye?"
- Transactions: "Mere transactions dikha do"

## Setup Instructions 🚀

### Step 1: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create an account or login
3. Click **"Create new secret key"**
4. Copy the key (starts with `sk-...`)

### Step 2: Configure Environment

Add to your `.env` file:

```bash
# In apps/api/.env (or root .env)
OPENAI_API_KEY=sk-your-actual-key-here
```

### Step 3: Install Dependencies

```bash
cd /Users/apurvasharan/Documents/Sarathi2.0

# Install OpenAI SDK
pnpm install

# Rebuild shared package
pnpm -w -r --filter @sarathi/shared build
```

### Step 4: Restart Server

```bash
# Stop API server (Ctrl+C)
pnpm dev:api
```

## Usage 💬

### From Web App

1. **Login** to Sarathi app
2. **Click tile #5**: "AI Assistant 🤖" (or "AI सहायक 🤖")
3. **Type or speak** your question
4. **Get personalized answer** based on your financial data

### Quick Questions

**English:**
- "What is my credit score?"
- "How much loan can I get?"
- "How does SafeSend work?"
- "How to improve my score?"

**Hindi:**
- "मेरा क्रेडिट स्कोर क्या है?"
- "मुझे कितना लोन मिल सकता है?"
- "SafeSend कैसे काम करता है?"
- "मेरा स्कोर कैसे बढ़ाएं?"

## Architecture 🏗️

### Backend (`apps/api/src/services/aiChat.ts`)
- OpenAI GPT-4 integration
- Context builder (user data, score, loans)
- Bilingual system prompts
- Error handling

### API Route (`apps/api/src/routes/chat.ts`)
- `POST /chat/message`
- Authenticated endpoint
- Conversation history support

### Frontend (`apps/web/src/pages/ChatPage.tsx`)
- Modern chat UI
- Web Speech API integration
- Voice input (mic button)
- Voice output (auto text-to-speech)
- Conversation history

## API Endpoint

```typescript
POST /api/chat/message

Headers:
  Authorization: Bearer <jwt>
  Content-Type: application/json

Body:
{
  "message": "मेरा क्रेडिट स्कोर क्या है?",
  "language": "hi",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ]
}

Response:
{
  "response": "आपका क्रेडिट स्कोर 720 है (बैंड A)। यह बहुत अच्छा है!",
  "timestamp": "2025-01-01T10:00:00.000Z"
}
```

## Cost Optimization 💰

### Token Usage
- GPT-4: ~$0.03 per 1K tokens
- Average chat: ~500 tokens = $0.015 per conversation
- System prompt: ~200 tokens
- User context: ~100 tokens

### Tips to Reduce Costs
1. **Use GPT-3.5-Turbo** (10x cheaper):
   ```typescript
   // In aiChat.ts
   model: 'gpt-3.5-turbo' // instead of 'gpt-4'
   ```

2. **Limit conversation history**:
   ```typescript
   // Keep last 5 messages only
   ...conversationHistory.slice(-5)
   ```

3. **Reduce max_tokens**:
   ```typescript
   max_tokens: 300 // instead of 500
   ```

## Browser Compatibility 🌐

### Voice Features
- **Chrome/Edge**: ✅ Full support (Web Speech API)
- **Safari**: ⚠️ Limited (no webkitSpeechRecognition)
- **Firefox**: ⚠️ Partial (needs flag enabled)
- **Mobile**: ✅ Chrome, ✅ Safari (iOS 14.5+)

### Fallback
If voice not supported, text input still works perfectly!

## Troubleshooting 🔧

### "AI Assistant is not configured"
- Check `OPENAI_API_KEY` in `.env`
- Restart API server
- Verify key is valid at OpenAI dashboard

### "Voice input not supported"
- Use Chrome or Edge browser
- Check browser permissions (mic access)
- Use text input as fallback

### Slow responses
- GPT-4 can take 3-5 seconds
- Consider switching to GPT-3.5-turbo
- Check OpenAI API status

### Hindi voice not working
- Ensure device has Hindi language pack
- Try changing device language to Hindi
- Use English voice as fallback

## Customization 🎨

### Change AI Model
```typescript
// In apps/api/src/services/aiChat.ts
model: 'gpt-3.5-turbo' // Faster, cheaper
// or
model: 'gpt-4-turbo'   // Latest, better
```

### Adjust Response Length
```typescript
max_tokens: 300  // Shorter (cheaper)
max_tokens: 1000 // Longer (more detailed)
```

### Add More Languages
```typescript
// Support Tamil, Telugu, etc.
const systemPrompt = buildSystemPrompt(language, context);
```

## Future Enhancements 🚀

- [ ] Add more regional languages (Tamil, Telugu, Bengali)
- [ ] Voice banking transactions
- [ ] Proactive alerts ("You qualify for ₹30K loan!")
- [ ] WhatsApp integration
- [ ] Voice authentication
- [ ] Sentiment analysis for support routing

## Security & Privacy 🔒

- ✅ User authentication required
- ✅ Personal data in system prompt (not stored by OpenAI)
- ✅ Conversation history client-side only
- ⚠️ Be mindful of PII in conversations
- ⚠️ Don't log sensitive data

## Support

For issues or questions, contact the Sarathi team or check:
- OpenAI Docs: https://platform.openai.com/docs
- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

