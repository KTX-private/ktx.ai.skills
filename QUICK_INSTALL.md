# KTX Skills Quick Installation Guide

**[中文版快速安装指南](./QUICK_INSTALL_zh.md)** | [Full Installation Guide](./INSTALLATION_GUIDE.md)

---

## 1. Environment Requirements

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

## 2. Quick Install (Recommended)

```bash
# Clone repository
git clone https://github.com/KTX-private/ktx.ai.skills.git
cd ktx.ai.skills

# (Optional) Install dependencies for running tests
npm install

# Verify installation (public APIs work without API key)
node test/test_connection.js
```

**Note:** Public APIs (market data, tickers, order books, K-lines) work immediately without API key configuration. You can configure API keys later for private operations (trading, account management).

---

## 3. Install in Claude Code

**For Linux/macOS (General):**
```bash
mkdir -p ~/.config/claude/skills
cp -r ktx.ai.skills ~/.config/claude/skills/
```

**For macOS (Library path):**
```bash
mkdir -p ~/Library/Application\ Support/Claude/skills
cp -r ktx.ai.skills ~/Library/Application\ Support/Claude/skills/
```

After installation, restart Claude Code and use in conversation: "Please use KTX skill to query balance"

---

## 4. Use in OpenAI Platforms

KTX Skills supports all OpenAI platforms including:
- OpenAI Codex
- OpenAI ChatGPT (via API)
- OpenAI Assistants API
- Any OpenAI-based AI Agents

**Option 1: GitHub Codespaces**
- Visit repo → Code → Codespaces → Create codespace

**Option 2: Local Integration**
```bash
git clone https://github.com/KTX-private/ktx.ai.skills.git
cd ktx.ai.skills
npm install
node scripts/setup_config.js
```

---

## 5. Optional: Configure API Keys

**API key configuration is NOT required for public APIs.** Configure it later when you need private operations.

**Public APIs (work without API key):**
- ✅ Market data queries
- ✅ Ticker prices
- ✅ Order books
- ✅ K-line (candlestick) data
- ✅ Trade history
- ✅ WebSocket public streams

**Private APIs (require API key):**
- 🔑 Trading operations
- 🔑 Account balance
- 🔑 Order management
- 🔑 Position information
- 🔑 Deposit/withdraw

**When to Configure API Keys:**
Configure API keys when you need to:
- Execute trades
- Query your account balance
- Manage your orders
- Access private account data

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

## 6. Verify Installation

```bash
cd ktx.ai.skills
node test/test_connection.js
```

Success output:
```
✓ Connection successful
```

---

## 7. Usage Examples

### Using Public APIs (No API Key Required)

```javascript
const { KTXPublicClient } = require('./scripts/ktx_client');
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
const { KTXPrivateClient } = require('./scripts/ktx_client');
const client = new KTXPrivateClient();

// Query account balance (requires API key)
const balance = await client.getMainAccounts();
console.log('Account Balance:', balance);

// Create order (requires API key)
const order = await client.buyLimit('BTC_USDT', 0.001, 70000);
console.log('Order Created:', order);
```

---

## 8. MCP Server Integration

**MCP Server URL:** `https://api.ktx.info/mcp`

**Available MCP Tools:**

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

**Example MCP Request:**
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

**Step 1: Establish SSE Connection**
```bash
curl -sN -H "Accept: text/event-stream" https://api.ktx.info/mcp
```

Response:
```
event: endpoint
data: /mcp/message?sessionId=<SESSION_ID>
```

**Step 2: Call MCP Tool via POST**
```bash
curl -X POST "https://api.ktx.info/mcp/message?sessionId=<SESSION_ID>" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

---

## 9. Detailed Documentation

- [Full Installation Guide](./INSTALLATION_GUIDE.md)
- [API Documentation](./SKILL.md)
- [Usage Examples](./scripts/examples/)
- [MCP Tools Reference](./API_SUPPORT_SUMMARY.md)

---

## Troubleshooting

### Connection Failed
- Check Node.js version: `node --version` (must be v16+)
- Verify internet connection
- Check API endpoint status: `curl https://api.ktx.info/health`

### API Key Not Working
- Verify API key format (should be 32-character hex string)
- Check if IP is whitelisted (if applicable)
- Contact support if issues persist

### Skills Not Found in Claude
- Ensure skills directory path is correct
- Restart Claude Code completely
- Check Claude Code settings for skills directory location
