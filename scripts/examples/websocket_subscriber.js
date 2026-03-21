const KTXWSClient = require('../ktx_ws');
const KTXClient = require('../ktx_client');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(require('os').homedir(), '.ktx_exchange_config.json');

async function example() {
  const ws = new KTXWSClient();

  console.log('=== KTX WebSocket Subscription Example ===\n');

  try {
    // 1. Connect to market WebSocket
    console.log('1. Connecting to market WebSocket...');
    await ws.connectMarketWS();
    console.log('   ✓ Connected\n');

    // 2. Subscribe to BTC_USDT order book
    console.log('2. Subscribe to BTC_USDT order book...');
    ws.subscribe(['spot.BTC_USDT.order_book.5']);
    ws.on('order_book', (data) => {
      console.log('   [Order Book Update]', data.stream);
      console.log(`   Bids: ${JSON.stringify(data.result.bids.slice(0, 2))}`);
      console.log(`   Asks: ${JSON.stringify(data.result.asks.slice(0, 2))}`);
    });
    console.log('   ✓ Subscribed\n');

    // 3. Subscribe to ETH_USDT trades
    console.log('3. Subscribe to ETH_USDT trades...');
    ws.subscribe(['spot.ETH_USDT.trades']);
    ws.on('trades', (data) => {
      const trade = data.result[0];
      const side = trade.side === 'buy' ? 'BUY' : 'SELL';
      console.log('   [Trade Record]', data.stream);
      console.log(`   ${side} ${trade.amount} @ ${trade.price}`);
    });
    console.log('   ✓ Subscribed\n');

    // 4. Subscribe to BTC_USDT K-line data
    console.log('4. Subscribe to BTC_USDT 5-minute K-line...');
    ws.subscribe(['spot.BTC_USDT.candles.5m']);
    ws.on('candles', (data) => {
      const candle = data.result[0];
      console.log('   [K-line Update]', data.stream);
      console.log(`   Open: ${candle[1]}, High: ${candle[2]}, Low: ${candle[3]}, Close: ${candle[4]}`);
    });
    console.log('   ✓ Subscribed\n');

    // 5. Subscribe to multiple tickers
    console.log('5. Subscribe to multiple trading pair tickers...');
    ws.subscribe(['spot.BTC_USDT.ticker', 'spot.ETH_USDT.ticker']);
    ws.on('ticker', (data) => {
      console.log('   [Ticker]', data.stream);
      console.log(`   Last price: ${data.result.last_price}, 24h change: ${data.result.change_24h}`);
    });
    console.log('   ✓ Subscribed\n');

    // 6. Connect to user data WebSocket (if Trade permission is configured)
    if (fs.existsSync(CONFIG_PATH)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      if (config.permission === 'Trade') {
        console.log('6. Connecting to user data WebSocket...');
        await ws.connectUserWS();
        console.log('   ✓ Connected');

        console.log('7. User login...');
        ws.loginUser(config.apiKey, config.apiSecret);
        ws.on('logged_in', () => {
          console.log('   ✓ Logged in\n');

          // 8. Subscribe to account updates
          console.log('8. Subscribe to account balance updates...');
          ws.subscribeAccount();
          ws.on('account_update', (data) => {
            console.log('   [Account Update]', data);
          });
          console.log('   ✓ Subscribed\n');

          // 9. Subscribe to order updates
          console.log('9. Subscribe to order updates...');
          ws.subscribeOrder();
          ws.on('order_update', (data) => {
            console.log('   [Order Update]', data);
          });
          console.log('   ✓ Subscribed\n');
        });
      }
    }

    console.log('=== WebSocket Subscription Completed, Waiting for Data Stream... ===');
    console.log('Press Ctrl+C to exit\n');

    // Listen for errors
    ws.on('error', (error) => {
      console.error('WebSocket Error:', error);
    });

    // Keep running
    process.on('SIGINT', () => {
      console.log('\n\nDisconnecting...');
      ws.disconnectAll();
      console.log('All connections disconnected');
      process.exit(0);
    });

  } catch (error) {
    console.error('Error:', error.message);
    ws.disconnectAll();
    process.exit(1);
  }
}

// Run example
example();
