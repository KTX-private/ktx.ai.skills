---
name: ktx-exchange
description: KTX exchange integration skill, providing complete functionality for market data queries, account management, trading operations, etc. Use this skill when users need to query real-time market data from KTX exchange, manage account assets, execute trading operations, or subscribe to market data streams. Supports spot and contract trading, order book depth, K-line data, trade history, account balance, order management, and more.
version: 1.0.0
---

# KTX Exchange Integration Skill

## Overview

This skill provides complete KTX exchange API integration functionality, supporting natural language queries for market data, account management, and trading operations. The skill includes REST API client and WebSocket client, covering public market data (depth, K-line, trades) and private user data (accounts, orders, positions).

## Quick Start

### First Use - Configure API Key

Before first use, you need to configure KTX API key, which will be securely stored in local user directory:

```bash
cd /Users/ceze/cezework/madbros/ktx.ai.skills/scripts
node setup_config.js
```

Follow the prompts to enter:
- API Key
- API Secret
- API key permissions (View/Trade)

Configuration file will be saved to `~/.ktx_exchange_config.json` (local access only)

### Verify Configuration

```bash
node scripts/test_connection.js
```

## Core Features

### 1. Market Data (Public Interface, No Authentication)

#### Query Trading Pairs
```
Get all KTX trading pairs
List available trading coins
Query BTC_USDT trading pair information
```

#### Query Order Book
```
Get BTC_USDT order book depth
Query depth data, show 20 levels
Get ETH_USDT buy/sell orders
```

#### Query K-line Data
```
Get BTC_USDT 1-hour K-line
Query past 24 hours K-line data
Get ETH_USDT 15-minute candlestick chart
```

#### Query 24h Ticker
```
Get BTC_USDT 24h ticker
Query all trading pair tickers
Show latest price and volume
```

#### Query Trade History
```
Get BTC_USDT recent trades
Query historical trade records
```

### 2. WebSocket Market Subscription

#### Real-time Market Data
```
Subscribe to BTC_USDT real-time market data
Listen to ETH_USDT price changes
Subscribe to multiple trading pairs' depth data
```

Supported stream types:
- `order_book` - Depth data
- `trades` - Trade records
- `candles` - K-line data
- `ticker` - 24h ticker

### 3. Account Management (Authentication Required)

#### Query Account Assets
```
Query my account balance
Get my available funds
List all coin assets
```

#### Query Orders
```
Query current pending orders
Get historical orders
Query specific order details
```

#### Query Trade Records
```
Query my trade fills
Get historical trade records
```

#### Query Positions (Contracts)
```
Query my positions
Get position information
```

### 4. Trading Operations (Trade Permission Required)

#### Order Placement
```
Buy 0.1 BTC
Sell 5 ETH
Limit buy BTC_USDT at price 50000
Market sell 10 ETH
```

#### Order Cancellation
```
Cancel order 123456
Cancel all pending orders
Batch cancel orders
```

#### Asset Transfer
```
Transfer from wallet to trading account
Transfer from trading account to wallet
Transfer 100 USDT
```

## Workflows

### Market Data Query Workflow

1. Determine query type (depth/K-line/ticker/trades)
2. Get trading pair symbol
3. Call corresponding REST API endpoint
4. Parse and format returned data

### Trading Operation Workflow

1. Verify API key configuration and permissions
2. Determine trading parameters (symbol, direction, quantity, price, etc.)
3. Build request parameters and sign
4. Call order placement endpoint
5. Handle returned results and errors

### WebSocket Subscription Workflow

1. Connect to market WebSocket (`wss://m-stream.ktx.com`)
2. Send SUBSCRIBE message for specified streams
3. Receive and process real-time pushed data
4. Can UNSUBSCRIBE at any time

### Private Data Streaming Workflow

1. Connect to user data WebSocket (`wss://u-stream.ktx.com`)
2. Login using api-key and api-sign
3. Subscribe to account/order/position streams
4. Receive real-time account change notifications

## API Authentication and Signature

All private interfaces must include in HTTP headers:
- `api-key`: API Key
- `api-sign`: HMAC-SHA256 signature
- `api-expire-time`: Request expiration time (millisecond timestamp)

Signature calculation steps:
1. Calculate `expire_time = Date.now() + validity_period`
2. Raw string = `expire_time + queryStr` (for GET) or `expire_time + bodyStr` (for POST)
3. Use HMAC-SHA256(secret, raw_string)
4. Output hex string as `api-sign`

Detailed signature implementation in `scripts/ktx_client.js`

## Error Handling

Common error codes:
- `-10000` ~ `-10003`: Network or permission errors
- `-12001` ~ `-12103`: Parameter or signature errors
- `-20001` ~ `-20007`: Business errors (insufficient balance, order failure, etc.)
- `-20006`: CPU limit exceeded
- `-20007`: Request rate limit exceeded

When handling errors:
1. Check error code and error message
2. For authentication errors, prompt user to check API key
3. For rate limit errors, wait and retry
4. For business errors, provide clear error reason

## Rate Limiting

- Maximum 10,000 requests per 10 seconds per IP
- Maximum 10,000 CPU points consumed per 10 seconds per IP
- Check current usage from response header `Ktx-Usage: t1:t2:t3`

## Resources

### scripts/

