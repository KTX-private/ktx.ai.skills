#!/usr/bin/env node

const { KTXPrivateClient } = require('./ktx_client');

async function testTransferAll() {
  console.log('====================================');
  console.log('   Test All Transfer Methods');
  console.log('====================================\n');

  const client = new KTXPrivateClient();

  // Test 1: Check if maybe GET request is needed
  console.log('🔄 Test 1: Trying GET instead of POST');
  try {
    const result = await client.getUserData('/v1/transfer', {
      coin: 'USDT',
      amount: '10',
      direction: 'main_to_trade'
    });
    console.log('GET Result:', JSON.stringify(result));
  } catch (error) {
    console.log('GET Error:', error.message);
  }

  // Test 2: Try with additional parameters
  console.log('\n🔄 Test 2: Adding more parameters');
  try {
    const result = await client.postUserData('/v1/transfer', {
      coin: 'USDT',
      amount: '10',
      direction: 'main_to_trade',
      type: 'transfer',
      from: 'main',
      to: 'trade'
    });
    console.log('Result:', JSON.stringify(result));
  } catch (error) {
    console.log('Error:', error.message);
  }

  // Test 3: Check what parameters are required by looking at error details
  console.log('\n🔄 Test 3: Testing with minimal valid parameters');
  try {
    const result = await client.postUserData('/v1/transfer', {
      coin: 'USDT',
      amount: '10'
    });
    console.log('Result:', JSON.stringify(result));
  } catch (error) {
    console.log('Error:', error.message);
  }

  // Test 4: Try with different direction values
  console.log('\n🔄 Test 4: Testing different direction values');
  const directions = ['main_to_trade', 'trade_to_main', 'MAIN_TO_TRADE', 'TRADE_TO_MAIN', 1, 2];
  for (const dir of directions) {
    try {
      const result = await client.postUserData('/v1/transfer', {
        coin: 'USDT',
        amount: '1',
        direction: dir
      });
      console.log(`Direction "${dir}":`, JSON.stringify(result));
      if (result.state === 0) {
        console.log('✓ SUCCESS!');
        break;
      }
    } catch (error) {
      console.log(`Direction "${dir}": Error - ${error.message}`);
    }
  }
}

testTransferAll().catch(console.error);
