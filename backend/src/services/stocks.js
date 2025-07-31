/**
 * yahoo-finance2 wrapper – hides library details from the rest of the app.
 */
import yahooFinance from 'yahoo-finance2';

/**
 * Fetch historical candles for a given symbol.
 *
 * @param {string} symbol   e.g. "GOOGL"
 * @param {string} range    e.g. "1d", "1mo", "6mo"
 * @param {string} interval e.g. "5m", "1d"
 * @returns {Array<{date:number, close:number, high:number, low:number}>}
 */
export async function getHistory(symbol, range, interval) {
  const { period1, period2 } = getPeriods(range);

  console.log(`[stocks.js] Calling yahooFinance.chart with:`, { symbol, period1, period2, interval });

  // Library automatically handles retries / throttling (still obey rate limits)
  const result = await yahooFinance.chart(symbol, {
    period1,
    period2,
    interval,
  });

  console.log('[stocks.js] Raw result from yahoo-finance2:', JSON.stringify(result, null, 2));

  // We reduce payload: only send timestamp & close/high/low to the browser
  return result.quotes.map((pt) => ({
    date: pt.date.getTime(),
    close: pt.close,
    high: pt.high,
    low: pt.low,
  }));
}

/**
 * Calculate start and end dates from a range string.
 * @param {string} range e.g. "1d", "1mo", "6mo"
 * @returns {{period1: string, period2: string}} e.g. { period1: "2024-07-21", period2: "2024-07-22" }
 */
function getPeriods(range) {
  const period2 = new Date();
  const period1 = new Date();

  switch (range) {
    case '1d':      period1.setDate(period1.getDate() - 1);         break;
    case '5d':      period1.setDate(period1.getDate() - 5);         break;
    case '1mo':     period1.setMonth(period1.getMonth() - 1);       break;
    case '6mo':     period1.setMonth(period1.getMonth() - 6);       break;
    case '1y':      period1.setFullYear(period1.getFullYear() - 1); break;
    case '5y':      period1.setFullYear(period1.getFullYear() - 5); break;
    case 'max':     period1.setFullYear(period1.getFullYear() - 50);break; // long ago
    default:
      throw new Error(`Unsupported range: ${range}`);
  }

  return {
    period1: period1.toISOString().split('T')[0], // YYYY-MM-DD
    period2: period2.toISOString().split('T')[0], // YYYY-MM-DD
  };
}
