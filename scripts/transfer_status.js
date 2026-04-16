#!/usr/bin/env node

const { KTXPrivateClient } = require('./ktx_client');

async function transferStatus() {
  console.log('====================================');
  console.log('   KTX Transfer Status');
  console.log('====================================\n');

  console.log('⚠️  Transfer API Currently Unavailable');
  console.log('\nThe internal transfer API (/v1/transfer) is returning parameter errors.');
  console.log('This appears to be an API-side issue or the documentation may be outdated.\n');

  console.log('📊 Current Account Status:');
  try {
    const client = new KTXPrivateClient();

    // Main wallet balance
    const mainAccounts = await client.getMainAccounts();
    const mainUSDT = mainAccounts.result.find(acc => acc.asset === 'USDT');

    // Trading account balance
    const tradingAccounts = await client.getAccounts();
    const tradingUSDT = tradingAccounts.result.find(acc => acc.asset === 'USDT');

    console.log('\n📊 Main Wallet USDT:');
    if (mainUSDT) {
      console.log('   Total Balance:', parseFloat(mainUSDT.balance).toFixed(6), 'USDT');
      console.log('   Available:    ', parseFloat(mainUSDT.free).toFixed(6), 'USDT');
    }

    console.log('\n📈 Trading Account USDT:');
    if (tradingUSDT) {
      console.log('   Total Balance:', parseFloat(tradingUSDT.balance).toFixed(6), 'USDT');
      console.log('   Available:    ', parseFloat(tradingUSDT.withdrawable).toFixed(6), 'USDT');
    }

    console.log('\n💡 Recommended Actions:');
    console.log('1. Contact KTX support about the transfer API issue');
    console.log('2. Use the KTX web interface for manual transfers');
    console.log('3. Check if API documentation needs updating');
    console.log('4. Verify API Key permissions include transfer capability');

    console.log('\n🔄 Alternative Manual Transfer:');
    console.log('You can perform transfers manually via:');
    console.log('   • KTX web interface: https://www.ktx.info');
    console.log('   • Mobile app transfer function');
    console.log('   • Contact customer support for assistance');

    console.log('\n====================================');
    console.log('   Status Check Complete');
    console.log('====================================\n');

  } catch (error) {
    console.error('Error checking status:', error.message);
  }
}

transferStatus().catch(console.error);
