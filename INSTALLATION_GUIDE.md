# KTX Skills 安装指南

本指南详细介绍如何将 KTX Skills 安装到不同的 AI Agent 平台，包括手动安装和各平台自动安装。

## 系统要求

### Node.js 版本要求

**最低要求：** Node.js v16.0.0 或更高版本

**推荐版本：** Node.js v18.x LTS 或 v20.x LTS

### 检查 Node.js 版本

```bash
# 检查是否已安装 Node.js
node --version

# 如果未安装或版本过低，请参考下面的安装说明
```

### 安装 Node.js

#### 方法 1：使用官方安装包（推荐）

**macOS / Linux:**
```bash
# 使用 nvm (Node Version Manager) 安装
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc  # 或 source ~/.zshrc (取决于你的 shell)

# 安装最新的 LTS 版本
nvm install --lts

# 使用 LTS 版本
nvm use --lts
```

**Windows:**
1. 访问 https://nodejs.org/
2. 下载并安装 LTS 版本（推荐 20.x LTS）
3. 重启命令行窗口

#### 方法 2：使用包管理器

**macOS (Homebrew):**
```bash
brew install node
```

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**CentOS/RHEL:**
```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

#### 方法 3：在 AI Agent 环境中安装 Node.js

如果你的 AI Agent 运行在受限环境中，可能需要通过以下方式安装：

**在 AI Agent 的系统提示中：**

```
请先安装 Node.js v18 或更高版本：
- macOS/Linux: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash && source ~/.bashrc && nvm install --lts
- Windows: 访问 https://nodejs.org/ 下载安装包
```

**在 AI Agent 的代码执行环境中：**

```bash
# 如果有权限，使用 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install --lts
nvm use --lts
```

### 验证 Node.js 安装

```bash
# 检查版本
node --version  # 应显示 v18.x.x 或更高

# 检查 npm 版本
npm --version
```

---

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

# 3. 验证安装（公共接口无需 API 密钥）
node test/test_connection.js
```

**重要说明：**
- 公共接口（行情数据、价格查询等）无需配置 API 密钥即可使用
- 私有接口（交易、账户管理）需要配置 API 密钥，可以在需要时再配置
- 你可以先使用公共接口进行测试，之后再配置 API 密钥进行交易操作

### 方式 2：下载 ZIP

1. 访问 https://github.com/KTX-private/ktx.ai.skills
2. 点击 "Code" → "Download ZIP"
3. 解压到目标目录
4. 进入目录并运行配置脚本

### 配置 API 密钥（可选）

**公共接口无需 API 密钥即可使用。** 你可以在需要使用私有操作时再配置。

#### 公共接口 vs 私有接口

| 功能类型 | 需要 API 密钥 | 示例操作 |
|---------|-------------|---------|
| **公共接口** | ❌ 不需要 | 查询行情、价格、订单簿、K线、成交记录 |
| **私有接口** | ✅ 需要 | 交易、查询余额、订单管理、仓位信息、充值提现 |

#### 何时配置 API 密钥

在以下情况下配置 API 密钥：
- 需要执行交易操作
- 需要查询账户余额
- 需要管理订单
- 需要访问私有账户数据
- 需要使用充值/提现功能

#### 配置方法

**方式 1：交互式配置（推荐）**

```bash
# 运行交互式配置脚本
node scripts/setup_config.js
```

按提示输入：
- API Key
- API Secret

**方式 2：手动配置**

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

## OpenAI 平台安装

KTX Skills 完全支持所有 OpenAI 平台，包括：
- OpenAI Codex
- OpenAI ChatGPT (通过 API)
- OpenAI Assistants API
- 任何基于 OpenAI 的 AI Agent

### OpenAI Codex 安装

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

### OpenAI Assistants API 集成

如果你想将 KTX Skills 集成到 OpenAI Assistants API：

1. 创建一个 Assistant 函数定义：

```json
{
  "type": "function",
  "function": {
    "name": "get_ktx_balance",
    "description": "Get KTX exchange account balance",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  }
}
```

2. 在你的 Python 后端中调用：

```python
from openai import OpenAI
import subprocess

def get_ktx_balance():
    result = subprocess.run(
        ['node', '/path/to/ktx.ai.skills/scripts/examples/get_balance.js'],
        capture_output=True,
        text=True
    )
    return result.stdout

# 在 Assistant 中使用
client = OpenAI()
assistant = client.beta.assistants.create(
    name="Trading Assistant",
    instructions="You are a trading assistant with KTX integration",
    tools=[{"type": "function", "function": get_ktx_balance}],
    model="gpt-4-turbo"
)
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

**重要提示：** 所有 AI Agent 平台都需要先安装 Node.js v16 或更高版本才能使用 KTX Skills。

### 如何在 AI Agent 中安装 Node.js

#### 方法 1：在系统提示中要求安装

在与 AI Agent 对话时，首先要求安装 Node.js：

```
请先安装 Node.js v18 或更高版本，然后再使用 KTX Skills。
```

AI Agent 应该会执行以下命令（或类似命令）：

```bash
# macOS/Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc  # 或 source ~/.zshrc
nvm install --lts
nvm use --lts

# 验证安装
node --version
```

#### 方法 2：在 AI Agent 配置中预安装 Node.js

某些 AI Agent 允许在启动配置中安装依赖：

**示例配置：**
```json
{
  "preinstall_commands": [
    "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash",
    "source ~/.bashrc",
    "nvm install --lts"
  ]
}
```

#### 方法 3：使用 Docker 镜像（推荐）

如果使用 Docker，可以选择预装 Node.js 的镜像：

```dockerfile
FROM node:20-alpine

# 安装 KTX Skills
WORKDIR /app
COPY . /app/
RUN npm install
```

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

### OpenAI 生态
- ✅ OpenAI Codex
- ✅ OpenAI ChatGPT (via API)
- ✅ OpenAI Assistants API
- ✅ OpenAI GPT-4o/o1

### Claude 生态
- ✅ Claude Code
- ✅ Claude Desktop
- ✅ Claude.ai (Web)

### 自主 Agent 框架
- ✅ AutoGPT
- ✅ GPT-Engineer
- ✅ AgentGPT
- ✅ BabyAGI

### 开发工具
- ✅ Cursor IDE
- ✅ Continue.dev
- ✅ VS Code (自定义配置)
- ✅ 自定义 Node.js 项目

### 其他平台
- ✅ 任何支持 Node.js 的 AI Agent
- ✅ 任何支持 API 调用的 AI 助手

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
