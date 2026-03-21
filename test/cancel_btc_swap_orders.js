const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  console.log('Querying pending orders...\n');

  const pendingOrdersResult = await client.getPendingOrders();

  console.log('Raw API Response:', JSON.stringify(pendingOrdersResult, null, 2));
  console.log();

  let pendingOrders = [];

  if (Array.isArray(pendingOrdersResult)) {
    pendingOrders = pendingOrdersResult;
  } else if (pendingOrdersResult && Array.isArray(pendingOrdersResult.result)) {
    pendingOrders = pendingOrdersResult.result;
  }

  console.log(`Total pending orders: ${pendingOrders.length}\n`);

  if (pendingOrders.length === 0) {
    console.log('No pending orders found.');
    return;
  }

  pendingOrders.forEach((order, index) => {
    console.log(`${index + 1}. Order ID: ${order.orderId || order.id || 'N/A'}`);
    console.log(`   Symbol: ${order.product || order.symbol || 'N/A'}`);
    console.log(`   Side: ${order.side || 'N/A'}`);
    console.log(`   Amount: ${order.quantity || order.amount || 'N/A'}`);
    console.log(`   Price: ${order.price || 'N/A'}`);
    console.log(`   Status: ${order.status || 'N/A'}`);
    console.log();
  });

  const btcSwapOrders = pendingOrders.filter(o =>
    (o.product || o.symbol || '').includes('BTC_USDT_SWAP') ||
    (o.product || o.symbol || '').includes('BTC') && (o.product || o.symbol || '').includes('SWAP')
  );

  console.log(`Found ${btcSwapOrders.length} BTC_USDT_SWAP orders\n`);

  if (btcSwapOrders.length === 0) {
    console.log('No BTC_USDT_SWAP orders found.');
    return;
  }

  console.log('Cancelling BTC_USDT_SWAP orders...\n');

  for (const order of btcSwapOrders) {
    const orderId = order.orderId || order.id;
    try {
      console.log(`Cancelling order ${orderId}...`);
      const result = await client.postUserData('/v1/order/delete', { id: orderId });
      console.log(`✓ Successfully cancelled order ${orderId}\n`);
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`✗ Failed to cancel order ${orderId}: ${error.message}\n`);
    }
  }

  console.log('\nVerifying cancellation...\n');

  const updatedPendingOrdersResult = await client.getPendingOrders();

  let updatedPendingOrders = [];

  if (Array.isArray(updatedPendingOrdersResult)) {
    updatedPendingOrders = updatedPendingOrdersResult;
  } else if (updatedPendingOrdersResult && Array.isArray(updatedPendingOrdersResult.result)) {
    updatedPendingOrders = updatedPendingOrdersResult.result;
  }

  const remainingBtcSwapOrders = updatedPendingOrders.filter(o =>
    (o.product || o.symbol || '').includes('BTC_USDT_SWAP') ||
    (o.product || o.symbol || '').includes('BTC') && (o.product || o.symbol || '').includes('SWAP')
  );

  if (remainingBtcSwapOrders.length === 0) {
    console.log('✓ All BTC_USDT_SWAP orders have been cancelled successfully!');
  } else {
    console.log(`⚠ ${remainingBtcSwapOrders.length} BTC_USDT_SWAP orders still remain`);
  }
}

main().catch(error => {
  console.error('\nError:', error.message);
  process.exit(1);
});
