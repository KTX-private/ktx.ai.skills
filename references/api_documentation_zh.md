# KTX API文档

## 基础信息

### Base URLs

| 类型 | URL |
|------|-----|
| 行情数据REST | `https://api.ktx.com/api` |
| 用户数据REST | `https://api.ktx.com/papi` |
| 行情WebSocket | `wss://m-stream.ktx.com` |
| 用户数据WebSocket | `wss://u-stream.ktx.com` |

### 请求方法

- `GET`：查询行情或账户等数据
- `POST`：提交下单、提现、划转等写操作

### 参数位置

- GET请求：参数放在URL Query String
- POST请求：参数放在JSON Body

### 响应格式

所有接口返回JSON格式数据。

## 流量限制

| 限制类型 | 限制值 | 说明 |
|---------|--------|------|
| 请求频率 | 每10秒最多10,000次 | 超限返回错误码`-20007` |
| CPU使用 | 每10秒最多10,000点 | 超限返回错误码`-20006` |
| 响应头 | `Ktx-Usage: t1:t2:t3` | 查看当前使用情况 |

## 认证与签名

### 私有接口HTTP头

所有私有接口需在HTTP头中包含：

| 头部名称 | 说明 |
|---------|------|
| `api-key` | API Key |
| `api-sign` | HMAC-SHA256签名 |
| `api-expire-time` | 请求过期时间（毫秒级UNIX时间戳） |

### 签名步骤

1. 计算 `expire_time = Date.now() + 有效期`（建议30秒）
2. 构造原始字符串：
   - GET请求：`expire_time + queryStr`
   - POST请求：`expire_time + bodyStr`
3. 使用 `HMAC-SHA256(secret, 原始字符串)` 计算签名
4. 将签名输出为hex字符串，作为 `api-sign`

### API Key权限

| 权限 | 说明 |
|------|------|
| View | 仅可查询私有数据 |
| Trade | 可下单、撤单、划转等交易操作 |

## 公共行情接口

### 1. 测试连通性

```
GET /v1/ping
```

响应：`pong`

### 2. 获取服务器时间

```
GET /v1/time
```

响应：
```json
{
  "server_time": 1677648000000
}
```

### 3. 获取币种列表

```
GET /v1/coins
```

响应：
```json
[
  {
    "currency": "BTC",
    "chains": [
      {
        "chain": "BTC",
        "protocol": "OMNI",
        "contract_address": "",
        "min_deposit": "0.001"
      }
    ]
  }
]
```

### 4. 获取交易对列表

```
GET /v1/products
```

查询参数：
- `market` (可选): 市场类型，如 `spot`
- `symbol` (可选): 交易对symbol

响应：
```json
[
  {
    "symbol": "BTC_USDT",
    "base_currency": "BTC",
    "quote_currency": "USDT",
    "min_base_amount": "0.001",
    "min_quote_amount": "10",
    "price_scale": 2,
    "amount_scale": 8,
    "amount_precision": 8,
    "price_precision": 2
  }
]
```

### 5. 获取深度数据

```
GET /v1/order_book
```

查询参数：
- `symbol` (必需): 交易对symbol
- `level` (可选): 档位深度，默认20
- `price_scale` (可选): 价格精度，默认2

响应：
```json
{
  "symbol": "BTC_USDT",
  "bids": [
    ["50000.00", "0.1"],
    ["49999.00", "0.5"]
  ],
  "asks": [
    ["50001.00", "0.2"],
    ["50002.00", "0.3"]
  ],
  "timestamp": 1677648000000
}
```

### 6. 获取K线数据

```
GET /v1/candles
```

查询参数：
- `symbol` (必需): 交易对symbol
- `time_frame` (必需): K线周期，如 `1m`, `5m`, `15m`, `1h`, `4h`, `1d`
- `limit` (可选): 返回数量，默认100，最大1000
- `before` (可选): 查询指定时间之前的K线（毫秒时间戳）
- `after` (可选): 查询指定时间之后的K线（毫秒时间戳）

响应：
```json
[
  [1677648000000, "50000.00", "50100.00", "49900.00", "50050.00", "100"],
  [1677648060000, "50050.00", "50150.00", "50000.00", "50100.00", "150"]
]
```

数组格式：`[时间戳, 开盘价, 最高价, 最低价, 收盘价, 成交量]`

### 7. 获取成交记录

```
GET /v1/trades
```

查询参数：
- `symbol` (必需): 交易对symbol
- `limit` (可选): 返回数量，默认100，最大500
- `before` (可选): 查询指定时间之前的成交
- `after` (可选): 查询指定时间之后的成交

