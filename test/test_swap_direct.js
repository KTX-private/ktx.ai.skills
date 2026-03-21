const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  const symbol = 'BTC_USDT_SWAP';
  const price = 70500;
  const leverage = 11;
  const usdtAmount = 40;

  const positionValue = usdtAmount * leverage;
  const quantity = (positionValue / price).toFixed(6);

  console.log(`Creating long order for ${quantity} BTC at ${price} with ${leverage}x leverage\n`);

  const params = {
    symbol: symbol,
    product: symbol,
    side: 'buy',
    type: 'limit',
    amount: quantity,
    quantity: quantity,
    price: String(price),
    leverage: leverage,
    marginMethod: 'cross',
    positionMerge: 'long',
    timeInForce: 'gtc'
  };

  // Test with raw HTTPS to see what endpoint is being used
  console.log('Testing raw request...\n');

  try {
    // First, let's check what the current client is using
    const config = require('crypto');
    const fs = require('fs');
    const path = require('path');

    const CONFIG_PATH = path.join(require('os').homedir(), '.ktx_exchange_config.json');
    const apiConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    console.log('API Key:', apiConfig.apiKey);
    console.log('API Permission:', apiConfig.permission);
    console.log();

    // Try creating the order
    const result = await client.postUserData('/v1/order', params);

    console.log('Result:', JSON.stringify(result, null, 2));

    if (result.state === 0) {
      console.log('\n✓ Order created successfully!');
    } else {
      console.log(`\n✗ Failed with error code ${result.state}: ${result.msg}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

main().catch(error => {
  console.error('\nFatal error:', error.message);
  process.exit(1);
});
