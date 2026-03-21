const { KTXPrivateClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPrivateClient();

  console.log('=== Testing Skill Methods ===\n');

  // Test 1: Check client properties
  console.log('1. Client properties:');
  console.log('   Has config:', !!client.config);
  console.log('   Has privateClient:', !!client.privateClient);
  console.log();

  // Test 2: Check cancelOrder method
  console.log('2. Checking cancelOrder method:');
  console.log('   Method exists:', typeof client.cancelOrder === 'function');
  console.log();

  // Test 3: Test cancelOrder
  const testOrderId = 'test_order_id';
  console.log(`3. Testing cancelOrder with ${testOrderId}...`);
  try {
    const result = await client.cancelOrder(testOrderId);
    console.log('   Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('   Error:', error.message);
  }
  console.log();

  // Test 4: Check other available methods
  console.log('4. Available methods on client:');
  const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client)).filter(
    m => typeof client[m] === 'function' && !m.startsWith('_')
  );
  methods.forEach(method => {
    console.log(`   - ${method}`);
  });

  console.log();
  console.log('✓ Skill methods test completed');
}

main().catch(error => {
  console.error('\nError:', error.message);
  process.exit(1);
});
