# KTX Skills 总览

KTX Skills 为 AI 助手提供 KTX 交易所的完整 API 集成，支持自然语言交易操作。

---

## 技能列表

| Skill | 描述 | 版本 | 状态 | 核心功能 |
|--------|--------|------|------|----------|
| ktx-exchange-spot | 现货交易 | 2026.3.23.1 | ✅ Active | 行情查询、账户查询、资产查询、下单管理 |
| ktx-exchange-futures | 合约交易 | 待开发 | - | 合约下单、平仓、杠杆、止损止盈 |
| ktx-market-analysis | 市场分析 | 待开发 | - | 技术分析、趋势判断、风险提示 |
| ktx-ws-streams | WebSocket 实时流 | 已实现 | ✅ Active | 实时行情、成交推送 |
| ktx-assets | 资产管理 | 已实现 | ✅ Active | 余额查询、账户估值、流水查询 |
| ktx-account | 账户管理 | 已实现 | ✅ Active | 订单管理、成交历史、持仓查询 |

---

## 已实现功能

### 1. ktx-exchange-spot（现货交易）

**核心功能：**
- ✅ 行情数据查询（公共接口）
  - 获取交易对列表 (`/v1/products`)
  - 获取单个交易对 24h 行情 (`/v1/ticker`)
  - 获取所有交易对信息（通过 products）
  - 获取订单簿深度 (`/v1/order_book`)
  - 获取 K 线数据 (`/v1/candles`)
  - 获取成交记录 (`/v1/trades`)
  
- ✅ 私有数据查询（需要 API Key）
  - 查询账户余额 (`/papi/v1/accounts`)
  - 查询可用余额
  - 查询资产总览
  
- ✅ 订单管理（需要 API Key + Trade 权限）
  - 查询当前挂单
  - 查询订单详情
  - 创建限价单
  - 创建市价单
  - 撤销订单
  - 批量撤单

**MCP 集成：**
- ✅ MCP Server 已部署：`https://api.ktx.info/mcp`
- ✅ 6 个公共工具已验证可用
- ✅ 支持自然语言交易指令

**使用示例（自然语言）：**
```
用户：帮我在 KTX 交易所以 68000 U 价格买入 0.1 BTC 现货
用户：以市价卖出 5 ETH
用户：查询 BTC 当前价格
用户：查看我的账户余额
```

---

### 2. ktx-ws-streams（WebSocket 实时流）

**核心功能：**
- ✅ 行情 WebSocket 连接管理
- ✅ 实时行情订阅（order_book、trades、candles、ticker）
- ✅ 用户数据 WebSocket 连接管理
- ✅ 账户数据实时推送（account、order、position）

**支持的流类型：**
- `order_book` - 订单簿深度推送
- `trades` - 成交记录推送
- `candles` - K 线推送
- `ticker` - 24h 行情推送

---

### 3. ktx-assets（资产查询）

**核心功能：**
- ✅ 查询主账户余额
- ✅ 查询所有账户余额
- ✅ 账户总估值查询
- ✅ 账户流水查询

**API 端点：**
- GET `/papi/v1/main-accounts` - 主账户余额
- GET `/papi/v1/accounts` - 所有账户余额
- GET `/papi/v1/account-assets` - 账户估值
- GET `/papi/v1/bills` - 账户流水

---

### 4. ktx-account（账户与订单）

**核心功能：**
- ✅ 查询订单列表（pending、filled、cancelled）
- ✅ 查询订单详情
- ✅ 创建订单（限价/市价）
- ✅ 撤销订单
- ✅ 查询成交历史
- ✅ 查询持仓（合约）

**API 端点：**
- GET `/papi/v1/orders` - 订单列表
- GET `/papi/v1/orders/{id}` - 订单详情
- POST `/papi/v1/orders` - 创建订单
- DELETE `/papi/v1/orders/{id}` - 撤销订单
- GET `/papi/v1/fills` - 成交历史
- GET `/papi/v1/positions` - 持仓查询

---

## 对标 Gate Skills 分析

### 当前覆盖度对比

