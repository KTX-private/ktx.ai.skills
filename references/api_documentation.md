# KTX API Documentation

## Base Information

| Type | URL |
|------|-----|
| Market Data REST | `https://api.ktx.app/api` |
| User Data REST | `https://api.ktx.app/papi` |
| Market WebSocket | `wss://m-stream.ktx.app` |
| User WebSocket | `wss://u-stream.ktx.app` |

---

## Request Methods

- `GET`: Query market or account data
- `POST`: Submit orders, deposits, transfers, etc.

---

## Parameters Location

- **GET requests**: Parameters in URL Query String
- **POST requests**: Parameters in JSON Body

---

## Response Format

All interfaces return JSON format data.

---

## Rate Limits

| Limit Type | Limit Value | Description |
|-------------|-------------|-------------------|
| Request Rate | 10,000 requests per 10 seconds | Rate limit exceeded error code `-20007` |
| CPU Usage | 10,000 CPU points per 10 seconds | CPU limit exceeded error code `-20006` |
| Response Headers | `Ktx-Usage: t1:t2:t3` | Check current usage |

---

## Authentication & Signing

### Required HTTP Headers

All private interfaces require authentication in HTTP headers:

| Header Name | Description |
|------------|-------------|
| `api-key` | API Key |
| `api-sign` | HMAC-SHA256 signature |
| `api-expire-time` | Request expiration time (milliseconds UNIX timestamp) |

---

## Signature Steps

1. **Calculate Expiration Time**
```javascript
const expireTime = Date.now() + 30000; // Current time + 30 seconds
```
**Recommendation**: Set expiration to 30 seconds to avoid network delays causing signature expiration.

2. **Construct Raw String**
Depending on HTTP method:

**For GET requests:**
```javascript
const queryStr = 'symbol=BTC_USDT&limit=100';
const message = expireTime + queryStr;
```

**For POST requests:**
```javascript
const bodyStr = JSON.stringify({ 
  symbol: 'BTC_USDT', 
  side: 'buy', 
  amount: '0.1', 
  price: '50000'
});
const message = expireTime + bodyStr;
```

3. **Calculate Signature**
```javascript
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', apiSecret)
  .update(message)
  .digest('hex');
```

4. **Set HTTP Headers**
```javascript
const headers = {
  'api-key': apiKey,
  'api-sign': signature,
  'api-expire-time': String(expireTime),
  'Content-Type': 'application/json'
};
```

---

## API Key Permissions

| Permission | Description |
|-----------|-------------|
| View | Query private data (accounts, orders, positions, fills) |
| Trade | Execute trades, cancel orders, transfers |

**Configuration**: Set appropriate permissions in exchange backend based on usage needs.

---

## Public Market APIs

No API key required for these endpoints.

### 1. Connectivity Test

```
GET /v1/ping
```

**Response:**
```json
{
  "pong": "pong"
}
```

---

### 2. Server Time

```
GET /v1/time
```

**Response:**
```json
{
  "server_time": 1677648000000
}
```

---

### 3. Get Coin List

```
GET /v1/coins
```

**Query Parameters:**
- `market` (optional): Market type, e.g., `spot` (default), `lpc`

**Response:**
```json
{
  "result": [
    {
      "currency": "BTC",
      "chains": [
        {
          "chain": "BTC",
          "protocol": "OMNI",
          "contract_address": ""
        }
      ]
    }
  ]
}
```

---

### 4. Get Trading Pairs

```
GET /v1/products
```

**Query Parameters:**
- `market` (optional): Market type, e.g., `spot` (default), `lpc`
- `symbol` (optional): Trading pair symbol, e.g., `BTC_USDT`

**Response:**
```json
{
  "result": [
    {
      "symbol": "BTC_USDT",
      "base_currency": "BTC",
      "quote_currency": "USDT",
      "min_base_amount": "0.001",
      "min_quote_amount": "10",
      "price_scale": 2,
      "amount_scale": 8,
      "amount_precision": 8,
      "price_precision": 2,
      "taker_fee": "0.002",
      "maker_fee": "0.001",
      "market": "spot"
    }
  ]
}
```

---

### 5. Get Order Book

```
GET /v1/order_book
```

