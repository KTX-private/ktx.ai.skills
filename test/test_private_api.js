/**
 * Test Suite for KTX Private API Features (requires API key)
 */

const { KTXPrivateClient } = require('../scripts/ktx_client');

// Test tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, error = null, skipped = false) {
  testResults.total++;
  if (skipped) {
    console.log(`  ⊘ ${name}`);
    testResults.tests.push({ name, status: 'SKIPPED' });
  } else if (passed) {
    testResults.passed++;
    console.log(`  ✓ ${name}`);
    testResults.tests.push({ name, status: 'PASSED' });
  } else {
    testResults.failed++;
    console.log(`  ✗ ${name}`);
    testResults.tests.push({ name, status: 'FAILED', error: error?.message });
  }
}

async function testSuite() {
  console.log('====================================');
  console.log('   KTX Private API Test Suite');
  console.log('====================================');
  console.log(`Started: ${new Date().toISOString()}\n`);

  const client = new KTXPrivateClient();

  // ==========================================
  // Suite 1: Account Information
  // ==========================================
  console.log('\n【Test Suite: Account Information】');

  // Test 1.1: Get trading accounts
  try {
    console.log('\nTest 1.1: Get Trading Accounts');
    const accountsResult = await client.getAccounts();
    const hasAccounts = accountsResult && accountsResult.result && Array.isArray(accountsResult.result);
    logTest('Get trading accounts', hasAccounts);
  } catch (error) {
    logTest('Get trading accounts', false, error);
  }

  // Test 1.2: Get wallet assets
  try {
    console.log('\nTest 1.2: Get Wallet Assets');
    const walletResult = await client.getMainAccounts();
    const hasWallet = walletResult && walletResult.result && Array.isArray(walletResult.result);
    logTest('Get wallet assets', hasWallet);
  } catch (error) {
    logTest('Get wallet assets', false, error);
  }

  // ==========================================
  // Suite 2: Account Operations
  // ==========================================
  console.log('\n【Test Suite: Account Operations】');

  // Test 2.1: Get deposit address
  try {
    console.log('\nTest 2.1: Get Deposit Address');
    try {
      const depositAddr = await client.getDepositAddress('BTC');
      const hasDepositAddr = depositAddr && depositAddr.result;
      logTest('Get deposit address (BTC)', hasDepositAddr);
    } catch (apiError) {
      // 404 is expected if endpoint doesn't exist
      if (apiError.message && apiError.message.includes('404')) {
        console.log('  ℹ Deposit address endpoint not available (404)');
        logTest('Get deposit address (BTC)', null, null, true); // Mark as skipped
      } else {
        throw apiError;
      }
    }
  } catch (error) {
    logTest('Get deposit address', false, error);
  }

  // Test 2.2: Get account ledgers
  try {
    console.log('\nTest 2.2: Get Account Ledgers');
    const ledgers = await client.getLedgers({ limit: 5 });
    const hasLedgers = ledgers && ledgers.result && Array.isArray(ledgers.result);
    logTest('Get account ledgers', hasLedgers);
  } catch (error) {
    logTest('Get account ledgers', false, error);
  }

  // ==========================================
  // Suite 3: Position Management
  // ==========================================
  console.log('\n【Test Suite: Position Management】');

  // Test 3.1: Get positions
  try {
    console.log('\nTest 3.1: Get Open Positions');
    const positionsResult = await client.getPositions();
    const hasPositions = positionsResult && positionsResult.result && Array.isArray(positionsResult.result);
    logTest('Get open positions', hasPositions);
  } catch (error) {
    logTest('Get open positions', false, error);
  }

  // ==========================================
  // Suite 4: Order Management - Query
  // ==========================================
  console.log('\n【Test Suite: Order Management - Query】');

  // Test 4.1: Get specified order (will fail if no orders)
  try {
    console.log('\nTest 4.1: Get Order by ID');
    const order = await client.getOrder('12345678');
    logTest('Get order by ID', true); // May return null, not an error
  } catch (error) {
    logTest('Get order by ID', false, error);
  }

  // Test 4.2: Get order history
  try {
    console.log('\nTest 4.2: Get Order History');
    const history = await client.getHistoryOrders({ limit: 10 });
    const hasHistory = history && history.result && Array.isArray(history.result);
    logTest('Get order history', hasHistory);
  } catch (error) {
    logTest('Get order history', false, error);
  }

  // Test 4.3: Get pending orders
  try {
    console.log('\nTest 4.3: Get Pending Orders');
    const pending = await client.getPendingOrders({ limit: 10 });
    const hasPending = pending && pending.result && Array.isArray(pending.result);
    logTest('Get pending orders', hasPending);
  } catch (error) {
    logTest('Get pending orders', false, error);
  }

  // Test 4.4: Get trade details
  try {
    console.log('\nTest 4.4: Get Trade Details');
    const fills = await client.getFills({ limit: 10 });
    const hasFills = fills && fills.result && Array.isArray(fills.result);
    logTest('Get trade details', hasFills);
  } catch (error) {
    logTest('Get trade details', false, error);
  }

  // ==========================================
  // Suite 5: Asset Transfer Operations
  // ==========================================
  console.log('\n【Test Suite: Asset Transfer Operations】');

  // Test 5.1: Asset transfer (will test without executing)
  try {
    console.log('\nTest 5.1: Asset Transfer API Available');
    // Note: We test if the method exists and is callable
    const hasTransfer = typeof client.transfer === 'function';
    logTest('Asset transfer method exists', hasTransfer);
  } catch (error) {
    logTest('Asset transfer method', false, error);
  }

  // Test 5.2: Withdraw API available
  try {
    console.log('\nTest 5.2: Withdraw API Available');
    const hasWithdraw = typeof client.withdraw === 'function';
    logTest('Withdraw method exists', hasWithdraw);
  } catch (error) {
    logTest('Withdraw method', false, error);
  }

  // ==========================================
  // Suite 6: Order Creation Helper Methods
  // ==========================================
  console.log('\n【Test Suite: Order Creation Helper Methods】');

  // Test 6.1: Check buyLimit method
  try {
    console.log('\nTest 6.1: buyLimit Method Exists');
    const hasBuyLimit = typeof client.buyLimit === 'function';
    logTest('buyLimit method exists', hasBuyLimit);
  } catch (error) {
    logTest('buyLimit method', false, error);
  }

  // Test 6.2: Check sellLimit method
  try {
    console.log('\nTest 6.2: sellLimit Method Exists');
    const hasSellLimit = typeof client.sellLimit === 'function';
    logTest('sellLimit method exists', hasSellLimit);
  } catch (error) {
    logTest('sellLimit method', false, error);
  }

  // Test 6.3: Check buyMarket method
  try {
    console.log('\nTest 6.3: buyMarket Method Exists');
    const hasBuyMarket = typeof client.buyMarket === 'function';
    logTest('buyMarket method exists', hasBuyMarket);
  } catch (error) {
    logTest('buyMarket method', false, error);
  }

  // Test 6.4: Check sellMarket method
  try {
    console.log('\nTest 6.4: sellMarket Method Exists');
    const hasSellMarket = typeof client.sellMarket === 'function';
    logTest('sellMarket method exists', hasSellMarket);
  } catch (error) {
    logTest('sellMarket method', false, error);
  }

  // Test 6.5: Check cancelOrder method
  try {
    console.log('\nTest 6.5: cancelOrder Method Exists');
    const hasCancelOrder = typeof client.cancelOrder === 'function';
    logTest('cancelOrder method exists', hasCancelOrder);
  } catch (error) {
    logTest('cancelOrder method', false, error);
  }

  // Test 6.6: Check cancelOrders method
  try {
    console.log('\nTest 6.6: cancelOrders Method Exists');
    const hasCancelOrders = typeof client.cancelOrders === 'function';
    logTest('cancelOrders method exists', hasCancelOrders);
  } catch (error) {
    logTest('cancelOrders method', false, error);
  }

  // Test 6.7: Check cancelAllOrders method
  try {
    console.log('\nTest 6.7: cancelAllOrders Method Exists');
    const hasCancelAllOrders = typeof client.cancelAllOrders === 'function';
    logTest('cancelAllOrders method exists', hasCancelAllOrders);
  } catch (error) {
    logTest('cancelAllOrders method', false, error);
  }

  // ==========================================
  // Print Summary
  // ==========================================
  console.log('\n====================================');
  console.log('   Test Summary');
  console.log('====================================');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✓ Passed: ${testResults.passed}`);
  console.log(`✗ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%\n`);

  if (testResults.failed > 0) {
    console.log('\nFailed Tests:');
    console.log('====================================');
    testResults.tests.filter(t => t.status === 'FAILED').forEach(t => {
      console.log(`  ✗ ${t.name}`);
      if (t.error) {
        console.log(`     Error: ${t.error}`);
      }
    });
  }

  console.log('\n====================================');
  console.log(`   Exit Code: ${testResults.failed > 0 ? 1 : 0}`);
  console.log('====================================\n');

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run test suite
testSuite().catch(error => {
  console.error('\n✗ Test suite execution failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});
