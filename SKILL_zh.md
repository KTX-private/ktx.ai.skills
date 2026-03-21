---
name: ktx-exchange
description: KTX交易所集成技能，提供行情查询、账户管理、交易操作等完整功能。当用户需要查询KTX交易所的实时行情、管理账户资产、执行交易操作、订阅行情推送时使用此技能。支持现货和合约交易、深度数据、K线、成交记录、账户余额、订单管理等功能。
version: 1.0.0
---

# KTX交易所集成技能

## 概述

本技能提供KTX交易所的完整API集成功能，支持通过自然语言进行行情查询、账户管理、交易操作等。技能包含REST API客户端和WebSocket客户端，涵盖公共行情数据（深度、K线、成交记录）和私有用户数据（账户、订单、仓位）。

## 快速开始

### 首次使用 - 配置API密钥

首次使用前需要配置KTX API密钥，密钥将安全存储在本地用户目录中：

```bash
cd /Users/ceze/cezework/madbros/ktx.ai.skills/scripts
node setup_config.js
```

按照提示输入：
- API Key
- API Secret
- API密钥权限（View/Trade）

配置文件将保存在 `~/.ktx_exchange_config.json`（仅限本机访问）

### 验证配置

```bash
node scripts/test_connection.js
```

## 核心功能

### 1. 行情数据（公共接口，无需认证）

#### 查询交易对列表
```
获取KTX所有交易对
列出可交易的币种
查询BTC_USDT交易对信息
```

#### 查询市场深度
```
获取BTC_USDT的订单簿深度
查询深度数据，显示20档
获取ETH_USDT的买卖盘
```

#### 查询K线数据
```
获取BTC_USDT的1小时K线
查询过去24小时的K线数据
获取ETH_USDT的15分钟蜡烛图
```

#### 查询24小时行情
```
获取BTC_USDT的24小时行情
查询所有交易对的ticker
显示最新价格和成交量
```

#### 查询成交记录
```
获取BTC_USDT的最近成交
查询历史成交记录
```

### 2. WebSocket行情订阅

#### 实时行情推送
```
订阅BTC_USDT的实时行情
监听ETH_USDT的价格变动
订阅多个交易对的深度数据
```

支持的流类型：
- `order_book` - 深度数据
- `trades` - 成交记录
- `candles` - K线数据
- `ticker` - 24小时行情

### 3. 账户管理（需要认证）

#### 查询账户资产
```
查询我的账户余额
获取我的可用资金
列出所有币种资产
```

#### 查询订单
```
查询当前挂单
获取历史委托
查询指定订单详情
```

#### 查询成交记录
```
查询我的成交明细
获取历史成交记录
```

#### 查询仓位（合约）
```
查询我的持仓
获取仓位信息
```

### 4. 交易操作（需要Trade权限）

#### 下单操作
```
买入0.1个BTC
卖出5个ETH
限价买入BTC_USDT，价格50000
市价卖出10个ETH
```

#### 撤单操作
```
撤销订单123456
撤销所有挂单
批量撤单
```

#### 资产划转
```
从钱包划转到交易账户
从交易账户划转到钱包
划转100 USDT
```

## 工作流程

### 行情查询流程

1. 确定查询类型（深度/K线/ticker/成交记录）
2. 获取交易对symbol
3. 调用相应的REST API接口
4. 解析并格式化返回数据

### 交易操作流程

1. 验证API密钥配置和权限
2. 确定交易参数（symbol、方向、数量、价格等）
3. 构建请求参数并签名
4. 调用下单接口
5. 处理返回结果和错误

### WebSocket订阅流程

1. 连接到行情WebSocket（`wss://m-stream.ktx.com`）
2. 发送SUBSCRIBE消息订阅指定流
3. 接收并处理实时推送数据
4. 可随时UNSUBSCRIBE取消订阅

### 私有数据推送流程

1. 连接到用户数据WebSocket（`wss://u-stream.ktx.com`）
2. 使用api-key和api-sign登录
3. 订阅account/order/position流
4. 接收实时账户变更推送

## API认证与签名

所有私有接口需要在HTTP头中包含：
- `api-key`: API Key
- `api-sign`: HMAC-SHA256签名
- `api-expire-time`: 请求过期时间（毫秒级时间戳）

签名计算步骤：
1. 计算 `expire_time = Date.now() + 有效期`
2. 原始字符串 = `expire_time + queryStr`（GET）或 `expire_time + bodyStr`（POST）
3. 使用 HMAC-SHA256(secret, 原始字符串)
4. 输出hex字符串作为 `api-sign`

详细的签名实现见 `scripts/ktx_client.js`

## 错误处理

常见错误码：
- `-10000` ~ `-10003`: 网络或权限错误
- `-12001` ~ `-12103`: 参数或签名错误
- `-20001` ~ `-20007`: 业务错误（余额不足、下单失败等）
- `-20006`: CPU限制超限
- `-20007`: 请求频率超限

处理错误时：
1. 检查错误码和错误信息
2. 对于认证错误，提示用户检查API密钥
3. 对于限流错误，等待后重试
4. 对于业务错误，提供明确的错误原因

## 流量限制

- 同一IP每10秒最多10,000次请求
- 同一IP每10秒最多消耗10,000点CPU
- 可从响应头 `Ktx-Usage: t1:t2:t3` 查看当前使用情况

## 资源使用

### scripts/

#### ktx_client.js
核心KTX API客户端，提供：
- REST API请求封装
- 自动签名处理
- 错误处理和重试
- 响应数据格式化

