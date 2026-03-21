const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  console.log('Checking for any recent orders that might give us clues...\n');

  // Check history orders for BTC_USDT_SWAP
  try {
    const historyResult = await client.getUserData('/v1/history/orders', {
      market: 'lpc',
      symbol: 'BTC_USDT_SWAP',
      limit: 10
    });

    console.log('History orders for BTC_USDT_SWAP:');
    console.log(JSON.stringify(historyResult, null, 2));
  } catch (error) {
    console.error('Error fetching history:', error.message);
  }

  // Also check current positions for more details
  try {
    const positions = await client.getPositions();

    if (Array.isArray(positions)) {
      const btcPosition = positions.find(p => p.symbol === 'BTC_USDT_SWAP');

      if (btcPosition) {
        console.log('\n=== BTC_USDT_SWAP Position Details ===\n');
        console.log(JSON.stringify(btcPosition, null, 2));
      }
    } else if (positions.result && Array.isArray(positions.result)) {
      const btcPosition = positions.result.find(p => p.symbol === 'BTC_USDT_SWAP');

      if (btcPosition) {
        console.log('\n=== BTC_USDT_SWAP Position Details ===\n');
        console.log(JSON.stringify(btcPosition, null, 2));
      }
    }
  } catch (error) {
    console.error('Error fetching positions:', error.message);
  }
}

main().catch(error => {
  console.error('\nError:', error.message);
  process.exit(1);
});
