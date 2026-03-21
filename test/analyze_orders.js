const { KTXClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXClient();

  const result = await client.getPendingOrders();

  let orders = [];
  if (Array.isArray(result)) {
    orders = result;
  } else if (result && Array.isArray(result.result)) {
    orders = result.result;
  }

  console.log('Analyzing existing orders...\n');

  orders.forEach((order, index) => {
    console.log(`Order ${index + 1}:`);
    console.log(JSON.stringify(order, null, 2));
    console.log();
  });

  if (orders.length > 0) {
    const sampleOrder = orders[0];
    console.log('Key observations:');
    console.log(`- Uses 'product' field: ${sampleOrder.product}`);
    console.log(`- Uses 'quantity' field: ${sampleOrder.quantity}`);
    console.log(`- Uses 'price' field: ${sampleOrder.price}`);
    console.log(`- Price format: ${sampleOrder.price}`);
    console.log(`- Quantity format: ${sampleOrder.quantity}`);
  }
}

main().catch(error => {
  console.error('Error:', error.message);
});
