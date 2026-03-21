const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  const orderId = '4613933420205665550';

  console.log('Cancelling BTC_USDT_SWAP order...\n');
  console.log(`Order ID: ${orderId}\n`);

  try {
    const result = await client.postUserData('/v1/order/delete', { id: orderId });

    console.log('API Response:', JSON.stringify(result, null, 2));
    console.log();

    if (result.state === 0 || result.success === true) {
      console.log('✓ Order cancelled successfully!');
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
