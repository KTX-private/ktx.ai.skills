const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  // Use the exact parameter format as existing orders
  const params = {
    symbol: 'LIT_USDT',
    product: 'LIT_USDT',
    side: 'sell',
    type: 'limit',
    amount: '5.0000',
    quantity: '5.0000',
    price: '1.05',
    timeInForce: 'gtc'
  };

  console.log('Creating sell order (direct API call)...\n');
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
      console.error('\nThis might be because:');
      console.error('1. LIT trading requires additional parameters');
      console.error('2. LIT trading is restricted for this account');
      console.error('3. Price/quantity precision requirements not met');
      console.error('4. Account does not have trading permission for LIT');
      process.exit(1);
    }

    console.log('✓ Order submitted!\n');
    console.log('Result:', result);

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
