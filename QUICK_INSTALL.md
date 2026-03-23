# KTX Skills Quick Installation

**[中文版快速安装指南](./QUICK_INSTALL_zh.md)** | [Full Installation Guide](./INSTALLATION_GUIDE.md)

## Requirements

**Node.js v16 or higher is required.**

Check your Node.js version:
```bash
node --version
```

If not installed, install Node.js:
- **macOS/Linux:** `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash && source ~/.bashrc && nvm install --lts`
- **Windows:** Download from https://nodejs.org/
- **More options:** See [Full Installation Guide](./INSTALLATION_GUIDE.md)

---

## Quick Install (Recommended)

```bash
# Clone the repository
git clone https://github.com/KTX-private/ktx.ai.skills.git
cd ktx.ai.skills

# Install dependencies (optional, for running tests)
npm install

# Verify installation (public APIs work without API key)
node test/test_connection.js
```

**Note:** Public APIs (market data, tickers, order books) work immediately without API key configuration. You can configure API keys later for private operations (trading, account management).

---

---

## Claude Code Installation

```bash
# 1. Copy to Claude skills directory
mkdir -p ~/.config/claude/skills
cp -r ktx.ai.skills ~/.config/claude/skills/

# 2. Restart Claude Code
# 3. Use in conversation: "Please use KTX skill to query balance"
```

**For macOS users:**
```bash
mkdir -p ~/Library/Application\ Support/Claude/skills
cp -r ktx.ai.skills ~/Library/Application\ Support/Claude/skills/
```

---

## OpenAI Platforms Installation

KTX Skills supports all OpenAI platforms including:
- OpenAI Codex
- OpenAI ChatGPT (via API)
- OpenAI Assistants API
- Any OpenAI-based AI Agents

### OpenAI Codex

```bash
# Option 1: GitHub Codespaces
# Visit repo → Code → Codespaces → Create codespace

# Option 2: Local integration
git clone https://github.com/KTX-private/ktx.ai.skills.git
cd ktx.ai.skills
npm install
node scripts/setup_config.js
```

---

## Configure API Keys (Optional)

**API key configuration is NOT required for public APIs.** You can configure it later when you need private operations.

Public APIs (work without API key):
- ✅ Market data queries
- ✅ Ticker prices
- ✅ Order books
- ✅ K-line (candlestick) data
- ✅ Trade history
- ✅ WebSocket public streams

Private APIs (require API key):
- 🔑 Trading operations
- 🔑 Account balance
- 🔑 Order management
- 🔑 Position information
- 🔑 Deposit/withdraw

### When to Configure API Keys

Configure API keys when you need to:
- Execute trades
- Query your account balance
- Manage your orders
- Access private account data

### Configuration Methods

**Option 1: Interactive Setup (Recommended)**
```bash
node scripts/setup_config.js
```

Follow prompts to enter:
- API Key
- API Secret

**Option 2: Manual Configuration**
```bash
cat > ~/.ktx_exchange_config.json << EOF
{
  "apiKey": "your_api_key",
  "secret": "your_secret"
}
EOF
```

---

## Verify Installation

```bash
cd ktx.ai.skills
node test/test_connection.js
```

Success output:
```
✓ Connection successful
```

---

## Usage Examples

### Using Public APIs (No API Key Required)

```javascript
const { KTXPublicClient } = require('./ktx.ai.skills/scripts/ktx_client');
const client = new KTXPublicClient();

// Query market price
const ticker = await client.getTicker('BTC_USDT');
console.log('BTC/USDT Price:', ticker);

// Query order book
const orderbook = await client.getOrderBook('BTC_USDT');
console.log('Order Book:', orderbook);

// Query k-line data
const candles = await client.getCandles('BTC_USDT', '1h');
console.log('Candles:', candles);
```

### Using Private APIs (API Key Required)

```javascript
const { KTXPrivateClient } = require('./ktx.ai.skills/scripts/ktx_client');
const client = new KTXPrivateClient();

// Query account balance (requires API key)
const balance = await client.getMainAccounts();
console.log('Account Balance:', balance);

// Create order (requires API key)
const order = await client.buyLimit('BTC_USDT', 0.001, 70000);
console.log('Order Created:', order);
```

---

## Detailed Documentation

- [Full Installation Guide](./INSTALLATION_GUIDE.md)
- [API Documentation](./SKILL.md)
- [Usage Examples](./scripts/examples/)

## MCP ENDPOINT

**MCP Server URL:** `https://api.ktx.info/mcp`

**Available Tools:**

| Tool Name | Status | Description |
|-----------|--------|-------------|
| get_trading_pairs | ✅ Working | Query all available trading pairs on KTX exchange |
| get_ticker | ✅ Working | Get 24h ticker data for a specific trading pair |
| get_all_tickers | ✅ Working | Get 24h ticker data for all trading pairs (via products endpoint) |
| get_orderbook | ✅ Working | Query order book depth for a trading pair |
| get_kline | ✅ Working | Query K-line (candlestick) data for a trading pair |
| get_trades | ✅ Working | Query recent trade history for a trading pair |

**Market Types:**
- `spot` - Spot trading (default)
- `lpc` - USDT-Margined Perpetual Contracts

**Example Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_ticker",
    "arguments": {
      "symbol": "BTC_USDT",
      "market": "spot"
    }
  }
}
```

