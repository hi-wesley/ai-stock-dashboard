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
  // Library automatically handles retries / throttling (still obey rate limits)
  const result = await yahooFinance.historical(symbol, {period1: '1970-01-01', period2: new Date(), interval, events: 'history', includeAdjustedClose: true, range});
  // We reduce payload: only send timestamp & close/high/low to the browser
  return result.map(pt => ({
    date: pt.date.getTime(),
    close: pt.close,
    high: pt.high,
    low : pt.low
  }));
}
