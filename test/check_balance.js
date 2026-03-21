const { KTXClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXClient();

  console.log('Querying account balance...\n');

  const accountsResult = await client.getAccounts();

  console.log('Trading Accounts:');
  console.log('==================\n');

  if (Array.isArray(accountsResult)) {
    accountsResult.forEach(account => {
      const balance = parseFloat(account.balance || account.available || '0');
      const currency = account.asset || account.currency || 'N/A';

      if (balance > 0 && currency.toUpperCase().includes('LIT')) {
        console.log(`${currency}:`);
        console.log(`  Balance: ${balance.toFixed(6)}`);
        console.log(`  Available: ${account.available || 'N/A'}`);
        console.log(`  Frozen: ${account.frozen || 'N/A'}`);
        console.log();
      }
    });
  } else if (accountsResult && Array.isArray(accountsResult.result)) {
    accountsResult.result.forEach(account => {
      const balance = parseFloat(account.balance || account.available || '0');
      const currency = account.asset || account.currency || 'N/A';

      if (balance > 0 && currency.toUpperCase().includes('LIT')) {
        console.log(`${currency}:`);
        console.log(`  Balance: ${balance.toFixed(6)}`);
        console.log(`  Available: ${account.available || 'N/A'}`);
        console.log(`  Frozen: ${account.frozen || 'N/A'}`);
        console.log();
      }
    });
  }

  console.log('All Trading Accounts:');
  console.log('=====================\n');

  const allAccounts = Array.isArray(accountsResult) ? accountsResult :
                     (accountsResult && Array.isArray(accountsResult.result) ? accountsResult.result : []);

  allAccounts.forEach((account, index) => {
    const balance = parseFloat(account.balance || account.available || '0');
    const currency = account.asset || account.currency || 'N/A';

    console.log(`${index + 1}. ${currency}: ${balance.toFixed(6)}`);
  });
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
