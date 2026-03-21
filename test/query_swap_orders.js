const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  console.log('Querying KTX futures/swap orders...\n');

  // Get all pending orders (this includes both spot and swap orders)
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

  // Separate spot and swap orders
  const spotOrders = pendingOrders.filter(o =>
    !(o.product || o.symbol || '').includes('_SWAP')
  );

  const swapOrders = pendingOrders.filter(o =>
    (o.product || o.symbol || '').includes('_SWAP')
  );

  // Display swap orders
  if (swapOrders.length > 0) {
    console.log('=== Swap/Futures Orders ===\n');
    swapOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order.orderId || order.id}`);
      console.log(`   Symbol: ${order.product || order.symbol}`);
      console.log(`   Side: ${order.side}`);
      console.log(`   Type: ${order.type}`);
      console.log(`   Quantity: ${order.quantity || order.amount}`);
      console.log(`   Price: ${order.price}`);
      console.log(`   Leverage: ${order.leverage || 'N/A'}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Create Time: ${order.createTime ? new Date(parseInt(order.createTime)).toLocaleString() : 'N/A'}`);
      console.log();
    });
  } else {
    console.log('=== No Swap/Futures Orders Found ===\n');
  }

  // Display spot orders for reference
  if (spotOrders.length > 0) {
    console.log('=== Spot Orders (for reference) ===\n');
    spotOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order.orderId || order.id}`);
      console.log(`   Symbol: ${order.product || order.symbol}`);
      console.log(`   Side: ${order.side}`);
      console.log(`   Quantity: ${order.quantity || order.amount}`);
      console.log(`   Price: ${order.price}`);
      console.log(`   Status: ${order.status}`);
      console.log();
    });
  }

  // Summary
  console.log('=== Summary ===');
  console.log(`Swap/Futures Orders: ${swapOrders.length}`);
  console.log(`Spot Orders: ${spotOrders.length}`);
  console.log(`Total Orders: ${pendingOrders.length}`);
}

main().catch(error => {
  console.error('\nError:', error.message);
  process.exit(1);
});
