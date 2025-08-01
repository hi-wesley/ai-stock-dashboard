export default async function handler(req, res) {
  // Dynamic imports to avoid build issues
  const { askAI, getModelInfo } = await import('../backend/src/services/ai.js');
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, context, mode = 'chat', stockInfo } = req.body;
  
  // For summary mode, question is optional
  if (mode === 'chat' && !question) {
    return res.status(400).json({ error: 'Question missing for chat mode.' });
  }

  try {
    const result = await askAI(question || '', context, mode, stockInfo);
    const modelInfo = getModelInfo();
    res.json({
      answer: result.answer,
      model: modelInfo.modelId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
}