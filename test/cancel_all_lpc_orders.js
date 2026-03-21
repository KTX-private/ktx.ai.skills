const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  console.log('Querying LPC (futures/swap) orders...\n');

  // Query lpc market orders (futures/swap)
  const lpcOrdersResult = await client.getUserData('/v1/pending/orders', {
    market: 'lpc'
  });

  let lpcOrders = [];

  if (Array.isArray(lpcOrdersResult)) {
    lpcOrders = lpcOrdersResult;
  } else if (lpcOrdersResult && Array.isArray(lpcOrdersResult.result)) {
    lpcOrders = lpcOrdersResult.result;
  }

  console.log(`Total LPC orders: ${lpcOrders.length}\n`);

  if (lpcOrders.length === 0) {
    console.log('No LPC (futures/swap) orders found.');
    return;
  }

  // Display orders before cancelling
  console.log('=== LPC Orders to Cancel ===\n');
  lpcOrders.forEach((order, index) => {
    console.log(`${index + 1}. Order ID: ${order.orderId || order.id}`);
    console.log(`   Symbol: ${order.product || order.symbol}`);
    console.log(`   Side: ${order.side}`);
    console.log(`   Quantity: ${order.quantity}`);
    console.log(`   Price: ${order.price}`);
    console.log(`   Leverage: ${order.leverage || 'N/A'}`);
    console.log(`   Status: ${order.status}`);
    console.log();
  });

  console.log('Cancelling LPC orders...\n');

  let successCount = 0;
  let failCount = 0;

  for (const order of lpcOrders) {
    const orderId = order.orderId || order.id;
    try {
      console.log(`Cancelling order ${orderId} (${order.product || order.symbol} ${order.side})...`);
      const result = await client.postUserData('/v1/order/delete', { id: orderId });

      if (result.state === 0 || result.success === true) {
        console.log(`✓ Successfully cancelled order ${orderId}\n`);
        successCount++;
      } else {
        console.log(`✗ Failed to cancel order ${orderId}: ${result.msg || 'Unknown error'}\n`);
        failCount++;
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`✗ Failed to cancel order ${orderId}: ${error.message}\n`);
      failCount++;
    }
  }

  console.log('=== Cancellation Summary ===\n');
  console.log(`Total orders: ${lpcOrders.length}`);
  console.log(`Successfully cancelled: ${successCount}`);
  console.log(`Failed: ${failCount}`);

  // Verify cancellation
  console.log('\nVerifying cancellation...\n');

  const updatedLpcOrdersResult = await client.getUserData('/v1/pending/orders', {
    market: 'lpc'
  });

  let updatedLpcOrders = [];

  if (Array.isArray(updatedLpcOrdersResult)) {
    updatedLpcOrders = updatedLpcOrdersResult;
  } else if (updatedLpcOrdersResult && Array.isArray(updatedLpcOrdersResult.result)) {
    updatedLpcOrders = updatedLpcOrdersResult.result;
  }

  if (updatedLpcOrders.length === 0) {
    console.log('✓ All LPC orders have been cancelled successfully!');
  } else {
    console.log(`⚠ ${updatedLpcOrders.length} LPC orders still remain`);
    updatedLpcOrders.forEach((order, i) => {
      console.log(`  ${i + 1}. ${order.orderId || order.id} - ${order.product || order.symbol} ${order.side}`);
    });
  }
}

main().catch(error => {
  console.error('\nError:', error.message);
  process.exit(1);
});
