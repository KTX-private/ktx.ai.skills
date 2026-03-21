const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  console.log('Querying LPC (futures/swap) orders...\n');

  // Query lpc market orders (futures/swap)
  const lpcOrdersResult = await client.getUserData('/v1/pending/orders', {
    market: 'lpc'
  });

  console.log('LPC Orders Response:', JSON.stringify(lpcOrdersResult, null, 2));
  console.log();

  let lpcOrders = [];

  if (Array.isArray(lpcOrdersResult)) {
    lpcOrders = lpcOrdersResult;
  } else if (lpcOrdersResult && Array.isArray(lpcOrdersResult.result)) {
    lpcOrders = lpcOrdersResult.result;
  }

  console.log(`Total LPC orders: ${lpcOrders.length}\n`);

  if (lpcOrders.length > 0) {
    console.log('=== LPC (Futures/Swap) Orders ===\n');
    lpcOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order.orderId || order.id}`);
      console.log(`   Symbol: ${order.product || order.symbol}`);
      console.log(`   Side: ${order.side}`);
      console.log(`   Type: ${order.type}`);
      console.log(`   Quantity: ${order.quantity}`);
      console.log(`   Price: ${order.price}`);
      console.log(`   Leverage: ${order.leverage || 'N/A'}`);
      console.log(`   Margin Method: ${order.marginMethod || 'N/A'}`);
      console.log(`   Position Merge: ${order.positionMerge || 'N/A'}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Executed Qty: ${order.executedQty}`);
      console.log(`   Create Time: ${order.createTime ? new Date(parseInt(order.createTime)).toLocaleString() : 'N/A'}`);
      console.log(`   Update Time: ${order.updateTime ? new Date(parseInt(order.updateTime)).toLocaleString() : 'N/A'}`);
      console.log();
    });
  } else {
    console.log('No LPC (futures/swap) orders found.\n');
  }

  // Also query specific BTC_USDT_SWAP orders
  console.log('=== Querying BTC_USDT_SWAP specifically ===\n');
  const btcSwapResult = await client.getUserData('/v1/pending/orders', {
    market: 'lpc',
    symbol: 'BTC_USDT_SWAP'
  });

  console.log('BTC_USDT_SWAP Response:', JSON.stringify(btcSwapResult, null, 2));
  console.log();

  let btcSwapOrders = [];

  if (Array.isArray(btcSwapResult)) {
    btcSwapOrders = btcSwapResult;
  } else if (btcSwapResult && Array.isArray(btcSwapResult.result)) {
    btcSwapOrders = btcSwapResult.result;
  }

  if (btcSwapOrders.length > 0) {
    console.log(`Found ${btcSwapOrders.length} BTC_USDT_SWAP orders:`);
    btcSwapOrders.forEach((order, i) => {
      console.log(`  ${i + 1}. Order ID: ${order.orderId || order.id}, ${order.side} ${order.quantity} @ ${order.price}`);
    });
  } else {
    console.log('No BTC_USDT_SWAP orders found.');
  }
}

main().catch(error => {
  console.error('\nError:', error.message);
  process.exit(1);
});
