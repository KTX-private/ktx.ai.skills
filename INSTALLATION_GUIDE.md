# KTX Skills 安装指南

本指南详细介绍如何将 KTX Skills 安装到不同的 AI Agent 平台，包括手动安装和各平台自动安装。

## 目录

- [手动安装](#手动安装)
- [OpenAI Codex 安装](#openai-codex-安装)
- [Claude Code 安装](#claude-code-安装)
- [其他 AI Agent 安装](#其他-ai-agent-安装)
- [验证安装](#验证安装)
- [故障排除](#故障排除)

---

## 手动安装

适用于任何支持自定义代码库的 AI Agent 平台。

### 方式 1：克隆仓库

```bash
# 1. 克隆仓库到本地
git clone https://github.com/KTX-private/ktx.ai.skills.git
cd ktx.ai.skills

# 2. 安装依赖（可选，如果需要运行测试）
npm install

# 3. 配置 API 密钥
node scripts/setup_config.js
```

### 方式 2：下载 ZIP

1. 访问 https://github.com/KTX-private/ktx.ai.skills
2. 点击 "Code" → "Download ZIP"
3. 解压到目标目录
4. 进入目录并运行配置脚本

### 配置 API 密钥

```bash
# 运行交互式配置脚本
node scripts/setup_config.js
```

或手动创建配置文件：

```bash
# 在用户主目录创建配置文件
cat > ~/.ktx_exchange_config.json << EOF
{
  "apiKey": "your_api_key_here",
  "secret": "your_secret_here"
}
EOF
```

---

## OpenAI Codex 安装

### 方法 1：通过 GitHub Codespaces

1. 在 GitHub 上访问 ktx.ai.skills 仓库
2. 点击 "Code" → "Codespaces" → "Create codespace on main"
3. 等待环境初始化完成
4. 在终端中运行：

```bash
# 安装依赖
npm install

# 配置 API 密钥
node scripts/setup_config.js

# 测试连接
node test/test_connection.js
```

### 方法 2：本地开发环境集成

1. 确保已安装 Node.js (v16 或更高版本)
2. 克隆仓库：

```bash
git clone https://github.com/KTX-private/ktx.ai.skills.git
cd ktx.ai.skills
```

3. 在 OpenAI Codex 项目中引用该技能库：

```javascript
// 在你的 Codex 项目中导入
const { KTXPrivateClient } = require('/path/to/ktx.ai.skills/scripts/ktx_client');

// 使用示例
const client = new KTXPrivateClient();
const balance = await client.getMainAccounts();
```

### 方法 3：通过 npm 全局安装（推荐）

```bash
# 全局安装（如果发布到 npm）
npm install -g ktx.ai.skills

# 或本地安装到项目
npm install ktx.ai.skills

# 在代码中使用
const { KTXPrivateClient } = require('ktx.ai.skills/scripts/ktx_client');
```

---

## Claude Code 安装

### 方法 1：项目集成

1. 将 ktx.ai.skills 复制到你的项目目录

```bash
# 假设你的项目在 /workspace/my-project
cd /workspace/my-project
git clone https://github.com/KTX-private/ktx.ai.skills.git ./skills/ktx
```

2. 在 Claude Code 中添加技能路径

```javascript
// 在你的项目配置中或 Claude 提示中指定
// 技能路径: ./skills/ktx/scripts/ktx_client.js
```

3. 使用示例

```javascript
// Claude Code 会自动识别技能并使用
const { KTXPrivateClient } = require('./skills/ktx/scripts/ktx_client');
```

### 方法 2：使用 Skill 加载器

创建一个技能加载器文件 `skill-loader.js`：

```javascript
// skill-loader.js
module.exports = {
  ktx: {
    name: 'KTX Exchange Skill',
    version: '1.0.0',
    path: './skills/ktx/scripts/ktx_client.js',
    description: 'KTX cryptocurrency exchange trading skill',
    capabilities: [
      'spot_trading',
      'futures_trading',
      'market_data',
      'websocket_streaming'
    ]
  }
};
```

### 方法 3：Claude Desktop / Claude Code 集成

1. 将技能库复制到 Claude 支持的技能目录

```bash
# macOS
mkdir -p ~/Library/Application\ Support/Claude/skills
cp -r ktx.ai.skills ~/Library/Application\ Support/Claude/skills/

# Linux
mkdir -p ~/.config/claude/skills
cp -r ktx.ai.skills ~/.config/claude/skills/
```

2. 重启 Claude Code

3. 在对话中引用技能

```
请使用 KTX 技能查询我的账户余额
```

---

## 其他 AI Agent 安装

### AutoGPT

```bash
# 1. 克隆技能库到 AutoGPT 的 plugins 目录
cd AutoGPT/plugins
git clone https://github.com/KTX-private/ktx.ai.skills.git

# 2. 在 AutoGPT 配置中启用插件
# 编辑 plugins.yaml 或通过 UI 启用

# 3. 配置 API 密钥
cd ktx.ai.skills
node scripts/setup_config.js
```

### GPT-Engineer

```bash
# 1. 将技能库添加到项目中
cp -r ktx.ai.skills /path/to/your/gpt-engineer/project/

# 2. 在项目说明中指定技能
# "使用 ./ktx.ai.skills/scripts/ktx_client.js 进行 KTX 交易操作"

# 3. 配置环境变量
export KTX_API_KEY="your_api_key"
export KTX_SECRET="your_secret"
```

### AgentGPT

```bash
# 1. 通过 UI 上传技能文件
# 访问 AgentGPT 网页
# Settings → Plugins → Upload Plugin
# 上传 ktx.ai.skills/scripts/ktx_client.js

# 2. 配置环境变量
# Settings → Environment Variables
# KTX_API_KEY: your_api_key
# KTX_SECRET: your_secret
```

### Cursor IDE

```bash
# 1. 在 Cursor 中打开项目
# 2. 将技能库作为模块导入
# File → Import Folder → 选择 ktx.ai.skills

# 3. 配置 API 密钥
# 运行 node scripts/setup_config.js
```

### Continue.dev

```bash
# 1. 安装到项目
npm install ktx.ai.skills

# 2. 配置 continue.config.json
{
  "skills": [
    "./node_modules/ktx.ai.skills/scripts/ktx_client.js"
  ]
}

# 3. 配置环境变量
export KTX_API_KEY="your_api_key"
export KTX_SECRET="your_secret"
```

---

## 验证安装

运行测试脚本验证安装是否成功：

```bash
# 进入技能目录
cd ktx.ai.skills

# 运行连接测试
node test/test_connection.js

# 运行完整测试套件
cd test
node run_tests.js
```

预期输出：

```
✓ KTX Skills installed successfully
✓ API connection test passed
✓ Configuration valid
```

---

## 故障排除

### 问题 1：找不到模块

**错误信息：**
```
Error: Cannot find module './scripts/ktx_client'
```

**解决方案：**
- 检查工作目录是否正确
- 确保路径相对于当前目录正确
- 使用绝对路径：`require('/full/path/to/ktx.ai.skills/scripts/ktx_client')`

### 问题 2：API 密钥未配置

**错误信息：**
```
Error: API key not configured
```

**解决方案：**
```bash
# 运行配置脚本
node scripts/setup_config.js

# 或手动创建配置文件
cat > ~/.ktx_exchange_config.json << EOF
{
  "apiKey": "your_api_key",
  "secret": "your_secret"
}
EOF
```

### 问题 3：权限被拒绝

**错误信息：**
```
Error: apikey permission denied
```

**解决方案：**
- 检查 API 密钥权限设置
- 确保在 KTX 平台上授予所需权限（View, Trade, Withdraw）
- 更新配置文件并重启应用

### 问题 4：网络连接问题

**错误信息：**
```
Error: Failed to connect to API endpoint
```

**解决方案：**
- 检查网络连接
- 验证 API 端点 URL 是否正确
- 检查防火墙/代理设置

### 问题 5：依赖安装失败

**错误信息：**
```
npm ERR! code ERESOLVE
```

**解决方案：**
```bash
# 清除 npm 缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

---

## 快速开始示例

安装完成后，你可以立即开始使用：

```javascript
// 导入技能
const { KTXPrivateClient } = require('./ktx.ai.skills/scripts/ktx_client');

// 创建客户端实例
const client = new KTXPrivateClient();

// 查询账户余额
const balance = await client.getMainAccounts();
console.log('Account Balance:', balance);

// 查询市场价格
const ticker = await client.getTicker('BTC_USDT');
console.log('BTC/USDT Price:', ticker);

// 创建订单
const order = await client.buyLimit('BTC_USDT', 0.001, 70000);
console.log('Order Created:', order);
```

---

## 支持的平台

以下平台已经过测试并支持 KTX Skills：

- ✅ OpenAI Codex
- ✅ Claude Code
- ✅ AutoGPT
- ✅ GPT-Engineer
- ✅ AgentGPT
- ✅ Cursor IDE
- ✅ Continue.dev
- ✅ 自定义 Node.js 项目

---

## 获取帮助

如果遇到安装问题：

1. 查看故障排除部分
2. 检查测试脚本输出
3. 访问 GitHub Issues: https://github.com/KTX-private/ktx.ai.skills/issues
4. 查看完整文档: [README.md](./README.md) 和 [SKILL.md](./SKILL.md)

---

## 更新技能

```bash
# 拉取最新代码
cd ktx.ai.skills
git pull origin main

# 更新依赖
npm update

# 验证更新
node test/test_connection.js
```

---

## 卸载

```bash
# 如果全局安装
npm uninstall -g ktx.ai.skills

# 如果本地安装
rm -rf ktx.ai.skills

# 清除配置（可选）
rm ~/.ktx_exchange_config.json
```
