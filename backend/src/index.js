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
import {askAI} from './services/ai.js';

const app = express();
app.use(cors());                  // allow Angular dev‑server http://localhost:4200
app.use(express.json());

// --- STOCK ENDPOINT ----------------------------------------------------------
app.get('/api/stocks/:symbol', async (req, res) => {
  /**
   * URL format:
   *   /api/stocks/NVDA?range=1d&interval=5m
   * Defaults are 1 month / 1‑day candles.
   */
  const {symbol} = req.params;
  const {range = '1mo', interval = '1d'} = req.query;

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
   *   { question: string, context: { symbol: 'GOOGL', range:'1d', series:[...] } }
   */
  const {question, context} = req.body;
  if (!question) return res.status(400).json({error: 'Question missing.'});

  try {
    const answer = await askAI(question, context);
    res.json({answer});
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
