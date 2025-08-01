/**
 * OpenRouter wrapper for models.
 * For real production, implement exponential‑backoff, timeouts, logging.
 */
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.YOUR_SITE_URL || 'http://localhost:3000',
    'X-Title': 'AI Stock Dashboard',
  }
});

const MODEL_ID = 'deepseek/deepseek-chat-v3-0324:free';

export async function askAI(question, context, mode = 'chat', stockInfo = {}) {
  /**
   * We pass a short system prompt + a JSONified context array truncated to
   * ~4k tokens. More advanced:  embed & RAG or summarise by time buckets.
   */
  
  let systemPrompt;
  let userPrompt;
  
  if (mode === 'summary') {
    // Summary mode with analyst prompt
    systemPrompt = `You are a financial analyst. Provide a brief summary of ${stockInfo.symbol || 'UNKNOWN'} stock performance. DO NOT mention specific prices, dates, or time periods. Use only general terms like "trending upward", "volatile", "stable", etc. Focus on overall patterns and sentiment. CRITICAL: Your ENTIRE response must be under 500 characters. Be very concise.`;
    
    userPrompt = `Summarize the overall trend and sentiment for ${stockInfo.symbol}. Remember: NO specific prices, dates, or time periods. Keep under 500 characters.
Data context (JSON): ${JSON.stringify(context)}`;
  } else {
    // Chat mode with contextual preloading
    systemPrompt = `You are a financial advisor for ${stockInfo.symbol || 'UNKNOWN'} stock. Answer questions concisely based on the provided data. CRITICAL: Your ENTIRE response must be under 500 characters. Be direct and to the point.`;
    
    userPrompt = `
Question: ${question}
Data context (JSON): ${JSON.stringify(context)}
`;
  }

  const chat = await openai.chat.completions.create({
    model: MODEL_ID,
    messages: [
      {role: 'system', content: systemPrompt},
      {role: 'user',   content: userPrompt}
    ],
    temperature: mode === 'summary' ? 0.3 : 0.5  // Slightly higher temperature for chat
  });

  return {
    answer: chat.choices[0].message.content.trim(),
    model: MODEL_ID
  };
}

export function getModelInfo() {
  return {
    modelId: MODEL_ID,
    displayName: MODEL_ID
  };
}
