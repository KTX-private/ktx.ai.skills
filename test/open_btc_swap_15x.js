const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  const symbol = 'BTC_USDT_SWAP';
  const price = 70800;
  const leverage = 15;
  const usdtAmount = 20;

  const positionValue = usdtAmount * leverage;
  const quantity = (positionValue / price).toFixed(6);

  console.log('=== Opening BTC_USDT_SWAP Position ===\n');
  console.log(`Symbol: ${symbol}`);
  console.log(`Price: ${price} USDT`);
  console.log(`Leverage: ${leverage}x`);
  console.log(`USDT Amount: ${usdtAmount} USDT`);
  console.log(`Position Size: ${quantity} BTC`);
  console.log(`Position Value: ${positionValue} USDT`);
  console.log(`Market: lpc (futures/swap)`);
  console.log(`Direction: Long`);
  console.log(`Required Margin: ${(positionValue / leverage).toFixed(2)} USDT\n`);

  const params = {
    symbol: symbol,
    product: symbol,
    side: 'buy',  // Long position
    type: 'limit',
    quantity: quantity,
    amount: quantity,
    price: String(price),
    market: 'lpc',
    leverage: leverage,
    marginMethod: 'cross',
    positionMerge: 'long',
    timeInForce: 'gtc',
    mini: false,
    stf: 'disabled',
    close: false,
    postOnly: false
  };

  console.log('Order parameters:');
  console.log(JSON.stringify(params, null, 2));
  console.log();

  try {
    const result = await client.postUserData('/v1/order', params);

    console.log('API Response:', JSON.stringify(result, null, 2));
    console.log();

    if (result.state && result.state < 0) {
      console.error(`✗ Order creation failed!`);
      console.error(`Error code: ${result.state}`);
      console.error(`Message: ${result.msg || 'No error message'}`);
      process.exit(1);
    }

    const order = result.result || result;

    console.log('✓ Long position order created successfully!\n');
    console.log(`Order ID: ${order.orderId || order.id || 'N/A'}`);
    console.log(`Symbol: ${order.product || order.symbol || symbol}`);
    console.log(`Side: ${order.side || 'buy'}`);
    console.log(`Type: ${order.type || 'limit'}`);
    console.log(`Price: ${order.price || price} USDT`);
    console.log(`Quantity: ${order.quantity || quantity} BTC`);
    console.log(`Leverage: ${order.leverage || leverage}x`);
    console.log(`Margin Method: ${order.marginMethod || 'cross'}`);
    console.log(`Position Mode: ${order.positionMerge || 'long'}`);
    console.log(`Status: ${order.status || 'submitted'}`);

    const orderValue = parseFloat(order.quantity || quantity) * parseFloat(order.price || price);
    console.log(`\nOrder Value: ${orderValue.toFixed(2)} USDT`);
    console.log(`Required Margin: ${(orderValue / leverage).toFixed(2)} USDT`);

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
