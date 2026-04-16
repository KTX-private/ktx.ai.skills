#!/usr/bin/env node

const { KTXPrivateClient } = require('./ktx_client');

async function testTransferEndpoint() {
  console.log('====================================');
  console.log('   Test Transfer Endpoint');
  console.log('====================================\n');

  try {
    const client = new KTXPrivateClient();

    // Test 1: Using transfer method
    console.log('🔄 Test 1: Using transfer method:');
    try {
      const result1 = await client.transfer({
        coin: 'USDT',
        amount: '100',
        direction: 'main_to_trade'
      });
      console.log('Result 1:', JSON.stringify(result1, null, 2));
    } catch (error1) {
      console.log('Error 1:', error1.message);
    }

    // Test 2: Using postUserData directly
    console.log('\n🔄 Test 2: Using postUserData directly:');
    try {
      const result2 = await client.postUserData('/v1/transfer', {
        coin: 'USDT',
        amount: '100',
        direction: 'main_to_trade'
      });
      console.log('Result 2:', JSON.stringify(result2, null, 2));
    } catch (error2) {
      console.log('Error 2:', error2.message);
    }

    // Test 3: Different endpoint variations
    console.log('\n🔄 Test 3: Testing different endpoint paths:');

    const endpoints = [
      '/v1/transfer',
      '/papi/v1/transfer',
      '/api/v1/transfer'
    ];

    for (const endpoint of endpoints) {
      console.log(`   Testing ${endpoint}...`);
      try {
        const result = await client.postUserData(endpoint, {
          coin: 'USDT',
          amount: '10',
          direction: 'main_to_trade'
        });
        console.log(`   ✓ Success:`, JSON.stringify(result));
      } catch (error) {
        console.log(`   ✗ Failed:`, error.message);
      }
    }

  } catch (error) {
    console.error('Fatal error:', error);
  }
}

testTransferEndpoint().catch(console.error);
