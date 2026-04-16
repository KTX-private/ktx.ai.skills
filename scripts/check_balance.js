#!/usr/bin/env node

const { KTXPrivateClient } = require('./ktx_client');

/**
 * Query account balance
 */
async function checkBalance() {
  console.log('====================================');
  console.log('   KTX Account Balance');
  console.log('====================================\n');

  try {
    const client = new KTXPrivateClient();

    // Query main wallet accounts
    console.log('📊 Main Wallet Accounts:');
    const mainAccountsResponse = await client.getMainAccounts();
    const mainAccounts = mainAccountsResponse.result || [];

    if (mainAccounts.length > 0) {
      let totalUSDT = 0;
      let assets = [];

      mainAccounts.forEach(account => {
        const balance = parseFloat(account.balance || 0);
        const available = parseFloat(account.free || 0);
        const locked = parseFloat(account.locked || 0);

        if (balance > 0 || available > 0) {
          assets.push({
            symbol: account.asset || account.coin,
            balance: balance,
            available: available,
            locked: locked
          });

          if (account.asset === 'USDT' || account.coin === 'USDT') {
            totalUSDT = balance;
          }
        }
      });

      if (assets.length > 0) {
        assets.forEach(asset => {
          console.log(`\n  ${asset.symbol}:`);
          console.log(`    Total Balance: ${asset.balance.toFixed(6)}`);
          console.log(`    Available:   ${asset.available.toFixed(6)}`);
          console.log(`    Locked:      ${asset.locked.toFixed(6)}`);
        });
        console.log(`\n  Total USDT: ${totalUSDT.toFixed(6)}`);
      } else {
        console.log('  No assets in main wallet');
      }
    } else {
      console.log('  No accounts found or query failed');
    }

    // Query trading accounts
    console.log('\n\n📈 Trading Accounts:');
    const tradingAccountsResponse = await client.getAccounts();
    const tradingAccounts = tradingAccountsResponse.result || [];

    if (tradingAccounts.length > 0) {
      tradingAccounts.forEach(account => {
        const balance = parseFloat(account.balance || 0);
        const available = parseFloat(account.withdrawable || 0);
        const locked = parseFloat(account.holds || 0);

        if (balance > 0) {
          console.log(`\n  ${account.asset}:`);
          console.log(`    Total Balance: ${balance.toFixed(6)}`);
          console.log(`    Available:   ${available.toFixed(6)}`);
          console.log(`    Locked:      ${locked.toFixed(6)}`);
          if (account.collateral) {
            console.log(`    Collateral:  ✓`);
          }
        }
      });
    } else {
      console.log('  No trading accounts found');
    }

    // Query positions
    console.log('\n\n🎯 Open Positions:');
    try {
      const positionsResponse = await client.getPositions();
      const positions = positionsResponse.result || [];

      if (positions.length > 0) {
        let hasOpenPositions = false;
        positions.forEach(position => {
          const quantity = parseFloat(position.quantity || 0);
          const leverage = parseInt(position.leverage || 0);
          const posMargin = parseFloat(position.posMargin || 0);
          const orderMargin = parseFloat(position.orderMargin || 0);

          if (Math.abs(quantity) > 0 || posMargin > 0 || orderMargin > 0) {
            hasOpenPositions = true;
            const entryPrice = parseFloat(position.entryPrice || 0);
            const side = position.side || (quantity > 0 ? 'LONG' : 'SHORT');

            console.log(`\n  ${position.symbol}:`);
            console.log(`    Side: ${side.toUpperCase()}`);
            console.log(`    Leverage: ${leverage}x`);
            console.log(`    Quantity: ${quantity.toFixed(6)}`);
            console.log(`    Entry Price: ${entryPrice.toFixed(6)}`);
            console.log(`    Position Margin: ${posMargin.toFixed(6)}`);
            console.log(`    Order Margin: ${orderMargin.toFixed(6)}`);
            console.log(`    Margin Method: ${position.marginMethod || 'cross'}`);
          }
        });

        if (!hasOpenPositions) {
          console.log('  No active positions');
        }
      } else {
        console.log('  No open positions');
      }
    } catch (posError) {
      console.log(`  Unable to query positions: ${posError.message}`);
    }

    console.log('\n====================================');
    console.log('   Query Completed');
    console.log('====================================\n');

  } catch (error) {
    console.error('\n✗ Query failed:', error.message);
    console.error('\nPossible reasons:');
    console.error('1. API Key is not configured or invalid');
    console.error('2. API Key does not have permission to query account info');
    console.error('3. Network connection problem');
    console.error('4. API service is temporarily unavailable');

    console.log('\nPlease check configuration:');
    console.log('  node scripts/check_config.js');
    process.exit(1);
  }
}

// Run the query
if (require.main === module) {
  checkBalance()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { checkBalance };
