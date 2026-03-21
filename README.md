# KTX Exchange Integration Skill

Complete API integration skill for KTX Exchange, providing market data queries, account management, trading operations, and more.

## 📦 Installation

**[Quick Install Guide](./QUICK_INSTALL.md)** - 5分钟快速安装

**[快速安装指南 (中文)](./QUICK_INSTALL_zh.md)** - 5分钟快速安装（中文版）

**[Full Installation Guide](./INSTALLATION_GUIDE.md)** - 详细安装指南（支持 Claude Code、OpenAI Codex、OpenAI Assistants API 等）

### Quick Start

```bash
# Clone and configure
git clone https://github.com/KTX-private/ktx.ai.skills.git
cd ktx.ai.skills
node scripts/setup_config.js

# Verify installation
node test/test_connection.js
```

## Features

- ✅ Complete REST API wrapper (public market data + private user data)
- ✅ WebSocket real-time market data streaming
- ✅ WebSocket private data streaming (account, orders, positions)
- ✅ Automatic signature authentication
- ✅ Comprehensive error handling
- ✅ Secure API key storage
- ✅ **Automatic configuration helper** - No manual setup required
- ✅ Rich usage examples
- ✅ Detailed documentation

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

**Option A: Interactive Setup (traditional)**

First-time users can configure KTX API key interactively:

```bash
npm run setup
```

Follow the prompts to enter:
- API Key
- API Secret
- Select permissions (View/Trade)

**Option B: Automatic Configuration (recommended)**

Programmatically save API keys without interactive prompts:

```javascript
const { saveKTXConfig } = require('./scripts/config_helper');

// Save configuration directly
saveKTXConfig(
  'your_api_key',
  'your_api_secret',
  'Trade'
);
```

See `scripts/examples/CONFIGURATION_GUIDE.md` for detailed usage.

The configuration file will be saved to `~/.ktx_exchange_config.json` (local access only)

### 3. Test Connection

Verify configuration is correct:

```bash
npm test
```

### 4. Run Examples

```bash
# Query market data example
npm run example:market

# WebSocket subscription example
npm run example:ws

# Trading operations example
npm run example:trade
```

## Usage

### Query Public Market Data (No API Key Required)

```javascript
const { KTXPublicClient } = require('./scripts/ktx_client');

const publicClient = new KTXPublicClient();

// Query single trading pair price
const ticker = await publicClient.getTicker('BTC_USDT');
console.log('BTC Price:', ticker.last);

// Query all trading pairs
const products = await publicClient.getProducts();
console.log('Number of trading pairs:', products.length);

// Get all trading pair tickers
const allTickers = await publicClient.getAllTickers();

// Query order book depth
const orderBook = await publicClient.getOrderBook('BTC_USDT', 20, 2);

// Query K-line data
const candles = await publicClient.getCandles('BTC_USDT', '1h', 100);

// Query recent trades
const trades = await publicClient.getTrades('BTC_USDT', 10);
```

### Query Account and Trading (API Key Required)

```javascript
const { KTXPrivateClient } = require('./scripts/ktx_client');

const privateClient = new KTXPrivateClient();

// Query account balance
const accounts = await privateClient.getAccounts();

// Query orders
const orders = await privateClient.getPendingOrders();

// Trading operations
const order = await privateClient.buyLimit('BTC_USDT', 0.1, 50000);
await privateClient.cancelOrder(order.id);
```

### Compatibility Mode (Auto Selection)

```javascript
const { KTXClient } = require('./scripts/ktx_client');

// Auto-detect: uses private client if API key configured, otherwise uses public client
const client = new KTXClient();

// Public interfaces work without configuration
const ticker = await client.getTicker('BTC_USDT');

// Private interfaces require API key configuration via npm run setup
try {
  const accounts = await client.getAccounts();
} catch (error) {
  console.error('API key configuration required');
}
```

## Directory Structure

```
ktx-exchange/
├── SKILL.md                          # Main skill documentation
├── README.md                         # This file
├── package.json                      # Project configuration
├── scripts/
│   ├── ktx_client.js                 # REST API client
│   ├── ktx_ws.js                     # WebSocket client
│   ├── setup_config.js               # Configuration initialization script
│   ├── test_connection.js            # Connection test script
│   └── examples/
│       ├── get_market_data.js        # Market data query example
│       ├── websocket_subscriber.js   # WebSocket subscription example
│       └── trading_operations.js     # Trading operations example
└── references/
    ├── api_documentation.md          # Complete API documentation
    ├── signature_spec.md             # Signature specification
    └── trading_guide.md             # Trading operation guide
```

