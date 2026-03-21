const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  console.log('=== Getting BTC Deposit Address ===\n');

  try {
    // Use the getDepositAddress method
    const result = await client.getDepositAddress('BTC');

    console.log('API Response:', JSON.stringify(result, null, 2));
    console.log();

    if (result.state && result.state < 0) {
      console.error(`✗ Failed to get deposit address!`);
      console.error(`Error code: ${result.state}`);
      console.error(`Message: ${result.msg || 'No error message'}`);
      process.exit(1);
    }

    const address = result.result || result;

    console.log('✓ BTC Deposit Address:\n');
    console.log(`Address: ${address.address || address.addr || 'N/A'}`);
    console.log(`Network: ${address.network || 'BTC'}`);
    console.log(`Currency: ${address.coin || address.currency || 'BTC'}`);
    if (address.tag || address.memo) {
      console.log(`Tag/Memo: ${address.tag || address.memo}`);
    }

  } catch (error) {
    console.error('✗ Failed to get deposit address:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\nError:', error.message);
  process.exit(1);
});
