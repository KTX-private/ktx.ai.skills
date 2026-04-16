#!/usr/bin/env node

const { KTXPrivateClient } = require('./ktx_client');

async function debugTransfer() {
  console.log('====================================');
  console.log('   Debug Transfer');
  console.log('====================================\n');

  try {
    const client = new KTXPrivateClient();

    // Check current balances
    console.log('📊 Current Balances:');
    const mainAccounts = await client.getMainAccounts();
    const mainUSDT = mainAccounts.result.find(acc => acc.asset === 'USDT');

    if (mainUSDT) {
      console.log(`   Main Wallet USDT: ${parseFloat(mainUSDT.balance).toFixed(6)}`);
      console.log(`   Available: ${parseFloat(mainUSDT.free).toFixed(6)}`);
    }

    // Try transfer with detailed error handling
    console.log('\n📝 Transfer Parameters (Test different formats):');

    // Format 1: coin, amount, direction
    const transferParams1 = {
      coin: 'USDT',
      amount: '100',
      direction: 'main_to_trade'
    };
    console.log('   Format 1:', JSON.stringify(transferParams1));

    // Format 2: coin_symbol, amount, direction
    const transferParams2 = {
      coin_symbol: 'USDT',
      amount: '100',
      direction: 'main_to_trade'
    };
    console.log('   Format 2:', JSON.stringify(transferParams2));

    // Format 3: asset, amount, direction
    const transferParams3 = {
      asset: 'USDT',
      amount: '100',
      direction: 'main_to_trade'
    };
    console.log('   Format 3:', JSON.stringify(transferParams3));

    console.log('\n🔄 Testing Format 1...');
    const result1 = await client.transfer(transferParams1);
    console.log('Result 1:', JSON.stringify(result1));

    console.log('\n🔄 Testing Format 2...');
    const result2 = await client.transfer(transferParams2);
    console.log('Result 2:', JSON.stringify(result2));

    console.log('\n🔄 Testing Format 3...');
    const result3 = await client.transfer(transferParams3);
    console.log('Result 3:', JSON.stringify(result3));

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugTransfer().catch(console.error);
