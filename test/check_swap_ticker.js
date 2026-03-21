const { KTXPublicClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPublicClient();

  console.log('Checking BTC_USDT_SWAP ticker...\n');

  try {
    const ticker = await client.getTicker('BTC_USDT_SWAP');

    console.log('BTC_USDT_SWAP Ticker:');
    console.log(JSON.stringify(ticker, null, 2));

    console.log('\nBTC_USDT_SWAP exists and is active.');
  } catch (error) {
    console.error('Error fetching BTC_USDT_SWAP ticker:', error.message);
    console.log('\nBTC_USDT_SWAP may not exist or use a different name.');
  }

  // Try checking existing positions for the correct symbol name
  console.log('\n=== Checking existing positions ===\n');

  const { KTXPrivateClient } = require('../scripts/ktx_client');
  const privateClient = new KTXPrivateClient();

  try {
    const positions = await privateClient.getPositions();

    if (Array.isArray(positions)) {
      positions.forEach(pos => {
        if (pos.symbol) {
          console.log(`Position symbol: ${pos.symbol}`);
        }
      });
    } else if (positions.result && Array.isArray(positions.result)) {
      positions.result.forEach(pos => {
        if (pos.symbol) {
          console.log(`Position symbol: ${pos.symbol}`);
        }
      });
    }
  } catch (error) {
    console.error('Error fetching positions:', error.message);
  }
}

main().catch(error => {
  console.error('\nError:', error.message);
  process.exit(1);
});
