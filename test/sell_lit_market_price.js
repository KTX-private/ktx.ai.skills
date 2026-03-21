const { KTXClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXClient();

  const params = {
    symbol: 'LIT_USDT',
    side: 'sell',
    type: 'limit',
    amount: '5',
    price: '1.05'
  };

  console.log('Creating sell order at market price...\n');
  console.log(JSON.stringify(params, null, 2));
  console.log();

  try {
    const result = await client.createOrder(params);

    console.log('API Response:', JSON.stringify(result, null, 2));

    if (result.state && result.state < 0) {
      console.error(`\n✗ Order creation failed!`);
      console.error(`Error code: ${result.state}`);
      console.error(`Message: ${result.msg || 'No error message'}`);
      console.error('\nCommon error -21108 causes:');
      console.error('1. Price is outside allowed range');
      console.error('2. Amount is below minimum order size');
      console.error('3. Insufficient available balance');
      console.error('4. Trading pair restrictions');
      process.exit(1);
    }

    const order = Array.isArray(result) ? result[0] : result;

    console.log('\n✓ Order created successfully!\n');
    console.log(`Order ID: ${order.orderId || order.id || result.orderId || result.id || 'N/A'}`);
    console.log(`Symbol: ${order.product || order.symbol || result.product || result.symbol || params.symbol}`);
    console.log(`Side: ${order.side || result.side || params.side}`);
    console.log(`Type: ${order.type || result.type || params.type}`);
    console.log(`Price: ${order.price || result.price || params.price} USDT`);
    console.log(`Quantity: ${order.quantity || order.amount || result.quantity || result.amount || params.amount} LIT`);
    console.log(`Status: ${order.status || result.status || 'submitted'}`);

  } catch (error) {
    console.error('✗ Failed to create order:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\nError:', error.message);
  process.exit(1);
});
