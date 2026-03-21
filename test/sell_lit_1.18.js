const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  const params = {
    symbol: 'LIT_USDT',
    product: 'LIT_USDT',
    side: 'sell',
    type: 'limit',
    amount: '3.5000',
    quantity: '3.5000',
    price: '1.18',
    timeInForce: 'gtc'
  };

  console.log('Creating sell order...\n');
  console.log(JSON.stringify(params, null, 2));
  console.log();

  try {
    const result = await client.postUserData('/v1/order', params);

    console.log('Raw API Response:', JSON.stringify(result, null, 2));
    console.log();

    if (result.state && result.state < 0) {
      console.error(`✗ Order creation failed!`);
      console.error(`Error code: ${result.state}`);
      console.error(`Message: ${result.msg || 'No error message'}`);
      process.exit(1);
    }

    const order = result.result || result;

    console.log('✓ Order created successfully!\n');
    console.log(`Order ID: ${order.orderId || order.id || 'N/A'}`);
    console.log(`Symbol: ${order.product || order.symbol || 'LIT_USDT'}`);
    console.log(`Side: ${order.side || 'sell'}`);
    console.log(`Type: ${order.type || 'limit'}`);
    console.log(`Price: ${order.price || '1.18'} USDT`);
    console.log(`Quantity: ${order.quantity || order.amount || '3.5000'} LIT`);
    console.log(`Status: ${order.status || 'submitted'}`);

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
