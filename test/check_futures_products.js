const { KTXPublicClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXPublicClient();

  console.log('Querying all products...\n');

  try {
    const products = await client.getProducts();

    console.log('All products:');
    console.log(JSON.stringify(products, null, 2));

    // Filter for BTC products
    if (Array.isArray(products)) {
      const btcProducts = products.filter(p => (p.symbol || p.product || '').toUpperCase().includes('BTC'));

      console.log('\n=== BTC Products ===\n');
      btcProducts.forEach((product, i) => {
        console.log(`${i + 1}. ${JSON.stringify(product, null, 2)}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().catch(error => {
  console.error('\nError:', error.message);
  process.exit(1);
});
