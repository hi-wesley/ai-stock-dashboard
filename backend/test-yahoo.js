
import yahooFinance from 'yahoo-finance2';

async function testYahooFinance() {
  try {
    const symbol = 'GOOGL';
    const queryOptions = {
      period1: '2024-06-22',
      period2: '2024-07-22',
      interval: '1d',
    };

    console.log(`Fetching data for ${symbol} with options:`, queryOptions);
    const result = await yahooFinance.chart(symbol, queryOptions);
    console.log('Successfully fetched data:');
    console.log(result.quotes);
  } catch (error) {
    console.error('Error fetching data from yahoo-finance2:', error);
  }
}

testYahooFinance();
