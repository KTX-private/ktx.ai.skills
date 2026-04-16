#!/usr/bin/env node

const { KTXPrivateClient } = require('./ktx_client');

async function testTransferParams() {
  console.log('====================================');
  console.log('   Test Transfer Parameters');
  console.log('====================================\n');

  const client = new KTXPrivateClient();

  // Test different parameter variations
  const testCases = [
    {
      name: 'coin, amount, direction',
      params: {
        coin: 'USDT',
        amount: '10',
        direction: 'main_to_trade'
      }
    },
    {
      name: 'coin_symbol, amount, direction',
      params: {
        coin_symbol: 'USDT',
        amount: '10',
        direction: 'main_to_trade'
      }
    },
    {
      name: 'currency, amount, direction',
      params: {
        currency: 'USDT',
        amount: '10',
        direction: 'main_to_trade'
      }
    },
    {
      name: 'asset, amount, direction',
      params: {
        asset: 'USDT',
        amount: '10',
        direction: 'main_to_trade'
      }
    },
    {
      name: 'symbol, amount, direction',
      params: {
        symbol: 'USDT',
        amount: '10',
        direction: 'main_to_trade'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🔄 Testing: ${testCase.name}`);
    console.log(`   Params:`, JSON.stringify(testCase.params));

    try {
      const result = await client.postUserData('/v1/transfer', testCase.params);
      console.log(`   Result:`, JSON.stringify(result));
    } catch (error) {
      console.log(`   Error:`, error.message);
    }
  }
}

testTransferParams().catch(console.error);