**Query Parameters:**
- `symbol` (required): Trading pair symbol, e.g., `BTC_USDT`
- `level` (optional): Depth levels, default 20
- `price_scale` (optional): Price precision, default 2

**Response:**
```json
{
  "result": {
    "bids": [
      ["50000.00", "0.5"]
    ],
    "asks": [
      ["50001.00", "0.3"]
    ],
    "timestamp": 1677648000000
  }
}
```

**Format:** `[price, quantity]` arrays for bids and asks.

---

### 6. Get K-Line (Candlestick) Data

```
GET /v1/candles
```

**Query Parameters:**
- `symbol` (required): Trading pair symbol, e.g., `BTC_USDT`
- `time_frame` (required): Time frame, options: `1m`, `5m`, `15m`, `1h`, `4h`, `1d`, `1w`, `1M`
- `limit` (optional): Number of candles, default 100, max 1000
- `before` (optional): Get candles before this timestamp (milliseconds)
- `after` (optional): Get candles after this timestamp (milliseconds)

**Response:**
```json
{
  "result": {
    "t": 3600000,
    "e": [
      [1677648000000, "50000.00", "51000.00", "50500.00", "24.43", 50100.00"]
    ]
  }
}
```

**Candle Format:** `[timestamp, open, high, low, close, volume, ...]`

---

### 7. Get Trade History

```
GET /v1/trades
```

**Query Parameters:**
- `symbol` (required): Trading pair symbol, e.g., `BTC_USDT`
- `limit` (optional): Number of trades, default 100, max 500
- `before` (optional): Get trades before this timestamp (milliseconds)
- `after` (optional): Get trades after this timestamp (milliseconds)

**Response:**
```json
{
  "result": [
    {
      "id": 123456789,
      "create_time": 1677648000000,
      "price": "50000.00",
      "amount": "0.1",
      "side": "buy",
      "fee": "5.0"
    }
  ]
}
```

---

### 8. Get 24h Ticker

```
GET /v1/ticker
```

**Query Parameters:**
- `symbol` (required): Trading pair symbol, e.g., `BTC_USDT`
- `market` (optional): Market type, e.g., `spot` (default), `lpc`

**Response (Single Pair):**
```json
{
  "result": [
    {
      "last": "50000.00",
      "low_24h": "49000.00",
      "high_24h": "51000.00",
      "change_24h": "1000.00",
      "change_percentage_24h": "2.04",
      "volume_24h": "1000.5",
      "quote_volume_24h": "50000000.00",
      "base_currency": "BTC",
      "quote_currency": "USDT",
      "amount_precision": 8,
      "price_precision": 2,
      "product": "BTC_USDT",
      "time": "1677648000000"
    }
  ]
}
```

---

## User Data APIs (Authentication Required)

### 9. Get Account Assets

```
GET /papi/v1/trade/accounts
```

**Query Parameters:** None

**Response:**
```json
{
  "currency": "BTC",
  "available": "1.5",
  "frozen": "0.5",
  "total": "2.0"
}
```

---

### 10. Get All Accounts

```
GET /papi/v1/accounts
```

**Query Parameters:** None

**Response:**
```json
{
  "result": [
    {
      "currency": "BTC",
      "available": "1.5",
      "frozen": "0.5",
      "total": "2.0"
    },
    {
      "currency": "USDT",
      "available": "10000.00",
      "frozen": "5000.00",
      "total": "15000.00"
    }
  ]
}
```

---

### 11. Create Order

```
POST /papi/v1/order
```

**Request Body:**
```json
{
  "symbol": "BTC_USDT",
  "side": "buy",
  "type": "limit",
  "amount": "0.1",
  "price": "50000",
  "time_in_force": "GTC"
}
```

**Parameters:**
- `symbol` (required): Trading pair symbol
- `side` (required): `buy` or `sell`
- `type` (required): `limit` or `market`
- `amount` (required): Order quantity
- `price` (required): Order price (required for limit orders)
- `time_in_force` (optional): Time in force, options: `GTC`, `IOC`, `FOK`, default `GTC`

**Response:**
```json
{
  "id": 123456789,
  "symbol": "BTC_USDT",
  "side": "buy",
  "type": "limit",
  "amount": "0.1",
  "price": "50000.00",
  "filled_amount": "0",
  "status": "open",
  "create_time": 1677648000000
}
```

