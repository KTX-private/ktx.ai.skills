const { KTXPublicClient } = require('./ktx_client');

/**
 * Calculate moving average
 */
function calculateMA(data, period) {
  if (!data || data.length < period) return null;
  const sum = data.reduce((acc, val) => acc + val, 0);
  return sum / period;
}

/**
 * Calculate change percentage
 */
function calculateChange(current, previous) {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Calculate volatility
 */
function calculateVolatility(highs, lows, periods = 7) {
  if (!highs || !lows || highs.length === 0) return 0;
  const high = Math.max(...highs.slice(0, periods));
  const low = Math.min(...lows.slice(0, periods));
  return ((high - low) / low) * 100;
}

/**
 * Find support and resistance levels
 */
function findSupportResistance(candles, periods = 7) {
  if (!candles || candles.length < periods) return { support: null, resistance: null };
  
  const highs = candles.slice(0, periods).map(c => parseFloat(c[2]));
  const lows = candles.slice(0, periods).map(c => parseFloat(c[3]));
  
  return {
    resistance: Math.max(...highs),
    support: Math.min(...lows)
  };
}

/**
 * Analyze trend direction
 */
function analyzeTrend(currentPrice, ma5, ma10, ma20) {
  if (!ma5 || !ma10 || !ma20) {
    return { trend: 'UNKNOWN', strength: 'NEUTRAL' };
  }
  
  let trend, strength;
  
  if (ma5 > ma10 && ma10 > ma20) {
    trend = 'UPTREND';
    strength = currentPrice > ma5 ? 'STRONG' : 'WEAK';
  } else if (ma5 < ma10 && ma10 < ma20) {
    trend = 'DOWNTREND';
    strength = currentPrice < ma5 ? 'STRONG' : 'WEAK';
  } else {
    trend = 'SIDEWAYS';
    strength = 'NEUTRAL';
  }
  
  return { trend, strength };
}

/**
 * Generate trading recommendations
 */
function getRecommendations(hourChange, trend, strength) {
  if (hourChange > 0) {
    if (trend === 'UPTREND') {
      return {
        conservative: 'Hold position, set take-profit',
        aggressive: 'Consider adding to position, stop-loss below support',
        shortTerm: 'Watch for pullback opportunities'
      };
    } else {
      return {
        conservative: 'Wait and watch for stabilization',
        aggressive: 'Consider small long entry near support, strict stop-loss',
        shortTerm: 'Watch for bounce opportunities, quick in/out'
      };
    }
  } else {
    return {
      conservative: 'Wait and watch for stabilization',
      aggressive: 'Consider small long entry near support, strict stop-loss',
      shortTerm: 'Watch for bounce opportunities, quick in/out'
    };
  }
}

/**
 * Analyze market trend for any cryptocurrency
 */
async function analyzeMarket(symbol, timeFrame = '1h', limit = 72) {
  const client = new KTXPublicClient();
  
  console.log('====================================');
  console.log(`    ${symbol.split('_')[0]} Price Analysis Report`);
  console.log('====================================\n');
  
  console.log(`Symbol: ${symbol}`);
  console.log(`Timeframe: ${timeFrame}`);
  console.log(`Data Points: ${limit}\n`);
  
  try {
    // Get K-line data
    const candles = await client.getCandles(symbol, timeFrame, limit);
    
    if (!candles || candles.length === 0) {
      console.log('Failed to get K-line data. Using basic price information...\n');
      
      const ticker = await client.getTicker(symbol);
      console.log('【Current Price】');
      console.log('Latest Price:', ticker.last_price, 'USDT');
      console.log('24h High:', ticker.high_24h, 'USDT');
      console.log('24h Low:', ticker.low_24h, 'USDT');
      console.log('24h Change:', ticker.change_24h, 'USDT');
      
      if (ticker.change_24h && ticker.last_price) {
        const changePercent = ((ticker.change_24h / ticker.last_price) * 100).toFixed(2);
        console.log('24h Change %:', changePercent + '%');
      }
      
      printDisclaimer();
      return null;
    }
    
    console.log(`Retrieved ${candles.length} K-line candles\n`);
    
    // K-line data format: [timestamp, open, high, low, close, volume]
    const latest = candles[0];
    const currentPrice = parseFloat(latest[4]);
    
    console.log('【Latest Price】');
    console.log('Time:', new Date(latest[0]).toLocaleString());
    console.log('Close Price:', currentPrice.toFixed(6), 'USDT');
    console.log('Open Price:', latest[1], 'USDT');
    console.log('High Price:', latest[2], 'USDT');
    console.log('Low Price:', latest[3], 'USDT');
    console.log('Volume:', latest[5], '\n');
    
    // Calculate period change
    const openPrice = parseFloat(latest[1]);
    const periodChange = currentPrice - openPrice;
    const periodChangePercent = calculateChange(currentPrice, openPrice);
    
    console.log('【Current Period Change】');
    console.log('Change Amount:', periodChange.toFixed(6), 'USDT');
    console.log('Change %:', periodChangePercent.toFixed(2), '%');
    console.log('Trend:', periodChange > 0 ? '📈 RISING' : '📉 FALLING\n');
    
    // Calculate 24h change if timeframe is 1h
    let trendDir = 'UNKNOWN';
    let trendStrength = 'NEUTRAL';
    
    if (timeFrame === '1h' && candles.length >= 24) {
      const dayAgo = candles[23];
      const dayChange = currentPrice - parseFloat(dayAgo[4]);
      const dayChangePercent = calculateChange(currentPrice, parseFloat(dayAgo[4]));
      
      console.log('【24 Hours Change】');
      console.log('Change Amount:', dayChange.toFixed(6), 'USDT');
      console.log('Change %:', dayChangePercent.toFixed(2), '%');
    }
    
    // Calculate 7 days change if enough data
    if (timeFrame === '1h' && candles.length >= 168) {
      const weekAgo = candles[167];
      const weekChange = currentPrice - parseFloat(weekAgo[4]);
      const weekChangePercent = calculateChange(currentPrice, parseFloat(weekAgo[4]));
      
      console.log('【7 Days Change】');
      console.log('Change Amount:', weekChange.toFixed(6), 'USDT');
      console.log('Change %:', weekChangePercent.toFixed(2), '%');
    }
    
    // Support and resistance
    const { support, resistance } = findSupportResistance(candles, 7);
    
    console.log('【Key Technical Levels】');
    console.log('Resistance (7d high):', resistance ? resistance.toFixed(6) : 'N/A', 'USDT');
    console.log('Support (7d low):', support ? support.toFixed(6) : 'N/A', 'USDT');
    console.log('Current Price:', currentPrice.toFixed(6), 'USDT');
    
    if (support && resistance) {
      const range = resistance - support;
      const position = ((currentPrice - support) / range) * 100;
      console.log('Price Position:', position.toFixed(1), '% (0% = support, 100% = resistance)');
      
      if (position < 30) {
        console.log('Status: NEAR SUPPORT LEVEL 📊');
      } else if (position > 70) {
        console.log('Status: NEAR RESISTANCE LEVEL 📊');
      } else {
        console.log('Status: IN MIDDLE RANGE 📊');
      }
    }
    
    // Moving averages
    if (candles.length >= 20) {
      const closes = candles.map(c => parseFloat(c[4]));
      const ma5 = calculateMA(closes.slice(0, 5), 5);
      const ma10 = calculateMA(closes.slice(0, 10), 10);
      const ma20 = calculateMA(closes.slice(0, 20), 20);
      
      console.log('\n【Moving Averages】');
      console.log('MA5:', ma5 ? ma5.toFixed(6) : 'N/A', 'USDT');
      console.log('MA10:', ma10 ? ma10.toFixed(6) : 'N/A', 'USDT');
      console.log('MA20:', ma20 ? ma20.toFixed(6) : 'N/A', 'USDT');
      console.log('Current Price:', currentPrice.toFixed(6), 'USDT');
      console.log('Position:');
      console.log('  vs MA5:', currentPrice > ma5 ? 'Above ✓' : 'Below');
      console.log('  vs MA10:', currentPrice > ma10 ? 'Above ✓' : 'Below');
      console.log('  vs MA20:', currentPrice > ma20 ? 'Above ✓' : 'Below');
      
      // Trend analysis
      const trendAnalysis = analyzeTrend(currentPrice, ma5, ma10, ma20);
      trendDir = trendAnalysis.trend;
      trendStrength = trendAnalysis.strength;
      
      console.log('\n【Trend Analysis】');
      console.log('Trend Direction:', trendDir);
      console.log('Trend Strength:', trendStrength);
      
      // Trading recommendations
      const recommendations = getRecommendations(periodChange, trendDir, trendStrength);
      
      console.log('\n【Trading Recommendations (For Reference Only)】');
      console.log('Conservative:', recommendations.conservative);
      console.log('Aggressive:', recommendations.aggressive);
      console.log('Short-term:', recommendations.shortTerm);
    }
    
    // Volatility analysis
    const highs = candles.map(c => parseFloat(c[2]));
    const lows = candles.map(c => parseFloat(c[3]));
    const volatility = calculateVolatility(highs, lows, 7);
    
    console.log('\n【Volatility】');
    console.log('7-day Volatility:', volatility.toFixed(2), '%');
    if (volatility > 10) {
      console.log('Rating: HIGH VOLATILITY ⚠️');
    } else if (volatility > 5) {
      console.log('Rating: MEDIUM VOLATILITY 📊');
    } else {
      console.log('Rating: LOW VOLATILITY 📉');
    }
    
    console.log('\nNote: Above analysis is based on historical technical data only');
    console.log('Does not constitute investment advice');
    
    // Return analysis results
    return {
      symbol,
      currentPrice,
      periodChange,
      periodChangePercent,
      trend: trendDir,
      volatility,
      support,
      resistance
    };
    
  } catch (error) {
    console.error('\n✗ Analysis failed:', error.message);
    console.error('\nPossible reasons:');
    console.error('1. Trading pair does not exist');
    console.error('2. API service issue');
    console.error('3. Network connection problem');
    
    // Fallback to basic price query
    try {
      console.log('\nTrying to get basic price information...\n');
      const ticker = await client.getTicker(symbol);
      console.log('【Latest Price】');
      console.log('Latest Price:', ticker.last_price, 'USDT');
      console.log('24h High:', ticker.high_24h, 'USDT');
      console.log('24h Low:', ticker.low_24h, 'USDT');
      console.log('24h Change:', ticker.change_24h, 'USDT');
    } catch (fallbackError) {
      console.error('Basic info query also failed:', fallbackError.message);
    }
    
    printDisclaimer();
    return null;
  }
}

/**
 * Print disclaimer
 */
function printDisclaimer() {
  console.log('\n====================================');
  console.log('      Disclaimer');
  console.log('====================================');
  console.log('⚠️  Above analysis is based on historical technical data only');
  console.log('⚠️  Does not constitute any investment advice');
  console.log('⚠️  Market conditions change rapidly, please use your own judgment');
  console.log('⚠️  Cryptocurrency trading carries high risks, trade with caution');
  console.log('⚠️  Please combine with fundamental analysis and risk management');
  console.log('====================================\n');
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node analyze_market.js <SYMBOL> [TIMEFRAME] [LIMIT]');
    console.log('\nExamples:');
    console.log('  node analyze_market.js BTC_USDT');
    console.log('  node analyze_market.js ETH_USDT 4h 50');
    console.log('  node analyze_market.js MARS_USDT 1h 72');
    console.log('  node analyze_market.js SOL_USDT 1d 30');
    console.log('\nTimeframe options: 1m, 5m, 15m, 1h, 4h, 1d');
    console.log('Default: 1h (hourly)');
    console.log('Default limit: 72 K-line candles');
    process.exit(1);
  }
  
  const symbol = args[0];
  const timeFrame = args[1] || '1h';
  const limit = parseInt(args[2]) || 72;
  
  console.log(`Analyzing: ${symbol}`);
  console.log(`Timeframe: ${timeFrame}`);
  console.log(`Data Points: ${limit}\n`);
  
  analyzeMarket(symbol, timeFrame, limit)
    .then(result => {
      if (result) {
        console.log('\n✓ Analysis completed successfully!');
        process.exit(0);
      } else {
        console.log('\n✗ Analysis failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { analyzeMarket };
