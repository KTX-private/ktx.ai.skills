const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  const orderId = '4613935619230270625';

  console.log('Cancelling order using Skill method...\n');
  console.log(`Order ID: ${orderId}\n`);

  try {
    const result = await client.cancelOrder(orderId);

    console.log('API Response:', JSON.stringify(result, null, 2));
    console.log();

    if (result.state === 0 || result.success === true) {
      console.log('✓ Order cancelled successfully!');

      // Extract cancelled order details
      const orders = result.result || [];
      if (Array.isArray(orders) && orders.length > 0) {
        const order = orders[0];
        console.log(`\nCancelled Order Details:`);
        console.log(`Order ID: ${order.orderId || order.id || 'N/A'}`);
        console.log(`Symbol: ${order.product || order.symbol || 'N/A'}`);
        console.log(`Side: ${order.side || 'N/A'}`);
        console.log(`Type: ${order.type || 'N/A'}`);
        console.log(`Price: ${order.price || 'N/A'} USDT`);
        console.log(`Quantity: ${order.quantity || order.amount || 'N/A'} BTC`);
        console.log(`Status: ${order.status || 'cancelled'}`);
        console.log(`Reason: ${order.reason || 'User cancelled'}`);
      }
    } else {
      console.log(`Response state: ${result.state}`);
      console.log(`Message: ${result.msg || 'No message'}`);
    }

  } catch (error) {
    console.error('✗ Failed to cancel order:', error.message);
    console.error('\nPossible reasons:');
    console.error('1. Order has already been filled');
    console.error('2. Order has already been cancelled');
    console.error('3. Order ID is invalid');
    console.error('4. Network connection issues');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\nError:', error.message);
  process.exit(1);
});
