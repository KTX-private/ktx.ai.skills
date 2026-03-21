const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  console.log('=== Testing Withdraw API ===\n');

  // Example withdraw parameters (NOT ACTUALLY WITHDRAWING)
  const withdrawParams = {
    coin_symbol: 'BTC',
    addr: 'bc1qjlxppurgx6ztfhguvjjn5gqkh3kjdm2valqktm',
    amount: 0.001,
    // memo: 'optional memo',
    // withdraw_id: 'custom_withdraw_id_123'
  };

  console.log('Withdraw Parameters:');
  console.log(JSON.stringify(withdrawParams, null, 2));
  console.log();

  console.log('NOTE: This is a TEST ONLY. Not actually withdrawing.');
  console.log('To actually withdraw, uncomment the code below.\n');

  // Uncomment to actually withdraw (BE CAREFUL!)
  /*
  try {
    const result = await client.withdraw(withdrawParams);

    console.log('API Response:', JSON.stringify(result, null, 2));
    console.log();

    if (result.state && result.state < 0) {
      console.error(`✗ Withdraw failed!`);
      console.error(`Error code: ${result.state}`);
      console.error(`Message: ${result.msg || 'No error message'}`);
      process.exit(1);
    }

    const withdraw = result.result || result;

    console.log('✓ Withdraw request submitted successfully!\n');
    console.log(`Withdraw ID: ${withdraw.withdraw_id || withdraw.id || 'N/A'}`);
    console.log(`Amount: ${withdraw.amount} ${withdraw.coin_symbol}`);
    console.log(`Address: ${withdraw.addr}`);
    console.log(`Status: ${withdraw.status || 'pending'}`);

  } catch (error) {
    console.error('✗ Failed to withdraw:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
  */
}

main().catch(error => {
  console.error('\nError:', error.message);
});
