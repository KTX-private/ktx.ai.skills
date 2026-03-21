const KTXClient = require('../ktx_client');

async function example() {
  const client = new KTXClient();

  console.log('=== KTX Trading Operations Example ===\n');
  console.log('Note: This script requires API key with Trade permission\n');

  try {
    // 1. Query account balance
    console.log('1. Query account balance:');
    const accounts = await client.getAccounts();
    console.log('   Account Balance:');
    accounts.forEach(account => {
      if (parseFloat(account.available) > 0 || parseFloat(account.frozen) > 0) {
        console.log(`   ${account.currency}: Available ${account.available}, Frozen ${account.frozen}`);
      }
    });
    console.log();

    // 2. Query pending orders
    console.log('2. Query pending orders:');
    const pendingOrders = await client.getPendingOrders();
    console.log(`   Current pending orders: ${pendingOrders.length}`);
    if (pendingOrders.length > 0) {
      pendingOrders.forEach(order => {
        console.log(`   Order ID: ${order.id}, ${order.side} ${order.amount} @ ${order.price}`);
      });
    }
    console.log();

    // 3. Query order history
    console.log('3. Query order history (last 10):');
    const historyOrders = await client.getHistoryOrders({ limit: 10 });
    console.log(`   Retrieved: ${historyOrders.length} order records`);
    historyOrders.forEach(order => {
      console.log(`   Order ID: ${order.id}, ${order.side} ${order.amount} @ ${order.price}, Status: ${order.status}`);
    });
    console.log();

    // 4. Query trade fills
    console.log('4. Query trade fills (last 10):');
    const fills = await client.getFills({ limit: 10 });
    console.log(`   Retrieved: ${fills.length} fill records`);
    fills.forEach(fill => {
      const side = fill.side === 'buy' ? 'BUY' : 'SELL';
      console.log(`   ${new Date(fill.create_time).toLocaleString()} ${side} ${fill.fee_currency} ${fill.amount} @ ${fill.price}, Fee: ${fill.fee}`);
    });
    console.log();

    // 5. Query positions (for futures)
    console.log('5. Query positions:');
    const positions = await client.getPositions();
    console.log(`   Current positions: ${positions.length}`);
    if (positions.length > 0) {
      positions.forEach(position => {
        console.log(`   Trading Pair: ${position.symbol}, Position Size: ${position.size}, Unrealized PnL: ${position.unrealized_pnl}`);
      });
    }
    console.log();

    // 6. Example: Limit buy (demo only, not actually executed)
    console.log('6. Limit buy example (demo only, not actually executed):');
    console.log('   Client method examples:');
    console.log('   await client.buyLimit("BTC_USDT", 0.01, 50000);');
    console.log('   OR');
    console.log('   await client.createOrder({');
    console.log('     symbol: "BTC_USDT",');
    console.log('     side: "buy",');
    console.log('     type: "limit",');
    console.log('     amount: "0.01",');
    console.log('     price: "50000"');
    console.log('   });');
    console.log();

    // 7. Example: Market sell (demo only, not actually executed)
    console.log('7. Market sell example (demo only, not actually executed):');
    console.log('   Client method examples:');
    console.log('   await client.sellMarket("ETH_USDT", 0.5);');
    console.log('   OR');
    console.log('   await client.createOrder({');
    console.log('     symbol: "ETH_USDT",');
    console.log('     side: "sell",');
    console.log('     type: "market",');
    console.log('     amount: "0.5"');
    console.log('   });');
    console.log();

    // 8. Example: Cancel order (demo only, not actually executed)
    console.log('8. Cancel order example (demo only, not actually executed):');
    console.log('   Cancel single order:');
    console.log('   await client.cancelOrder(123456);');
    console.log('   OR');
    console.log('   Batch cancel orders:');
    console.log('   await client.cancelOrders([123456, 123457, 123458]);');
    console.log('   OR');
    console.log('   Cancel all orders:');
    console.log('   await client.cancelAllOrders();');
    console.log('   Cancel all orders for specific trading pair:');
    console.log('   await client.cancelAllOrders("BTC_USDT");');
    console.log();

    // 9. Example: Asset transfer (demo only, not actually executed)
    console.log('9. Asset transfer example (demo only, not actually executed):');
    console.log('   Transfer from wallet to trading account:');
    console.log('   await client.transfer({');
    console.log('     coin: "USDT",');
    console.log('     amount: "100",');
    console.log('     direction: "main_to_trade"');
    console.log('   });');
    console.log('   Transfer from trading account to wallet:');
    console.log('   await client.transfer({');
    console.log('     coin: "USDT",');
    console.log('     amount: "100",');
    console.log('     direction: "trade_to_main"');
    console.log('   });');
    console.log();

    console.log('=== Example Execution Completed ===');
    console.log('\nRisk Warning:');
    console.log('- Test in test environment before actual trading');
    console.log('- Start with small amounts, verify before large transactions');
    console.log('- Carefully verify order parameters before submission');
    console.log('- Recommend setting stop-loss limits to control risk');

  } catch (error) {
    console.error('Error:', error.message);
    console.error('\nPossible reasons:');
    console.error('1. Insufficient API key permission (Trade permission required)');
    console.error('2. Incorrect API key configuration');
    console.error('3. Network connection issues');
    console.error('4. Insufficient account balance');
    process.exit(1);
  }
}

// Run example
example();
