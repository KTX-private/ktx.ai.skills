const crypto = require('crypto');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration file path (user home directory)
const CONFIG_PATH = path.join(require('os').homedir(), '.ktx_exchange_config.json');

// API endpoint configuration
const API_CONFIG = {
  market: {
    baseUrl: 'https://api.ktx.app/api',
    wsUrl: 'wss://m-stream.ktx.app'
  },
  user: {
    baseUrl: 'https://api.ktx.app/papi',
    wsUrl: 'wss://u-stream.ktx.app'
  }
};

/**
 * Load API key configuration (optional)
 */
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const config = fs.readFileSync(CONFIG_PATH, 'utf8');
      return JSON.parse(config);
    }
    return null; // Configuration not existing is not an error
  } catch (error) {
    throw new Error(`Failed to load configuration: ${error.message}`);
  }
}

/**
 * Generate HMAC-SHA256 signature
 */
function signRequest(secret, expireTime, data) {
  const message = expireTime + data;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(message);
  return hmac.digest('hex');
}

/**
 * Send HTTP request
 */
function httpRequest(options) {
  return new Promise((resolve, reject) => {
    const client = options.protocol === 'https:' ? https : http;

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(result)}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

/**
 * KTX public client class (no API key required, only queries public data)
 */
class KTXPublicClient {
  constructor() {
    // Public client does not require API key
    this.config = null;
  }

  /**
   * Build request headers (public interface requires no signature)
   */
  _buildHeaders() {
    return {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Build request options
   */
  _buildOptions(url, method, headers = {}) {
    const urlObj = new URL(url);

    return {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: headers,
      protocol: urlObj.protocol
    };
  }

  /**
   * Public market data query (no signature required)
   */
  async getMarketData(path, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_CONFIG.market.baseUrl}${path}${queryString ? '?' + queryString : ''}`;
      const options = this._buildOptions(url, 'GET', this._buildHeaders());

      return await httpRequest(options);
    } catch (error) {
      throw new Error(`Failed to query market data: ${error.message}`);
    }
  }

  /**
   * Parse API response (handle possible wrapper format)
   */
  _parseResponse(result) {
    // API return format may be { state: 0, result: [...] }
    if (result && typeof result === 'object' && result.hasOwnProperty('result')) {
      const data = result.result;
      // K-line interface returns format { t: time period, e: [K-line array] }
      if (data && typeof data === 'object' && data.hasOwnProperty('e')) {
        return data.e;
      }
      return data;
    }
    return result;
  }

  /**
   * Parse single object response (such as ticker)
   */
  _parseSingleResponse(result) {
    // API return format may be { state: 0, result: [...] }
    if (result && result.result) {
      if (Array.isArray(result.result)) {
        if (result.result.length > 0) {
          return result.result[0];
        }
        return null;
      }
      return result.result;
    }
    return result;
  }

  // ============ Public market interface (no API key required) ============

  /**
   * Get trading pairs list
   */
  async getProducts(params = {}) {
    const result = await this.getMarketData('/v1/products', params);
    return this._parseResponse(result);
  }

  /**
   * Get order book data
   */
  async getOrderBook(symbol, level = 20, priceScale = 2) {
    const result = await this.getMarketData('/v1/order_book', {
      symbol,
      level,
      price_scale: priceScale
    });
    const parsed = this._parseResponse(result);
    // Map API response {a: asks, b: bids, t: timestamp, i: symbol} to standard format
    if (parsed && typeof parsed === 'object') {
      return {
        asks: parsed.a || [],
        bids: parsed.b || [],
        timestamp: parsed.t,
        symbol: parsed.i
      };
    }
    return parsed;
  }

  /**
   * Get K-line data
   */
  async getCandles(symbol, timeFrame = '1h', limit = 100, before = null, after = null) {
    const params = { symbol, time_frame: timeFrame, limit };
    if (before) params.before = before;
    if (after) params.after = after;
    const result = await this.getMarketData('/v1/candles', params);
    const parsed = this._parseResponse(result);
    // Convert array of strings to array of numbers
    if (Array.isArray(parsed)) {
      return parsed.map(candle => candle.map(value => typeof value === 'string' ? parseFloat(value) : value));
    }
    return parsed;
  }

  /**
   * Get 24h ticker (single)
   */
  async getTicker(symbol = '') {
    // Returns error when symbol parameter is not provided, so symbol must be provided here
    if (!symbol) {
      throw new Error('getTicker requires symbol parameter, e.g. "BTC_USDT"');
    }
    const result = await this.getMarketData('/v1/ticker', { symbol });
    // ticker interface returns result array, extract the first element
    const parsed = this._parseResponse(result);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // API returns field names: last, high, low, change, volume, askPrice, bidPrice
      // Convert to unified format: last_price, high_24h, low_24h, change_24h, volume_24h
      const ticker = parsed[0];
      return {
        ...ticker,
        last_price: parseFloat(ticker.last),
        high_24h: parseFloat(ticker.high),
        low_24h: parseFloat(ticker.low),
        change_24h: parseFloat(ticker.change) * parseFloat(ticker.open), // change is percentage, convert to absolute value
        volume_24h: parseFloat(ticker.volume),
        ask_price: parseFloat(ticker.askPrice),
        bid_price: parseFloat(ticker.bidPrice)
      };
    }
    return parsed;
  }

  /**
   * Get 24h market data for all trading pairs
   */
  async getAllTickers() {
    // Get trading pairs list
    const products = await this.getProducts();
    if (!products || !Array.isArray(products)) return [];

    // Batch query tickers (simplified to serial query here, can use Promise.all in practice)
    const tickers = [];
    for (const product of products) {
      try {
        const ticker = await this.getTicker(product.symbol);
        if (ticker) tickers.push(ticker);
      } catch (error) {
        // Ignore single query error
        continue;
      }
    }
    return tickers;
  }

  /**
   * Get trade records
   */
  async getTrades(symbol, limit = 100, before = null, after = null) {
    const params = { symbol, limit };
    if (before) params.before = before;
    if (after) params.after = after;
    const result = await this.getMarketData('/v1/trades', params);
    return this._parseResponse(result);
  }

  /**
   * Get server time
   */
  async getTime() {
    const result = await this.getMarketData('/v1/time');
    const parsed = this._parseResponse(result);
    // API returns time as string, convert to number
    if (parsed && parsed.time) {
      return typeof parsed.time === 'string' ? parseInt(parsed.time, 10) : parsed.time;
    }
    return parsed;
  }

  /**
   * Get coins list
   */
  async getCoins() {
    const result = await this.getMarketData('/v1/coins');
    return this._parseResponse(result);
  }

  /**
   * Get futures mark price
   */
  async getMarkPrice(symbol, market = 'lpc') {
    const params = { market };
    if (symbol) params.symbol = symbol;
    const result = await this.getMarketData('/v1/products', params);
    const parsed = this._parseResponse(result);
    
    // Parse products and extract mark price
    if (Array.isArray(parsed)) {
      if (symbol) {
        // Return specific symbol's mark price
        const product = parsed.find(p => p.symbol === symbol);
        return product ? {
          symbol: product.symbol,
          markPrice: parseFloat(product.markPrice || 0),
          lastPrice: parseFloat(product.markPrice || 0), // Use markPrice as lastPrice since ticker data is separate
          indexPrice: parseFloat(product.indexPrice || 0),
          fundingRate: parseFloat(product.fundingRate || 0),
          predictedFundingRate: parseFloat(product.predictedFundingRate || 0),
          nextFundingTime: product.nextFundingTime ? parseInt(String(product.nextFundingTime)) : null,
          prevFundingTime: product.prevFundingTime ? parseInt(String(product.prevFundingTime)) : null,
          markMethod: product.markMethod,
          market: product.market
        } : null;
      } else {
        // Return all products' mark prices
        return parsed.map(p => ({
          symbol: p.symbol,
          markPrice: parseFloat(p.markPrice || 0),
          lastPrice: parseFloat(p.markPrice || 0),
          indexPrice: parseFloat(p.indexPrice || 0),
          fundingRate: parseFloat(p.fundingRate || 0),
          predictedFundingRate: parseFloat(p.predictedFundingRate || 0),
          nextFundingTime: p.nextFundingTime ? parseInt(String(p.nextFundingTime)) : null,
          prevFundingTime: p.prevFundingTime ? parseInt(String(p.prevFundingTime)) : null,
          markMethod: p.markMethod,
          market: p.market
        }));
      }
    }
    return parsed;
  }
}

/**
 * KTX private client class (requires API key, can query private data and execute trading)
 */
class KTXPrivateClient {
  constructor() {
    this.config = loadConfig();
    if (!this.config) {
      throw new Error('Private client requires API key configuration, please run setup_config.js first');
    }
  }

  /**
   * Build request headers (with signature)
   */
  _buildHeaders(method, data = '') {
    const expireTime = Date.now() + 30000; // Expire after 30 seconds
    const apiSign = signRequest(this.config.apiSecret, String(expireTime), data);

    return {
      'api-key': this.config.apiKey,
      'api-sign': apiSign,
      'api-expire-time': String(expireTime),
      'Content-Type': 'application/json'
    };
  }

  /**
   * Build request options
   */
  _buildOptions(url, method, headers = {}) {
    const urlObj = new URL(url);

    return {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: headers,
      protocol: urlObj.protocol
    };
  }

  /**
   * Public market data query (no signature required)
   */
  async getMarketData(path, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_CONFIG.market.baseUrl}${path}${queryString ? '?' + queryString : ''}`;
      const options = this._buildOptions(url, 'GET', { 'Content-Type': 'application/json' });

      return await httpRequest(options);
    } catch (error) {
      throw new Error(`Failed to query market data: ${error.message}`);
    }
  }

  /**
   * Private data query (GET, requires signature)
   */
  async getUserData(path, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_CONFIG.user.baseUrl}${path}${queryString ? '?' + queryString : ''}`;
      const headers = this._buildHeaders('GET', queryString);
      const options = this._buildOptions(url, 'GET', headers);

      return await httpRequest(options);
    } catch (error) {
      throw new Error(`Failed to query private data: ${error.message}`);
    }
  }

  /**
   * Private operation submission (POST, requires signature)
   */
  async postUserData(path, data = {}) {
    try {
      const body = JSON.stringify(data);
      const url = `${API_CONFIG.user.baseUrl}${path}`;
      const headers = this._buildHeaders('POST', body);
      const options = this._buildOptions(url, 'POST', headers);
      options.body = body;

      return await httpRequest(options);
    } catch (error) {
      throw new Error(`Failed to submit private operation: ${error.message}`);
    }
  }

  /**
   * Parse API response (handle possible wrapper format)
   */
  _parseResponse(result) {
    // API return format may be { state: 0, result: [...] }
    if (result && typeof result === 'object' && result.hasOwnProperty('result')) {
      return result.result;
    }
    // K-line interface returns format { t: time period, e: [K-line array] }
    if (result && typeof result === 'object' && result.hasOwnProperty('e')) {
      return result.e;
    }
    return result;
  }

  /**
   * Parse single object response (such as ticker)
   */
  _parseSingleResponse(result) {
    // API return format may be { state: 0, result: [...] }
    if (result && result.result && Array.isArray(result.result) && result.result.length > 0) {
      return result.result[0];
    }
    return result;
  }

  // ============ Public market interface (inherits public client functionality) ============

  /**
   * Get trading pairs list
   */
  async getProducts(params = {}) {
    const result = await this.getMarketData('/v1/products', params);
    return this._parseResponse(result);
  }

  /**
   * Get order book data
   */
  async getOrderBook(symbol, level = 20, priceScale = 2) {
    const result = await this.getMarketData('/v1/order_book', {
      symbol,
      level,
      price_scale: priceScale
    });
    const parsed = this._parseResponse(result);
    // Map API response {a: asks, b: bids, t: timestamp, i: symbol} to standard format
    if (parsed && typeof parsed === 'object') {
      return {
        asks: parsed.a || [],
        bids: parsed.b || [],
        timestamp: parsed.t,
        symbol: parsed.i
      };
    }
    return parsed;
  }

  /**
   * Get K-line data
   */
  async getCandles(symbol, timeFrame = '1h', limit = 100, before = null, after = null) {
    const params = { symbol, time_frame: timeFrame, limit };
    if (before) params.before = before;
    if (after) params.after = after;
    const result = await this.getMarketData('/v1/candles', params);
    const parsed = this._parseResponse(result);
    // Convert array of strings to array of numbers
    if (Array.isArray(parsed)) {
      return parsed.map(candle => candle.map(value => typeof value === 'string' ? parseFloat(value) : value));
    }
    return parsed;
  }

  /**
   * Get 24h market data (single or all)
   */
  async getTicker(symbol = '') {
    // Returns error when symbol parameter is not provided, so symbol must be provided here
    if (!symbol) {
      throw new Error('getTicker requires symbol parameter, e.g. "BTC_USDT"');
    }
    const result = await this.getMarketData('/v1/ticker', { symbol });
    const parsed = this._parseResponse(result);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const ticker = parsed[0];
      return {
        ...ticker,
        last_price: parseFloat(ticker.last),
        high_24h: parseFloat(ticker.high),
        low_24h: parseFloat(ticker.low),
        change_24h: parseFloat(ticker.change) * parseFloat(ticker.open),
        volume_24h: parseFloat(ticker.volume),
        ask_price: parseFloat(ticker.askPrice),
        bid_price: parseFloat(ticker.bidPrice)
      };
    }
    return this._parseSingleResponse(result);
  }

  /**
   * Get 24h market data for all trading pairs
   */
  async getAllTickers() {
    // Get trading pairs list
    const products = await this.getProducts();
    if (!products || !Array.isArray(products)) return [];

    // Batch query tickers (simplified to serial query here, can use Promise.all in practice)
    const tickers = [];
    for (const product of products) {
      try {
        const ticker = await this.getTicker(product.product);
        if (ticker) tickers.push(ticker);
      } catch (error) {
        // Ignore single query error
        continue;
      }
    }
    return tickers;
  }

  /**
   * Get trade records
   */
  async getTrades(symbol, limit = 100, before = null, after = null) {
    const params = { symbol, limit };
    if (before) params.before = before;
    if (after) params.after = after;
    const result = await this.getMarketData('/v1/trades', params);
    return this._parseResponse(result);
  }

  /**
   * Get server time
   */
  async getTime() {
    const result = await this.getMarketData('/v1/time');
    const parsed = this._parseResponse(result);
    // API returns time as string, convert to number
    if (parsed && parsed.time) {
      return typeof parsed.time === 'string' ? parseInt(parsed.time, 10) : parsed.time;
    }
    return parsed;
  }

  /**
   * Get coins list
   */
  async getCoins() {
    const result = await this.getMarketData('/v1/coins');
    return this._parseResponse(result);
  }

  /**
   * Get futures mark price
   */
  async getMarkPrice(symbol, market = 'lpc') {
    const params = { market };
    if (symbol) params.symbol = symbol;
    const result = await this.getMarketData('/v1/products', params);
    const parsed = this._parseResponse(result);
    
    // Parse products and extract mark price
    if (Array.isArray(parsed)) {
      if (symbol) {
        // Return specific symbol's mark price
        const product = parsed.find(p => p.symbol === symbol);
        return product ? {
          symbol: product.symbol,
          markPrice: parseFloat(product.markPrice || 0),
          lastPrice: parseFloat(product.markPrice || 0), // Use markPrice as lastPrice since ticker data is separate
          indexPrice: parseFloat(product.indexPrice || 0),
          fundingRate: parseFloat(product.fundingRate || 0),
          predictedFundingRate: parseFloat(product.predictedFundingRate || 0),
          nextFundingTime: product.nextFundingTime ? parseInt(product.nextFundingTime) : null,
          prevFundingTime: product.prevFundingTime ? parseInt(product.prevFundingTime) : null,
          markMethod: product.markMethod,
          market: product.market
        } : null;
      } else {
        // Return all products' mark prices
        return parsed.map(p => ({
          symbol: p.symbol,
          markPrice: parseFloat(p.markPrice || 0),
          lastPrice: parseFloat(p.markPrice || 0),
          indexPrice: parseFloat(p.indexPrice || 0),
          fundingRate: parseFloat(p.fundingRate || 0),
          predictedFundingRate: parseFloat(p.predictedFundingRate || 0),
          nextFundingTime: p.nextFundingTime ? parseInt(p.nextFundingTime) : null,
          prevFundingTime: p.prevFundingTime ? parseInt(p.prevFundingTime) : null,
          markMethod: p.markMethod,
          market: p.market
        }));
      }
    }
    return parsed;
  }

  // ============ Public market interface (inherits public client functionality) ============

  /**
   * Get trading accounts
   */
  async getAccounts() {
    return await this.getUserData('/v1/trade/accounts');
  }

  /**
   * Get wallet assets
   */
  async getMainAccounts() {
    return await this.getUserData('/v1/main/accounts');
  }

  /**
   * Get deposit address (POST request)
   */
  async getDepositAddress(coinSymbol) {
    return await this.postUserData('/v1/depositAddr', { coin_symbol: coinSymbol });
  }

  /**
   * Get account ledgers
   */
  async getLedgers(params = {}) {
    return await this.getUserData('/v1/ledgers', params);
  }

  /**
   * Get position information
   */
  async getPositions() {
    return await this.getUserData('/v1/positions');
  }

  // ============ Order interface (requires signature) ============

  /**
   * Create order
   */
  async createOrder(params) {
    // Validate required parameters
    if (!params.symbol || !params.side || !params.type || !params.amount) {
      throw new Error('Missing required parameters: symbol, side, type, amount');
    }

    return await this.postUserData('/v1/order', params);
  }

  /**
   * Query specified order
   */
  async getOrder(orderId) {
    return await this.getUserData('/v1/order', { id: orderId });
  }

  /**
   * Query historical orders
   */
  async getHistoryOrders(params = {}) {
    return await this.getUserData('/v1/history/orders', params);
  }

  /**
   * Query pending orders
   */
  async getPendingOrders(params = {}) {
    return await this.getUserData('/v1/pending/orders', params);
  }

  /**
   * Query spot orders
   */
  async getSpotOrders(symbol) {
    const params = symbol ? { market: 'spot', symbol } : { market: 'spot' };
    return await this.getUserData('/v1/pending/orders', params);
  }

  /**
   * Query futures/swap orders
   */
  async getFuturesOrders(symbol) {
    const params = symbol ? { market: 'lpc', symbol } : { market: 'lpc' };
    return await this.getUserData('/v1/pending/orders', params);
  }

  /**
   * Query history orders
   */
  async getHistoryOrders(params = {}) {
    return await this.getUserData('/v1/history/orders', params);
  }

  /**
   * Query spot history orders
   */
  async getSpotHistoryOrders(symbol, params = {}) {
    const finalParams = { market: 'spot', ...params };
    if (symbol) {
      finalParams.symbol = symbol;
    }
    return await this.getUserData('/v1/history/orders', finalParams);
  }

  /**
   * Query futures history orders
   */
  async getFuturesHistoryOrders(symbol, params = {}) {
    const finalParams = { market: 'lpc', ...params };
    if (symbol) {
      finalParams.symbol = symbol;
    }
    return await this.getUserData('/v1/history/orders', finalParams);
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId) {
    return await this.postUserData('/v1/order/delete', { id: orderId });
  }

  /**
   * Batch cancel orders
   */
  async cancelOrders(orderIds) {
    return await this.postUserData('/v1/orders/delete', { ids: orderIds });
  }

  /**
   * Cancel all orders
   */
  async cancelAllOrders(symbol = null) {
    const params = symbol ? { symbol } : {};
    return await this.postUserData('/v1/orders/delete', params);
  }

  /**
   * Cancel all spot orders
   */
  async cancelAllSpotOrders(symbol = null) {
    const params = { market: 'spot' };
    if (symbol) {
      params.symbol = symbol;
    }
    return await this.postUserData('/v1/orders/delete', params);
  }

  /**
   * Cancel all futures orders
   */
  async cancelAllFuturesOrders(symbol = null) {
    const params = { market: 'lpc' };
    if (symbol) {
      params.symbol = symbol;
    }
    return await this.postUserData('/v1/orders/delete', params);
  }

  /**
   * Get trade details
   */
  async getFills(params = {}) {
    return await this.getUserData('/v1/fills', params);
  }

  // ============ Asset transfer interface (requires signature) ============

  /**
   * Transfer from wallet to trading account or vice versa
   */
  async transfer(params) {
    // Validate required parameters
    if (!params.symbol || !params.amount || !params.type) {
      throw new Error('Missing required parameters: symbol, amount, type');
    }

    // Map legacy parameters for backward compatibility
    const transferParams = {
      symbol: params.symbol,
      amount: params.amount,
      type: params.type,
      transfer_id: params.transfer_id
    };

    return await this.postUserData('/v1/transfer', transferParams);
  }

  /**
   * Transfer from main wallet to trading account
   */
  async transferToTrading(symbol, amount, transferId = null) {
    const params = {
      symbol: symbol,
      amount: amount,
      type: 'WALLET_TRADE'
    };
    if (transferId) {
      params.transfer_id = transferId;
    }
    return await this.transfer(params);
  }

  /**
   * Transfer from trading account to main wallet
   */
  async transferToWallet(symbol, amount, transferId = null) {
    const params = {
      symbol: symbol,
      amount: amount,
      type: 'TRADE_WALLET'
    };
    if (transferId) {
      params.transfer_id = transferId;
    }
    return await this.transfer(params);
  }

  /**
   * Subaccount transfer
   */
  async subaccountTransfer(params) {
    return await this.postUserData('/v1/subaccount/transfer', params);
  }

  /**
   * Withdraw
   */
  async withdraw(params) {
    return await this.postUserData('/v1/withdraw', params);
  }

  // ============ Futures/Swap order methods ============

  /**
   * Format futures order parameters
   */
  formatFuturesOrderParams(symbol, side, type, quantity, price = null, options = {}) {
    const params = {
      symbol,
      product: symbol,  // Required for futures
      side,
      type,
      quantity: String(quantity),
      amount: String(quantity),  // Required for validation
      market: 'lpc',  // Critical: specifies futures market
      leverage: options.leverage || 10,
      marginMethod: options.marginMethod || 'cross',
      positionMerge: options.positionMerge || (side === 'buy' ? 'long' : 'short'),
      timeInForce: options.timeInForce || 'gtc',
      mini: options.mini || false,
      stf: options.stf || 'disabled',
      close: options.close || false,
      postOnly: options.postOnly || false,
      ...options
    };

    if (price !== null) {
      params.price = String(price);
    }

    return params;
  }

  /**
   * Futures limit buy (long)
   */
  async buyFuturesLimit(symbol, quantity, price, options = {}) {
    const params = this.formatFuturesOrderParams(symbol, 'buy', 'limit', quantity, price, options);
    return await this.postUserData('/v1/order', params);
  }

  /**
   * Futures limit sell (short)
   */
  async sellFuturesLimit(symbol, quantity, price, options = {}) {
    const params = this.formatFuturesOrderParams(symbol, 'sell', 'limit', quantity, price, options);
    return await this.postUserData('/v1/order', params);
  }

  /**
   * Futures market buy
   */
  async buyFuturesMarket(symbol, quantity, options = {}) {
    const params = this.formatFuturesOrderParams(symbol, 'buy', 'market', quantity, null, options);
    return await this.postUserData('/v1/order', params);
  }

  /**
   * Futures market sell
   */
  async sellFuturesMarket(symbol, quantity, options = {}) {
    const params = this.formatFuturesOrderParams(symbol, 'sell', 'market', quantity, null, options);
    return await this.postUserData('/v1/order', params);
  }

  /**
   * Close long position
   */
  async closeLongPosition(symbol, quantity, price = null, options = {}) {
    const params = this.formatFuturesOrderParams(symbol, 'sell', price ? 'limit' : 'market', quantity, price, {
      ...options,
      positionMerge: 'long',
      close: true
    });
    return await this.postUserData('/v1/order', params);
  }

  /**
   * Close short position
   */
  async closeShortPosition(symbol, quantity, price = null, options = {}) {
    const params = this.formatFuturesOrderParams(symbol, 'buy', price ? 'limit' : 'market', quantity, price, {
      ...options,
      positionMerge: 'short',
      close: true
    });
    return await this.postUserData('/v1/order', params);
  }

  // ============ Helper methods ============

  /**
   * Format order parameters
   */
  formatOrderParams(symbol, side, type, amount, price = null, options = {}) {
    const params = {
      symbol,
      side,
      type,
      amount: String(amount),
      ...options
    };

    if (price !== null) {
      params.price = String(price);
    }

    // Add both amount and quantity for compatibility
    // API uses 'quantity' but validation requires 'amount'
    if (!params.quantity && params.amount) {
      params.quantity = params.amount;
    }

    return params;
  }

  /**
   * Limit buy
   */
  async buyLimit(symbol, amount, price, options = {}) {
    const params = this.formatOrderParams(symbol, 'buy', 'limit', amount, price, options);
    return await this.createOrder(params);
  }

  /**
   * Limit sell
   */
  async sellLimit(symbol, amount, price, options = {}) {
    const params = this.formatOrderParams(symbol, 'sell', 'limit', amount, price, options);
    return await this.createOrder(params);
  }

  /**
   * Market buy
   */
  async buyMarket(symbol, amount, options = {}) {
    const params = this.formatOrderParams(symbol, 'buy', 'market', amount, null, options);
    return await this.createOrder(params);
  }

  /**
   * Market sell
   */
  async sellMarket(symbol, amount, options = {}) {
    const params = this.formatOrderParams(symbol, 'sell', 'market', amount, null, options);
    return await this.createOrder(params);
  }

  // ============ Futures/Swap order methods ============

  /**
   * Format futures order parameters
   */
  formatFuturesOrderParams(symbol, side, type, quantity, price = null, options = {}) {
    const params = {
      symbol,
      product: symbol,  // Required for futures
      side,
      type,
      quantity: String(quantity),
      amount: String(quantity),  // Required for validation
      market: 'lpc',  // Critical: specifies futures market
      leverage: options.leverage || 10,
      marginMethod: options.marginMethod || 'cross',
      positionMerge: options.positionMerge || (side === 'buy' ? 'long' : 'short'),
      timeInForce: options.timeInForce || 'gtc',
      mini: options.mini || false,
      stf: options.stf || 'disabled',
      close: options.close || false,
      postOnly: options.postOnly || false,
      ...options
    };

    if (price !== null) {
      params.price = String(price);
    }

    return params;
  }

  /**
   * Futures limit buy (long)
   */
  async buyFuturesLimit(symbol, quantity, price, options = {}) {
    const params = this.formatFuturesOrderParams(symbol, 'buy', 'limit', quantity, price, options);
    return await this.createOrder(params);
  }

  /**
   * Futures limit sell (short)
   */
  async sellFuturesLimit(symbol, quantity, price, options = {}) {
    const params = this.formatFuturesOrderParams(symbol, 'sell', 'limit', quantity, price, options);
    return await this.createOrder(params);
  }

  /**
   * Futures market buy
   */
  async buyFuturesMarket(symbol, quantity, options = {}) {
    const params = this.formatFuturesOrderParams(symbol, 'buy', 'market', quantity, null, options);
    return await this.createOrder(params);
  }

  /**
   * Futures market sell
   */
  async sellFuturesMarket(symbol, quantity, options = {}) {
    const params = this.formatFuturesOrderParams(symbol, 'sell', 'market', quantity, null, options);
    return await this.createOrder(params);
  }

  /**
   * Close long position
   */
  async closeLongPosition(symbol, quantity, price = null, options = {}) {
    const params = this.formatFuturesOrderParams(symbol, 'sell', price ? 'limit' : 'market', quantity, price, {
      ...options,
      positionMerge: 'long',
      close: true
    });
    return await this.createOrder(params);
  }

  /**
   * Close short position
   */
  async closeShortPosition(symbol, quantity, price = null, options = {}) {
    const params = this.formatFuturesOrderParams(symbol, 'buy', price ? 'limit' : 'market', quantity, price, {
      ...options,
      positionMerge: 'short',
      close: true
    });
    return await this.createOrder(params);
  }

  // ============ Delegated methods for convenience ============

  async getSpotOrders(symbol) {
    return await this.privateClient.getSpotOrders(symbol);
  }

  async getFuturesOrders(symbol) {
    return await this.privateClient.getFuturesOrders(symbol);
  }

  async cancelAllSpotOrders(symbol) {
    return await this.privateClient.cancelAllSpotOrders(symbol);
  }

  async cancelAllFuturesOrders(symbol) {
    return await this.privateClient.cancelAllFuturesOrders(symbol);
  }
}

// ============ Compatibility: maintain backward compatibility ============

/**
 * KTX client class (compatible with old code, uses private client by default)
 * @deprecated Recommend using KTXPublicClient or KTXPrivateClient
 */
class KTXClient {
  constructor() {
    try {
      this.privateClient = new KTXPrivateClient();
      this.isPublic = false;
    } catch (error) {
      // Use public client if no configuration
      this.publicClient = new KTXPublicClient();
      this.isPublic = true;
    }
  }

  // ============ Public market interface ============

  async getProducts(params = {}) {
    if (this.isPublic) return await this.publicClient.getProducts(params);
    return await this.privateClient.getProducts(params);
  }

  async getOrderBook(symbol, level = 20, priceScale = 2) {
    if (this.isPublic) return await this.publicClient.getOrderBook(symbol, level, priceScale);
    return await this.privateClient.getOrderBook(symbol, level, priceScale);
  }

  async getCandles(symbol, timeFrame = '1h', limit = 100, before = null, after = null) {
    if (this.isPublic) return await this.publicClient.getCandles(symbol, timeFrame, limit, before, after);
    return await this.privateClient.getCandles(symbol, timeFrame, limit, before, after);
  }

  async getTicker(symbol = '') {
    if (this.isPublic) return await this.publicClient.getTicker(symbol);
    return await this.privateClient.getTicker(symbol);
  }

  async getAllTickers() {
    if (this.isPublic) return await this.publicClient.getAllTickers();
    return await this.privateClient.getAllTickers();
  }

  async getTrades(symbol, limit = 100, before = null, after = null) {
    if (this.isPublic) return await this.publicClient.getTrades(symbol, limit, before, after);
    return await this.privateClient.getTrades(symbol, limit, before, after);
  }

  async getTime() {
    if (this.isPublic) return await this.publicClient.getTime();
    return await this.privateClient.getTime();
  }

  async getCoins() {
    if (this.isPublic) return await this.publicClient.getCoins();
    return await this.privateClient.getCoins();
  }

  async getMarkPrice(symbol, market = 'lpc') {
    if (this.isPublic) return await this.publicClient.getMarkPrice(symbol, market);
    return await this.privateClient.getMarkPrice(symbol, market);
  }

  // ============ Private interface (only available when API key is configured) ============

  async getAccounts() {
    this.ensurePrivate();
    return await this.privateClient.getAccounts();
  }

  async getMainAccounts() {
    this.ensurePrivate();
    return await this.privateClient.getMainAccounts();
  }

  async getDepositAddress(coin) {
    this.ensurePrivate();
    return await this.privateClient.getDepositAddress(coin);
  }

  async getLedgers(params = {}) {
    this.ensurePrivate();
    return await this.privateClient.getLedgers(params);
  }

  async getPositions() {
    this.ensurePrivate();
    return await this.privateClient.getPositions();
  }

  async createOrder(params) {
    this.ensurePrivate();
    return await this.privateClient.createOrder(params);
  }

  async getOrder(orderId) {
    this.ensurePrivate();
    return await this.privateClient.getOrder(orderId);
  }

  async getHistoryOrders(params = {}) {
    this.ensurePrivate();
    return await this.privateClient.getHistoryOrders(params);
  }

  async getPendingOrders(params = {}) {
    this.ensurePrivate();
    return await this.privateClient.getPendingOrders(params);
  }

  async cancelOrder(orderId) {
    this.ensurePrivate();
    return await this.privateClient.cancelOrder(orderId);
  }

  async cancelOrders(orderIds) {
    this.ensurePrivate();
    return await this.privateClient.cancelOrders(orderIds);
  }

  async cancelAllOrders(symbol = null) {
    this.ensurePrivate();
    return await this.privateClient.cancelAllOrders(symbol);
  }

  async getFills(params = {}) {
    this.ensurePrivate();
    return await this.privateClient.getFills(params);
  }

  async transfer(params) {
    this.ensurePrivate();
    return await this.privateClient.transfer(params);
  }

  async transferToTrading(symbol, amount, transferId = null) {
    this.ensurePrivate();
    return await this.privateClient.transferToTrading(symbol, amount, transferId);
  }

  async transferToWallet(symbol, amount, transferId = null) {
    this.ensurePrivate();
    return await this.privateClient.transferToWallet(symbol, amount, transferId);
  }

  async subaccountTransfer(params) {
    this.ensurePrivate();
    return await this.privateClient.subaccountTransfer(params);
  }

  async withdraw(params) {
    this.ensurePrivate();
    return await this.privateClient.withdraw(params);
  }

  async buyLimit(symbol, amount, price, options = {}) {
    this.ensurePrivate();
    return await this.privateClient.buyLimit(symbol, amount, price, options);
  }

  async sellLimit(symbol, amount, price, options = {}) {
    this.ensurePrivate();
    return await this.privateClient.sellLimit(symbol, amount, price, options);
  }

  async buyMarket(symbol, amount, options = {}) {
    this.ensurePrivate();
    return await this.privateClient.buyMarket(symbol, amount, options);
  }

  async sellMarket(symbol, amount, options = {}) {
    this.ensurePrivate();
    return await this.privateClient.sellMarket(symbol, amount, options);
  }

  // ============ Futures/Swap order methods ============

  /**
   * Futures limit buy (long)
   */
  async buyFuturesLimit(symbol, quantity, price, options = {}) {
    this.ensurePrivate();
    return await this.privateClient.buyFuturesLimit(symbol, quantity, price, options);
  }

  /**
   * Futures limit sell (short)
   */
  async sellFuturesLimit(symbol, quantity, price, options = {}) {
    this.ensurePrivate();
    return await this.privateClient.sellFuturesLimit(symbol, quantity, price, options);
  }

  /**
   * Futures market buy
   */
  async buyFuturesMarket(symbol, quantity, options = {}) {
    this.ensurePrivate();
    return await this.privateClient.buyFuturesMarket(symbol, quantity, options);
  }

  /**
   * Futures market sell
   */
  async sellFuturesMarket(symbol, quantity, options = {}) {
    this.ensurePrivate();
    return await this.privateClient.sellFuturesMarket(symbol, quantity, options);
  }

  /**
   * Close long position
   */
  async closeLongPosition(symbol, quantity, price = null, options = {}) {
    this.ensurePrivate();
    return await this.privateClient.closeLongPosition(symbol, quantity, price, options);
  }

  /**
   * Close short position
   */
  async closeShortPosition(symbol, quantity, price = null, options = {}) {
    this.ensurePrivate();
    return await this.privateClient.closeShortPosition(symbol, quantity, price, options);
  }

  /**
   * Get futures mark price
   */
  async getMarkPrice(symbol, market = 'lpc') {
    if (this.isPublic) return await this.publicClient.getMarkPrice(symbol, market);
    return await this.privateClient.getMarkPrice(symbol, market);
  }

  // ============ Spot and Futures helper methods ============

  async getSpotOrders(symbol) {
    this.ensurePrivate();
    return await this.privateClient.getSpotOrders(symbol);
  }

  async getFuturesOrders(symbol) {
    this.ensurePrivate();
    return await this.privateClient.getFuturesOrders(symbol);
  }

  async cancelAllSpotOrders(symbol) {
    this.ensurePrivate();
    return await this.privateClient.cancelAllSpotOrders(symbol);
  }

  async cancelAllFuturesOrders(symbol) {
    this.ensurePrivate();
    return await this.privateClient.cancelAllFuturesOrders(symbol);
  }

  ensurePrivate() {
    if (this.isPublic) {
      throw new Error('This operation requires API key configuration, please run setup_config.js first');
    }
  }
}

module.exports = {
  KTXPublicClient,
  KTXPrivateClient,
  KTXClient
};
