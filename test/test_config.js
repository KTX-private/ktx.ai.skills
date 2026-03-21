const path = require('path');

/**
 * Test configuration
 */
module.exports = {
  // KTX API configuration
  api: {
    baseUrl: 'https://api.ktx.app',
    marketEndpoint: '/api/v1',
    userEndpoint: '/papi/v1',
    wsMarket: 'wss://m-stream.ktx.app',
    wsUser: 'wss://u-stream.ktx.app'
  },
  
  // Test symbols
  symbols: {
    valid: ['BTC_USDT', 'ETH_USDT', 'SOL_USDT', 'MARS_USDT'],
    invalid: ['INVALID_PAIR', 'WRONG_FORMAT', '']
  },
  
  // Test parameters
  params: {
    timeFrames: ['1m', '5m', '15m', '1h', '4h', '1d'],
    limits: [10, 50, 72, 100],
    levels: [5, 10, 20, 50],
    priceScales: [2, 4, 6, 8]
  },
  
  // Test timeouts (in milliseconds)
  timeouts: {
    short: 5000,
    medium: 10000,
    long: 30000
  },
  
  // Response validation
  validation: {
    tickerRequiredFields: ['last_price', 'high_24h', 'low_24h', 'change_24h', 'volume_24h'],
    orderBookRequiredFields: ['bids', 'asks'],
    candleRequiredFields: ['time', 'open', 'high', 'low', 'close', 'volume'],
    productRequiredFields: ['symbol', 'product']
  },
  
  // Paths
  paths: {
    scripts: path.join(__dirname, '..', 'scripts'),
    test: __dirname
  }
};
