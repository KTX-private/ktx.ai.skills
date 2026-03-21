# KTX交易所集成技能

KTX交易所的完整API集成技能，提供行情查询、账户管理、交易操作等功能。

## 📦 安装

### 系统要求

- **Node.js** v16 或更高版本（推荐 v18+ LTS）

### 快速开始

**[Quick Install Guide (English)](./QUICK_INSTALL.md)** - 5分钟快速安装（英文版）

**[快速安装指南 (中文)](./QUICK_INSTALL_zh.md)** - 5分钟快速安装（中文版）

**[完整安装指南](./INSTALLATION_GUIDE.md)** - 详细安装指南（支持 Claude Code、OpenAI Codex、OpenAI Assistants API 等 AI Agent 平台）

### 快速开始

```bash
# 克隆并配置
git clone https://github.com/KTX-private/ktx.ai.skills.git
cd ktx.ai.skills
node scripts/setup_config.js

# 验证安装
node test/test_connection.js
```

## 功能特性

- ✅ 完整的REST API封装（公共行情 + 私有用户数据）
- ✅ WebSocket实时行情推送
- ✅ WebSocket私有数据推送（账户、订单、仓位）
- ✅ 自动签名认证
- ✅ 完善的错误处理
- ✅ 安全的API密钥存储
- ✅ 丰富的使用示例
- ✅ 详细的文档说明

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置API密钥

首次使用需要配置KTX API密钥：

```bash
npm run setup
```

按照提示输入：
- API Key
- API Secret
- 选择权限（View/Trade）

配置文件将保存在 `~/.ktx_exchange_config.json`（仅限本机访问）

### 3. 测试连接

验证配置是否正确：

```bash
npm test
```

### 4. 运行示例

```bash
# 查询行情数据示例
npm run example:market

# WebSocket订阅示例
npm run example:ws

# 交易操作示例
npm run example:trade
```

## 使用方法

### 查询公共行情（无需API密钥）

```javascript
const { KTXPublicClient } = require('./scripts/ktx_client');

const publicClient = new KTXPublicClient();

// 查询单个交易对价格
const ticker = await publicClient.getTicker('BTC_USDT');
console.log('BTC价格:', ticker.last);

// 查询所有交易对
const products = await publicClient.getProducts();
console.log('交易对数量:', products.length);

// 获取所有交易对行情
const allTickers = await publicClient.getAllTickers();

// 查询深度数据
const orderBook = await publicClient.getOrderBook('BTC_USDT', 20, 2);

// 查询K线数据
const candles = await publicClient.getCandles('BTC_USDT', '1h', 100);

// 查询成交记录
const trades = await publicClient.getTrades('BTC_USDT', 10);
```

### 查询账户和交易（需要API密钥）

```javascript
const { KTXPrivateClient } = require('./scripts/ktx_client');

const privateClient = new KTXPrivateClient();

// 查询账户余额
const accounts = await privateClient.getAccounts();

// 查询订单
const orders = await privateClient.getPendingOrders();

// 交易操作
const order = await privateClient.buyLimit('BTC_USDT', 0.1, 50000);
await privateClient.cancelOrder(order.id);
```

### 兼容模式（自动选择）

```javascript
const { KTXClient } = require('./scripts/ktx_client');

// 自动检测：有API密钥使用私有客户端，否则使用公共客户端
const client = new KTXClient();

// 公共接口无需配置即可使用
const ticker = await client.getTicker('BTC_USDT');

// 私有接口需要先运行 npm run setup 配置API密钥
try {
  const accounts = await client.getAccounts();
} catch (error) {
  console.error('需要先配置API密钥');
}
```

## 目录结构

```
ktx-exchange/
├── SKILL.md                          # 技能主文档
├── README.md                         # 本文件
├── package.json                      # 项目配置
├── scripts/
│   ├── ktx_client.js                 # REST API客户端
│   ├── ktx_ws.js                     # WebSocket客户端
│   ├── setup_config.js               # 配置初始化脚本
│   ├── test_connection.js            # 连接测试脚本
│   └── examples/
│       ├── get_market_data.js        # 行情查询示例
│       ├── websocket_subscriber.js   # WebSocket订阅示例
│       └── trading_operations.js     # 交易操作示例
└── references/
    ├── api_documentation.md          # 完整API文档
    ├── signature_spec.md             # 签名规范
    └── trading_guide.md             # 交易指南
```

## 主要功能

### 1. 行情数据（公共接口）

- 获取交易对列表
- 获取市场深度
- 获取K线数据（多周期）
- 获取24小时行情
- 获取成交记录
- 获取币种列表