---

### 12. Query Orders

```
GET /papi/v1/orders
```

**Query Parameters:**
- `symbol` (optional): Trading pair symbol
- `status` (optional): Order status, e.g., `open`, `filled`, `cancelled`
- `limit` (optional): Number of orders

**Response:**
```json
{
  "result": [
    {
      "id": 123456789,
      "symbol": "Related to BTC_USDT",
      "side": "buy",
      "type": "limit",
      "amount": "0.1",
      "price": "50000.00",
      "status": "open",
      "create_time": 1677648000000
    }
  ]
}
```

---

### 13. Query Order Details

```
GET /papi/v1/orders/{id}
```

**Query Parameters:**
- `id` (required): Order ID

**Response:**
```json
{
  "id": 123456789,
  "symbol": "BTC_USDT",
  "side": "buy",
  "type": "limit",
  "amount": "0.1",
  "price": "50000.00",
  "status": "filled",
  "filled_amount": "0.1",
  "create_time": 1677648000000,
  "filled_time": 1677649000000
}
```

---

### 14. Cancel Order

```
DELETE /papi/v1/orders/{id}
```

**Response:**
```json
{
  "cancelled_ids": [123456789]
}
```

---

### 15. Cancel All Orders

```
DELETE /papi/v1/orders
```

**Query Parameters:**
- `symbol` (optional): Trading pair symbol

**Response:**
```json
{
  "cancelled_ids": [123456789, 123456790]
}
```

---

### 16. Get Fill History

```
GET /papi/v1/fills
```

**Query Parameters:**
- `symbol` (optional): Trading pair symbol
- `limit` (optional): Number of fills, default 100
- `before` (optional): Get fills before timestamp
- `after` (optional): Get fills after timestamp

**Response:**
```json
{
  "result": [
    {
      "id": 123456,
      "order_id": 123456789,
      "symbol": "BTC_USDT",
      "side": "buy",
      "type": "limit",
      "amount": "0.1",
      "price": "50000.00",
      "fee": "5.0",
      "fee_currency": "USDT",
      "create_time": 1677648000000,
      "filled_time": 1677649000000
    }
  ]
}
```

---

## Order Types

| Type | Description |
|------|-------------|
| `limit` | Limit order (executed at specified price or better) |
| `market` | Market order (executed at current market price) |

---

## Order Sides

| Side | Description |
|------|-------------|
| `buy` | Buy (long position) |
| `sell` | Sell (short position) |

---

## Order Status

| Status | Description |
|--------|-------------|
| `open` | Waiting to be filled |
| `filled` | Fully executed |
| `cancelled` | Cancelled |
| `partial_filled` | Partially executed |

---

## Time In Force

| Value | Description |
|-------|-------------|
| `GTC` | Good Till Cancelled (default) |
| `IOC` | Immediate Or Cancel |
| `FOK` | Fill Or Kill |
| `post_only` | Post Only (no partial fills) |

---

## K-Line Time Frames

| Time Frame | Description |
|-----------|-------------|
| `1m` | 1 minute |
| `5m` | 5 minutes |
| `15m` | 15 minutes |
| `1h` | 1 hour |
| `4h` | 4 hours |
| `1d` | 1 day |
| `1w` | 1 week |
| `1M` | 1 month |

---

## Market Types

| Type | Description | Example Symbol |
|------|-------------|---------------|
| `spot` | Spot trading | BTC_USDT, ETH_USDT |
| `lpc` | USDT-margined perpetual contracts | BTC_USDT_SWAP, ETH_USDT_SWAP |

---

## WebSocket APIs

### Market WebSocket

**Connection URL:** `wss://m-stream.ktx.app`

#### Subscribe to Order Book

```json
{
  "id": 1,
  "method": "SUBSCRIBE",
  "params": [
    "spot.BTC_USDT.order_book.20"
  ]
}
```

**Stream Format:** `spot.{symbol}.order_book.{depth}`

#### Subscribe to Trades

```json
{
  "id": 2,
  "method": "SUBSCRIBE",
  "params": [
    "spot.BTC_USDT.trades"
  ]
}
```

**Stream Format:** `spot.{symbol}.trades`

#### Subscribe to Candles

