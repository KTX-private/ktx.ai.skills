/**
 * KTX WebSocket Client Unit Tests
 * Test-driven development for WebSocket functionality
 */

const KTXWSClient = require('../scripts/ktx_ws');
const config = require('./test_config');
const utils = require('./test_utils');

// Test result tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * Log test result
 */
function logTest(name, passed, error = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    testResults.tests.push({ name, status: '✓ PASSED', error: null });
    console.log(`  ✓ ${name}`);
  } else {
    testResults.failed++;
    testResults.tests.push({ name, status: '✗ FAILED', error: error.message });
    console.log(`  ✗ ${name}: ${error.message}`);
  }
}

/**
 * Test suite: Market WebSocket Connection
 */
async function testMarketWSConnection() {
  console.log('\n【Test Suite: Market WebSocket Connection】');
  const ws = new KTXWSClient();
  
  try {
    console.log('  Connecting to market WebSocket...');
    await ws.connectMarketWS();
    
    logTest('Market WS connection', true);
  } catch (error) {
    logTest('Market WS connection', false, error);
  }
  
  // Cleanup
  try {
    ws.disconnectMarketWS();
  } catch (e) {
    // Ignore cleanup errors
  }
}

/**
 * Test suite: User WebSocket Connection
 */
async function testUserWSConnection() {
  console.log('\n【Test Suite: User WebSocket Connection】');
  const ws = new KTXWSClient();
  
  try {
    console.log('  Connecting to user WebSocket...');
    await ws.connectUserWS();
    
    logTest('User WS connection', true);
  } catch (error) {
    logTest('User WS connection', false, error);
  }
  
  // Cleanup
  try {
    ws.disconnectUserWS();
  } catch (e) {
    // Ignore cleanup errors
  }
}

/**
 * Test suite: Market Stream Subscription
 */
async function testMarketSubscription() {
  console.log('\n【Test Suite: Market Stream Subscription】');
  const ws = new KTXWSClient();
  
  try {
    // Connect first
    await ws.connectMarketWS();
    
    // Subscribe to ticker stream
    console.log('  Subscribing to ticker stream...');
    ws.on('ticker', (data) => {
      console.log(`  ✓ Received ticker data`);
      ws.disconnectMarketWS();
    });
    
    ws.subscribe(['spot.BTC_USDT.ticker']);
    
    // Wait for data with timeout
    const received = await Promise.race([
      new Promise(resolve => ws.on('ticker', resolve)),
      utils.delay(config.timeouts.medium)
    ]);
    
    if (received) {
      logTest('Market subscription', true);
    } else {
      logTest('Market subscription', false, new Error('Timeout waiting for ticker data'));
    }
  } catch (error) {
    logTest('Market subscription', false, error);
  } finally {
    try {
      ws.disconnectMarketWS();
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Test suite: User Data Subscription
 */
async function testUserSubscription() {
  console.log('\n【Test Suite: User Data Subscription】');
  const ws = new KTXWSClient();
  
  try {
    // Connect first
    await ws.connectUserWS();
    
    // Login with test credentials (will fail, but test the mechanism)
    console.log('  Testing login mechanism...');
    
    try {
      ws.loginUser('test_api_key', 'test_api_secret');
      await utils.delay(config.timeouts.short);
      logTest('User login mechanism', false, new Error('Expected to fail with invalid credentials'));
    } catch (error) {
      // Expected to fail
      logTest('User login mechanism', true);
    }
  } catch (error) {
    logTest('User subscription setup', false, error);
  } finally {
    try {
      ws.disconnectUserWS();
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Test suite: Auto-reconnection
 */
async function testAutoReconnection() {
  console.log('\n【Test Suite: Auto-reconnection】');
  const ws = new KTXWSClient();
  
  try {
    // Connect and disconnect multiple times
    console.log('  Test 1: Initial connection...');
    await ws.connectMarketWS();
    ws.disconnectMarketWS();
    await utils.delay(1000);
    
    console.log('  Test 2: Reconnection...');
    await ws.connectMarketWS();
    ws.disconnectMarketWS();
    await utils.delay(1000);
    
    console.log('  Test 3: Third connection...');
    await ws.connectMarketWS();
    ws.disconnectMarketWS();
    
    logTest('Auto-reconnection mechanism', true);
  } catch (error) {
    logTest('Auto-reconnection mechanism', false, error);
  }
}

/**
 * Test suite: Heartbeat Mechanism
 */
async function testHeartbeat() {
  console.log('\n【Test Suite: Heartbeat Mechanism】');
  const ws = new KTXWSClient();
  
  try {
    // Connect
    await ws.connectMarketWS();
    
    // Wait for heartbeat (30s interval)
    console.log('  Waiting for heartbeat (35s)...');
    await utils.delay(35000);
    
    // Check if still connected
    if (ws.marketWS && ws.marketWS.readyState === 1) {
      logTest('Heartbeat mechanism', true);
    } else {
      logTest('Heartbeat mechanism', false, new Error('Connection lost during heartbeat period'));
    }
    
  } catch (error) {
    logTest('Heartbeat mechanism', false, error);
  } finally {
    try {
      ws.disconnectMarketWS();
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Run all WebSocket tests
 */
async function runAllTests() {
  console.log('====================================');
  console.log('   KTX WebSocket Unit Tests');
  console.log('====================================');
  console.log(`WS Market: ${config.api.wsMarket}`);
  console.log(`WS User: ${config.api.wsUser}`);
  console.log(`Test Started: ${new Date().toISOString()}\n`);
  
  await testMarketWSConnection();
  await testUserWSConnection();
  await testMarketSubscription();
  await testUserSubscription();
  await testAutoReconnection();
  await testHeartbeat();
  
  // Print summary
  console.log('\n====================================');
  console.log('   Test Summary');
  console.log('====================================');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✓ Passed: ${testResults.passed}`);
  console.log(`✗ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
  console.log('\n');
  
  if (testResults.failed > 0) {
    console.log('Failed Tests:');
    testResults.tests.filter(t => t.status === '✗ FAILED').forEach(t => {
      console.log(`  - ${t.name}: ${t.error.message}`);
    });
    console.log('');
  }
  
  return testResults;
}

// Main execution
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log('✓ All tests completed!');
      process.exit(testResults.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('✗ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  testMarketWSConnection,
  testUserWSConnection,
  testMarketSubscription,
  testUserSubscription,
  testAutoReconnection,
  testHeartbeat
};