响应：
```json
[
  {
    "id": 123456789,
    "create_time": 1677648000000,
    "price": "50000.00",
    "amount": "0.1",
    "side": "buy"
  }
]
```

### 8. 获取24小时行情

```
GET /v1/ticker
```

查询参数：
- `symbol` (可选): 交易对symbol，不传则返回所有

响应（单个交易对）：
```json
{
  "symbol": "BTC_USDT",
  "last_price": "50000.00",
  "low_24h": "49000.00",
  "high_24h": "51000.00",
  "change_24h": "1000.00",
  "change_percentage_24h": "2.04",
  "volume_24h": "1000.5",
  "quote_volume_24h": "50000000.00"
}
```

## 用户数据接口（需要签名）

### 1. 获取交易账户资产

```
GET /v1/trade/accounts
```

响应：
```json
[
  {
    "currency": "BTC",
    "available": "1.5",
    "frozen": "0.5",
    "total": "2.0"
  },
  {
    "currency": "USDT",
    "available": "10000.00",
    "frozen": "5000.00",
    "total": "15000.00"
  }
]
```

### 2. 获取钱包资产

```
GET /v1/main/accounts
```

响应格式同上。

### 3. 获取充值地址

```
GET /v1/depositAddr
```

查询参数：
- `coin` (必需): 币种

响应：
```json
{
  "currency": "BTC",
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "chain": "BTC",
  "tag": ""
}
```

### 4. 获取账单流水

```
GET /v1/ledgers
```

查询参数：
- `currency` (可选): 币种
- `limit` (可选): 返回数量
- `before` (可选): 查询指定时间之前的记录
- `after` (可选): 查询指定时间之后的记录

响应：
```json
[
  {
    "id": 123456,
    "currency": "BTC",
    "type": "deposit",
    "amount": "1.0",
    "balance": "10.0",
    "create_time": 1677648000000
  }
]
```

### 5. 创建委托

```
POST /v1/order
```

请求参数：
```json
{
  "symbol": "BTC_USDT",
  "side": "buy",
  "type": "limit",
  "amount": "0.1",
  "price": "50000",
  "time_in_force": "GTC"
}
```

参数说明：
- `symbol` (必需): 交易对symbol
- `side` (必需): `buy` 或 `sell`
- `type` (必需): `limit` 或 `market`
- `amount` (必需): 数量
- `price` (必需): 价格（限价单必需）
- `time_in_force` (可选): `GTC`, `IOC`, `FOK`，默认`GTC`

响应：
```json
{
  "id": 123456789,
  "symbol": "BTC_USDT",
  "side": "buy",
  "type": "limit",
  "amount": "0.1",
  "price": "50000.00",
  "filled_amount": "0",
  "status": "open",
  "create_time": 1677648000000
}
```

### 6. 查询指定委托

```
GET /v1/order?id=123456789
```

查询参数：
- `id` (必需): 订单ID

响应格式同创建委托响应。

### 7. 查询历史委托

```
GET /v1/history/orders
```

查询参数：
- `symbol` (可选): 交易对
- `status` (可选): 订单状态
- `limit` (可选): 返回数量
- `before` (可选): 查询指定时间之前
- `after` (可选): 查询指定时间之后

响应：
```json
[
  {
    "id": 123456789,
    "symbol": "BTC_USDT",
    "side": "buy",
    "type": "limit",
    "amount": "0.1",
    "price": "50000.00",
    "filled_amount": "0.1",
    "status": "filled",
    "create_time": 1677648000000
  }
]
```

### 8. 查询当前未成交委托

```
GET /v1/pending/orders
```

查询参数：
- `symbol` (可选): 交易对

响应格式同查询历史委托。

### 9. 撤销委托

```
POST /v1/order/delete
```

请求参数：
```json
{
  "id": 123456789
}
```

响应：
```json
{
  "id": 123456789,
  "status": "cancelled"
}
```

### 10. 批量撤销委托

```
POST /v1/orders/delete
```

请求参数：
```json
{
  "ids": [123456789, 123456790, 123456791]
}
```

或撤销指定交易对的所有订单：
```json
{
  "symbol": "BTC_USDT"
}
```

响应：
```json
{
  "cancelled_ids": [123456789, 123456790],
  "failed_ids": []
}
```

### 11. 获取仓位信息

```
GET /v1/positions
```

响应：
```json
[
  {
    "symbol": "BTC_USDT",
    "side": "long",
    "size": "1.5",
    "entry_price": "50000.00",
    "mark_price": "50100.00",
    "unrealized_pnl": "150.00",
    "leverage": "10"
  }
]
```

### 12. 获取成交明细

