const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load config
const CONFIG_PATH = path.join(require('os').homedir(), '.ktx_exchange_config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

const API_KEY = config.apiKey;
const API_SECRET = config.apiSecret;

// Test with both endpoints
const endpoints = [
  { name: 'api.ktx.app', baseUrl: 'https://api.ktx.app/papi' },
  { name: 'api.ktx.com', baseUrl: 'https://api.ktx.com/papi' }
];

async function testOrder(endpoint) {
  const symbol = 'BTC_USDT_SWAP';
  const price = 70500;
  const leverage = 11;
  const usdtAmount = 40;

  const positionValue = usdtAmount * leverage;
  const quantity = (positionValue / price).toFixed(6);

  const params = {
    symbol: symbol,
    product: symbol,
    side: 'buy',
    type: 'limit',
    amount: quantity,
    quantity: quantity,
    price: String(price),
    leverage: leverage,
    marginMethod: 'cross',
    positionMerge: 'long',
    timeInForce: 'gtc'
  };

  const body = JSON.stringify(params);
  const expireTime = Date.now() + 5000;

  const sign = crypto.createHmac('sha256', API_SECRET)
    .update(expireTime + body)
    .digest('hex');

  const options = {
    hostname: new URL(endpoint.baseUrl).hostname,
    port: 443,
    path: '/v1/order',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': API_KEY,
      'api-sign': sign,
      'api-expire-time': expireTime,
      'Content-Length': Buffer.byteLength(body)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          resolve({ raw: data });
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('Testing BTC_USDT_SWAP order creation on different endpoints...\n');

  for (const endpoint of endpoints) {
    console.log(`=== Testing endpoint: ${endpoint.name} ===\n`);
    try {
      const result = await testOrder(endpoint.baseUrl);
      console.log('Response:', JSON.stringify(result, null, 2));

      if (result.state === 0 || result.success === true) {
        console.log('\n✓ SUCCESS! Order created on', endpoint.name);
        break;
      } else {
        console.log('\n✗ Failed on', endpoint.name);
      }
    } catch (error) {
      console.error('\n✗ Error on', endpoint.name, ':', error.message);
    }
    console.log();
  }
}

main().catch(error => {
  console.error('\nError:', error.message);
  process.exit(1);
});