```json
{
  "id": 3,
  "method": "SUBSCRIBE",
  "params": [
    "spot.BTC_USDT.candles.1h"
  ]
}
```

**Stream Format:** `spot.{symbol}.candles.{time_frame}`

#### Subscribe to 24h Ticker

```json
{
  "id": 4,
  "method": "SUBSCRIBE",
  "params": [
    "spot.BTC_USDT.ticker"
  ]
}
```

**Stream Format:** `spot.{symbol}.ticker`

#### Unsubscribe

```json
{
  "id": 5,
  "method": "UNSUBSCRIBE",
  "params": [
    "spot.BTC_USDT.order_book.20",
    "spot.BTC_USDT.trades",
    "spot.BTC_USDT.candles.1h",
    "spot.BTC_USDT.ticker"
  ]
}
```

---

### User Data WebSocket

**Connection URL:** `wss://u-stream.ktx.app`

#### Login

```json
{
  "id": 1,
  "method": "LOGIN",
  "auth": {
    "api-key": "your_api_key",
    "api-sign": "your_signature",
    "api-expire-time": "1677648100000"
  }
}
```

#### Subscribe to Account

```json
{
  "id": 2,
  "method": "SUBSCRIBE",
  "params": [
    "account"
  ]
}
```

**Stream Format:** `account` - All account changes

#### Subscribe to Orders

```json
{
  "id": 3,
  "method": "SUBSCRIBE",
  "params": [
    "order"
  ]
}
```

**Stream Format:** `order` - All order changes

#### Subscribe to Positions

```json
{
  "id": 4,
  "method": "SUBSCRIBE",
  "params": [
    "position"
  ]
}
```

**Stream Format:** `position` - All position changes

#### Unsubscribe

```json
{
  "id": 5,
  "method": "UNSUBSCRIBE",
  "params": [
    "account",
    "order",
    "position"
  ]
}
```

#### Heartbeat

```json
{
  "id": 6,
  "method": "PING"
}
```

**Response:**
```json
{
  "pong": 1677648100000
}
```

---

## Error Codes

| Error Code | Description |
|-----------|-------------|
| `-10000` | Network error |
| `-10001` | Not implemented |
| `-10002` | Not implemented |
| `-10003` | Unknown error |
| `-12001` | Missing required parameter |
| `-12002` | Invalid parameter format |
| `-12003` | Parameter value out of range |
| `-20001` | Insufficient balance |
| `-20002` | Order failed |
| `-20006` | CPU limit exceeded |
| `-20007` | Rate limit exceeded |
| `-21001` | Order not found |
| `-21002` | Order already completed |
| `-21401` | Coin not supported |
| `-21402` | Chain not supported |

---

## Example Usage

### JavaScript (Node.js)

**Get Market Data:**
```javascript
const crypto = require('crypto');
const https = require('https');

function signRequest(apiSecret, expireTime, message) {
  const hmac = crypto.createHmac('sha256', apiSecret);
  hmac.update(message);
  return hmac.digest('hex');
}

// Get ticker
const apiKey = 'your_api_key';
const apiSecret = 'your_api_secret';
const symbol = 'BTC_USDT';
const expireTime = Date.now() + 30000;

const options = {
  hostname: 'api.ktx.app',
  port: 443,
  path: `/api/v1/ticker?symbol=${symbol}&market=spot`,
  method: 'GET',
  headers: {
    'api-key': apiKey,
    'api-sign': signRequest(apiSecret, expireTime, ''),
    'api-expire-time': String(expireTime),
    'Content-Type': 'application/json'
  }
};

https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    console.log('Ticker:', result);
  });
}).on('error', console.error);
```

**Create Order:**
```javascript
const orderData = {
  symbol: 'BTC_USDT',
  side: 'buy',
  type: 'limit',
  amount: '0.1',
  price: '50000'
};

const bodyStr = JSON.stringify(orderData);
const message = expireTime + bodyStr;
const signature = signRequest(apiSecret, expireTime, bodyStr);

const options = {
  hostname: 'api.ktx.app',
  port: 443,
  path: '/papi/v1/order',
  method: 'POST',
  headers: {
    'api-key': apiKey,
    'api-sign': signature,
    'api-expire-time': String(expireTime),
    'Content-Type': 'application/json'
  },
  body: bodyStr
};

https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    console.log('Order created:', result);
  });
}).on('error', console.error);
```

