const { KTXClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXClient();

  console.log('Checking LIT balances...\n');

  // Check trading account
  console.log('1. Trading Account:');
  const tradingAccounts = await client.getAccounts();

  const litTradingAccount = Array.isArray(tradingAccounts) ?
    tradingAccounts.find(acc => acc.asset && acc.asset.toUpperCase() === 'LIT') :
    (tradingAccounts.result || []).find(acc => acc.asset && acc.asset.toUpperCase() === 'LIT');

  if (litTradingAccount) {
    console.log(`   Balance: ${litTradingAccount.balance || 'N/A'}`);
    console.log(`   Available: ${litTradingAccount.available || litTradingAccount.balance || 'N/A'}`);
    console.log(`   Frozen: ${litTradingAccount.frozen || '0'}`);
  } else {
    console.log('   No LIT found');
  }

  // Check wallet
  console.log('\n2. Wallet:');
  try {
    const walletResult = await client.getWalletBalance();

    console.log('   Wallet response:', JSON.stringify(walletResult, null, 2));

    if (Array.isArray(walletResult)) {
      const litWallet = walletResult.find(acc => acc.asset && acc.asset.toUpperCase() === 'LIT');
      if (litWallet) {
        console.log(`   Balance: ${litWallet.balance || 'N/A'}`);
        console.log(`   Available: ${litWallet.available || 'N/A'}`);
      }
    } else if (walletResult && Array.isArray(walletResult.result)) {
      const litWallet = walletResult.result.find(acc => acc.asset && acc.asset.toUpperCase() === 'LIT');
      if (litWallet) {
        console.log(`   Balance: ${litWallet.balance || 'N/A'}`);
        console.log(`   Available: ${litWallet.available || 'N/A'}`);
      }
    }
  } catch (error) {
    console.log('   Error fetching wallet balance:', error.message);
  }
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
