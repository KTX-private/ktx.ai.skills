const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  const price = 71000;
  const symbol = 'BTC_USDT_SWAP';

  console.log('=== Closing BTC_USDT_SWAP Positions ===\n');
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

  console.log(`Found ${positions.length} positions:\n`);

  const btcPositions = positions.filter(p =>
    p.symbol && p.symbol.includes('BTC_USDT_SWAP')
  );

  if (btcPositions.length === 0) {
    console.log('No BTC_USDT_SWAP positions found.');
    return;
  }

  btcPositions.forEach((pos, index) => {
    console.log(`${index + 1}. Symbol: ${pos.symbol}`);
    console.log(`   Side: ${pos.side}`);
    console.log(`   Quantity: ${pos.quantity}`);
    console.log(`   Entry Price: ${pos.entryPrice}`);
    console.log(`   Position ID: ${pos.id}`);
    console.log(`   Closable Qty: ${pos.closableQty}`);
    console.log();
  });

  // Get pending orders first
  console.log('2. Checking for existing BTC_USDT_SWAP orders...\n');
  const pendingOrdersResult = await client.getUserData('/v1/pending/orders', {
    market: 'lpc',
    symbol: symbol
  });
  let pendingOrders = [];

  if (Array.isArray(pendingOrdersResult)) {
    pendingOrders = pendingOrdersResult;
  } else if (pendingOrdersResult && Array.isArray(pendingOrdersResult.result)) {
    pendingOrders = pendingOrdersResult.result;
  }

  if (pendingOrders.length > 0) {
    console.log(`Found ${pendingOrders.length} pending orders, cancelling them first...\n`);

    for (const order of pendingOrders) {
      const orderId = order.orderId || order.id;
      try {
        console.log(`Cancelling order ${orderId}...`);
        await client.cancelOrder(orderId);
        console.log(`✓ Cancelled ${orderId}\n`);
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`✗ Failed to cancel ${orderId}: ${error.message}\n`);
      }
    }
  }

  // Now close positions
  console.log('3. Closing positions at ${price} USDT...\n');

  for (const pos of btcPositions) {
    const closableQty = parseFloat(pos.closableQty || '0');

    if (closableQty <= 0) {
      console.log(`Skipping position ${pos.id} - no closable quantity\n`);
      continue;
    }

    const quantity = closableQty.toFixed(6);
    const side = pos.side === 'long' ? 'sell' : 'buy';
    const positionMerge = pos.side === 'long' ? 'long' : 'short';

    console.log(`Closing ${pos.side} position ${pos.id}, quantity: ${quantity}\n`);

    const params = {
      symbol: symbol,
      product: symbol,
      side: side,  // Opposite side to close
      type: 'limit',
      quantity: quantity,
      amount: quantity,
      price: String(price),
      market: 'lpc',
      leverage: pos.leverage || 10,
      marginMethod: pos.marginMethod || 'cross',
      positionMerge: positionMerge,
      timeInForce: 'gtc',
      close: true,  // Critical: this is a close position order
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
        console.log(`Order Value: ${orderValue.toFixed(2)} USDT\n`);
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
  process.exit(1);
});
