const { KTXClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXClient();

  const symbol = 'LIT_USDT';
  const price = '1.2';
  const quantity = '5';

  console.log('Creating sell order...\n');
  console.log(`Symbol: ${symbol}`);
  console.log(`Price: ${price} USDT`);
  console.log(`Quantity: ${quantity} LIT\n`);

  try {
    const result = await client.sellLimit(symbol, parseFloat(quantity), parseFloat(price));

    console.log('API Response:', JSON.stringify(result, null, 2));
    console.log();

    const order = Array.isArray(result) ? result[0] : result;

    console.log('✓ Order response received\n');
    console.log(`Order ID: ${order.orderId || order.id || result.orderId || result.id || 'N/A'}`);
    console.log(`Symbol: ${order.product || order.symbol || result.product || result.symbol || symbol}`);
    console.log(`Side: ${order.side || result.side || 'sell'}`);
    console.log(`Type: ${order.type || result.type || 'limit'}`);
    console.log(`Price: ${order.price || result.price || price} USDT`);
    console.log(`Quantity: ${order.quantity || order.amount || result.quantity || result.amount || quantity} LIT`);
    console.log(`Status: ${order.status || result.status || 'submitted'}`);

  } catch (error) {
    console.error('✗ Failed to create order:', error.message);
    console.error('\nPossible reasons:');
    console.error('1. Insufficient LIT balance in trading account');
    console.error('2. Invalid price or quantity parameters');
    console.error('3. Trading pair temporarily unavailable');
    console.error('4. API key permission insufficient (Trade permission required)');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\nError:', error.message);
  process.exit(1);
});
