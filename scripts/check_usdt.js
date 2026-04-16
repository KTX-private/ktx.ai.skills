#!/usr/bin/env node

const { KTXPrivateClient } = require('./ktx_client');

/**
 * Query USDT balance
 */
async function checkUSDTBalance() {
  console.log('====================================');
  console.log('   USDT Balance Query');
  console.log('====================================\n');

  try {
    const client = new KTXPrivateClient();

    // Query main wallet USDT
    console.log('📊 Main Wallet USDT:');
    const mainAccounts = await client.getMainAccounts();
    const mainUSDT = mainAccounts.result.find(acc => acc.asset === 'USDT');

    if (mainUSDT) {
      console.log('   Total Balance:', parseFloat(mainUSDT.balance).toFixed(6), 'USDT');
      console.log('   Available:    ', parseFloat(mainUSDT.free).toFixed(6), 'USDT');
      console.log('   Locked:       ', parseFloat(mainUSDT.locked).toFixed(6), 'USDT');
    } else {
      console.log('   No USDT found in main wallet');
    }

    // Query trading account USDT
    console.log('\n📈 Trading Account USDT:');
    const tradingAccounts = await client.getAccounts();
    const tradingUSDT = tradingAccounts.result.find(acc => acc.asset === 'USDT');

    if (tradingUSDT) {
      console.log('   Total Balance:', parseFloat(tradingUSDT.balance).toFixed(6), 'USDT');
      console.log('   Available:    ', parseFloat(tradingUSDT.withdrawable).toFixed(6), 'USDT');
      console.log('   Locked:       ', parseFloat(tradingUSDT.holds).toFixed(6), 'USDT');
      console.log('   Collateral:   ', tradingUSDT.collateral ? '✓ Yes' : '✗ No');
    } else {
      console.log('   No USDT found in trading account');
    }

    // Calculate total
    const mainTotal = mainUSDT ? parseFloat(mainUSDT.balance) : 0;
    const tradingTotal = tradingUSDT ? parseFloat(tradingUSDT.balance) : 0;
    const totalUSDT = mainTotal + tradingTotal;

    console.log('\n====================================');
    console.log('   Total USDT: ' + totalUSDT.toFixed(6) + ' USDT');
    console.log('====================================\n');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the query
if (require.main === module) {
  checkUSDTBalance()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { checkUSDTBalance };
