const { KTXClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXClient();

  console.log('Querying pending orders...\n');

  const pendingOrdersResult = await client.getPendingOrders();

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

  const litSellOrders = pendingOrders.filter(o =>
    (o.product || o.symbol || '') && (o.product || o.symbol || '').toUpperCase().includes('LIT') &&
    o.side && o.side.toLowerCase() === 'sell'
  );

  console.log(`Found ${litSellOrders.length} LIT sell orders\n`);

  if (litSellOrders.length === 0) {
    console.log('No LIT sell orders found.');
    return;
  }

  console.log('Cancelling LIT sell orders...\n');

  for (const order of litSellOrders) {
    try {
      const orderId = order.orderId || order.id;
      console.log(`Cancelling order ${orderId}...`);
      await client.cancelOrder(orderId);
      console.log(`✓ Successfully cancelled order ${orderId}\n`);
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`✗ Failed to cancel order ${order.id}: ${error.message}\n`);
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

  const remainingLitSellOrders = updatedPendingOrders.filter(o =>
    (o.product || o.symbol || '') && (o.product || o.symbol || '').toUpperCase().includes('LIT') &&
    o.side && o.side.toLowerCase() === 'sell'
  );

  if (remainingLitSellOrders.length === 0) {
    console.log('✓ All LIT sell orders have been cancelled successfully!');
  } else {
    console.log(`⚠ ${remainingLitSellOrders.length} LIT sell orders still remain`);
  }
}

main().catch(error => {
  console.error('\nError:', error.message);
  process.exit(1);
});
