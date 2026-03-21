/**
 * Test utility functions
 */

/**
 * Assert that a value is truthy
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Assert that a value equals expected
 */
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, but got ${actual}: ${message}`);
  }
}

/**
 * Assert that a value is not null/undefined
 */
function assertNotNull(value, message) {
  if (value === null || value === undefined) {
    throw new Error(`Value is null/undefined: ${message}`);
  }
}

/**
 * Assert that a value is an array
 */
function assertArray(value, message) {
  if (!Array.isArray(value)) {
    throw new Error(`Expected array, got ${typeof value}: ${message}`);
  }
}

/**
 * Assert that a value is an object
 */
function assertObject(value, message) {
  if (typeof value !== 'object' || Array.isArray(value) || value === null) {
    throw new Error(`Expected object, got ${typeof value}: ${message}`);
  }
}

/**
 * Assert that a value is a number
 */
function assertNumber(value, message) {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(`Expected number, got ${typeof value}: ${message}`);
  }
}

/**
 * Assert that a value is a string
 */
function assertString(value, message) {
  if (typeof value !== 'string') {
    throw new Error(`Expected string, got ${typeof value}: ${message}`);
  }
}

/**
 * Assert that a value is within range
 */
function assertInRange(value, min, max, message) {
  assertNumber(value, message);
  if (value < min || value > max) {
    throw new Error(`Value ${value} not in range [${min}, ${max}]: ${message}`);
  }
}

/**
 * Delay execution for specified milliseconds
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with specified attempts
 */
async function retry(fn, attempts = 3, delayMs = 1000) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) {
        await delay(delayMs);
      }
    }
  }
  throw lastError;
}

/**
 * Validate ticker response structure
 */
function validateTicker(ticker, symbol) {
  assertObject(ticker, `Ticker should be an object for ${symbol}`);
  assertNotNull(ticker.last_price, `Ticker should have last_price for ${symbol}`);
  assertNotNull(ticker.high_24h, `Ticker should have high_24h for ${symbol}`);
  assertNotNull(ticker.low_24h, `Ticker should have low_24h for ${symbol}`);
  // API returns price as string, accept both string and number
  assert(typeof ticker.last_price === 'string' || typeof ticker.last_price === 'number',
    `last_price should be a string or number for ${symbol}, got ${typeof ticker.last_price}`);
  assert(typeof ticker.high_24h === 'string' || typeof ticker.high_24h === 'number',
    `high_24h should be a string or number for ${symbol}, got ${typeof ticker.high_24h}`);
}

/**
 * Validate order book response structure
 */
function validateOrderBook(orderBook, symbol) {
  assertObject(orderBook, `Order book should be an object for ${symbol}`);
  assertArray(orderBook.bids, `Order book should have bids array for ${symbol}`);
  assertArray(orderBook.asks, `Order book should have asks array for ${symbol}`);
  assert(orderBook.bids.length > 0, `Order book should have bids for ${symbol}`);
  assert(orderBook.asks.length > 0, `Order book should have asks for ${symbol}`);
}

/**
 * Validate candles response structure
 */
function validateCandles(candles, symbol) {
  assertArray(candles, `Candles should be an array for ${symbol}`);
  if (candles.length > 0) {
    assertArray(candles[0], `Each candle should be an array for ${symbol}`);
    assert(candles[0].length >= 5, `Candle should have at least 5 elements for ${symbol}`);
    // API now returns numbers for candle data
    assertNumber(candles[0][4], `Candle close price should be a number for ${symbol}`);
  }
}

/**
 * Validate products response structure
 */
function validateProducts(products) {
  assertArray(products, 'Products should be an array');
  if (products.length > 0) {
    assertObject(products[0], `Each product should be an object`);
    assertString(products[0].symbol, 'Product should have symbol');
  }
}

module.exports = {
  assert,
  assertEqual,
  assertNotNull,
  assertArray,
  assertObject,
  assertNumber,
  assertString,
  assertInRange,
  delay,
  retry,
  validateTicker,
  validateOrderBook,
  validateCandles,
  validateProducts
};
