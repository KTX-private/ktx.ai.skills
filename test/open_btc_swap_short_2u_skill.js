const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  const symbol = 'BTC_USDT_SWAP';
  const price = 70600;
  const leverage = 15;
  const usdtAmount = 2;

  const positionValue = usdtAmount * leverage;
  const quantity = (positionValue / price).toFixed(6);

  console.log('=== Opening BTC_USDT_SWAP Short Position ===\n');
  console.log(`Symbol: ${symbol}`);
  console.log(`Price: ${price} USDT`);
  console.log(`Leverage: ${leverage}x`);
  console.log(`USDT Amount: ${usdtAmount} USDT`);
  console.log(`Position Size: ${quantity} BTC`);
  console.log(`Position Value: ${positionValue} USDT`);
  console.log(`Market: lpc (futures/swap)`);
  console.log(`Direction: Short`);
  console.log(`Required Margin: ${usdtAmount} USDT\n`);

  // Use sellFuturesLimit Skill method
  console.log('Using Skill method: sellFuturesLimit()\n');

  try {
    const result = await client.sellFuturesLimit(symbol, quantity, price, {
      leverage: leverage,
      marginMethod: 'cross',
      positionMerge: 'short'
    });

    console.log('API Response:', JSON.stringify(result, null, 2));
    console.log();

    if (result.state && result.state < 0) {
      console.error(`✗ Order creation failed!`);
      console.error(`Error code: ${result.state}`);
      console.error(`Message: ${result.msg || 'No error message'}`);
      process.exit(1);
    }

    const order = result.result || result;

    console.log('✓ Short position order created successfully!\n');
    console.log(`Order ID: ${order.orderId || order.id || 'N/A'}`);
    console.log(`Symbol: ${order.product || order.symbol || symbol}`);
    console.log(`Side: ${order.side || 'sell'}`);
    console.log(`Type: ${order.type || 'limit'}`);
    console.log(`Price: ${order.price || price} USDT`);
    console.log(`Quantity: ${order.quantity || quantity} BTC`);
    console.log(`Leverage: ${order.leverage || leverage}x`);
    console.log(`Margin Method: ${order.marginMethod || 'cross'}`);
    console.log(`Position Mode: ${order.positionMerge || 'short'}`);
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
