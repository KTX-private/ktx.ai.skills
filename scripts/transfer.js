#!/usr/bin/env node

const { KTXPrivateClient } = require('./ktx_client');

/**
 * Unified transfer script for KTX Skills
 */
async function transferAsset(symbol = 'USDT', amount = 100, direction = 'to_trading', transferId = null) {
  console.log('====================================');
  console.log('   KTX Asset Transfer');
  console.log('====================================\n');

  try {
    const client = new KTXPrivateClient();

    // Check balances before transfer
    console.log('📊 Balances Before Transfer:');
    const mainAccounts = await client.getMainAccounts();
    const tradingAccounts = await client.getAccounts();

    const mainAsset = mainAccounts.result.find(acc => acc.asset === symbol);
    const tradingAsset = tradingAccounts.result.find(acc => acc.asset === symbol);

    if (mainAsset) {
      console.log(`   Main Wallet ${symbol}: ${parseFloat(mainAsset.balance).toFixed(6)}`);
    }
    if (tradingAsset) {
      console.log(`   Trading Account ${symbol}: ${parseFloat(tradingAsset.balance).toFixed(6)}`);
    }

    // Determine transfer type
    let transferType, transferDirection;
    if (direction === 'to_trading' || direction === 'main_to_trade') {
      transferType = 'WALLET_TRADE';
      transferDirection = 'Main Wallet → Trading Account';
    } else if (direction === 'to_wallet' || direction === 'trade_to_main') {
      transferType = 'TRADE_WALLET';
      transferDirection = 'Trading Account → Main Wallet';
    } else {
      throw new Error(`Invalid direction: ${direction}. Use 'to_trading' or 'to_wallet'`);
    }

    // Perform transfer
    console.log(`\n💸 Transferring ${amount} ${symbol}`);
    console.log(`   Direction: ${transferDirection}`);
    console.log(`   Type: ${transferType}`);

    const transferParams = {
      symbol: symbol,
      amount: amount,
      type: transferType
    };

    if (transferId) {
      transferParams.transfer_id = transferId;
      console.log(`   Transfer ID: ${transferId}`);
    } else {
      const autoId = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
      transferParams.transfer_id = autoId;
      console.log(`   Transfer ID: ${autoId} (auto-generated)`);
    }

    const result = await client.transfer(transferParams);

    if (result && (result.state === 0 || result.state === '0')) {
      console.log('   ✓ Transfer successful!');

      if (result.result) {
        console.log(`   New Balance: ${result.result.balance} ${result.result.asset}`);
      }

      // Check balances after transfer
      console.log('\n📊 Balances After Transfer:');
      const mainAccountsAfter = await client.getMainAccounts();
      const tradingAccountsAfter = await client.getAccounts();

      const mainAssetAfter = mainAccountsAfter.result.find(acc => acc.asset === symbol);
      const tradingAssetAfter = tradingAccountsAfter.result.find(acc => acc.asset === symbol);

      if (mainAssetAfter) {
        console.log(`   Main Wallet ${symbol}: ${parseFloat(mainAssetAfter.balance).toFixed(6)}`);
      }
      if (tradingAssetAfter) {
        console.log(`   Trading Account ${symbol}: ${parseFloat(tradingAssetAfter.balance).toFixed(6)}`);
      }

      console.log('\n====================================');
      console.log('   Transfer Completed Successfully');
      console.log('====================================\n');
    } else {
      throw new Error(result?.msg || result?.message || 'Transfer failed');
    }

  } catch (error) {
    console.error('\n✗ Transfer failed:', error.message);
    console.error('\nPossible reasons:');
    console.error('1. Insufficient balance');
    console.error('2. Invalid direction (use: to_trading or to_wallet)');
    console.error('3. Invalid symbol (e.g., USDT, BTC, ETH)');
    console.error('4. Network connection problem');
    console.error('5. API service issue');

    console.log('\nUsage:');
    console.log('  node transfer.js [SYMBOL] [AMOUNT] [DIRECTION] [TRANSFER_ID]');
    console.log('\nExamples:');
    console.log('  node transfer.js USDT 100 to_trading');
    console.log('  node transfer.js USDT 50 to_wallet');
    console.log('  node transfer.js BTC 0.1 to_trading custom_id_123');
    console.log('\nDirections:');
    console.log('  to_trading - Transfer from main wallet to trading account');
    console.log('  to_wallet  - Transfer from trading account to main wallet');

    process.exit(1);
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);

  const symbol = args[0] || 'USDT';
  const amount = parseFloat(args[1]) || 100;
  const direction = args[2] || 'to_trading';
  const transferId = args[3] || null;

  transferAsset(symbol, amount, direction, transferId)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { transferAsset };
