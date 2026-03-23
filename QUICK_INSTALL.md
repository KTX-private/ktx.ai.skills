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

## 2. One-Click Installation Overview

KTX Skills provides one-click installation scripts that complete the configuration of KTX MCP service and Skills in seconds:

- **Cursor Users:**
  Command: `bash skills/ktx-mcp-cursor-installer/scripts/install.sh`
  
- **OpenClaw Users:**
  Command: `./skills/ktx-mcp-openclaw-installer/scripts/install.sh`
  
- **Claude Code (Claude CLI) Users:**
  Command: `bash skills/ktx-mcp-claude-installer/scripts/install.sh`
  
- **Codex Users:**
  Command: `bash skills/ktx-mcp-codex-installer/scripts/install.sh`

---

## 3. Quick Start (Natural Language)

After installing the AI assistant and launching it, simply speak to it:

> "Help me automatically install KTX Skills and MCP: https://github.com/KTX-private/ktx.ai.skills"

The assistant will automatically complete all installation steps.

---

## 4. Prerequisites

Before installation, ensure:
- AI agent environment that supports Skill loading (Cursor, OpenClaw, Claude CLI, Codex, etc.)
- Node.js installed (including npx)
- Internet connection

---

## 5. Installation by Framework

### Cursor Users

**Step 1:** Download or execute at repository root:
```bash
bash skills/ktx-mcp-cursor-installer/scripts/install.sh
```

**Step 2:** Speak to AI assistant:
"Help me to install KTX Skills"

---

### OpenClaw Users

**Step 1:** Default installation (all MCP services):
```bash
./skills/ktx-mcp-openclaw-installer/scripts/install.sh
```

**Step 2:** Selective installation:
```bash
./skills/ktx-mcp-openclaw-installer/scripts/install.sh --select
```

**Step 3:** Speak to AI assistant:
"Help me to install KTX Skills"

---

### Claude Code (Claude CLI) Users

**Step 1:** Execute at repository root:
```bash
bash skills/ktx-mcp-claude-installer/scripts/install.sh
```

**Step 2:** Optional parameters:
- `--no-skills` - Install MCP only
- `--mcp main` - Install specific MCP
- `--mcp dex` - Install only specified MCP

**Step 3:** Speak to AI assistant:
"Help me to install KTX Skills"

---

### Codex Users

**Step 1:** Execute at repository root:
```bash
bash skills/ktx-mcp-codex-installer/scripts/install.sh
```

**Step 2:** Optional parameters (same as above):
- `--no-skills` - Install MCP only
- `--mcp main` - Install specific MCP
- `--mcp dex` - Install only specified MCP

**Step 3:** Speak to AI assistant:
"Help me to install KTX Skills"

---

## 6. Universal Installation (npx Method, Recommended)

**Step 1:** Confirm npx is installed:
```bash
npx -v
```

**Step 2:** Interactive installation of all Skills:
```bash
npx skills add https://github.com/KTX-private/ktx.ai.skills
```

**Step 3:** Install single Skill (example):
```bash
npx skills add https://github.com/KTX-private/ktx.ai.skills --skill ktx-exchange
```

---

## 7. Natural Language Installation Examples

After installation is complete, you can use natural language commands in Claude CLI or Codex CLI:

### Market Data Queries
```
Get KTX trading pairs list
Query BTC_USDT market price
Get order book depth for BTC_USDT
```

### Trading Operations
```
Check my account balance
Buy 0.1 BTC at market price
Sell 5 ETH with limit order
```

### WebSocket Subscriptions
```
Subscribe to BTC_USDT real-time quotes
Listen to ETH_USDT price changes
```

---

## 8. Manual Installation (Clone Method)

```bash
# Clone repository
git clone https://github.com/KTX-private/ktx.ai.skills.git
cd ktx.ai.skills

# Install dependencies (optional, for running tests)
npm install

# Verify installation (public APIs work without API key)
node test/test_connection.js
```

**Note:** Public APIs (market data, tickers, order books) work immediately without API key configuration. You can configure API keys later for private operations (trading, account management).

---

## 9. Install in Claude Code

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

## 10. Use in OpenClaw (小龙虾)

### Method 1: Conversational Installation (Recommended)

OpenClaw is a popular AI agent with built-in GitHub integration. You can install KTX Skills with just a simple message:

**In the OpenClaw interface (e.g., Telegram, Feishu), send:**
```
Help me install this skill: https://github.com/KTX-private/ktx.ai.skills
```

The assistant will automatically:
1. Fetch the repository
2. Configure the environment
3. Attempt to load the KTX Skills

### Method 2: Manual Installation

If you prefer manual installation:

**Step 1: Clone repository**
```bash
git clone https://github.com/KTX-private/ktx.ai.skills.git
cd ktx.ai.skills

# Install dependencies (optional)
npm install
```

**Step 2: Add to OpenClaw Skills Directory**

OpenClaw automatically loads skills from the `skills` subdirectory. Ensure the KTX Skills structure follows the OpenClaw skills format:

```
ktx.skills/
├── manifest.json          # Skill metadata (required)
├── README.md             # Skill description
└── scripts/
    └── ...            # Skill scripts
```

**Step 3: Restart OpenClaw**

After adding the skills directory:
1. Go to OpenClaw settings
2. Navigate to Skills / Plugins section
3. Refresh or restart OpenClaw
4. The KTX Skills should appear in the available skills list

### Supported Features

Once installed, you can use KTX Skills in OpenClaw for:
- Query market data (prices, order books, K-lines)
- Check account balance (requires API key)
- Place orders (requires API key)
- WebSocket subscriptions for real-time data

### Example Conversations

After installation, you can use natural language commands:

**Market Queries:**
```
Query BTC_USDT price on KTX
Get order book depth for ETH_USDT
Fetch 1-hour K-line for BTC_USDT
```

**Trading Operations:**
```
Check my account balance
Buy 0.1 BTC with 10x leverage
Cancel pending order #12345
```

---

## 11. Use in OpenAI Platforms

KTX Skills supports all OpenAI platforms including:
- OpenAI Codex
- OpenAI ChatGPT (via API)
- OpenAI Assistants API
- Any OpenAI-based AI Agents

---

## 11. Optional: Configure API Keys

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

## 12. Verify Installation

```bash
cd ktx.ai.skills
node test/test_connection.js
```

Success output:
```
✓ Connection successful
```

---

## 13. Usage Examples

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

## 14. MCP Server Integration

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

## 15. Detailed Documentation

- [Full Installation Guide](./INSTALLATION_GUIDE.md)
- [API Documentation](./SKILL.md)
- [Usage Examples](./scripts/examples/)

---

## 16. Troubleshooting

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

---

## 17. Security Considerations

### 1. API Key Security
- Never hardcode API keys in your code
- Config files are only stored locally (`~/.ktx_exchange_config.json`)
- Never commit config files to version control

### 2. Permission Control
- Use `View` permission for query-only operations
- Use `Trade` permission for trading operations
- Create different API keys for different purposes

### 3. Signature Security
- Use HTTPS for all API calls
- Rotate API keys periodically
- Keep signature expiration time reasonably short

### 4. Fund Security
- Test with small amounts first
- Verify order parameters before execution
- Set stop-loss limits when possible

---

## 18. Risk Disclaimer

⚠️ **Risk Warning:** 
- The above examples and operations are for API demonstration only
- Futures trading carries extremely high risk
- Leverage trading can result in complete loss of principal
- Market prices fluctuate rapidly, actual execution may differ from expected
- Investment involves risk, proceed with caution
- Please understand futures trading mechanics and risks before operating
- Configure leverage reasonably based on your risk tolerance

---
