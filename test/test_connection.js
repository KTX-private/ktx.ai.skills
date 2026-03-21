const { KTXPublicClient } = require('../scripts/ktx_client');

console.log('====================================');
console.log('   KTX Exchange Connection Test');
console.log('====================================\n');

async function testConnection() {
  const client = new KTXPublicClient();

  try {
    // Test 1: Get server time
    console.log('【Test 1】Get server time...');
    const timeResult = await client.getTime();
    console.log('✓ Server time:', new Date(timeResult).toLocaleString());

    // Test 2: Get trading pairs list
    console.log('\n【Test 2】Get trading pairs list...');
    const products = await client.getProducts();
    console.log(`✓ Successfully got ${products.length} trading pairs`);
    if (products.length > 0) {
      console.log('  Example pairs:', products.slice(0, 3).map(p => p.symbol).join(', '));
    }

    // Test 3: Get BTC_USDT 24h ticker
    console.log('\n【Test 3】Get BTC_USDT 24h ticker...');
    const ticker = await client.getTicker('BTC_USDT');
    console.log('✓ Last price:', ticker.last_price);
    console.log('  24h high:', ticker.high_24h);
    console.log('  24h low:', ticker.low_24h);
    console.log('  24h volume:', ticker.volume_24h);

    // Test 4: Get order book
    console.log('\n【Test 4】Get BTC_USDT order book (top 5 levels)...');
    const orderBook = await client.getOrderBook('BTC_USDT', 5, 2);
    console.log('✓ Top 5 bid orders:');
    orderBook.bids.slice(0, 5).forEach(bid => {
      console.log(`    ${bid[0]} (${bid[1]})`);
    });
    console.log('✓ Top 5 ask orders:');
    orderBook.asks.slice(0, 5).forEach(ask => {
      console.log(`    ${ask[0]} (${ask[1]})`);
    });

    console.log('\n====================================');
    console.log('   Test completed!');
    console.log('====================================\n');

  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error('\nPlease check:');
    console.error('1. Network connection is normal');
    console.error('2. API endpoint configuration is correct');
    console.error('3. System time is accurate\n');
    process.exit(1);
  }
}

// Run test
testConnection();
