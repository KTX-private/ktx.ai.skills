# 交易操作指南

## 概述

本指南详细介绍KTX交易所的交易操作流程、订单类型、风险控制等内容。

## 订单类型

### 限价单（Limit Order）

限价单是指定价格和数量的订单，只有当市场价格达到或优于指定价格时才会成交。

**特点：**
- 可以设置买入或卖出价格
- 只有市场价格达到设定价格才会成交
- 可以设置有效期（GTC/IOC/FOK）
- 适合精确控制交易价格

**使用场景：**
- 在特定价格买入或卖出
- 设置止盈或止损价格
- 对冲现有仓位

**示例：**
```javascript
// 限价买入
await client.buyLimit('BTC_USDT', 0.1, 50000);

// 限价卖出
await client.sellLimit('BTC_USDT', 0.1, 55000);
```

### 市价单（Market Order）

市价单是以当前市场最优价格立即成交的订单，不需要指定价格。

**特点：**
- 无需指定价格，立即成交
- 以市场最优价格成交
- 可能存在滑点
- 适合快速交易

**使用场景：**
- 紧急需要买入或卖出
- 市场波动较大时快速入场/出场
- 不太在意具体价格

**示例：**
```javascript
// 市价买入
await client.buyMarket('BTC_USDT', 0.1);

// 市价卖出
await client.sellMarket('BTC_USDT', 0.1);
```

## 订单有效期（Time In Force）

### GTC（Good Till Cancelled）

撤销前有效，订单将一直保持有效直到被完全成交或手动撤销。

- **默认选项**
- 适合长期挂单
- 可以设置多个价格梯队

### IOC（Immediate Or Cancel）

立即成交或取消，订单中能立即成交的部分成交，剩余部分立即撤销。

- **适合大额交易**
- 避免部分成交
- 减少订单簿积压

### FOK（Fill Or Kill）

全部成交或取消，要么全部成交，要么全部撤销。

- **适合精确数量的交易**
- 避免部分成交
- 对流动性要求较高

**示例：**
```javascript
// IOC订单
await client.createOrder({
  symbol: 'BTC_USDT',
  side: 'buy',
  type: 'limit',
  amount: '1.0',
  price: '50000',
  time_in_force: 'IOC'
});

// FOK订单
await client.createOrder({
  symbol: 'BTC_USDT',
  side: 'sell',
  type: 'limit',
  amount: '1.0',
  price: '55000',
  time_in_force: 'FOK'
});
```

## 订单状态

| 状态 | 说明 | 处理建议 |
|------|------|----------|
| `open` | 未成交 | 可以撤销或等待成交 |
| `partial_filled` | 部分成交 | 可以撤销剩余部分或继续等待 |
| `filled` | 已成交 | 订单已完成 |
| `cancelled` | 已撤销 | 订单已取消 |
| `rejected` | 已拒绝 | 检查余额、价格等参数 |

## 订单操作流程

### 1. 查询账户余额

在下单前，建议先查询账户余额，确保有足够的资金：

```javascript
const accounts = await client.getAccounts();
const usdtBalance = accounts.find(a => a.currency === 'USDT');
console.log('可用USDT:', usdtBalance.available);
```

### 2. 获取当前价格

获取当前市场价格作为参考：

```javascript
const ticker = await client.getTicker('BTC_USDT');
console.log('最新价格:', ticker.last_price);
console.log('24h最高:', ticker.high_24h);
console.log('24h最低:', ticker.low_24h);
```

### 3. 下单

根据策略选择合适的订单类型：

```javascript
// 限价买入示例
const order = await client.buyLimit('BTC_USDT', 0.1, 50000);
console.log('订单ID:', order.id);
```

### 4. 监控订单状态

查询订单状态：

```javascript
const order = await client.getOrder(orderId);
console.log('订单状态:', order.status);
console.log('已成交数量:', order.filled_amount);
```

### 5. 撤销订单（如需要）

```javascript
await client.cancelOrder(orderId);
// 或批量撤销
await client.cancelOrders([orderId1, orderId2]);
// 或撤销所有订单
await client.cancelAllOrders('BTC_USDT');
```

## 风险控制

### 1. 止盈设置

设置目标价格，达到后自动卖出：

```javascript
// 在入场价格+10%处设置止盈
const entryPrice = 50000;
const targetPrice = entryPrice * 1.1;

await client.sellLimit('BTC_USDT', 0.1, targetPrice);
```

### 2. 止损设置

设置止损价格，降低损失：

```javascript
// 在入场价格-5%处设置止损
const entryPrice = 50000;
const stopLossPrice = entryPrice * 0.95;

await client.sellLimit('BTC_USDT', 0.1, stopLossPrice);
```

### 3. 仓位控制

不要将所有资金投入单一交易：