---

## Python

**Get Ticker:**
```python
import hmac
import time
import requests
import hashlib

api_key = 'your_api_key'
api_secret = 'your_api_secret'
symbol = 'BTC_USDT'
expire_time = int(time.time() * 1000) + 30000
message = f'{expire_time}'
signature = hmac.new(
    api_secret.encode('utf-8'),
    message.encode('utf-8'),
    hashlib.sha256
).hexdigest()

headers = {
    'api-key': api_key,
    'api-sign': signature,
    'api-expire-time': str(expire_time),
    'Content-Type': 'application/json'
}

response = requests.get(
    f'https://api.ktx.app/api/v1/ticker?symbol={symbol}&market=spot',
    headers=headers
)

print(response.json())
```

---

## Go

**Get Ticker:**
```go
package main

import (
    "crypto/hmac"
    "crypto/sha256"
    "encoding/hex"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

func signRequest(secret string, expireTime int64, data string) string {
    h := hmac.New(sha256.New, []byte(secret))
    h.Write([]byte(data))
    return hex.EncodeToString(h.Sum(nil))
}

func getTicker() {
    apiKey := "your_api_key"
    apiSecret := "your_api_secret"
    symbol := "BTC_USDT"
    expireTime := time.Now().Add(30 * time.Second).UnixMilli()
    message := fmt.Sprintf("%d", expireTime)
    signature := signRequest(apiSecret, expireTime, message)

    url := fmt.Sprintf("https://api.ktx.app/api/v1/ticker?symbol=%s&market=spot", symbol)

    req, _ := http.NewRequest("GET", url, nil)
    req.Header.Set("api-key", apiKey)
    req.Header.Set("api-sign", signature)
    req.Header.Set("api-expire-time", strconv.FormatInt(expireTime, 10))
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)
    var result map[string]interface{}
    json.Unmarshal(body, &result)

    fmt.Println("Ticker:", result)
}

func main() {
    getTicker()
}
```

---

## Troubleshooting

### 1. Signature Errors (-12001, -12002)

**Possible Causes:**
- API Key or API Secret is incorrect
- Original string construction error
- Timestamp format incorrect

**Solutions:**
1. Verify API Key and API Secret in exchange backend
2. Check if using correct signature algorithm (HMAC-SHA256)
3. Ensure timestamp is in milliseconds
4. Use official example code for comparison

### 2. Connection Issues

**Checks:**
1. Verify network connectivity to `api.ktx.app`
2. Check firewall settings
3. Verify SSL/TLS configuration

### 3. Rate Limiting (-20006, -20007)

**Solutions:**
1. Reduce request frequency
2. Implement exponential backoff for retries
3. Use WebSocket for real-time data instead of polling
4. Batch queries when possible

### 4. Balance Issues (-20001)

**Checks:**
1. Verify account has sufficient balance
2. Check order amount is within account total
3. Ensure correct currency is being used

---

## Security Considerations

1. **API Key Security**
   - Never hardcode API keys in your code
   - Store API keys in environment variables or configuration files
   - Never commit API keys to version control
   - Rotate API keys periodically
   - Use different API keys for different environments

2. **Permission Control**
   - Use `View` permission for query-only operations
   - Use `Trade` permission only for trading operations
   - Create separate API keys for different purposes

3. **Signature Security**
   - Set reasonable expiration time (30-60 seconds recommended)
   - Synchronize system time with NTP for accurate timestamps
   - Use HTTPS for all API calls
   - Verify signature before sending requests

4. **Risk Management**
   - Test with small amounts first
   - Set stop-loss limits when possible
   - Use limit orders instead of market orders
   - Never risk more than you can afford to lose

---

## Support

- **Full Installation Guide:** [QUICK_INSTALL.md](./QUICK_INSTALL.md)
- **Chinese Installation Guide:** [QUICK_INSTALL_zh.md](./QUICK_INSTALL_zh.md)
- **Skills Overview:** [SKILLS_OVERVIEW.md](./SKILLS_OVERVIEW.md)
- **Usage Examples:** [scripts/examples/](./scripts/examples/)

---

**Version:** v2026.3.23.1  
**Last Updated:** 2026-03-23