| 功能类别 | Gate Skills | KTX Skills | 差距分析 |
|---------|------------|------------|----------|
| **行情查询** | 10+ Skills | 1 Skill | 需扩展更多专业分析工具 |
| **现货交易** | gate-exchange-spot | ktx-exchange-spot | 功能相当，需自然语言优化 |
| **合约交易** | gate-exchange-futures | ❌ 未实现 | 需开发合约交易 skill |
| **资产查询** | gate-exchange-assets | ktx-assets | 功能相当 |
| **账户管理** | gate-exchange-subaccount | ktx-account | 功能相当，需补充子账户 |
| **理财/质押** | gate-exchange-simpleearn<br>gate-staking | ❌ 未实现 | 需开发理财/质押技能 |
| **市场分析** | gate-info-coinanalysis<br>gate-info-marketoverview<br>gate-info-trendanalysis<br>gate-exchange-marketanalysis | ❌ 未实现 | 需开发市场分析技能 |
| **新闻资讯** | gate-news-briefing<br>gate-news-eventexplain | ❌ 未实现 | 需集成新闻/事件 API |
| **风险检测** | gate-info-riskcheck | ❌ 未实现 | 可集成第三方风险评估服务 |
| **趋势分析** | gate-info-trendanalysis | ❌ 未实现 | 需开发技术分析工具 |
| **跨所交易** | gate-exchange-crossex | ❌ 未实现 | 需开发跨所交易 skill |
| **VIP/费率** | gate-exchange-vipfee | ❌ 未实现 | 需开发费率查询 skill |
| **地址追踪** | gate-info-addresstracker | ❌ 未实现 | 需开发链上数据追踪 skill |
| **多币对比** | gate-info-coincompare | ❌ 未实现 | 需开发币种对比工具 |
| **理财/双币** | gate-exchange-dual | ❌ 未实现 | 需开发双币理财 skill |
| **子账户** | gate-exchange-subaccount | ktx-account 需补充 | 需实现子账户管理 |
| **闪兑** | gate-exchange-flashswap | ❌ 未实现 | 需开发闪兑 skill |
| **交易 Copilot** | gate-exchange-trading-copilot | ❌ 未实现 | 需开发智能交易助手 |

### 优先开发方向

#### 第一优先级（核心交易功能完善）
1. **ktx-exchange-futures** - 合约交易
   - 合约下单（开多/开空）
   - 平仓操作
   - 杠杆设置与查询
   - 止损止盈设置

2. **ktx-exchange-subaccount 增强**
   - 子账户创建
   - 子账户查询
   - 子账户锁定/解锁
   - 资产划转

3. **自然语言交易指令优化**
   - "帮我在 KTX 买入 0.1 BTC" → 自动解析并调用现货下单 API
   - "以 68000 价格 10 倍杠杆开多 100U 仓位" → 自动调用合约开仓 API
   - "查询我的持仓" → 自动查询并展示持仓
   - "平掉所有多单" → 自动批量平仓
   - "设置 5% 止损" → 自动为持仓添加止损订单

#### 第二优先级（增值功能）
1. **ktx-market-analysis** - 市场分析
   - 技术指标计算（MA、RSI、MACD 等）
   - K 线趋势判断
   - 支撑/阻力位识别
   - 价格突破检测
   - 风险评估报告

2. **ktx-exchange-simpleearn** / **ktx-staking** - 理财/质押
   - 产品列表查询
   - 持仓收益查询
   - 利率信息
   - 申购/赎回操作

3. **ktx-news-integration** - 新闻/事件
   - 重大事件推送
   - 项目新闻聚合
   - 社交情绪分析
   - 价格异动原因追溯

#### 第三优先级（高级功能）
1. **ktx-exchange-trading-copilot** - 交易助手
   - 行情智能分析
   - 风控建议
   - 最佳下单时机判断
   - 自动止损建议

2. **ktx-risk-check** - 风险检测
   - 蜜罐检测
   - Rug Pull 风险评估
   - 税费计算
   - 持币集中度分析

3. **ktx-dex-market** - DEX 集成
   - 链上代币信息
   - DEX 路由
   - Swap 执行
   - 跨链资产查询

---

## MCP Server 状态

**部署地址：** `https://api.ktx.info/mcp`

**已验证工具（公共 API）：**
- ✅ `get_trading_pairs` - 查询所有交易对
- ✅ `get_ticker` - 获取 24h 行情（支持 spot/lpc 市场）
- ✅ `get_all_tickers` - 获取所有交易对信息
- ✅ `get_orderbook` - 查询订单簿深度
- ✅ `get_kline` - 查询 K 线数据
- ✅ `get_trades` - 查询成交记录

