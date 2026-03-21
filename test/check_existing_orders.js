const { KTXClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXClient();

  console.log('Checking existing order parameters...\n');

  const result = await client.getPendingOrders();
  const orders = result || [];

  if (orders.length > 0) {
    console.log('Sample order structure:');
    console.log(JSON.stringify(orders[0], null, 2));
    console.log();

    console.log(`Price: ${orders[0].price}`);
    console.log(`Quantity: ${orders[0].quantity}`);
    console.log(`Product: ${orders[0].product}`);
    console.log(`Price precision: ${orders[0].price.split('.')[1] ? orders[0].price.split('.')[1].length : 0}`);
    console.log(`Quantity precision: ${orders[0].quantity.split('.')[1] ? orders[0].quantity.split('.')[1].length : 0}`);
  } else {
    console.log('No pending orders');
  }
}

main().catch(error => {
  console.error('Error:', error.message);
});
