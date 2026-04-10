# KTX Trading Guide

## Overview

This guide provides comprehensive information about trading on KTX exchange, including spot trading, futures trading, risk management, and best practices.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Trading Basics](#2-trading-basics)
3. [Order Types](#3-order-types)
4. [Order Status](#4-order-status)
5. [Time in Force](#5-time-in-force)
6. [Order Parameters](#6-order-parameters)
7. [Leverage and Margin](#7-leverage-and-margin)
8. [Risk Management](#8-risk-management)
9. [Trading Tips](#9-trading-tips)
10. [FAQ](#10-faq)

---

## 1. Introduction

KTX exchange supports both spot trading and futures trading (USDT-margined perpetual contracts).

### Key Features

- **Spot Trading:** Buy and sell cryptocurrencies
- **Futures Trading:** Long and short positions with leverage
- **Market Orders:** Limit orders at specific prices
- **Stop Orders:** Stop-loss and take-profit orders
- **Real-time Data:** WebSocket market data streaming
- **Account Management:** Multi-asset support

---

## 2. Trading Basics

### Spot Trading

**Order Flow**
1. Place buy order
2. Order gets matched
3. Position opened
4. Price moves in your favor
5. Close position (sell to take profit)

### Futures Trading

**Position Types**
- **Long:** Betting price will go up
- **Short:** Betting price will go down
- **Leverage:** Multiplier on position value (1x to 100x)

**Important Notes:**
- Long positions profit when price rises
- Short positions profit when price falls
- Leverage amplifies both gains AND losses
- Higher leverage = Higher risk

---

## 3. Order Types

### Limit Orders

Executed at a specific price or better.

**Types:**
- **Limit Buy Order:** Buy at or below specified price
- **Limit Sell Order:** Sell at or above specified price
- **Limit orders sit in the order book until matched**

### Market Orders

Executed immediately at current market price.

### Stop Orders

Automated orders to manage risk:
- **Stop-Loss Order:** Automatically closes position to limit loss
- **Take-Profit Order:** Automatically closes position to lock in profit

**Time in Force:**
- `GTC` (Good Till Cancel): Valid until cancelled, then filled or cancelled
- `IOC` (Immediate Or Cancel): Execute immediately, remaining gets cancelled
- `FOK` (Fill Or Kill): Execute fully, partial fills allowed

---

## 4. Order Status

| Status | Description |
|--------|-------------|
| `open` | Waiting to be matched |
| `filled` | Fully executed |
| `cancelled` | Cancelled by user or system |
| `partial_filled` | Partially executed |

---

## 5. Time in Force

| Value | Description | Usage |
|-------|-------------|
| `GTC` | Good Till Cancel (default) | Valid until cancelled |
| `IOC` | Immediate Or Cancel | Use for immediate execution |
| `FOK` | Fill Or Kill | Allow partial fills |

---

## 6. Order Parameters

### Required Parameters

- **symbol**: Trading pair symbol (e.g., `BTC_USDT` for spot, `BTC_USDT_SWAP` for futures)
- **side**: `buy` or `sell`
- **type**: Order type (`limit`, `market`)
- **amount**: Order quantity
- **price**: Order price (required for limit orders)

### Optional Parameters

- **time_in_force**: Time in force type
- **client_order_id**: Unique identifier for order
- **reduce_only**: Reduce position only (for stop-loss/take-profit)

---

## 7. Leverage and Margin

### Understanding Leverage

**Leverage Formula**
```
Position Value = Amount × Price
Required Margin = Position Value / Leverage
```

**Example:**
- Position: 0.1 BTC at 68,000 USDT
- 10x Leverage: 68,000 USDT / 10 = 6,800 USDT margin
- 20x Leverage: 68,000 USDT / 20 = 3,400 USDT margin

**Leverage Levels**
- **Low Risk:** 1-5x for spot, 1-10x for futures
- **Medium Risk:** 5-10x
- **High Risk:** 10-20x
- **Extreme Risk:** 20-100x

**Risk Warnings:**
- Price drops 10% at 10x leverage = 100% loss
- Price drops 5% at 20x leverage = 100% loss
- Liquidation can occur quickly at high leverage

---

## 8. Risk Management

### Position Sizing

**Risk per Trade Rule:** Never risk more than 1-2% of your total portfolio on a single trade.

**Stop-Loss Strategies**

#### Percentage Stop-Loss
- Close position at a fixed percentage loss (e.g., 5%, 10%, 20%)
- **Example:** Buy at 68,000, set 10% stop-loss at 61,200

#### Trailing Stop-Loss
- Stop-loss follows price in your favor as it rises
- **Example:** Buy at 68,000, set 10% trailing stop-loss

#### ATR-Based Stop-Loss
- Use Average True Range (ATR) indicator
- Set stop-loss at entry price ± 2 × ATR

### Take-Profit Strategies

#### Fixed Profit Target
- Close at a predetermined price
- **Risk:Reward Ratio:** Example 1:3 (risk 3 to make 3)
- **Example:** Buy at 68,000, take profit at 68,000 × 1.10 = 74,800

#### Trailing Take-Profit
- Lock in profits as price moves favorably
- **Example:** Raise stop-loss to entry price once price reaches 68,500

### Risk-Reward Ratio

Consistent strategy across all trades:
- **Conservative:** 1:1 to 1:2
- **Moderate:** 1:2 to 1:5
- **Aggressive:** 1:3 to 1:5
- **Speculative:** 1:5 to 1:10+

---

## 9. Trading Tips

### Entry Points

- **Support and Resistance:** Use technical analysis to identify key price levels
- **Trend Following:** Trade in direction of the trend
- **Volume Analysis:** High volume often precedes price movement
- **News Awareness:** Major news can trigger significant price changes

### Position Management

- **Don't Overtrade:** Avoid making too many trades
- **Monitor Open Positions:** Keep track of all open positions
- **Use Proper Position Sizing:** Follow the 1-2% rule

### Technical Indicators

**Popular Indicators for KTX:**
- **Moving Averages (MA):** Trend identification
- **Relative Strength Index (RSI):** Momentum
- **Bollinger Bands:** Volatility
- **MACD:** Trend and momentum

### Emotional Discipline

- **Stick to Your Plan:** Don't deviate due to fear or greed
- **Accept Losses:** Part of trading
- **Don't Revenge Trade:** Don't immediately re-enter after a loss
- **Keep Records:** Review past trades to learn from mistakes

### When to Avoid Trading

- **During High Volatility:** Market conditions uncertain
- **Major Announcements:** Central bank or exchange news
- **Insufficient Liquidity:** Low market depth
- **Technical Indicators:** Conflicting signals

---

## 10. FAQ

### Common Questions

**Q: What is the minimum deposit amount?**
A: Depends on the asset. Typically 10-100 USDT for major coins.

**Q: What are the trading fees?**
A: 
- Spot: Maker 0.1%, Taker 0.2%
- Futures: Depends on leverage, typically 0.05-0.1% per trade

**Q: Can I hold both spot and futures positions?**
A: Yes, you can have both simultaneously.

**Q: How long do withdrawals take?**
A: Typically 30 minutes to 2 hours, depending on network congestion.

**Q: What happens if the price moves against my position?**
A: For futures: If position is long and price drops significantly, you may receive a liquidation call.
- For spot: You just hold the asset until you sell.

**Q: Can I trade 24/7?**
A: Futures markets can be traded 24/7. Spot markets may have limited hours.

**Q: How do I close a position?**
A: 
- Spot: Sell the same amount you bought
- Futures: Place a closing order in the opposite direction (long → sell, short → buy)

**Q: What is liquidation?**
A: Automatic closure of a leveraged position when margin falls below maintenance requirements.

---

## Risk Warning

⚠️ **Important Risk Warnings:**
- Leverage trading involves extremely high risk
- You can lose your entire principal
- Past performance is not indicative of future results
- Markets are highly volatile and unpredictable
- Only trade with money you can afford to lose
- Never borrow money to trade
- Seek professional advice if you're a beginner
- Technical analysis does not guarantee future prices

---

**Version:** v1.0.0  
**Last Updated:** 2026-03-23
