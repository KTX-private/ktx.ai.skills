/**
 * KTX Skills - Test Runner (REST API Only)
 * Execute REST API test suites only (skip WebSocket tests)
 */

const testClient = require('./test_client');

// Test tracking
let allResults = {
  total: 0,
  passed: 0,
  failed: 0,
  suites: []
};

/**
 * Execute test suite
 */
async function executeTestSuite(suiteName, testFn) {
  console.log('\n====================================');
  console.log(`   ${suiteName}`);
  console.log('====================================\n');
  
  const startTime = Date.now();
  let suitePassed = 0;
  let suiteFailed = 0;
  let suiteTests = [];
  
  try {
    const results = await testFn();
    
    if (results && results.tests) {
      suitePassed = results.passed;
      suiteFailed = results.failed;
      suiteTests = results.tests;
    }
    
    const duration = Date.now() - startTime;
    
    console.log(`✓ ${suiteName} completed in ${duration}ms`);
  } catch (error) {
    suiteFailed++;
    suiteTests.push({
      name: suiteName,
      status: '✗ FAILED',
      error: error.message
    });
    console.error(`✗ ${suiteName} failed: ${error.message}`);
  }
  
  allResults.total += suitePassed + suiteFailed;
  allResults.passed += suitePassed;
  allResults.failed += suiteFailed;
  allResults.suites.push({
    name: suiteName,
    passed: suitePassed,
    failed: suiteFailed,
    duration: Date.now() - startTime
  });
}

/**
 * Main test runner
 */
async function main() {
  console.log('====================================');
  console.log('   KTX Skills - Test Runner (REST API Only)');
  console.log('====================================');
  console.log(`Started: ${new Date().toISOString()}\n`);
  
  const startTime = Date.now();
  
  // Execute REST API test suites only
  await executeTestSuite('REST API Client Tests', testClient.runAllTests);
  
  const totalDuration = Date.now() - startTime;
  
  // Print overall summary
  console.log('\n====================================');
  console.log('   Overall Test Summary');
  console.log('====================================');
  console.log(`Total Duration: ${totalDuration}ms (${(totalDuration/1000).toFixed(2)}s)`);
  console.log(`\nTotal Tests: ${allResults.total}`);
  console.log(`✓ Passed: ${allResults.passed}`);
  console.log(`✗ Failed: ${allResults.failed}`);
  console.log(`Success Rate: ${((allResults.passed / allResults.total) * 100).toFixed(2)}%\n`);
  
  // Suite breakdown
  console.log('Suite Breakdown:');
  console.log('====================================');
  allResults.suites.forEach(suite => {
    const status = suite.failed === 0 ? '✓' : '✗';
    const rate = ((suite.passed / (suite.passed + suite.failed)) * 100).toFixed(2);
    console.log(`  ${status} ${suite.name}: ${suite.passed}/${suite.passed + suite.failed} passed (${rate}%)`);
  });
  
  console.log('\n');
  
  // List failed tests
  if (allResults.failed > 0) {
    console.log('Failed Tests:');
    console.log('====================================');
    const results = await testClient.runAllTests();
    results.tests.filter(t => t.status === '✗ FAILED').forEach(t => {
      console.log(`  - ${t.name}: ${t.error}`);
    });
    console.log('');
  }
  
  // Exit with appropriate code
  const exitCode = allResults.failed > 0 ? 1 : 0;
  console.log(`✓ Test suite completed with exit code: ${exitCode}`);
  
  process.exit(exitCode);
}

// Check if running as module
if (require.main === module) {
  main();
}

module.exports = {
  main,
  executeTestSuite
};
