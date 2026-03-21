# KTX Skills - Scripts Directory

This directory contains the core scripts for KTX exchange integration skill.

## Available Scripts

### Core Client Scripts

#### `ktx_client.js`
REST API client providing three-tier client architecture:
- **KTXPublicClient** - Public market data (no API key required)
- **KTXPrivateClient** - Private user data and trading (API key required)
- **KTXClient** - Unified compatibility wrapper (auto-detects config)

**Features:**
- Public endpoints: products, order book, K-line, ticker, trades, coins, server time
- Private endpoints: accounts, orders, positions, transfers, withdrawals
- HMAC-SHA256 signature authentication
- Automatic response parsing
- Comprehensive error handling

#### `ktx_ws.js`
WebSocket client for real-time data streaming:
- Market WebSocket (wss://m-stream.ktx.app) - Public streams
- User WebSocket (wss://u-stream.ktx.app) - Private streams with authentication
- Auto-reconnection mechanism
- Heartbeat mechanism (30s interval)
- Event-based message handling

**Supported Streams:**
- Market: order_book, trades, candles, ticker
- User: account, order, position

### Utility Scripts

#### `setup_config.js`
Interactive configuration wizard for API key setup:
- Prompts for API Key, API Secret, and permission selection
- Saves config to `~/.ktx_exchange_config.json` with 600 permissions
- Validates API key format before saving

#### `test_connection.js`
Basic connection testing script:
- Tests server connectivity
- Validates API key configuration
- Tests basic API endpoints

### Example Scripts

#### `examples/analyze_market.js` (UNIFIED MARKET ANALYSIS)
**Unified market analysis for ANY cryptocurrency**
Supports flexible timeframes and data points.

**Usage:**
```bash
node examples/analyze_market.js <SYMBOL> [TIMEFRAME] [LIMIT]
```

**Examples:**
```bash
# Basic usage (default: 1h, 72 candles)
node examples/analyze_market.js BTC_USDT

# Custom timeframe
node examples/analyze_market.js ETH_USDT 4h 50

# Daily analysis
node examples/analyze_market.js SOL_USDT 1d 30

# Multiple timeframes
node examples/analyze_market.js MARS_USDT 1h 72
node examples/analyze_market.js MARS_USDT 4h 48
```

**Timeframe options:** `1m`, `5m`, `15m`, `1h`, `4h`, `1d`
**Default:** `1h` (hourly)
**Default limit:** `72` K-line candles

**Analysis Output:**
- Latest price information
- Current period change (1h/24h/7d depending on timeframe)
- Key technical levels (support/resistance)
- Moving averages (MA5, MA10, MA20)
- Trend direction and strength
- Volatility rating
- Trading recommendations (conservative/aggressive/short-term)

#### `examples/get_market_data.js`
Example script for querying market data:
- Get trading pairs list
- Get 24h ticker for specific pairs
- Get multiple tickers
- Get order book depth
- Get K-line data
- Get recent trades
- Get coin list

**Usage:**
```bash
node examples/get_market_data.js
```

#### `examples/websocket_subscriber.js`
WebSocket subscription example:
- Connect to market WebSocket
- Subscribe to order book, trades, candles, ticker
- Connect to user WebSocket (if Trade permission configured)
- Subscribe to account, order, position updates
- Auto-reconnection and heartbeat

**Usage:**
```bash
node examples/websocket_subscriber.js
```

#### `examples/trading_operations.js`
Trading operations example (requires API key with Trade permission):
- Query account balance
- Query pending orders
- Query order history
- Query trade fills
- Query positions
- Example order placement (demo only, not actually executed)
- Example order cancellation (demo only)

**Usage:**
```bash
node examples/trading_operations.js
```

## API Configuration

**Current API Domain:** `https://api.ktx.app`
**Current WebSocket Domain:** `wss://m-stream.ktx.app` / `wss://u-stream.ktx.app`

**API Endpoints:**
- Market REST: `https://api.ktx.app/api/v1/`
- User REST: `https://api.ktx.app/papi/v1/`
- Market WS: `wss://m-stream.ktx.app`
- User WS: `wss://u-stream.ktx.app`

## Common Usage Patterns

### Public Data (No API Key)
```javascript
const { KTXPublicClient } = require('./ktx_client');

const client = new KTXPublicClient();

// Get ticker
const ticker = await client.getTicker('BTC_USDT');
console.log('BTC Price:', ticker.last_price);

// Get K-line data
const candles = await client.getCandles('BTC_USDT', '1h', 100);

// Analyze market
const { analyzeMarket } = require('./examples/analyze_market.js');
const analysis = await analyzeMarket('ETH_USDT', '4h', 50);
```

### Private Data (API Key Required)
```javascript
const { KTXPrivateClient } = require('./ktx_client');

const client = new KTXPrivateClient();

// Get account balance
const accounts = await client.getAccounts();

// Place order
const order = await client.buyLimit('BTC_USDT', 0.1, 50000);

// Cancel order
await client.cancelOrder(order.id);
```

### WebSocket Subscription
```javascript
const KTXWSClient = require('./ktx_ws');

const ws = new KTXWSClient();

// Connect and subscribe
await ws.connectMarketWS();
ws.subscribe(['spot.BTC_USDT.order_book.5']);

// Listen to events
ws.on('order_book', (data) => {
  console.log('Order book update:', data);
});

// Auto-reconnection and heartbeat are handled automatically
```

## Error Handling

All scripts include comprehensive error handling:
- Network errors with retry suggestions
- API errors with clear error messages
- Invalid input validation
- Fallback to basic queries when K-line data unavailable

## Security

- API keys stored locally in `~/.ktx_exchange_config.json`
- File permissions set to 600 (owner read/write only)
- HMAC-SHA256 signature with 30-second expiration
- No telemetry or data collection

## Testing

Run connection test before using:
```bash
node test_connection.js
```

Test specific functionality:
```bash
# Test market analysis
node examples/analyze_market.js BTC_USDT

# Test WebSocket subscription
node examples/websocket_subscriber.js

# Test trading operations (requires API key)
node examples/trading_operations.js
```

## Development Notes

- All code comments and console.log messages are in English
- Compatible with Node.js >= 14.0.0
- Uses `ws` library for WebSocket connections
- Follows KTX API documentation for response formats
- Handles multiple API response formats (wrapper objects, K-line arrays)

## Support

For issues or questions:
1. Check this README
2. Review the main project documentation in parent directory
3. Check KTX API documentation
4. Verify API key configuration (for private endpoints)
5. Test network connectivity
