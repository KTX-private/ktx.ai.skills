const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  const price = 71000;
  const symbol = 'BTC_USDT_SWAP';

  console.log('=== Closing Long Position (Simple) ===\n');
  console.log(`Symbol: ${symbol}`);
  console.log(`Price: ${price} USDT\n`);

  // Get current positions
  console.log('1. Querying current positions...\n');
  const positionsResult = await client.getPositions();

  let positions = [];
  if (Array.isArray(positionsResult)) {
    positions = positionsResult;
  } else if (positionsResult && Array.isArray(positionsResult.result)) {
    positions = positionsResult.result;
  }

  const btcPositions = positions.filter(p =>
    p.symbol && p.symbol.includes('BTC_USDT_SWAP') &&
    p.side === 'long' &&
    parseFloat(p.quantity || '0') > 0
  );

  if (btcPositions.length === 0) {
    console.log('No BTC_USDT_SWAP long positions found with quantity > 0.');
    return;
  }

  console.log(`Found ${btcPositions.length} long positions:\n`);

  btcPositions.forEach((pos, index) => {
    console.log(`${index + 1}. Position ID: ${pos.id}`);
    console.log(`   Side: ${pos.side}`);
    console.log(`   Quantity: ${pos.quantity}`);
    console.log(`   Closable Qty: ${pos.closableQty}`);
    console.log(`   Leverage: ${pos.leverage}`);
    console.log();
  });

  // Close positions with direct API call but using client
  console.log('2. Closing long positions...\n');

  for (const pos of btcPositions) {
    const closableQty = parseFloat(pos.closableQty || '0');

    if (closableQty <= 0) {
      console.log(`Skipping position ${pos.id} - no closable quantity\n`);
      continue;
    }

    const quantity = closableQty.toFixed(6);

    console.log(`Closing long position ${pos.id}, quantity: ${quantity}\n`);

    // Build params manually to avoid formatFuturesOrderParams issue
    const params = {
      symbol: symbol,
      product: symbol,
      side: 'sell',  // Opposite side to close long
      type: 'limit',
      quantity: quantity,
      amount: quantity,
      price: String(price),
      market: 'lpc',
      leverage: pos.leverage || 10,
      marginMethod: pos.marginMethod || 'cross',
      positionMerge: 'long',
      timeInForce: 'gtc',
      close: true,  // This is a close position order
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
        console.error(`✗ Failed to close position!`);
        console.error(`Error code: ${result.state}`);
        console.error(`Message: ${result.msg || 'No error message'}\n`);
      } else {
        const order = result.result || result;
        const orderValue = parseFloat(order.quantity || quantity) * parseFloat(order.price || price);
        console.log(`✓ Close order created successfully!`);
        console.log(`Order ID: ${order.orderId || order.id || 'N/A'}`);
        console.log(`Price: ${order.price || price} USDT`);
        console.log(`Quantity: ${order.quantity || quantity} BTC`);
        console.log(`Order Value: ${orderValue.toFixed(2)} USDT`);
        console.log(`Status: ${order.status || 'submitted'}\n`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`✗ Failed to create close order: ${error.message}\n`);
    }
  }

  console.log('=== Position Closing Completed ===');
}

main().catch(error => {
  console.error('\nError:', error.message);
  console.error(error.stack);
  process.exit(1);
});
