const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  const price = 70500;
  const leverage = 11;
  const quantity = '0.006241';

  console.log('Testing different parameter combinations...\n');

  // Test 1: Only symbol
  console.log('Test 1: Only symbol field');
  try {
    const params1 = {
      symbol: 'BTC_USDT_SWAP',
      side: 'buy',
      type: 'limit',
      quantity: quantity,
      price: String(price),
      leverage: leverage,
      marginMethod: 'cross',
      positionMerge: 'long',
      timeInForce: 'gtc'
    };
    const result1 = await client.postUserData('/v1/order', params1);
    console.log('Result:', JSON.stringify(result1, null, 2));
    if (result1.state === 0) {
      console.log('✓ SUCCESS with only symbol\n');
      return;
    }
  } catch (e) {
    console.log('✗ Failed:', e.message);
  }

  await new Promise(r => setTimeout(r, 500));

  // Test 2: Only product
  console.log('\nTest 2: Only product field');
  try {
    const params2 = {
      product: 'BTC_USDT_SWAP',
      side: 'buy',
      type: 'limit',
      quantity: quantity,
      price: String(price),
      leverage: leverage,
      marginMethod: 'cross',
      positionMerge: 'long',
      timeInForce: 'gtc'
    };
    const result2 = await client.postUserData('/v1/order', params2);
    console.log('Result:', JSON.stringify(result2, null, 2));
    if (result2.state === 0) {
      console.log('✓ SUCCESS with only product\n');
      return;
    }
  } catch (e) {
    console.log('✗ Failed:', e.message);
  }

  await new Promise(r => setTimeout(r, 500));

  // Test 3: Both symbol and product
  console.log('\nTest 3: Both symbol and product fields');
  try {
    const params3 = {
      symbol: 'BTC_USDT_SWAP',
      product: 'BTC_USDT_SWAP',
      side: 'buy',
      type: 'limit',
      quantity: quantity,
      price: String(price),
      leverage: leverage,
      marginMethod: 'cross',
      positionMerge: 'long',
      timeInForce: 'gtc'
    };
    const result3 = await client.postUserData('/v1/order', params3);
    console.log('Result:', JSON.stringify(result3, null, 2));
    if (result3.state === 0) {
      console.log('✓ SUCCESS with both symbol and product\n');
      return;
    }
  } catch (e) {
    console.log('✗ Failed:', e.message);
  }

  await new Promise(r => setTimeout(r, 500));

  // Test 4: Using different naming convention
  console.log('\nTest 4: Try BTCUSDT (without _SWAP)');
  try {
    const params4 = {
      symbol: 'BTCUSDT',
      product: 'BTCUSDT',
      side: 'buy',
      type: 'limit',
      quantity: quantity,
      price: String(price),
      leverage: leverage,
      marginMethod: 'cross',
      positionMerge: 'long',
      timeInForce: 'gtc'
    };
    const result4 = await client.postUserData('/v1/order', params4);
    console.log('Result:', JSON.stringify(result4, null, 2));
    if (result4.state === 0) {
      console.log('✓ SUCCESS with BTCUSDT\n');
      return;
    }
  } catch (e) {
    console.log('✗ Failed:', e.message);
  }

  console.log('\n=== All tests failed ===');
  console.log('It appears BTC_USDT_SWAP may not be available for new orders.');
  console.log('However, historical orders show it was available before.');
  console.log('This could mean:');
  console.log('1. The product has been temporarily disabled');
  console.log('2. There is a maintenance issue');
  console.log('3. The API endpoint or requirements have changed');
}

main().catch(error => {
  console.error('\nError:', error.message);
  process.exit(1);
});
