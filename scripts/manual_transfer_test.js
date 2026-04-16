#!/usr/bin/env node

const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load config
const CONFIG_PATH = path.join(require('os').homedir(), '.ktx_exchange_config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

function generateSignature(secret, expireTime, data) {
  const message = expireTime + data;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(message);
  return hmac.digest('hex');
}

async function manualTransfer() {
  console.log('====================================');
  console.log('   Manual Transfer Test');
  console.log('====================================\n');

  const method = 'POST';
  const path = '/papi/v1/transfer';
  const body = JSON.stringify({
    coin: 'USDT',
    amount: '10',
    direction: 'main_to_trade'
  });

  const expireTime = Date.now() + 30000;
  const apiSign = generateSignature(config.apiSecret, String(expireTime), body);

  const options = {
    hostname: 'api.ktx.app',
    port: 443,
    path: path,
    method: method,
    headers: {
      'api-key': config.apiKey,
      'api-sign': apiSign,
      'api-expire-time': String(expireTime),
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  console.log('Request Details:');
  console.log('URL:', 'https://' + options.hostname + options.path);
  console.log('Method:', method);
  console.log('Headers:', JSON.stringify({
    'api-key': config.apiKey.substring(0, 8) + '...',
    'api-sign': apiSign.substring(0, 16) + '...',
    'api-expire-time': expireTime,
    'Content-Type': 'application/json'
  }, null, 2));
  console.log('Body:', body);
  console.log('');

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('Response Status:', res.statusCode);
        console.log('Response Headers:', JSON.stringify(res.headers, null, 2));
        console.log('Response Body:', data);
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ raw: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request Error:', error.message);
      reject(error);
    });

    req.write(body);
    req.end();
  });
}

manualTransfer().then(result => {
  console.log('\n====================================');
  console.log('   Test Completed');
  console.log('====================================');
}).catch(error => {
  console.error('\nFatal Error:', error);
});
