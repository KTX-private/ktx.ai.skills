# KTX Skill API支持总结

## 现货交易 (Spot Market)

| 功能 | 方法名 | 支持状态 | API端点 | 说明 |
|------|--------|---------|---------|------|
| 查询挂单 | `getPendingOrders()` | ✅ 支持 | `GET /v1/pending/orders` | 需要传递 `market='spot'` 参数 |
| 查询历史订单 | `getHistoryOrders()` | ✅ 支持 | `GET /v1/history/orders` | 需要传递 `market='spot'` 参数 |
| 创建限价买单 | `buyLimit()` | ✅ 支持 | `POST /v1/order` | 现货专用 |
| 创建限价卖单 | `sellLimit()` | ✅ 支持 | `POST /v1/order` | 现货专用 |
| 创建市价买单 | `buyMarket()` | ✅ 支持 | `POST /v1/order` | 现货专用 |
| 创建市价卖单 | `sellMarket()` | ✅ 支持 | `POST /v1/order` | 现货专用 |
| 查询单个订单 | `getOrder()` | ✅ 支持 | `GET /v1/order` | 需要订单ID |
| 取消订单 | `cancelOrder()` | ✅ 支持 | `POST /v1/order/delete` | 需要订单ID |
| 批量取消订单 | `cancelOrders()` | ✅ 支持 | `POST /v1/orders/delete` | 需要订单ID列表 |
| 取消所有订单 | `cancelAllOrders()` | ✅ 支持 | `POST /v1/orders/delete` | 可指定交易对 |
| 查询成交记录 | `getFills()` | ✅ 支持 | `GET /v1/fills` | 支持分页和筛选 |
| 查询账户余额 | `getAccounts()` | ✅ 支持 | `GET /v1/accounts` | 交易账户余额 |
| 查询主账户余额 | `getMainAccounts()` | ✅ 支持 | `GET /v1/main/accounts` | 钱包余额 |
| 资产划转 | `transfer()` | ✅ 支持 | `POST /v1/transfer` | 钱包<->交易账户 |
| 充值地址 | `getDepositAddress()` | ✅ 支持 | `GET /v1/depositAddr` | 需要币种 |
| 提现 | `withdraw()` | ✅ 支持 | `POST /v1/withdraw` | 需要币种和地址 |

## U本位合约 (LPC Futures/Swap)

| 功能 | 方法名 | 支持状态 | API端点 | 说明 |
|------|--------|---------|---------|------|
| 查询挂单 | `getPendingOrders()` | ⚠️ 部分支持 | `GET /v1/pending/orders` | **需要**传递 `market='lpc'` 参数 |
| 查询历史订单 | `getHistoryOrders()` | ⚠️ 部分支持 | `GET /v1/history/orders` | **需要**传递 `market='lpc'` 参数 |
| 创建订单 | `createOrder()` | ⚠️ 部分支持 | `POST /v1/order` | **需要**手动传递合约参数 |
| 查询单个订单 | `getOrder()` | ⚠️ 部分支持 | `GET /v1/order` | 合约订单也可查询 |
| 取消订单 | `cancelOrder()` | ✅ 支持 | `POST /v1/order/delete` | 现货和合约共用 |
| 批量取消订单 | `cancelOrders()` | ✅ 支持 | `POST /v1/orders/delete` | 现货和合约共用 |
| 取消所有订单 | `cancelAllOrders()` | ✅ 支持 | `POST /v1/orders/delete` | 现货和合约共用 |
| 查询成交记录 | `getFills()` | ⚠️ 部分支持 | `GET /v1/fills` | 可能需要传递 `market='lpc'` |
| 查询持仓 | `getPositions()` | ✅ 支持 | `GET /v1/positions` | **合约专属功能** |

## 市场数据 (Market Data) - 现货和合约通用

| 功能 | 方法名 | 支持状态 | API端点 | 说明 |
|------|--------|---------|---------|------|
| 查询产品列表 | `getProducts()` | ✅ 支持 | `GET /v1/products` | 所有交易对 |
| 查询深度数据 | `getOrderBook()` | ✅ 支持 | `GET /v1/order_book` | 支持指定深度 |
| 查询K线 | `getCandles()` | ✅ 支持 | `GET /v1/candles` | 支持多时间周期 |
| 查询24小时行情 | `getTicker()` | ✅ 支持 | `GET /v1/ticker` | 单个交易对 |
| 查询所有行情 | `getAllTickers()` | ✅ 支持 | `GET /v1/tickers` | 所有交易对 |
| 查询成交记录 | `getTrades()` | ✅ 支持 | `GET /v1/trades` | 最新成交 |
| 查询服务器时间 | `getTime()` | ✅ 支持 | `GET /v1/time` | 服务器时间戳 |
| 查询币种信息 | `getCoins()` | ✅ 支持 | `GET /v1/coins` | 币种列表 |

