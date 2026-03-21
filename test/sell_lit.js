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
    const order = await client.sellLimit(symbol, parseFloat(quantity), parseFloat(price));

    console.log('✓ Order created successfully!\n');
    console.log(`Order ID: ${order.orderId || order.id || 'N/A'}`);
    console.log(`Symbol: ${order.product || order.symbol || symbol}`);
    console.log(`Side: ${order.side || 'sell'}`);
    console.log(`Type: ${order.type || 'limit'}`);
    console.log(`Price: ${order.price || price} USDT`);
    console.log(`Quantity: ${order.quantity || order.amount || quantity} LIT`);
    console.log(`Status: ${order.status || 'submitted'}`);

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
