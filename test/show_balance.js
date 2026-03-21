/**
 * Show KTX balance with correct API response parsing
 */

const { KTXPrivateClient } = require('../scripts/ktx_client');

async function showBalance() {
  console.log('====================================');
  console.log('   Your KTX Assets');
  console.log('====================================\n');

  try {
    const client = new KTXPrivateClient();

    console.log('Retrieving account information...\n');

    // Get accounts (API returns { result: [...] })
    console.log('1. Trading Accounts:');
    console.log('--------------------------------------------');
    const accountsResult = await client.getAccounts();

    if (!accountsResult || !accountsResult.result) {
      console.log('✗ No trading accounts data returned.');
    } else {
      const accounts = accountsResult.result;
      console.log(`✓ Found ${accounts.length} trading account(s)\n`);

      let totalBalance = 0;
      let hasPositiveBalance = false;

      accounts.forEach((account, index) => {
        const balance = parseFloat(account.balance) || 0;
        const withdrawable = parseFloat(account.withdrawable) || 0;
        const holds = parseFloat(account.holds) || 0;
        const currency = account.asset || 'N/A';

        console.log(`\nAccount ${index + 1}: ${currency}`);
        console.log(`  Balance:        ${balance.toFixed(6)}`);
        console.log(`  Withdrawable:    ${withdrawable.toFixed(6)}`);
        console.log(`  Holds:          ${holds.toFixed(6)}`);

        if (balance > 0) {
          hasPositiveBalance = true;
        }
      });

      console.log('\n====================================');
      console.log('   Summary:');
      console.log('====================================');
      console.log(`Total Accounts: ${accounts.length}`);
      console.log(`Accounts with Positive Balance: ${hasPositiveBalance ? 'Yes' : 'No'}`);
    }

    // Get wallet assets (main accounts)
    console.log('\n\n2. Wallet Assets:');
    console.log('--------------------------------------------');
    try {
      const mainAccountsResult = await client.getMainAccounts();

      if (!mainAccountsResult || !mainAccountsResult.result) {
        console.log('✗ No wallet assets data returned.');
      } else {
        const mainAccounts = mainAccountsResult.result;
        console.log(`✓ Found ${mainAccounts.length} wallet asset(s)\n`);

        let totalWalletBalance = 0;

        mainAccounts.forEach((account, index) => {
          const balance = parseFloat(account.balance) || 0;
          const withdrawable = parseFloat(account.withdrawable) || 0;
          const currency = account.asset || 'N/A';

          console.log(`\nWallet ${index + 1}: ${currency}`);
          console.log(`  Balance:        ${balance.toFixed(6)}`);
          console.log(`  Withdrawable:    ${withdrawable.toFixed(6)}`);

          totalWalletBalance += balance;
        });

        console.log('\n====================================');
        console.log(`Total Wallet Balance: ${totalWalletBalance.toFixed(6)}`);
      }
    } catch (error) {
      console.log('Wallet assets query error:', error.message);
    }

    // Get positions
    console.log('\n\n3. Open Positions:');
    console.log('--------------------------------------------');
    try {
      const positionsResult = await client.getPositions();

      if (!positionsResult || !positionsResult.result) {
        console.log('✗ No positions data returned.');
      } else {
        const positions = positionsResult.result;
        console.log(`✓ Found ${positions.length} open position(s)\n`);

        let totalUnrealizedPnl = 0;

        if (positions.length === 0) {
          console.log('No open positions.');
        } else {
          positions.slice(0, 10).forEach((position, index) => {
            console.log(`\nPosition ${index + 1}:`);
            console.log(`  Symbol:         ${position.symbol}`);
            console.log(`  Side:           ${position.side}`);
            console.log(`  Size:           ${position.size}`);
            console.log(`  Entry Price:    ${position.entry_price}`);
            console.log(`  Mark Price:     ${position.mark_price}`);

            if (position.unrealized_pnl) {
              const unrealizedPnl = parseFloat(position.unrealized_pnl);
              totalUnrealizedPnl += unrealizedPnl;
              console.log(`  Unrealized PnL: ${unrealizedPnl.toFixed(2)}`);
            }
          });

          console.log('\n====================================');
          console.log('   Position Summary:');
          console.log('====================================');
          console.log(`Total Positions: ${positions.length}`);
          console.log(`Total Unrealized PnL: ${totalUnrealizedPnl.toFixed(2)}`);
        }
      }
    } catch (error) {
      console.log('Positions query error:', error.message);
    }

    console.log('\n====================================');
    console.log('   Query Completed!');
    console.log('====================================\n');

  } catch (error) {
    console.error('✗ Query failed:', error.message);

    if (error.message.includes('API key') || error.message.includes('configuration')) {
      console.error('\nConfiguration issue detected.');
      console.error('Please ensure:');
      console.error('1. KTX API keys are configured');
      console.error('2. File ~/.ktx_exchange_config.json exists');
    } else if (error.message.includes('permission') || error.message.includes('权限')) {
      console.error('\nPermission issue detected.');
      console.error('Please ensure:');
      console.error('1. API key has Trade permission');
      console.error('2. Contact KTX support if needed');
    } else {
      console.error('\nPlease check:');
      console.error('1. Network connectivity');
      console.error('2. API endpoint status');
      console.error('3. API key validity');
    }

    process.exit(1);
  }
}

showBalance();