## 主要问题汇总

### 1. 现货交易
**优点**:
- ✅ 所有常用方法都已实现
- ✅ 有专门的买卖方法 (`buyLimit`, `sellLimit` 等)
- ✅ 用户体验良好

**缺点**:
- ⚠️ `getPendingOrders` 和 `getHistoryOrders` 默认不传递 `market='spot'`
- ⚠️ 参数验证要求 `amount`，但API使用 `quantity`

### 2. U本位合约交易
**优点**:
- ✅ 基础API端点都已实现
- ✅ 可以通过手动传参完成合约操作
- ✅ `getPositions()` 方法专门用于查询持仓

**缺点**:
- ❌ **没有**专门的合约订单查询方法
- ❌ **没有**专门的合约订单创建方法
- ❌ 需要手动传递 `market='lpc'` 参数
- ❌ 需要手动传递复杂的合约参数 (`leverage`, `marginMethod`, `positionMerge`)
- ❌ 参数验证与实际API不匹配

## 推荐改进方案

### 方案1: 添加现货和合约的专用方法 (推荐)

```javascript
// 现货订单查询
async getSpotOrders(symbol) {
  const params = symbol ? { market: 'spot', symbol } : { market: 'spot' };
  return await this.getUserData('/v1/pending/orders', params);
}

// 合约订单查询
async getFuturesOrders(symbol) {
  const params = symbol ? { market: 'lpc', symbol } : { market: 'lpc' };
  return await this.getUserData('/v1/pending/orders', params);
}

// 合约限价买单
async buyFuturesLimit(symbol, quantity, price, options = {}) {
  const params = {
    symbol,
    product: symbol,
    side: 'buy',
    type: 'limit',
    quantity: String(quantity),
    amount: String(quantity),
    price: String(price),
    leverage: options.leverage || 10,
    marginMethod: options.marginMethod || 'cross',
    positionMerge: options.positionMerge || 'long',
    timeInForce: 'gtc',
    ...options
  };
  return await this.postUserData('/v1/order', params);
}

// 合约限价卖单
async sellFuturesLimit(symbol, quantity, price, options = {}) {
  const params = {
    symbol,
    product: symbol,
    side: 'sell',
    type: 'limit',
    quantity: String(quantity),
    amount: String(quantity),
    price: String(price),
    leverage: options.leverage || 10,
    marginMethod: options.marginMethod || 'cross',
    positionMerge: options.positionMerge || 'short',
    timeInForce: 'gtc',
    ...options
  };
  return await this.postUserData('/v1/order', params);
}
```

### 方案2: 改进现有方法

1. 修改 `getPendingOrders` 方法的默认参数
2. 添加参数自动映射 (`amount` <-> `quantity`)
3. 改进参数验证逻辑

## 使用示例

### 现货交易
```javascript
const client = new KTXClient();

// 查询现货挂单
const spotOrders = await client.getPendingOrders({ market: 'spot' });

// 创建现货订单
await client.buyLimit('BTC_USDT', 0.01, 50000);

// 取消现货订单
await client.cancelOrder(orderId);
```

### 合约交易
```javascript
const client = new KTXPrivateClient();

// 查询合约挂单 (当前需要手动传参)
const futuresOrders = await client.getUserData('/v1/pending/orders', {
  market: 'lpc',
  symbol: 'BTC_USDT_SWAP'
});

// 创建合约订单 (当前需要手动传参)
await client.postUserData('/v1/order', {
  symbol: 'BTC_USDT_SWAP',
  product: 'BTC_USDT_SWAP',
  side: 'buy',
  type: 'limit',
  amount: '0.000675',
  quantity: '0.000675',
  price: '70500.0',
  leverage: 10,
  marginMethod: 'cross',
  positionMerge: 'long',
  timeInForce: 'gtc'
});

// 查询持仓
const positions = await client.getPositions();
```

## 总结

**现货交易**: ✅ **完全支持**，所有功能都已实现，用户体验良好

**U本位合约交易**: ⚠️ **部分支持**，核心功能可用但用户体验较差，需要手动传递复杂参数

**建议优先级**:
1. **高优先级**: 添加合约专用的查询和创建订单方法
2. **中优先级**: 改进参数验证和参数映射
3. **低优先级**: 完善文档和示例代码