#### ktx_client.js
Core KTX API client, providing:
- REST API request wrapper
- Automatic signature handling
- Error handling and retry
- Response data formatting

Main methods:
- `getMarketData(path, params)` - Query public market data
- `getUserData(path, params, method)` - Query private data (GET)
- `postUserData(path, data)` - Submit private operations (POST)
- `getProducts(params)` - Get trading pair list
- `getOrderBook(symbol, level, priceScale)` - Get order book depth
- `getCandles(symbol, timeFrame, limit)` - Get K-line data
- `getTicker(symbol)` - Get 24h ticker
- `getTrades(symbol, limit)` - Get recent trades
- `getAccounts()` - Query account balance
- `getOrders(filters)` - Query orders
- `createOrder(params)` - Create order
- `cancelOrder(orderId)` - Cancel order
- `cancelAllOrders(symbol)` - Cancel all orders
- `getPositions()` - Query positions
- `transfer(params)` - Asset transfer

#### ktx_ws.js
KTX WebSocket client, providing:
- Market WebSocket connection management
- User data WebSocket connection management
- Subscribe/Unsubscribe management
- Message parsing and callback handling

Main methods:
- `connectMarketWS()` - Connect to market WebSocket
- `subscribe(streams)` - Subscribe to market streams
- `unsubscribe(streams)` - Unsubscribe
- `connectUserWS()` - Connect to user data WebSocket
- `loginUser()` - User data login
- `subscribeAccount()` - Subscribe to account updates
- `subscribeOrder()` - Subscribe to order updates
- `subscribePosition()` - Subscribe to position updates
- `on(event, callback)` - Event listening

#### setup_config.js
Configuration file initialization script, interactively creates API key configuration file.

#### test_connection.js
Connection test script, verifies API key and basic functionality.

#### examples/
Usage example scripts:
- `get_market_data.js` - Market data query example
- `websocket_subscriber.js` - WebSocket subscription example
- `trading_operations.js` - Trading operations example

### references/

#### api_documentation.md
Complete KTX API documentation, including:
- Detailed REST API endpoint descriptions
- Request parameters and response formats
- WebSocket protocol specifications
- Complete error code list

#### signature_spec.md
Detailed API signature specification, including:
- Signature algorithm description
- Implementation examples in multiple programming languages
- Common issues and debugging tips

#### trading_guide.md
Trading operation guide, including:
- Order type descriptions (market/limit/stop-loss)
- Order status descriptions
- Position calculation methods
- Risk control recommendations

## Security Notes

1. **API Key Security**
   - Never hardcode API keys in code
   - Config file saved only in local user directory (`~/.ktx_exchange_config.json`)
   - Do not commit config file to version control

2. **Permission Control**
   - Use `View` permission for query-only functions
   - Use `Trade` permission for trading operations
   - Create different API keys for different purposes

3. **Signature Security**
   - Use HTTPS for all API calls
   - Rotate API keys regularly
   - Signature expiration time should not be too long

4. **Fund Security**
   - Test with small amounts first
   - Verify order parameters before execution
   - Recommend setting stop-loss limit

## Usage Examples

### Query Market Data
```javascript
const client = require('./scripts/ktx_client.js');

// Get trading pairs
const products = await client.getProducts();
console.log(products);

// Get order book
const orderBook = await client.getOrderBook('BTC_USDT', 20, 2);
console.log(orderBook);

// Get K-line
const candles = await client.getCandles('BTC_USDT', '1h', 100);
console.log(candles);

// Get 24h ticker
const ticker = await client.getTicker('BTC_USDT');
console.log(ticker);
```

### WebSocket Subscription
```javascript
const ws = require('./scripts/ktx_ws.js');

// Connect to market WebSocket
await ws.connectMarketWS();

// Subscribe to BTC_USDT depth
ws.subscribe(['spot.BTC_USDT.order_book.20']);

// Listen to depth updates
ws.on('order_book', (data) => {
  console.log('Order book update:', data);
});
```

### Trading Operations
```javascript
const client = require('./scripts/ktx_client.js');

// Query account balance
const accounts = await client.getAccounts();
console.log(accounts);

// Limit buy
const order = await client.createOrder({
  symbol: 'BTC_USDT',
  side: 'buy',
  type: 'limit',
  amount: '0.1',
  price: '50000'
});
console.log(order);

// Cancel order
await client.cancelOrder(order.id);
```

## Troubleshooting

### Issue: API Key Authentication Failed
- Check config file path is correct
- Verify API Key and Secret are correct
- Confirm system time is accurate (signature depends on timestamp)
- Check IP whitelist settings

### Issue: Request Rate Limit Exceeded
- Reduce request frequency
- Use WebSocket subscription instead of polling
- Use batch queries instead of individual queries

### Issue: WebSocket Connection Disconnected
- Check network connection
- Implement heartbeat mechanism
- Add auto-reconnection logic

## Extension Development

To extend functionality:
1. Add new API methods in `scripts/ktx_client.js`
2. Add new WebSocket handling logic in `scripts/ktx_ws.js`
3. Add corresponding documentation in `references/`
4. Add usage examples in `examples/`

## Version History

### v1.0.0
- Initial version
- Support basic market data queries
- Support account management
- Support trading operations
- Support WebSocket market and private data streaming
- Complete error handling and security mechanisms
