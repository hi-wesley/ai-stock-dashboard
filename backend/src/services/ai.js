/**
 * Minimal OpenAI wrapper.
 * For real production, implement exponential‑backoff, timeouts, logging.
 */
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function askAI(question, context) {
  /**
   * We pass a short system prompt + a JSONified context array truncated to
   * ~4k tokens. More advanced:  embed & RAG or summarise by time buckets.
   */
  const systemPrompt = `You are a helpful market‑data assistant.
Answer with short paragraphs. If asked about a price point, include
the exact number and date if available.`;

  const userPrompt = `
Question: ${question}
Data context (JSON): ${JSON.stringify(context).slice(0, 3000)}
`;

  const chat = await openai.chat.completions.create({
    model: 'gpt-4o-mini',        // cheap, fast; swap for gpt‑4o if budget allows
    messages: [
      {role: 'system', content: systemPrompt},
      {role: 'user',   content: userPrompt}
    ],
    temperature: 0.3
  });

  return chat.choices[0].message.content.trim();
}
