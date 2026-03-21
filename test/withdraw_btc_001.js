const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  console.log('=== Withdraw 0.01 BTC ===\n');

  // Withdraw parameters
  const withdrawParams = {
    coin_symbol: 'BTC',
    addr: 'bc1qjlxppurgx6ztfhguvjjn5gqkh3kjdm2valqktm',
    amount: 0.01
  };

  console.log('Withdraw Parameters:');
  console.log(JSON.stringify(withdrawParams, null, 2));
  console.log();

  // Check balance before withdraw
  console.log('Checking BTC balance...');
  const balanceResult = await client.getMainAccounts();
  const btcBalance = balanceResult.result?.find(a => a.asset === 'BTC');

  if (btcBalance) {
    console.log(`BTC Available: ${btcBalance.free}`);
    console.log(`BTC Locked: ${btcBalance.locked}`);
    console.log(`BTC Total: ${btcBalance.balance}\n`);
  }

  if (parseFloat(btcBalance?.free || 0) < withdrawParams.amount) {
    console.error(`✗ Insufficient BTC balance!`);
    console.error(`Available: ${btcBalance?.free} BTC`);
    console.error(`Required: ${withdrawParams.amount} BTC`);
    process.exit(1);
  }

  console.log('Processing withdrawal...\n');

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
    console.log(`Coin: ${withdraw.coin_symbol}`);
    console.log(`Amount: ${withdraw.amount} BTC`);
    console.log(`Address: ${withdraw.addr}`);
    console.log(`Memo: ${withdraw.memo || 'N/A'}`);
    console.log(`Status: ${withdraw.status || 'pending'}`);

  } catch (error) {
    console.error('✗ Failed to withdraw:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\nError:', error.message);
});
