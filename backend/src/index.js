/**
 * Simple Express server that:
 * 1. Proxies stock‑price queries to Yahoo Finance (uses yahoo-finance2).
 * 2. Forwards chat questions to OpenAI.
 *
 * We keep keys on the server so they never leak to the browser.
 */
import express from 'express';
import cors from 'cors';
import 'dotenv/config';           // loads .env into process.env
import {getHistory} from './services/stocks.js';
import {askAI, getModelInfo} from './services/ai.js';

const app = express();
app.use(cors());                  // allow Angular dev‑server http://localhost:4200
app.use(express.json());

// --- STOCK ENDPOINT ----------------------------------------------------------
app.get('/api/stocks/:symbol', async (req, res) => {
  /**
   * URL format:
   *   /api/stocks/GOOGL?range=1d&interval=5m
   * Defaults are 1 month / 1‑day candles.
   */
  const {symbol} = req.params;
  const {range = '1mo', interval = '1d'} = req.query;

  console.log(`[server] Received request for ${symbol} with range=${range}, interval=${interval}`);

  try {
    const data = await getHistory(symbol, range, interval);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Failed to fetch stock data'});
  }
});

// --- AI ENDPOINT -------------------------------------------------------------
app.post('/api/chat', async (req, res) => {
  /**
   * Body:
   *   { 
   *     question: string, 
   *     context: { symbol: 'GOOGL', range:'1d', series:[...] },
   *     mode?: 'chat' | 'summary',
   *     stockInfo?: { symbol: string, name?: string }
   *   }
   */
  const {question, context, mode = 'chat', stockInfo} = req.body;
  
  // For summary mode, question is optional
  if (mode === 'chat' && !question) {
    return res.status(400).json({error: 'Question missing for chat mode.'});
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
    res.status(500).json({error: 'AI request failed'});
  }
});

// --- START -------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Backend listening on http://localhost:${PORT}`)
);
