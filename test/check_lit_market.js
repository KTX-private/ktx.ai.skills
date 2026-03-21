const { KTXClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXClient();

  console.log('Querying LIT_USDT market data...\n');

  try {
    // Get ticker
    const ticker = await client.getTicker('LIT_USDT');
    console.log('Ticker:');
    console.log(JSON.stringify(ticker, null, 2));
    console.log();

    // Get order book
    const orderBook = await client.getOrderBook('LIT_USDT', 5);
    console.log('Order Book (Top 5):');
    console.log('Asks (Sell Orders):');
    orderBook.asks.slice(0, 5).forEach((ask, i) => {
      console.log(`  ${i+1}. ${ask[0]} - ${ask[1]}`);
    });
    console.log('\nBids (Buy Orders):');
    orderBook.bids.slice(0, 5).forEach((bid, i) => {
      console.log(`  ${i+1}. ${bid[0]} - ${bid[1]}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    console.error('LIT_USDT trading pair may not exist or is not available');
  }
}

main().catch(error => {
  console.error('\nError:', error.message);
  process.exit(1);
});
