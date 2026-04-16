#!/usr/bin/env node

const { KTXPrivateClient } = require('./ktx_client');

/**
 * Transfer USDT from main wallet to trading account
 */
async function transferToTrading(amount = 100) {
  console.log('====================================');
  console.log('   Wallet Transfer');
  console.log('====================================\n');

  try {
    const client = new KTXPrivateClient();

    // Check balances before transfer
    console.log('📊 Balances Before Transfer:');
    const mainAccounts = await client.getMainAccounts();
    const tradingAccounts = await client.getAccounts();

    const mainUSDT = mainAccounts.result.find(acc => acc.asset === 'USDT');
    const tradingUSDT = tradingAccounts.result.find(acc => acc.asset === 'USDT');

    if (mainUSDT) {
      console.log(`   Main Wallet: ${parseFloat(mainUSDT.balance).toFixed(6)} USDT`);
    }
    if (tradingUSDT) {
      console.log(`   Trading Account: ${parseFloat(tradingUSDT.balance).toFixed(6)} USDT`);
    }

    // Perform transfer
    console.log(`\n💸 Transferring ${amount} USDT from main wallet to trading account...`);

    const transferParams = {
      symbol: 'USDT',
      amount: amount,
      type: 'WALLET_TRADE',
      transfer_id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9)
    };

    const result = await client.transfer(transferParams);

    console.log('   API Response:', JSON.stringify(result));

    if (result && (result.state === 0 || result.state === '0')) {
      console.log('   ✓ Transfer successful!');

      // Check balances after transfer
      console.log('\n📊 Balances After Transfer:');
      const mainAccountsAfter = await client.getMainAccounts();
      const tradingAccountsAfter = await client.getAccounts();

      const mainUSDTAfter = mainAccountsAfter.result.find(acc => acc.asset === 'USDT');
      const tradingUSDTAfter = tradingAccountsAfter.result.find(acc => acc.asset === 'USDT');

      if (mainUSDTAfter) {
        console.log(`   Main Wallet: ${parseFloat(mainUSDTAfter.balance).toFixed(6)} USDT`);
      }
      if (tradingUSDTAfter) {
        console.log(`   Trading Account: ${parseFloat(tradingUSDTAfter.balance).toFixed(6)} USDT`);
      }

      console.log('\n====================================');
      console.log('   Transfer Completed');
      console.log('====================================\n');
    } else {
      throw new Error(result?.message || 'Transfer failed');
    }

  } catch (error) {
    console.error('\n✗ Transfer failed:', error.message);
    console.error('\nPossible reasons:');
    console.error('1. Insufficient balance in main wallet');
    console.error('2. Transfer limit exceeded');
    console.error('3. Network connection problem');
    console.error('4. API service issue');
    process.exit(1);
  }
}

// Run the transfer
if (require.main === module) {
  const amount = parseFloat(process.argv[2]) || 100;
  transferToTrading(amount)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { transferToTrading };
