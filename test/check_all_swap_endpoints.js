const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  console.log('Checking various swap/futures order endpoints...\n');

  const endpoints = [
    '/v1/order/open',
    '/v1/futures/openOrder',
    '/v1/futures/open-orders',
    '/v1/futures/allOrders',
    '/v1/position/order',
    '/v1/position/orders'
  ];

  for (const endpoint of endpoints) {
    console.log(`\nTrying endpoint: ${endpoint}`);
    try {
      const result = await client.postUserData(endpoint, {});
      console.log('✓ Success!');
      console.log('Response:', JSON.stringify(result, null, 2));

      let orders = [];
      if (Array.isArray(result)) {
        orders = result;
      } else if (result && Array.isArray(result.result)) {
        orders = result.result;
      }

      if (orders.length > 0) {
        const btcSwapOrders = orders.filter(o =>
          (o.product || o.symbol || '').includes('BTC_USDT_SWAP')
        );

        if (btcSwapOrders.length > 0) {
          console.log(`\nFound ${btcSwapOrders.length} BTC_USDT_SWAP orders:`);
          btcSwapOrders.forEach((order, i) => {
            console.log(`  ${i + 1}. Order ID: ${order.orderId || order.id}, ${order.side} ${order.quantity} @ ${order.price}`);
          });
        }
      }
    } catch (error) {
      console.log(`✗ Failed: ${error.message}`);
    }
  }
}

main().catch(error => {
  console.error('\nError:', error.message);
  process.exit(1);
});
