# KTX Skills Quick Installation

**[中文版快速安装指南](./QUICK_INSTALL_zh.md)** | [Full Installation Guide](./INSTALLATION_GUIDE.md)

## Quick Install (Recommended)

```bash
# Clone and configure
git clone https://github.com/KTX-private/ktx.ai.skills.git
cd ktx.ai.skills
node scripts/setup_config.js

# Verify installation
node test/test_connection.js
```

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

## Configure API Keys

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

```javascript
const { KTXPrivateClient } = require('./ktx.ai.skills/scripts/ktx_client');
const client = new KTXPrivateClient();

// Query account balance
const balance = await client.getMainAccounts();
console.log(balance);

// Query market price
const ticker = await client.getTicker('BTC_USDT');
console.log(ticker);
```

---

## Detailed Documentation

- [Full Installation Guide](./INSTALLATION_GUIDE.md)
- [API Documentation](./SKILL.md)
- [Usage Examples](./scripts/examples/)
