const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  console.log('Checking for swap/futures orders...\n');

  // Try different endpoints for swap orders
  try {
    // Try getting positions
    console.log('1. Checking positions...\n');
    const positions = await client.getPositions();

    console.log('Positions:');
    console.log(JSON.stringify(positions, null, 2));
    console.log();

    if (Array.isArray(positions) && positions.length > 0) {
      const btcSwapPositions = positions.filter(p =>
        (p.symbol || p.product || '').includes('BTC_USDT_SWAP')
      );

      if (btcSwapPositions.length > 0) {
        console.log(`Found ${btcSwapPositions.length} BTC_USDT_SWAP positions:`);
        btcSwapPositions.forEach((pos, i) => {
          console.log(`${i + 1}. ${JSON.stringify(pos, null, 2)}`);
        });
      }
    }
  } catch (error) {
    console.error('Error fetching positions:', error.message);
  }

  // Try getting swap orders directly
  try {
    console.log('\n2. Checking swap orders...\n');
    const swapOrders = await client.postUserData('/v1/futures/orders', {});

    console.log('Swap orders:');
    console.log(JSON.stringify(swapOrders, null, 2));
    console.log();

    let orders = [];
    if (Array.isArray(swapOrders)) {
      orders = swapOrders;
    } else if (swapOrders && Array.isArray(swapOrders.result)) {
      orders = swapOrders.result;
    }

    if (orders.length > 0) {
      const btcSwapOrders = orders.filter(o =>
        (o.product || o.symbol || '').includes('BTC_USDT_SWAP')
      );

      if (btcSwapOrders.length > 0) {
        console.log(`Found ${btcSwapOrders.length} BTC_USDT_SWAP orders:`);
        btcSwapOrders.forEach((order, i) => {
          console.log(`${i + 1}. Order ID: ${order.orderId || order.id}`);
          console.log(`   Symbol: ${order.product || order.symbol}`);
          console.log(`   Side: ${order.side}`);
          console.log(`   Quantity: ${order.quantity}`);
          console.log(`   Price: ${order.price}`);
          console.log(`   Status: ${order.status}`);
          console.log();
        });
      } else {
        console.log('No BTC_USDT_SWAP orders found');
      }
    } else {
      console.log('No swap orders found');
    }
  } catch (error) {
    console.error('Error fetching swap orders:', error.message);
  }
}

main().catch(error => {
  console.error('\nError:', error.message);
  process.exit(1);
});