**待添加工具（私有 API）：**
- 🔨 `get_account_balance` - 查询账户余额
- 🔨 `get_orders` - 查询订单列表
- 🔨 `create_order` - 创建订单
- 🔨 `cancel_order` - 撤销订单
- 🔨 `get_positions` - 查询持仓
- 🔨 `get_fills` - 查询成交历史

**WebSocket 订阅工具：**
- 🔨 `subscribe_orderbook` - 订阅订单簿
- 🔨 `subscribe_ticker` - 订阅 24h 行情
- 🔨 `subscribe_trades` - 订阅成交记录

---

## 版本更新日志

### v2026.3.23.1（当前版本）
- ✅ 现货交易基础功能完成
- ✅ MCP Server 部署并验证
- ✅ WebSocket 实时流实现
- ✅ 资产查询功能完成
- ✅ 账户管理功能完成
- ⚠️ 自然语言交易指令需优化
- ❌ 合约交易功能未实现
- ❌ 理财/质押功能未实现
- ❌ 市场分析功能未实现

### 未来版本计划

#### v2026.4
- 🚀 开发合约交易技能
- 🚀 开发理财/质押技能
- 🚀 优化自然语言交易指令
- 🚀 添加子账户管理

#### v2026.5
- 🚀 开发市场分析技能
- 🚀 集成新闻/事件 API
- 🚀 开发风险检测工具
- 🚀 开发交易 Copilot
- 🚀 添加 DEX 集成

---

## 快速开始指南

### 安装 KTX Skills

**使用 Claude Code：**
```bash
mkdir -p ~/.config/claude/skills
cp -r ktx.ai.skills ~/.config/claude/skills/
```

**使用 OpenClaw：**
发送消息：`Help me install this skill: https://github.com/KTX-private/ktx.ai.skills`

**使用 Cursor：**
执行：`bash skills/ktx-mcp-cursor-installer/scripts/install.sh`

**使用 npx（通用方法）：**
```bash
npx skills add https://github.com/KTX-private/ktx.ai.skills
```

### 配置 API Key（可选）

公共接口无需配置 API Key，交易功能需要：

```bash
cd ktx.ai.skills/scripts
node setup_config.js
```

### 测试安装

```bash
node test/test_connection.js
```

成功输出：`✓ Connection successful`

---

## 使用示例

### 自然语言交易指令

**现货交易：**
```
帮我在 KTX 以市价买入 0.1 BTC
帮我在 KTX 以限价 68000 卖出 0.05 BTC
查询我的账户余额
查看 BTC 当前价格
```

**合约交易（需开发 futures skill）：**
```
帮我在 KTX 以 68000 价格 10 倍杠杆开多 100U 价值 BTC 仓位
平掉所有 BTC 多单
设置 5% 止损
```

### API 调用示例

**查询行情：**
```javascript
const { KTXPublicClient } = require('./scripts/ktx_client');
const client = new KTXPublicClient();

const ticker = await client.getTicker('BTC_USDT');
console.log('BTC/USDT Price:', ticker);

const orderbook = await client.getOrderBook('BTC_USDT');
console.log('Order Book:', orderbook);
```

**交易操作：**
```javascript
const { KTXPrivateClient } = require('./scripts/ktx_client');
const client = new KTXPrivateClient();

// 查询余额
const balance = await client.getMainAccounts();
console.log('Balance:', balance);

// 下单
const order = await client.buyLimit('BTC_USDT', 0.1, 68000);
console.log('Order:', order);
```

---

## 技术支持

- **API 文档：** [SKILL.md](./SKILL.md)
- **完整安装指南：** [QUICK_INSTALL.md](./QUICK_INSTALL.md)
- **中文安装指南：** [QUICK_INSTALL_zh.md](./QUICK_INSTALL_zh.md)
- **使用示例：** [scripts/examples/](./scripts/examples/)
- **详细文档：** [references/](./references/)

---

## 免责声明

⚠️ **风险警告：**
- 合约交易风险极高，可能导致本金全部损失
- 高杠杆交易波动性极大
- 市场瞬息万变，实际成交价格可能与预期不同
- 技术分析仅供参考，不构成投资建议
- 投资有风险，入市需谨慎
- 请充分了解交易机制和风险后再操作
- 请结合自身风险承受能力合理配置杠杆

---

**版本：** v2026.3.23.1
**更新时间：** 2026-03-23
**维护者：** KTX Skills Team
