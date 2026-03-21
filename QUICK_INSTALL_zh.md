# KTX Skills 快速安装

## 系统要求

**需要 Node.js v16 或更高版本。**

检查 Node.js 版本：
```bash
node --version
```

如果未安装，请安装 Node.js：
- **macOS/Linux:** `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash && source ~/.bashrc && nvm install --lts`
- **Windows:** 访问 https://nodejs.org/ 下载安装
- **更多选项:** 查看 [完整安装指南](./INSTALLATION_GUIDE.md)

---

## 一键安装（推荐）

```bash
# 克隆仓库
git clone https://github.com/KTX-private/ktx.ai.skills.git
cd ktx.ai.skills

# 安装依赖（可选，用于运行测试）
npm install

# 验证安装（公共接口无需 API 密钥即可使用）
node test/test_connection.js
```

**注意：** 公共接口（行情数据、价格、订单簿）无需配置 API 密钥即可使用。你可以在需要使用私有接口（交易、账户管理）时再配置 API 密钥。

---

---

## Claude Code 安装

```bash
# 1. 复制到 Claude 技能目录
mkdir -p ~/.config/claude/skills
cp -r ktx.ai.skills ~/.config/claude/skills/

# 2. 重启 Claude Code
# 3. 在对话中使用："请使用 KTX 技能查询余额"
```

**macOS 用户：**
```bash
mkdir -p ~/Library/Application\ Support/Claude/skills
cp -r ktx.ai.skills ~/Library/Application\ Support/Claude/skills/
```

---

## OpenAI 平台安装

KTX Skills 完全支持所有 OpenAI 平台，包括：
- OpenAI Codex
- OpenAI ChatGPT (通过 API)
- OpenAI Assistants API
- 任何基于 OpenAI 的 AI Agent

### OpenAI Codex

```bash
# 方式 1: GitHub Codespaces
# 访问仓库 → Code → Codespaces → Create codespace

# 方式 2: 本地集成
git clone https://github.com/KTX-private/ktx.ai.skills.git
cd ktx.ai.skills
npm install
node scripts/setup_config.js
```

---

## 配置 API 密钥（可选）

**公共接口不需要配置 API 密钥。** 你可以在需要使用私有操作时再配置。

公共接口（无需 API 密钥）：
- ✅ 行情数据查询
- ✅ 价格查询
- ✅ 订单簿
- ✅ K线（蜡烛图）数据
- ✅ 成交记录
- ✅ WebSocket 公共数据流

私有接口（需要 API 密钥）：
- 🔑 交易操作
- 🔑 账户余额
- 🔑 订单管理
- 🔑 仓位信息
- 🔑 充值/提现

### 何时配置 API 密钥

在以下情况下配置 API 密钥：
- 执行交易
- 查询账户余额
- 管理订单
- 访问私有账户数据

### 配置方法

**方式 1：交互式配置（推荐）**
```bash
node scripts/setup_config.js
```

按提示输入：
- API Key
- API Secret

**方式 2：手动配置**
```bash
cat > ~/.ktx_exchange_config.json << EOF
{
  "apiKey": "your_api_key",
  "secret": "your_secret"
}
EOF
```

---

## 验证安装

```bash
cd ktx.ai.skills
node test/test_connection.js
```

成功输出：
```
✓ KTX Skills installed successfully
✓ API connection test passed
✓ Configuration valid
```

---

## 使用示例

### 使用公共接口（无需 API 密钥）

```javascript
const { KTXPublicClient } = require('./ktx.ai.skills/scripts/ktx_client');
const client = new KTXPublicClient();

// 查询市场价格
const ticker = await client.getTicker('BTC_USDT');
console.log('BTC/USDT 价格:', ticker);

// 查询订单簿
const orderbook = await client.getOrderBook('BTC_USDT');
console.log('订单簿:', orderbook);

// 查询 K线数据
const candles = await client.getCandles('BTC_USDT', '1h');
console.log('K线数据:', candles);
```

### 使用私有接口（需要 API 密钥）

```javascript
const { KTXPrivateClient } = require('./ktx.ai.skills/scripts/ktx_client');
const client = new KTXPrivateClient();

// 查询账户余额（需要 API 密钥）
const balance = await client.getMainAccounts();
console.log('账户余额:', balance);

// 创建订单（需要 API 密钥）
const order = await client.buyLimit('BTC_USDT', 0.001, 70000);
console.log('订单创建成功:', order);
```

---

## 支持 AI Agent 平台

- ✅ Claude Code
- ✅ OpenAI Codex
- ✅ AutoGPT
- ✅ GPT-Engineer
- ✅ AgentGPT
- ✅ Cursor IDE
- ✅ Continue.dev

---

## 详细文档

- [完整安装指南](./INSTALLATION_GUIDE.md) - 详细的分步安装说明
- [API 文档](./SKILL.md) - 完整的 API 参考
- [中文 API 文档](./SKILL_zh.md)
- [使用示例](./scripts/examples/) - 实际代码示例

---

## 常见问题

### Q: 如何获取 API 密钥？

A: 访问 KTX 交易所官网 → 个人中心 → API 管理 → 创建 API 密钥

### Q: 安装后如何测试？

A: 运行 `node test/test_connection.js` 验证连接

### Q: 支持哪些交易对？

A: 支持所有 KTX 交易所的交易对，包括现货和合约

### Q: 遇到问题怎么办？

A: 查看完整安装指南的"故障排除"部分，或在 GitHub 提交 Issue

---

## 更新技能

```bash
cd ktx.ai.skills
git pull origin main
npm update
```

---

## 快速链接

- 📚 [完整文档](./README_zh.md)
- 🔧 [安装指南](./INSTALLATION_GUIDE.md)
- 💡 [使用示例](./scripts/examples/)
- 🐛 [问题反馈](https://github.com/KTX-private/ktx.ai.skills/issues)
