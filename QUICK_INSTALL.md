# KTX Skills Quick Installation

**[中文版快速安装指南](./QUICK_INSTALL_zh.md)** | [中文完整安装指南](./INSTALLATION_GUIDE.md)

## Quick Install (Recommended)

```bash
# 克隆并配置
git clone https://github.com/KTX-private/ktx.ai.skills.git
cd ktx.ai.skills
node scripts/setup_config.js

# 验证安装
node test/test_connection.js
```

---

## Claude Code 安装

```bash
# 1. 复制到 Claude 技能目录
mkdir -p ~/.config/claude/skills
cp -r ktx.ai.skills ~/.config/claude/skills/

# 2. 重启 Claude Code
# 3. 在对话中使用："请使用 KTX 技能查询余额"
```

---

## OpenAI Codex 安装

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

## 配置 API 密钥

**方式 1：交互式配置（推荐）**
```bash
node scripts/setup_config.js
```

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

## 验证

```bash
cd ktx.ai.skills
node test/test_connection.js
```

成功输出：✓ Connection successful

---

## 使用示例

```javascript
const { KTXPrivateClient } = require('./ktx.ai.skills/scripts/ktx_client');
const client = new KTXPrivateClient();

// 查询余额
const balance = await client.getMainAccounts();
console.log(balance);

// 查询价格
const ticker = await client.getTicker('BTC_USDT');
console.log(ticker);
```

---

## 详细文档

- [完整安装指南](./INSTALLATION_GUIDE.md)
- [API 文档](./SKILL.md)
- [使用示例](./scripts/examples/)
