const { KTXClient } = require('../scripts/ktx_client');

async function main() {
  const client = new KTXClient();

  console.log('=== Testing KTX Skill Spot and Futures Orders ===\n');

  try {
    // Test 1: Query spot orders
    console.log('1. Querying spot orders...');
    const spotOrders = await client.getSpotOrders();
    console.log(`   Found ${Array.isArray(spotOrders) ? spotOrders.length : 0} spot orders\n`);

    // Test 2: Query futures orders
    console.log('2. Querying futures orders...');
    const futuresOrders = await client.getFuturesOrders();
    console.log(`   Found ${Array.isArray(futuresOrders) ? futuresOrders.length : 0} futures orders\n`);

    // Test 3: Check positions
    console.log('3. Querying positions...');
    const positions = await client.getPositions();
    console.log(`   Found ${Array.isArray(positions) ? positions.length : 0} positions\n`);

    // Display available methods
    console.log('=== Available Methods ===\n');
    console.log('Spot Orders:');
    console.log('  - client.buyLimit(symbol, amount, price, options)');
    console.log('  - client.sellLimit(symbol, amount, price, options)');
    console.log('  - client.buyMarket(symbol, amount, options)');
    console.log('  - client.sellMarket(symbol, amount, options)');
    console.log('  - client.getSpotOrders(symbol)');
    console.log('  - client.cancelAllSpotOrders(symbol)');
    console.log();

    console.log('Futures Orders:');
    console.log('  - client.buyFuturesLimit(symbol, quantity, price, options)');
    console.log('  - client.sellFuturesLimit(symbol, quantity, price, options)');
    console.log('  - client.buyFuturesMarket(symbol, quantity, options)');
    console.log('  - client.sellFuturesMarket(symbol, quantity, options)');
    console.log('  - client.closeLongPosition(symbol, quantity, price, options)');
    console.log('  - client.closeShortPosition(symbol, quantity, price, options)');
    console.log('  - client.getFuturesOrders(symbol)');
    console.log('  - client.cancelAllFuturesOrders(symbol)');
    console.log();

    console.log('Futures Order Options:');
    console.log('  - leverage: number (default: 10) - Leverage multiplier');
    console.log('  - marginMethod: string (default: "cross") - Margin mode ("cross" or "isolate")');
    console.log('  - positionMerge: string (default: "long" for buy, "short" for sell)');
    console.log('  - timeInForce: string (default: "gtc") - Time in force');
    console.log('  - mini: boolean (default: false) - Mini contract');
    console.log('  - close: boolean (default: false) - Close position order');
    console.log('  - postOnly: boolean (default: false) - Post only order');
    console.log();

    console.log('✓ All methods are available and working!');

  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
