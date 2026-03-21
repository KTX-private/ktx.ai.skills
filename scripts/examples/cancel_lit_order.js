/**
 * Cancel KTX LIT_USDT sell order
 */

const { KTXPrivateClient } = require('../scripts/ktx_client');

async function cancelLITOrder() {
  console.log('====================================');
  console.log('   Cancel LIT_USDT Sell Order');
  console.log('====================================\n');

  try {
    const client = new KTXPrivateClient();

    console.log('Step 1: Querying pending orders...\n');
    const pendingOrdersResult = await client.getPendingOrders();

    if (!pendingOrdersResult || !pendingOrdersResult.result) {
      console.log('No pending orders data returned.\n');
      return;
    }

    const pendingOrders = pendingOrdersResult.result;

    console.log(`Found ${pendingOrders.length} pending order(s)\n`);

    // Filter LIT_USDT orders
    const litOrders = pendingOrders.filter(order => {
      return order.symbol && (order.symbol.includes('LIT') || order.symbol.includes('lit'));
    });

    if (litOrders.length === 0) {
      console.log('No LIT_USDT orders found.\n');
      console.log('Showing all pending orders:\n');

      if (pendingOrders.length > 0) {
        pendingOrders.slice(0, 5).forEach((order, index) => {
          console.log(`\nOrder ${index + 1}:`);
          console.log(`  ID:     ${order.id}`);
          console.log(`  Symbol: ${order.symbol}`);
          console.log(`  Side:   ${order.side}`);
          console.log(`  Type:   ${order.type}`);
          console.log(`  Amount: ${order.amount}`);
        });
      }
      return;
    }

    console.log(`Found ${litOrders.length} LIT order(s):\n`);

    // Find sell orders only
    const sellOrders = litOrders.filter(order => {
      return order.side && order.side.toLowerCase() === 'sell';
    });

    if (sellOrders.length === 0) {
      console.log('No LIT sell orders found.\n');
      console.log('All LIT orders are buy orders or closed.\n');
      return;
    }

    console.log(`Found ${sellOrders.length} LIT sell order(s) to cancel.\n`);

    // Cancel each sell order
    for (let i = 0; i < sellOrders.length; i++) {
      const order = sellOrders[i];
      console.log(`\nCancelling order ${i + 1}/${sellOrders.length}: ${order.id}`);

      try {
        await client.cancelOrder(order.id);
        console.log('Cancelled successfully');
      } catch (error) {
        console.error(`Failed to cancel: ${error.message}`);
      }
    }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n====================================');
    console.log('   Cancellation Complete');
    console.log('====================================\n');

    // Verify
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedPendingOrdersResult = await client.getPendingOrders();
    if (updatedPendingOrdersResult && updatedPendingOrdersResult.result) {
      const updatedOrders = updatedPendingOrdersResult.result;
      const remainingLitOrders = updatedOrders.filter(order =>
        order.symbol && (order.symbol.includes('LIT') || order.symbol.includes('lit'))
      );
      const remainingSellOrders = remainingLitOrders.filter(order =>
        order.side && order.side.toLowerCase() === 'sell'
      );

      console.log(`Remaining LIT orders: ${remainingLitOrders.length}`);
      console.log(`Remaining LIT sell orders: ${remainingSellOrders.length}`);

      if (remainingSellOrders.length === 0) {
        console.log('All LIT sell orders have been cancelled successfully!\n');
      } else {
        console.log('Some orders remain:');
        remainingSellOrders.forEach((order, index) => {
          console.log(`  ${index + 1}. ${order.id} - ${order.symbol} ${order.side}`);
        });
      }
    }

  } catch (error) {
    console.error('Operation failed:', error.message);

    if (error.message.includes('API key') || error.message.includes('configuration')) {
      console.error('\nConfiguration issue detected.');
      console.error('Please ensure:');
      console.error('1. KTX API keys are configured');
      console.error('2. File ~/.ktx_exchange_config.json exists');
    } else {
      console.error('Please check:');
      console.error('1. Network connectivity');
      console.error('2. API endpoint status');
      console.error('3. API key validity');
    }

    process.exit(1);
  }
}

cancelLITOrder();