### 2. 账户管理（私有接口）

- 查询交易账户余额
- 查询钱包资产
- 获取充值地址
- 查询账单流水
- 查询仓位信息

### 3. 交易操作（需要Trade权限）

- 限价买入/卖出
- 市价买入/卖出
- 查询订单（单个/历史/当前）
- 撤销订单（单个/批量/全部）
- 查询成交明细
- 资产划转
- 子账户划转

### 4. WebSocket推送

**行情WebSocket（wss://m-stream.ktx.com）：**
- 深度数据推送
- 成交记录推送
- K线数据推送
- 24小时行情推送

**用户数据WebSocket（wss://u-stream.ktx.com）：**
- 账户余额变更推送
- 订单状态变更推送
- 仓位变更推送

## API密钥安全

### 安全特性

- ✅ API密钥仅存储在本地用户目录（`~/.ktx_exchange_config.json`）
- ✅ 配置文件权限设置为600（仅所有者可读写）
- ✅ 不会上传到任何云端或第三方
- ✅ 不会提交到版本控制系统（需用户自行添加到.gitignore）

### 安全建议

1. **不要分享API密钥**：API密钥包含您的账户权限
2. **设置IP白名单**：在交易所后台限制API密钥的IP访问
3. **最小权限原则**：根据实际需求选择View或Trade权限
4. **定期轮换密钥**：定期更换API Key和API Secret
5. **使用单独的API密钥**：为不同用途创建不同的API密钥
6. **监控使用情况**：定期查看API调用记录和余额变动
7. **及时停用密钥**：发现异常时立即停用API密钥

### 权限说明

| 权限 | 功能 | 适用场景 |
|------|------|----------|
| View | 查询行情、账户、订单 | 数据分析、监控、策略研究 |
| Trade | 包含View权限 + 交易操作 | 实盘交易、自动化交易 |

## 错误处理

所有API调用都可能抛出错误，建议使用try-catch捕获：

```javascript
try {
  const result = await client.someMethod();
  console.log(result);
} catch (error) {
  console.error('操作失败:', error.message);

  // 根据错误类型处理
  if (error.message.includes('20001')) {
    console.error('余额不足');
  } else if (error.message.includes('20006')) {
    console.error('请求频率超限，请稍后重试');
  }
}
```

## 常见问题

### Q1: 配置文件在哪里？

A: 配置文件保存在用户主目录：`~/.ktx_exchange_config.json`

### Q2: 如何重置配置？

A: 重新运行 `npm run setup`，会提示覆盖现有配置

### Q3: API密钥安全吗？

A: API密钥只保存在您的本地电脑，不会上传到任何云端。但请注意不要将配置文件分享给他人或提交到版本控制系统。

### Q4: View权限和Trade权限有什么区别？

A: View权限只能查询数据，Trade权限可以执行交易操作。建议根据实际需求选择。

### Q5: 如何获取API密钥？

A: 登录KTX交易所网站，进入API管理页面创建API密钥。

### Q6: 连接测试失败怎么办？

A: 请检查：
1. 网络连接是否正常
2. API密钥配置是否正确
3. API密钥权限是否足够
4. 系统时间是否准确（签名依赖时间戳）

### Q7: WebSocket连接断开如何处理？

A: 客户端已实现自动重连机制，无需手动处理。也可以监听断开事件手动处理：

```javascript
ws.on('market_disconnected', () => {
  console.log('行情连接断开');
});
```

## 依赖项

- Node.js >= 14.0.0
- ws >= 8.14.0

## 文档

详细文档请参考：
- [SKILL.md](SKILL.md) - 技能使用说明
- [references/api_documentation.md](references/api_documentation.md) - 完整API文档
- [references/signature_spec.md](references/signature_spec.md) - 签名规范
- [references/trading_guide.md](references/trading_guide.md) - 交易指南

## 许可证

MIT License

## 免责声明

本技能仅供学习和研究使用，不构成投资建议。加密货币交易存在高风险，可能导致本金损失。请在充分了解风险的前提下，根据自己的风险承受能力进行交易。作者不对任何因使用本技能造成的损失承担责任。

## 支持

如遇问题，请：
1. 查看文档中的常见问题部分
2. 检查错误信息和日志
3. 确认API密钥配置正确
4. 测试网络连接

## 更新日志

### v1.0.0 (2024-01-01)

- 初始版本发布
- 完整的REST API封装
- WebSocket实时推送支持
- 完善的文档和示例
- 安全的API密钥管理
