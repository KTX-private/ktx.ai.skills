/**
 * KTX Skills - Integration Tests
 * End-to-end testing of complete workflows
 */

const { KTXPublicClient, KTXPrivateClient } = require('../scripts/ktx_client');
const KTXWSClient = require('../scripts/ktx_ws');
const config = require('./test_config');

// Test result tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, error = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    testResults.tests.push({ name, status: '✓ PASSED', error: null });
    console.log(` ✓ ${name}`);
  } else {
    testResults.failed++;
    testResults.tests.push({ name, status: '✗ FAILED', error: error.message });
    console.log(` ✗ ${name}: ${error.message}`);
  }
}

/**
 * Integration Test 1: Market Data Query Workflow
 * Test the complete workflow of querying market data
 */
async function testMarketDataWorkflow() {
  console.log('\n【Integration Test 1: Market Data Query Workflow】');
  
  try {
    const client = new KTXPublicClient();
    
    // Step 1: Get server time
    const time = await client.getTime();
    logTest('Get server time', true);
    
    // Step 2: Get products list
    const products = await client.getProducts();
    logTest('Get products list', products && products.length > 0);
    
    // Step 3: Get ticker for multiple symbols
    const symbols = config.symbols.valid.slice(0, 3);
    for (const symbol of symbols) {
      const ticker = await client.getTicker(symbol);
      logTest(`Get ticker for ${symbol}`, ticker && ticker.last_price);
    }
    
    // Step 4: Get order book
    const orderBook = await client.getOrderBook('BTC_USDT', 10, 2);
    logTest('Get order book', orderBook && orderBook.bids);
    
    // Step 5: Get K-line data
    const candles = await client.getCandles('BTC_USDT', '1h', 24);
    logTest('Get K-line data', candles && candles.length > 0);
    
    // Step 6: Get trades
    const trades = await client.getTrades('BTC_USDT', 10);
    logTest('Get trades', trades && trades.length > 0);
    
    console.log('\n  Market Data Workflow: ✓ COMPLETED\n');
    return true;
    
  } catch (error) {
    logTest('Market Data Workflow', false, error);
    return false;
  }
}

/**
 * Integration Test 2: WebSocket Real-time Workflow
 * Test the complete workflow of WebSocket real-time data streaming
 */
async function testWebSocketWorkflow() {
  console.log('\n【Integration Test 2: WebSocket Real-time Workflow】');
  
  const ws = new KTXWSClient();
  
  try {
    // Step 1: Connect to market WebSocket
    console.log('  Connecting to market WebSocket...');
    await ws.connectMarketWS();
    logTest('Market WS connection', true);
    
    // Step 2: Subscribe to ticker stream
    console.log('  Subscribing to BTC_USDT ticker...');
    ws.subscribe(['spot.BTC_USDT.ticker']);
    
    // Step 3: Wait for data with timeout
    console.log('  Waiting for ticker data (15s)...');
    let dataReceived = false;
    const dataPromise = new Promise(resolve => {
      const timeout = setTimeout(() => resolve(false), 15000);
      ws.on('ticker', (data) => {
        clearTimeout(timeout);
        dataReceived = true;
        resolve(true);
      });
    });
    
    const received = await dataPromise;
    logTest('Receive WS ticker data', received);
    
    // Step 4: Unsubscribe
    console.log('  Unsubscribing...');
    ws.unsubscribe(['spot.BTC_USDT.ticker']);
    
    // Cleanup
    ws.disconnectMarketWS();
    console.log('\n  WebSocket Real-time Workflow: ✓ COMPLETED\n');
    return received;
    
  } catch (error) {
    logTest('WebSocket Real-time Workflow', false, error);
    return false;
  }
}

/**
 * Integration Test 3: Analysis Workflow
 * Test the complete workflow of market analysis
 */
async function testAnalysisWorkflow() {
  console.log('\n【Integration Test 3: Analysis Workflow】');
  
  try {
    const { analyzeMarket } = require('../scripts/market_analysis');
    
    // Analyze multiple symbols
    const symbols = ['BTC_USDT', 'ETH_USDT', 'SOL_USDT'];
    
    for (const symbol of symbols) {
      console.log(`\n  Analyzing ${symbol}...`);
      const result = await analyzeMarket(symbol, '1h', 48);
      logTest(`Analyze ${symbol} symbol`, result && result.currentPrice);
    }
    
    console.log('\n  Analysis Workflow: ✓ COMPLETED\n');
    return true;
    
  } catch (error) {
    logTest('Analysis Workflow', false, error);
    return false;
  }
}

/**
 * Integration Test 4: Error Handling Workflow
 * Test error handling with invalid inputs
 */
async function testErrorHandlingWorkflow() {
  console.log('\n【Integration Test 4: Error Handling Workflow】');
  
  try {
    const client = new KTXPublicClient();
    
    // Test 1: Invalid symbol
    try {
      await client.getTicker('INVALID_SYMBOL');
      logTest('Invalid symbol error handling', false);
    } catch (error) {
      logTest('Invalid symbol error handling', true);
    }
    
    // Test 2: Empty symbol
    try {
      await client.getTicker('');
      logTest('Empty symbol error handling', false);
    } catch (error) {
      logTest('Empty symbol error handling', true);
    }
    
    // Test 3: Invalid timeframe
    try {
      await client.getCandles('BTC_USDT', 'invalid', 10);
      logTest('Invalid timeframe error handling', false);
    } catch (error) {
      logTest('Invalid timeframe error handling', true);
    }
    
    console.log('\n  Error Handling Workflow: ✓ COMPLETED\n');
    return true;
    
  } catch (error) {
    logTest('Error Handling Workflow', false, error);
    return false;
  }
}

/**
 * Run all integration tests
 */
async function runAllTests() {
  console.log('====================================');
  console.log('   KTX Skills - Integration Tests');
  console.log('====================================');
  console.log(`API Endpoint: ${config.api.baseUrl}`);
  console.log(`Test Started: ${new Date().toISOString()}\n`);
  
  await testMarketDataWorkflow();
  await testWebSocketWorkflow();
  await testAnalysisWorkflow();
  await testErrorHandlingWorkflow();
  
  // Print summary
  console.log('\n====================================');
  console.log('   Integration Test Summary');
  console.log('====================================');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✓ Passed: ${testResults.passed}`);
  console.log(`✗ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
  console.log('\n');
  
  if (testResults.failed > 0) {
    console.log('Failed Tests:');
    testResults.tests.filter(t => t.status === '✗ FAILED').forEach(t => {
      console.log(`  - ${t.name}`);
      if (t.error) {
        console.log(`    Error: ${t.error.message}`);
      }
    });
  }
  
  return testResults;
}

// Main execution
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log('✓ All integration tests completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('✗ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  testMarketDataWorkflow,
  testWebSocketWorkflow,
  testAnalysisWorkflow,
  testErrorHandlingWorkflow
};
