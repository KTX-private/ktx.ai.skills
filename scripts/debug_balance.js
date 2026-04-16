#!/usr/bin/env node

const { KTXPrivateClient } = require('./ktx_client');

/**
 * Debug account balance query
 */
async function debugBalance() {
  console.log('====================================');
  console.log('   Debug Balance Query');
  console.log('====================================\n');

  try {
    const client = new KTXPrivateClient();

    // Query main wallet accounts
    console.log('📊 Main Wallet Accounts (Raw Response):');
    const mainAccounts = await client.getMainAccounts();
    console.log('Response:', JSON.stringify(mainAccounts, null, 2));

    // Query trading accounts
    console.log('\n📈 Trading Accounts (Raw Response):');
    const tradingAccounts = await client.getAccounts();
    console.log('Response:', JSON.stringify(tradingAccounts, null, 2));

    // Query positions
    console.log('\n🎯 Positions (Raw Response):');
    const positions = await client.getPositions();
    console.log('Response:', JSON.stringify(positions, null, 2));

  } catch (error) {
    console.error('\n✗ Query failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the debug
debugBalance().catch(console.error);
