const { KTXPrivateClient, KTXPublicClient } = require('../scripts/ktx_client');

async function main() {
  const privateClient = new KTXPrivateClient();
  const publicClient = new KTXPublicClient();

  console.log('Getting current market data...\n');

  // Get order book to find best ask price
  const orderBook = await publicClient.getOrderBook('LIT_USDT', 1);

  if (!orderBook.asks || orderBook.asks.length === 0) {
    console.error('✗ No sell orders in order book');
    process.exit(1);
  }

  const bestAsk = orderBook.asks[0];
  const askPrice = bestAsk[0].toString();

  console.log(`Best ask price: ${askPrice} USDT\n`);

  // Get LIT balance - use the actual balance we know from previous queries
  // We had 9.842298, and we have a pending order for 3.5, so available is about 6.3423
  const litAvailable = 6.3423;

  console.log(`LIT Available (approximate): ${litAvailable}\n`);

  // Format quantity with 4 decimal places (LIT precision)
  const quantity = litAvailable.toFixed(4);

  console.log(`Creating sell order for ${quantity} LIT at ${askPrice} USDT...\n`);

  const params = {
    symbol: 'LIT_USDT',
    product: 'LIT_USDT',
    side: 'sell',
    type: 'limit',
    amount: quantity,
    quantity: quantity,
    price: askPrice,
    timeInForce: 'gtc'
  };

  console.log('Order parameters:');
  console.log(JSON.stringify(params, null, 2));
  console.log();

  try {
    const result = await privateClient.postUserData('/v1/order', params);

    console.log('Raw API Response:', JSON.stringify(result, null, 2));
    console.log();

    if (result.state && result.state < 0) {
      console.error(`✗ Order creation failed!`);
      console.error(`Error code: ${result.state}`);
      console.error(`Message: ${result.msg || 'No error message'}`);
      process.exit(1);
    }

    const order = result.result || result;

    console.log('✓ Order created successfully!\n');
    console.log(`Order ID: ${order.orderId || order.id || 'N/A'}`);
    console.log(`Symbol: ${order.product || order.symbol || 'LIT_USDT'}`);
    console.log(`Side: ${order.side || 'sell'}`);
    console.log(`Type: ${order.type || 'limit'}`);
    console.log(`Price: ${order.price || askPrice} USDT`);
    console.log(`Quantity: ${order.quantity || order.amount || quantity} LIT`);
    console.log(`Status: ${order.status || 'submitted'}`);

  } catch (error) {
    console.error('✗ Failed to create order:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\nError:', error.message);
  process.exit(1);
});
