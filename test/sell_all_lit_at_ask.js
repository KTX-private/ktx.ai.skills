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

  // Get LIT balance using the correct method
  const accountsResult = await privateClient.getAccounts();
  let accounts = accountsResult;

  console.log('Accounts response:', JSON.stringify(accountsResult, null, 2));

  if (accountsResult && typeof accountsResult === 'object' && accountsResult.result) {
    accounts = accountsResult.result;
  }

  console.log('Accounts array:', accounts);

  const litAccount = Array.isArray(accounts) ?
    accounts.find(acc => (acc.asset || acc.currency) && (acc.asset || acc.currency).toUpperCase() === 'LIT') :
    null;

  if (!litAccount) {
    console.error('✗ No LIT balance found');
    process.exit(1);
  }

  const litBalance = parseFloat(litAccount.balance || '0');
  const litAvailable = parseFloat(litAccount.available || litAccount.balance || '0');

  console.log(`LIT Balance: ${litBalance}`);
  console.log(`LIT Available: ${litAvailable}\n`);

  if (litAvailable <= 0) {
    console.error('✗ No available LIT to sell');
    process.exit(1);
  }

  // Format quantity with 4 decimal places (LIT precision)
  // Subtract a tiny amount to avoid precision issues
  const quantity = (litAvailable - 0.00001).toFixed(4);

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
