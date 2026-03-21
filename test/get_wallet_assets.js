const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  console.log('=== Getting Wallet Assets ===\n');

  try {
    // Get wallet assets
    const result = await client.getMainAccounts();

    console.log('API Response:', JSON.stringify(result, null, 2));
    console.log();

    if (result.state && result.state < 0) {
      console.error(`✗ Failed to get wallet assets!`);
      console.error(`Error code: ${result.state}`);
      console.error(`Message: ${result.msg || 'No error message'}`);
      process.exit(1);
    }

    const assets = result.result || result;

    console.log('✓ Wallet Assets:\n');
    if (Array.isArray(assets)) {
      assets.forEach(asset => {
        if (asset.coin === 'BTC' || asset.currency === 'BTC') {
          console.log(`=== BTC Asset ===`);
          console.log(`Available: ${asset.available || 'N/A'}`);
          console.log(`Frozen: ${asset.frozen || '0'}`);
          console.log(`Total: ${asset.total || 'N/A'}`);
          console.log(`Address: ${asset.address || asset.addr || 'N/A'}`);
          console.log();
        }
      });
    } else if (assets.balances) {
      // Alternative format
      const btcAsset = assets.balances.find(b => b.asset === 'BTC' || b.coin === 'BTC');
      if (btcAsset) {
        console.log(`=== BTC Asset ===`);
        console.log(`Available: ${btcAsset.free || btcAsset.available || 'N/A'}`);
        console.log(`Frozen: ${btcAsset.locked || btcAsset.frozen || '0'}`);
        console.log(`Total: ${btcAsset.total || 'N/A'}`);
        console.log(`Address: ${btcAsset.address || btcAsset.addr || 'N/A'}`);
      }
    }

  } catch (error) {
    console.error('✗ Failed to get wallet assets:', error.message);
    console.error('\nError details:', error);
  }
}

main().catch(error => {
  console.error('\nError:', error.message);
});
