#!/usr/bin/env node

const { KTXPrivateClient, KTXPublicClient } = require('./ktx_client');

// 1. Get futures mark price
async function getMarkPrice(symbol) {
  try {
    const client = new KTXPublicClient();
    const markPriceData = await client.getMarkPrice(symbol);
    
    console.log('====================================');
    console.log('   Futures Mark Price');
    console.log('====================================\n');
    
    if (markPriceData) {
      console.log('Symbol:', markPriceData.symbol);
      console.log('Mark Price:', markPriceData.markPrice);
      console.log('Last Price:', markPriceData.lastPrice);
      console.log('Index Price:', markPriceData.indexPrice);
      console.log('Funding Rate:', (markPriceData.fundingRate * 100).toFixed(4) + '%');
      if (markPriceData.nextFundingTime) {
        console.log('Next Funding Time:', new Date(markPriceData.nextFundingTime).toLocaleString());
      }
    } else {
      console.log('No mark price data found for symbol:', symbol);
    }
    
    console.log('\n====================================\n');
    
    return markPriceData;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

// 2. Get futures USDT balance
async function getFuturesUSDTBalance() {
  try {
    const client = new KTXPrivateClient();
    const accounts = await client.getAccounts();
    const usdtAccount = accounts.result.find(acc => acc.asset === 'USDT');
    
    console.log('====================================');
    console.log('   Futures USDT Balance');
    console.log('====================================\n');
    
    if (usdtAccount) {
      console.log('Total Balance:', parseFloat(usdtAccount.balance).toFixed(6), 'USDT');
      console.log('Available:', parseFloat(usdtAccount.withdrawable).toFixed(6), 'USDT');
      console.log('Locked:', parseFloat(usdtAccount.holds).toFixed(6), 'USDT');
      if (usdtAccount.collateral) console.log('Collateral: Yes');
    } else {
      console.log('No USDT found');
    }
    
    console.log('\n====================================\n');
    return usdtAccount;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

// 3. Create market order with take profit and stop loss
async function createMarketOrderWithTPSL(symbol, side, quantity, options = {}) {
  try {
    const client = new KTXPrivateClient();
    const publicClient = new KTXPublicClient();
    
    const {
      leverage = 10,
      takeProfitPercent = 2,
      stopLossPercent = 1,
      transfer_id = null
    } = options;
    
    // Get current price
    const ticker = await publicClient.getTicker(symbol);
    const currentPrice = parseFloat(ticker.last_price);
    
    // Calculate TP/SL prices
    let takeProfitPrice, stopLossPrice;
    if (side.toLowerCase() === 'buy') {
      takeProfitPrice = currentPrice * (1 + takeProfitPercent / 100);
      stopLossPrice = currentPrice * (1 - stopLossPercent / 100);
    } else {
      takeProfitPrice = currentPrice * (1 - takeProfitPercent / 100);
      stopLossPrice = currentPrice * (1 + stopLossPercent / 100);
    }
    
    console.log('====================================');
    console.log('   Create Market Order with TP/SL');
    console.log('====================================\n');
    console.log('Symbol:', symbol);
    console.log('Side:', side.toUpperCase());
    console.log('Quantity:', quantity);
    console.log('Leverage:', leverage + 'x');
    console.log('Current Price:', currentPrice);
    console.log('Take Profit:', takeProfitPrice.toFixed(6), `(+${takeProfitPercent}%)`);
    console.log('Stop Loss:', stopLossPrice.toFixed(6), `(-${stopLossPercent}%)`);
    console.log('');
    
    // Create market order
    const orderParams = {
      symbol,
      product: symbol,
      side: side.toLowerCase(),
      type: 'market',
      quantity: String(quantity),
      amount: String(quantity),
      market: 'lpc',
      leverage,
      marginMethod: 'cross',
      positionMerge: side.toLowerCase() === 'buy' ? 'long' : 'short',
      timeInForce: 'gtc',
      mini: false,
      stf: 'disabled',
      close: false,
      postOnly: false
    };
    
    if (transfer_id) orderParams.transfer_id = transfer_id;
    
    console.log('Submitting order...');
    const result = await client.createOrder(orderParams);
    
    if (result && (result.state === 0 || result.state === '0')) {
      console.log('Success! Order ID:', result.id);
      console.log('Status:', result.status);
      console.log('\nNote: TP/SL orders should be created as separate limit orders.');
      console.log('\n====================================\n');
      return result;
    } else {
      throw new Error(result?.msg || 'Order creation failed');
    }
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

// 4. Get active futures orders
async function getActiveFuturesOrders(symbol = null) {
  try {
    const client = new KTXPrivateClient();
    const params = { market: 'lpc' };
    if (symbol) params.symbol = symbol;
    
    const orders = await client.getPendingOrders(params);
    
    console.log('====================================');
    console.log('   Active Futures Orders');
    console.log('====================================\n');
    
    if (orders.result && orders.result.length > 0) {
      console.log('Active orders:', orders.result.length);
      orders.result.forEach((order, i) => {
        console.log(`\nOrder ${i + 1}:`);
        console.log('  ID:', order.id);
        console.log('  Symbol:', order.symbol || order.product);
        console.log('  Side:', order.side);
        console.log('  Type:', order.type);
        console.log('  Price:', order.price);
        console.log('  Quantity:', order.amount);
        console.log('  Filled:', order.filled_amount || '0');
        console.log('  Status:', order.status);
      });
    } else {
      console.log('No active orders');
    }
    
    console.log('\n====================================\n');
    return orders.result || [];
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

// 5. Get order status by ID
async function getOrderStatus(orderId) {
  try {
    const client = new KTXPrivateClient();
    
    console.log('====================================');
    console.log('   Order Status');
    console.log('====================================\n');
    console.log('Order ID:', orderId);
    
    const order = await client.getOrder(orderId);
    
    if (order && (order.state === 0 || order.state === '0')) {
      const data = order.result || order;
      console.log('\nOrder Details:');
      console.log('  Symbol:', data.symbol || data.product);
      console.log('  Side:', data.side);
      console.log('  Type:', data.type);
      console.log('  Price:', data.price);
      console.log('  Quantity:', data.amount);
      console.log('  Filled:', data.filled_amount || '0');
      console.log('  Avg Price:', data.avg_fill_price || 'N/A');
      console.log('  Fee:', data.fee || '0');
      console.log('  Status:', data.status);
      console.log('  Created:', new Date(data.create_time).toLocaleString());
      
      console.log('\n====================================\n');
      return data;
    } else {
      throw new Error('Order not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

// 6. Get user positions list
async function getUserPositions() {
  try {
    const client = new KTXPrivateClient();
    const positions = await client.getPositions();
    
    console.log('====================================');
    console.log('   User Positions List');
    console.log('====================================\n');
    
    if (positions.result && positions.result.length > 0) {
      let hasActive = false;
      positions.result.forEach(pos => {
        const size = parseFloat(pos.quantity || 0);
        const posMargin = parseFloat(pos.posMargin || 0);
        
        if (Math.abs(size) > 0 || posMargin > 0) {
          hasActive = true;
          console.log(`\n${pos.symbol || pos.product}:`);
          console.log('  Side:', (pos.side || (size > 0 ? 'LONG' : 'SHORT')).toUpperCase());
          console.log('  Leverage:', pos.leverage + 'x');
          console.log('  Size:', size.toFixed(6));
          console.log('  Entry Price:', parseFloat(pos.entryPrice || 0).toFixed(6));
          console.log('  Position Margin:', posMargin.toFixed(6));
          console.log('  Order Margin:', parseFloat(pos.orderMargin || 0).toFixed(6));
        }
      });
      if (!hasActive) console.log('No active positions');
    } else {
      console.log('No positions found');
    }
    
    console.log('\n====================================\n');
    return positions.result || [];
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log('Usage: node futures_complete.js <command> [args...]');
    console.log('\nCommands:');
    console.log('  1. mark_price <SYMBOL>         - Get futures mark price');
    console.log('  2. futures_balance              - Get futures USDT balance');
    console.log('  3. market_order <SYMBOL> <SIDE> <QTY> [options]');
    console.log('                                    - Create market order with TP/SL');
    console.log('  4. active_orders [SYMBOL]       - Get active futures orders');
    console.log('  5. order_status <ID>           - Get order status');
    console.log('  6. positions                   - Get user positions');
    console.log('\nOptions for market_order:');
    console.log('  --leverage <N>   Leverage (default: 10)');
    console.log('  --tp <N>          Take profit % (default: 2)');
    console.log('  --sl <N>          Stop loss % (default: 1)');
    console.log('\nExamples:');
    console.log('  node futures_complete.js mark_price BTC_USDT');
    console.log('  node futures_complete.js futures_balance');
    console.log('  node futures_complete.js market_order BTC_USDT buy 0.1 --leverage 10');
    console.log('  node futures_complete.js active_orders BTC_USDT');
    console.log('  node futures_complete.js order_status 123456');
    console.log('  node futures_complete.js positions');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'mark_price':
        getMarkPrice(args[1] || 'BTC_USDT');
        break;
      case 'futures_balance':
        getFuturesUSDTBalance();
        break;
      case 'market_order':
        if (!args[1] || !args[2] || !args[3]) {
          throw new Error('Missing: symbol side quantity');
        }
        const opts = {};
        for (let i = 4; i < args.length; i++) {
          if (args[i] === '--leverage') opts.leverage = parseInt(args[++i]);
          if (args[i] === '--tp') opts.takeProfitPercent = parseFloat(args[++i]);
          if (args[i] === '--sl') opts.stopLossPercent = parseFloat(args[++i]);
        }
        createMarketOrderWithTPSL(args[1], args[2], args[3], opts);
        break;
      case 'active_orders':
        getActiveFuturesOrders(args[1]);
        break;
      case 'order_status':
        if (!args[1]) throw new Error('Order ID required');
        getOrderStatus(args[1]);
        break;
      case 'positions':
        getUserPositions();
        break;
      default:
        throw new Error('Unknown command: ' + command);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

module.exports = {
  getMarkPrice,
  getFuturesUSDTBalance,
  createMarketOrderWithTPSL,
  getActiveFuturesOrders,
  getOrderStatus,
  getUserPositions
};