```
GET /v1/fills
```

查询参数：
- `symbol` (可选): 交易对
- `order_id` (可选): 订单ID
- `limit` (可选): 返回数量
- `before` (可选): 查询指定时间之前
- `after` (可选): 查询指定时间之后

响应：
```json
[
  {
    "id": 123456,
    "order_id": 123456789,
    "symbol": "BTC_USDT",
    "side": "buy",
    "price": "50000.00",
    "amount": "0.1",
    "fee": "5.0",
    "fee_currency": "USDT",
    "create_time": 1677648000000
  }
]
```

### 13. 资产划转

```
POST /v1/transfer
```

请求参数：
```json
{
  "coin": "USDT",
  "amount": "1000",
  "direction": "main_to_trade"
}
```

参数说明：
- `coin` (必需): 币种
- `amount` (必需): 数量
- `direction` (必需): `main_to_trade`（钱包到交易账户）或 `trade_to_main`（交易账户到钱包）

### 14. 子账户资产划转

```
POST /v1/subaccount/transfer
```

请求参数：
```json
{
  "uid": "123456",
  "coin": "USDT",
  "amount": "1000",
  "direction": "in"
}
```

### 15. 提现

```
POST /v1/withdraw
```

请求参数：
```json
{
  "coin": "BTC",
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "chain": "BTC",
  "amount": "0.1",
  "tag": ""
}
```

## WebSocket接口

### 行情WebSocket

连接地址：`wss://m-stream.ktx.com`

#### 订阅消息

```json
{
  "id": 1,
  "method": "SUBSCRIBE",
  "params": ["spot.BTC_USDT.order_book.20"]
}
```

#### 取消订阅

```json
{
  "id": 2,
  "method": "UNSUBSCRIBE",
  "params": ["spot.BTC_USDT.order_book.20"]
}
```

#### 支持的流类型

| 流类型 | 格式 | 说明 |
|--------|------|------|
| 深度数据 | `spot.{symbol}.order_book.{depth}` | 深度数据，depth为档位 |
| 成交记录 | `spot.{symbol}.trades` | 成交记录 |
| K线数据 | `spot.{symbol}.candles.{time_frame}` | K线数据 |
| 24小时行情 | `spot.{symbol}.ticker` | 24小时行情 |

### 用户数据WebSocket

连接地址：`wss://u-stream.ktx.com`

#### 登录

```json
{
  "method": "LOGIN",
  "auth": {
    "api-key": "your_api_key",
    "api-sign": "your_signature"
  }
}
```

#### 心跳

```json
{
  "ping": 1677648000000
}
```

#### 订阅流

```json
{
  "id": 1,
  "method": "SUBSCRIBE",
  "params": ["account"]
}
```

#### 支持的流类型

| 流类型 | 说明 |
|--------|------|
| `account` | 账户余额变更 |
| `order` | 委托状态、成交变更 |
| `position` | 仓位变更 |

## 错误码

| 错误码 | 说明 |
|--------|------|
| -10000 | 网络错误 |
| -10001 | 未实现 |
| -10002 | 无权限 |
| -10003 | 未知错误 |
| -12001 | 缺少必需参数 |
| -12002 | 参数格式错误 |
| -12003 | 签名错误 |
| -12101 | API Key不存在 |
| -12102 | API Key已过期 |
| -12103 | 请求过期 |
| -20001 | 余额不足 |
| -20002 | 下单失败 |
| -20006 | CPU限制超限 |
| -20007 | 请求频率超限 |
| -21001 | 订单不存在 |
| -21002 | 订单已完成 |
| -21401 | 币种不支持 |

## 订单类型

### 订单类型

| 类型 | 说明 |
|------|------|
| `limit` | 限价单 |
| `market` | 市价单 |

### 订单方向

| 方向 | 说明 |
|------|------|
| `buy` | 买入 |
| `sell` | 卖出 |

### 订单状态

| 状态 | 说明 |
|------|------|
| `open` | 未成交 |
| `filled` | 已成交 |
| `cancelled` | 已撤销 |
| `partial_filled` | 部分成交 |
| `rejected` | 已拒绝 |

### 时间有效期

| 类型 | 说明 |
|------|------|
| `GTC` | 撤销前有效（默认）|
| `IOC` | 立即成交或取消 |
| `FOK` | 全部成交或取消 |

## K线周期

| 周期 | 说明 |
|------|------|
| `1m` | 1分钟 |
| `5m` | 5分钟 |
| `15m` | 15分钟 |
| `1h` | 1小时 |
| `4h` | 4小时 |
| `1d` | 1天 |
| `1w` | 1周 |
| `1M` | 1月 |