主要方法：
- `getMarketData(path, params)` - 查询公共行情数据
- `getUserData(path, params, method)` - 查询私有数据（GET）
- `postUserData(path, data)` - 提交私有操作（POST）
- `getProducts(params)` - 获取交易对列表
- `getOrderBook(symbol, level, priceScale)` - 获取深度数据
- `getCandles(symbol, timeFrame, limit)` - 获取K线数据
- `getTicker(symbol)` - 获取24小时行情
- `getTrades(symbol, limit)` - 获取成交记录
- `getAccounts()` - 查询账户余额
- `getOrders(filters)` - 查询订单
- `createOrder(params)` - 创建订单
- `cancelOrder(orderId)` - 撤销订单
- `cancelAllOrders(symbol)` - 撤销所有订单
- `getPositions()` - 查询仓位
- `transfer(params)` - 资产划转

#### ktx_ws.js
KTX WebSocket客户端，提供：
- 行情WebSocket连接管理
- 用户数据WebSocket连接管理
- 订阅/取消订阅管理
- 消息解析和回调处理

主要方法：
- `connectMarketWS()` - 连接行情WebSocket
- `subscribe(streams)` - 订阅行情流
- `unsubscribe(streams)` - 取消订阅
- `connectUserWS()` - 连接用户数据WebSocket
- `loginUser()` - 用户数据登录
- `subscribeAccount()` - 订阅账户变更
- `subscribeOrder()` - 订阅订单变更
- `subscribePosition()` - 订阅仓位变更
- `on(event, callback)` - 事件监听

#### setup_config.js
配置文件初始化脚本，交互式创建API密钥配置文件。

#### test_connection.js
连接测试脚本，验证API密钥和基本功能。

#### examples/
使用示例脚本：
- `get_market_data.js` - 查询行情数据示例
- `websocket_subscriber.js` - WebSocket订阅示例
- `trading_operations.js` - 交易操作示例

### references/

#### api_documentation.md
KTX API完整文档，包含：
- 所有REST API端点详细说明
- 请求参数和响应格式
- WebSocket协议规范
- 错误码完整列表

#### signature_spec.md
API签名详细规范，包含：
- 签名算法说明
- 多种编程语言实现示例
- 常见问题和调试技巧

#### trading_guide.md
交易操作指南，包含：
- 订单类型说明（市价/限价/止盈止损）
- 订单状态说明
- 仓位计算方法
- 风险控制建议

## 安全注意事项

1. **API密钥安全**
   - 永远不要将API密钥硬编码在代码中
   - 配置文件仅保存在本地用户目录（`~/.ktx_exchange_config.json`）
   - 不要将配置文件提交到版本控制系统

2. **权限控制**
   - 仅查询功能使用 `View` 权限
   - 需要交易操作使用 `Trade` 权限
   - 建议为不同用途创建不同API密钥

3. **签名安全**
   - 使用HTTPS进行所有API调用
   - 定期轮换API密钥
   - 签名过期时间不宜过长

4. **资金安全**
   - 测试环境先进行小额测试
   - 验证订单参数后再执行
   - 建议设置止损限价

## 使用示例

### 查询行情
```javascript
const client = require('./scripts/ktx_client.js');

// 获取交易对列表
const products = await client.getProducts();
console.log(products);

// 获取深度数据
const orderBook = await client.getOrderBook('BTC_USDT', 20, 2);
console.log(orderBook);

// 获取K线
const candles = await client.getCandles('BTC_USDT', '1h', 100);
console.log(candles);

// 获取24小时行情
const ticker = await client.getTicker('BTC_USDT');
console.log(ticker);
```

### WebSocket订阅
```javascript
const ws = require('./scripts/ktx_ws.js');

// 连接行情WebSocket
await ws.connectMarketWS();

// 订阅BTC_USDT深度
ws.subscribe(['spot.BTC_USDT.order_book.20']);

// 监听深度更新
ws.on('order_book', (data) => {
  console.log('Order book update:', data);
});
```

### 交易操作
```javascript
const client = require('./scripts/ktx_client.js');

// 查询账户余额
const accounts = await client.getAccounts();
console.log(accounts);

// 限价买入
const order = await client.createOrder({
  symbol: 'BTC_USDT',
  side: 'buy',
  type: 'limit',
  amount: '0.1',
  price: '50000'
});
console.log(order);

// 撤销订单
await client.cancelOrder(order.id);
```

## 故障排查

### 问题：API密钥认证失败
- 检查配置文件路径是否正确
- 验证API Key和Secret是否正确
- 确认系统时间是否准确（签名依赖时间戳）
- 检查IP白名单设置

### 问题：请求频率超限
- 减少请求频率
- 使用WebSocket订阅代替轮询
- 批量查询替代单次查询

### 问题：WebSocket连接断开
- 检查网络连接
- 实现心跳机制
- 添加自动重连逻辑

## 扩展开发

如需扩展功能：
1. 在 `scripts/ktx_client.js` 中添加新的API方法
2. 在 `scripts/ktx_ws.js` 中添加新的WebSocket处理逻辑
3. 在 `references/` 中添加相应的文档
4. 在 `examples/` 中添加使用示例

## 版本历史

### v1.0.0
- 初始版本
- 支持基础行情查询
- 支持账户管理
- 支持交易操作
- 支持WebSocket行情和私有数据推送
- 完整的错误处理和安全机制
