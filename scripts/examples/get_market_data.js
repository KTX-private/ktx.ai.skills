const KTXClient = require('../ktx_client');

async function example() {
  const client = new KTXClient();

  console.log('=== KTX Market Data Query Example ===\n');

  try {
    // 1. Get all trading pairs
    console.log('1. Get all trading pairs:');
    const products = await client.getProducts();
    console.log(`   Total: ${products.length} trading pairs`);
    console.log(`   Examples: ${products.slice(0, 5).map(p => p.symbol).join(', ')}\n`);

    // 2. Get 24h ticker for specific trading pair
    console.log('2. Get BTC_USDT 24h ticker:');
    const ticker = await client.getTicker('BTC_USDT');
    console.log(`   Last price: ${ticker.last_price}`);
    console.log(`   24h high: ${ticker.high_24h}`);
    console.log(`   24h low: ${ticker.low_24h}`);
    console.log(`   24h volume: ${ticker.volume_24h}`);
    console.log(`   24h quote volume: ${ticker.quote_volume_24h}\n`);

    // 3. Get tickers for multiple trading pairs
    console.log('3. Get tickers for multiple trading pairs:');
    const tickers = await client.getTicker();
    console.log(`   Retrieved: ${tickers.length} trading pair tickers`);
    console.log(`   First 5:`);
    tickers.slice(0, 5).forEach(t => {
      console.log(`   ${t.symbol}: ${t.last_price}`);
    });
    console.log();

    // 4. Get order book depth
    console.log('4. Get ETH_USDT order book depth (top 10 levels):');
    const orderBook = await client.getOrderBook('ETH_USDT', 10, 2);
    console.log('   Bids:');
    orderBook.bids.slice(0, 5).forEach(bid => {
      console.log(`     ${bid[0]} (${bid[1]})`);
    });
    console.log('   Asks:');
    orderBook.asks.slice(0, 5).forEach(ask => {
      console.log(`     ${ask[0]} (${ask[1]})`);
    });
    console.log();

    // 5. Get K-line data
    console.log('5. Get BTC_USDT 1h K-line data (last 20 candles):');
    const candles = await client.getCandles('BTC_USDT', '1h', 20);
    console.log(`   Retrieved: ${candles.length} K-line candles`);
    console.log('   Last 3 candles:');
    candles.slice(0, 3).forEach(candle => {
      console.log(`     Time: ${new Date(candle[0]).toLocaleString()}, Open: ${candle[1]}, High: ${candle[2]}, Low: ${candle[3]}, Close: ${candle[4]}`);
    });
    console.log();

    // 6. Get recent trades
    console.log('6. Get BTC_USDT recent trades (top 10):');
    const trades = await client.getTrades('BTC_USDT', 10);
    console.log(`   Retrieved: ${trades.length} trade records`);
    console.log('   First 3 trades:');
    trades.slice(0, 3).forEach(trade => {
      const side = trade.side === 'buy' ? 'BUY' : 'SELL';
      console.log(`     ${new Date(trade.create_time).toLocaleString()} ${side} ${trade.amount} @ ${trade.price}`);
    });
    console.log();

    // 7. Get coin list
    console.log('7. Get supported coins list:');
    const coins = await client.getCoins();
    console.log(`   Total: ${coins.length} coins`);
    console.log(`   Examples: ${coins.slice(0, 5).map(c => c.currency).join(', ')}\n`);

    console.log('=== Example Execution Completed ===');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run example
example();