```javascript
const totalBalance = 10000; // 总资金
const riskPerTrade = 0.02;  // 单笔交易风险2%
const riskAmount = totalBalance * riskPerTrade;

const stopLossDistance = 500; // 止损距离
const positionSize = riskAmount / stopLossDistance;

console.log('建议仓位:', positionSize);
```

### 4. 资金管理建议

- 不要使用超过总资金5%的资金进行单笔交易
- 保留至少20%的可用资金作为风险缓冲
- 逐步建仓，不要一次性重仓
- 分散投资，不要集中在单一交易对

## 成交记录管理

### 查询成交明细

```javascript
// 查询所有成交记录
const fills = await client.getFills({ limit: 50 });

// 查询特定交易对的成交
const btcFills = await client.getFills({
  symbol: 'BTC_USDT',
  limit: 20
});

// 查询特定订单的成交
const orderFills = await client.getFills({
  order_id: orderId
});
```

### 计算交易成本

```javascript
const fills = await client.getFills({ limit: 100 });
let totalFee = 0;
let totalVolume = 0;

fills.forEach(fill => {
  totalFee += parseFloat(fill.fee);
  totalVolume += parseFloat(fill.amount);
});

console.log('总成交数量:', totalVolume);
console.log('总手续费:', totalFee);
console.log('手续费率:', (totalFee / totalVolume) * 100, '%');
```

## 资产划转

### 钱包到交易账户

```javascript
await client.transfer({
  coin: 'USDT',
  amount: '1000',
  direction: 'main_to_trade'
});
```

### 交易账户到钱包

```javascript
await client.transfer({
  coin: 'USDT',
  amount: '500',
  direction: 'trade_to_main'
});
```

## 高级策略

### 1. 网格交易

在价格区间内设置多个限价单，自动高抛低吸：

```javascript
// 简化的网格交易示例
const basePrice = 50000;
const gridSize = 10;
const gridStep = 0.02; // 2%间距
const orderAmount = 0.01;

for (let i = 0; i < gridSize; i++) {
  const buyPrice = basePrice * (1 - i * gridStep);
  const sellPrice = basePrice * (1 + i * gridStep);

  // 买入单
  client.buyLimit('BTC_USDT', orderAmount, buyPrice);

  // 卖出单
  client.sellLimit('BTC_USDT', orderAmount, sellPrice);
}
```

### 2. 分批建仓

将大单分成多个小单，降低市场冲击：

```javascript
const totalAmount = 1.0;
const batches = 5;
const batchAmount = totalAmount / batches;

for (let i = 0; i < batches; i++) {
  setTimeout(async () => {
    await client.buyLimit('BTC_USDT', batchAmount, 50000 + i * 100);
  }, i * 30000); // 每30秒下一个单
}
```

### 3. 条件单模拟

虽然API不直接支持条件单，但可以通过监控实现：

```javascript
async function conditionalOrder() {
  const ticker = await client.getTicker('BTC_USDT');
  const price = parseFloat(ticker.last_price);

  if (price < 48000) {
    // 价格跌破48000，买入
    await client.buyMarket('BTC_USDT', 0.1);
  } else if (price > 52000) {
    // 价格突破52000，卖出
    await client.sellMarket('BTC_USDT', 0.1);
  }
}

// 定期检查
setInterval(conditionalOrder, 60000); // 每分钟检查一次
```

## 错误处理

### 常见错误

1. **余额不足**（-20001）
   - 检查账户余额
   - 减少下单数量
   - 划转资金到交易账户

2. **下单失败**（-20002）
   - 检查价格是否在合理范围内
   - 确认交易对存在且可交易
   - 检查订单参数是否正确

3. **订单不存在**（-21001）
   - 确认订单ID正确
   - 检查订单是否已完成或已撤销

### 错误处理示例

```javascript
try {
  const order = await client.buyLimit('BTC_USDT', 0.1, 50000);
  console.log('下单成功:', order.id);
} catch (error) {
  if (error.message.includes('20001')) {
    console.error('余额不足，请检查账户余额');
  } else if (error.message.includes('20002')) {
    console.error('下单失败，请检查订单参数');
  } else {
    console.error('未知错误:', error.message);
  }
}
```

## 最佳实践

1. **小额测试**：在生产环境使用前，先进行小额测试
2. **参数验证**：下单前仔细验证所有参数
3. **日志记录**：记录所有交易操作，便于审计和调试
4. **异常处理**：完善的错误处理和重试机制
5. **安全第一**：不要将API密钥硬编码在代码中
6. **风险控制**：设置止损和止盈，控制单笔交易风险
7. **实时监控**：使用WebSocket实时监控订单状态
8. **定期复盘**：定期回顾交易记录，优化策略

## 免责声明

本指南仅供学习参考，不构成投资建议。加密货币交易存在高风险，可能导致本金损失。请在充分了解风险的前提下，根据自己的风险承受能力进行交易。作者不对任何因使用本指南造成的损失承担责任。
