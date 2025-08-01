export default async function handler(req, res) {
  // Dynamic import to avoid build issues
  const { getHistory } = await import('../../backend/src/services/stocks.js');
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbol } = req.query;
  const { range = '1mo', interval = '1d' } = req.query;

  console.log(`[api] Received request for ${symbol} with range=${range}, interval=${interval}`);

  try {
    const data = await getHistory(symbol, range, interval);
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
}