## Main Features

### 1. Market Data (Public Interface)

- Get trading pair list
- Get order book depth
- Get K-line data (multiple timeframes)
- Get 24h ticker
- Get recent trades
- Get coin list

### 2. Account Management (Private Interface)

- Query trading account balance
- Query wallet assets
- Get deposit address
- Query account ledgers
- Query positions

### 3. Trading Operations (Trade Permission Required)

- Limit buy/sell
- Market buy/sell
- Query orders (single/history/current)
- Cancel orders (single/batch/all)
- Query trade fills
- Asset transfer
- Subaccount transfer

### 4. WebSocket Streaming

**Market WebSocket (wss://m-stream.ktx.com):**
- Order book updates
- Recent trades
- K-line updates
- 24h ticker updates

**User WebSocket (wss://u-stream.ktx.com):**
- Account balance updates
- Order status updates
- Position updates

## API Key Security

### Security Features

- ✅ API key stored only in local user directory (`~/.ktx_exchange_config.json`)
- ✅ Config file permissions set to 600 (owner read/write only)
- ✅ Never uploaded to any cloud or third party
- ✅ Never committed to version control (user must add to .gitignore)

### Security Recommendations

1. **Never Share API Keys**: API keys contain your account permissions
2. **Set IP Whitelist**: Restrict API key IP access in exchange backend
3. **Principle of Least Privilege**: Choose View or Trade permissions based on actual needs
4. **Rotate Keys Regularly**: Regularly replace API Key and API Secret
5. **Use Separate API Keys**: Create different API keys for different purposes
6. **Monitor Usage**: Regularly check API call records and balance changes
7. **Disable Keys Promptly**: Disable API keys immediately if anomalies detected

### Permission Description

| Permission | Function | Use Cases |
|------------|----------|-----------|
| View | Query market data, accounts, orders | Data analysis, monitoring, strategy research |
| Trade | Includes View permissions + trading operations | Live trading, automated trading |

## Error Handling

All API calls may throw errors, recommend using try-catch:

```javascript
try {
  const result = await client.someMethod();
  console.log(result);
} catch (error) {
  console.error('Operation failed:', error.message);

  // Handle based on error type
  if (error.message.includes('20001')) {
    console.error('Insufficient balance');
  } else if (error.message.includes('20006')) {
    console.error('Request rate limit exceeded, please retry later');
  }
}
```

## FAQ

### Q1: Where is the configuration file?

A: The configuration file is saved in user home directory: `~/.ktx_exchange_config.json`

### Q2: How to reset configuration?

A: Run `npm run setup` again, it will prompt to overwrite existing configuration

### Q3: Are API keys secure?

A: API keys are stored only on your local computer and never uploaded to any cloud. However, please do not share configuration files with others or commit to version control.

### Q4: What's the difference between View and Trade permissions?

A: View permission can only query data, Trade permission can execute trading operations. Choose based on actual needs.

### Q5: How to get API keys?

A: Login to KTX exchange website, go to API management page to create API keys.

### Q6: What to do if connection test fails?

A: Please check:
1. Network connection is normal
2. API key configuration is correct
3. API key permissions are sufficient
4. System time is accurate (signature depends on timestamp)

### Q7: How to handle WebSocket disconnection?

A: Client has implemented auto-reconnection mechanism, no manual handling needed. You can also listen to disconnection events:

```javascript
ws.on('market_disconnected', () => {
  console.log('Market connection disconnected');
});
```

## Dependencies

- Node.js >= 14.0.0
- ws >= 8.14.0

## Documentation

For detailed documentation, please refer to:
- [SKILL.md](SKILL.md) - Skill usage instructions
- [references/api_documentation.md](references/api_documentation.md) - Complete API documentation
- [references/signature_spec.md](references/signature_spec.md) - Signature specification
- [references/trading_guide.md](references/trading_guide.md) - Trading guide

## License

MIT License

## Disclaimer

This skill is for learning and research purposes only and does not constitute investment advice. Cryptocurrency trading carries high risks and may result in loss of principal. Please trade based on your risk tolerance after fully understanding the risks. The author is not responsible for any losses caused by using this skill.

## Support

If you encounter issues, please:
1. Check the FAQ section in documentation
2. Check error messages and logs
3. Verify API key configuration is correct
4. Test network connection

## Changelog

### v1.0.0 (2024-01-01)

- Initial release
- Complete REST API wrapper
- WebSocket real-time streaming support
- Comprehensive documentation and examples
- Secure API key management
