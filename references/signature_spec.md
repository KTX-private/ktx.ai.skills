# KTX API Signature Specification

This document describes the signature algorithm used for KTX API authentication and provides implementation examples in various programming languages.

## Table of Contents

- [Overview](#overview)
- [Authentication Process](#authentication-process)
- [Signature Algorithm](#signature-algorithm)
- [Implementation Examples](#implementation-examples)
- [WebSocket Authentication](#websocket-authentication)
- [Common Errors](#common-errors)
- [Security Best Practices](#security-best-practices)

## Overview

KTX API uses HMAC-SHA256 signature to verify API request legitimacy. Each API request must include the following authentication parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `APIKEY` | String | Yes | Your API Key |
| `TIMESTAMP` | String | Yes | Current timestamp in milliseconds |
| `SIGNATURE` | String | Yes | HMAC-SHA256 signature of the request |

## Authentication Process

1. **Obtain API Key**: Log in to KTX platform, go to API Management, and create API Key
2. **Construct Request**: Assemble request parameters in the specified format
3. **Generate Signature**: Calculate HMAC-SHA256 signature using the API Secret
4. **Send Request**: Include authentication headers in the API request
5. **Verify Response**: Process the API response data

## Signature Algorithm

The signature is generated using the following steps:

### Step 1: Construct the Signature String

For **GET** requests:
```
timestamp + method + requestPath + queryString
```

For **POST** requests:
```
timestamp + method + requestPath + body
```

**Parameters:**
- `timestamp`: Current timestamp in milliseconds
- `method`: HTTP method (GET, POST, etc.), in uppercase
- `requestPath`: Request path, e.g., `/api/v1/order`
- `queryString`: URL-encoded query string (for GET requests)
- `body`: JSON string of the request body (for POST requests)

### Step 2: Generate HMAC-SHA256 Signature

Use your API Secret as the key to sign the constructed signature string:

```javascript
const crypto = require('crypto');
const signature = crypto.createHmac('sha256', apiSecret)
  .update(signatureString)
  .digest('hex');
```

### Step 3: Add Authentication Headers

Add the following headers to your HTTP request:

```http
APIKEY: your_api_key
TIMESTAMP: 1234567890123
SIGNATURE: generated_signature
```

## Implementation Examples

### JavaScript (Node.js)

#### GET Request Example

```javascript
const crypto = require('crypto');
const axios = require('axios');

// Configuration
const apiKey = 'your_api_key';
const apiSecret = 'your_api_secret';
const baseUrl = 'https://api.ktx.info';

// GET request signature generation
function generateGetSignature(timestamp, method, requestPath, queryString) {
  const signatureString = timestamp + method + requestPath + queryString;
  return crypto.createHmac('sha256', apiSecret)
    .update(signatureString)
    .digest('hex');
}

// Example: Query order
async function getOrder(orderId) {
  const method = 'GET';
  const requestPath = '/api/v1/order';
  const queryString = `orderId=${orderId}`;

  const timestamp = Date.now().toString();
  const signature = generateGetSignature(timestamp, method, requestPath, queryString);

  try {
    const response = await axios({
      method,
      url: `${baseUrl}${requestPath}?${queryString}`,
      headers: {
        'APIKEY': apiKey,
        'TIMESTAMP': timestamp,
        'SIGNATURE': signature
      }
    });
    return response.data;
  } catch (error) {
    console.error('Request failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage example
getOrder('123456789')
  .then(data => console.log('Order data:', data))
  .catch(err => console.error('Error:', err));
```

#### POST Request Example

```javascript
const crypto = require('crypto');
const axios = require('axios');

// Configuration
const apiKey = 'your_api_key';
const apiSecret = 'your_api_secret';
const baseUrl = 'https://api.ktx.info';

// POST request signature generation
function generatePostSignature(timestamp, method, requestPath, body) {
  const signatureString = timestamp + method + requestPath + body;
  return crypto.createHmac('sha256', apiSecret)
    .update(signatureString)
    .digest('hex');
}

// Example: Place an order
async function placeOrder(orderData) {
  const method = 'POST';
  const requestPath = '/api/v1/order';
  const body = JSON.stringify(orderData);

  const timestamp = Date.now().toString();
  const signature = generatePostSignature(timestamp, method, requestPath, body);

  try {
    const response = await axios({
      method,
      url: `${baseUrl}${requestPath}`,
      data: orderData,
      headers: {
        'APIKEY': apiKey,
        'TIMESTAMP': timestamp,
        'SIGNATURE': signature,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Order failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage example
const orderData = {
  symbol: 'BTC-USDT',
  side: 'BUY',
  type: 'LIMIT',
  price: '68000.00',
  quantity: '0.001'
};

placeOrder(orderData)
  .then(data => console.log('Order result:', data))
  .catch(err => console.error('Error:', err));
```

### Python

#### GET Request Example

```python
import hmac
import hashlib
import time
import requests
import urllib.parse
from typing import Dict, Any

# Configuration
API_KEY = 'your_api_key'
API_SECRET = 'your_api_secret'
BASE_URL = 'https://api.ktx.info'

def generate_get_signature(timestamp: str, method: str, request_path: str, query_string: str) -> str:
    """Generate signature for GET request"""
    signature_string = timestamp + method + request_path + query_string
    return hmac.new(
        API_SECRET.encode('utf-8'),
        signature_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

def get_order(order_id: str) -> Dict[str, Any]:
    """Query order"""
    method = 'GET'
    request_path = '/api/v1/order'
    query_string = f"orderId={order_id}"

    timestamp = str(int(time.time() * 1000))
    signature = generate_get_signature(timestamp, method, request_path, query_string)

    headers = {
        'APIKEY': API_KEY,
        'TIMESTAMP': timestamp,
        'SIGNATURE': signature
    }

    url = f"{BASE_URL}{request_path}?{query_string}"
    response = requests.get(url, headers=headers)
    return response.json()

# Usage example
try:
    order_data = get_order('123456789')
    print("Order data:", order_data)
except Exception as e:
    print("Error:", e)
```

#### POST Request Example

```python
import hmac
import hashlib
import time
import requests
import json
from typing import Dict, Any

# Configuration
API_KEY = 'your_api_key'
API_SECRET = 'your_api_secret'
BASE_URL = 'https://api.ktx.info'

def generate_post_signature(timestamp: str, method: str, request_path: str, body: str) -> str:
    """Generate signature for POST request"""
    signature_string = timestamp + method + request_path + body
    return hmac.new(
        API_SECRET.encode('utf-8'),
        signature_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

def place_order(order_data: Dict[str, Any]) -> Dict[str, Any]:
    """Place an order"""
    method = 'POST'
    request_path = '/api/v1/order'
    body = json.dumps(order_data, separators=(',', ':'))

    timestamp = str(int(time.time() * 1000))
    signature = generate_post_signature(timestamp, method, request_path, body)

    headers = {
        'APIKEY': API_KEY,
        'TIMESTAMP': timestamp,
        'SIGNATURE': signature,
        'Content-Type': 'application/json'
    }

    url = f"{BASE_URL}{request_path}"
    response = requests.post(url, json=order_data, headers=headers)
    return response.json()

# Usage example
order_data = {
    'symbol': 'BTC-USDT',
    'side': 'BUY',
    'type': 'LIMIT',
    'price': '68000.00',
    'quantity': '0.001'
}

try:
    result = place_order(order_data)
    print("Order result:", result)
except Exception as e:
    print("Error:", e)
```

### Go

#### GET Request Example

```go
package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"
)

// Configuration
const (
	APIKey    = "your_api_key"
	APISecret = "your_api_secret"
	BaseURL   = "https://api.ktx.info"
)

// Generate GET signature
func generateGetSignature(timestamp, method, requestPath, queryString string) string {
	signatureString := timestamp + method + requestPath + queryString
	h := hmac.New(sha256.New, []byte(APISecret))
	h.Write([]byte(signatureString))
	return hex.EncodeToString(h.Sum(nil))
}

// GetOrder query order
func GetOrder(orderID string) (map[string]interface{}, error) {
	method := "GET"
	requestPath := "/api/v1/order"
	queryString := fmt.Sprintf("orderId=%s", orderID)

	timestamp := strconv.FormatInt(time.Now().UnixMilli(), 10)
	signature := generateGetSignature(timestamp, method, requestPath, queryString)

	url := fmt.Sprintf("%s%s?%s", BaseURL, requestPath, queryString)

	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("APIKEY", APIKey)
	req.Header.Set("TIMESTAMP", timestamp)
	req.Header.Set("SIGNATURE", signature)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var result map[string]interface{}
	err = json.Unmarshal(body, &result)
	return result, err
}

func main() {
	orderData, err := GetOrder("123456789")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println("Order data:", orderData)
}
```

#### POST Request Example

```go
package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"
)

// Configuration
const (
	APIKey    = "your_api_key"
	APISecret = "your_api_secret"
	BaseURL   = "https://api.ktx.info"
)

// Generate POST signature
func generatePostSignature(timestamp, method, requestPath, body string) string {
	signatureString := timestamp + method + requestPath + body
	h := hmac.New(sha256.New, []byte(APISecret))
	h.Write([]byte(signatureString))
	return hex.EncodeToString(h.Sum(nil))
}

// PlaceOrder place an order
func PlaceOrder(orderData map[string]interface{}) (map[string]interface{}, error) {
	method := "POST"
	requestPath := "/api/v1/order"

	bodyBytes, err := json.Marshal(orderData)
	if err != nil {
		return nil, err
	}
	body := string(bodyBytes)

	timestamp := strconv.FormatInt(time.Now().UnixMilli(), 10)
	signature := generatePostSignature(timestamp, method, requestPath, body)

	url := fmt.Sprintf("%s%s", BaseURL, requestPath)

	req, err := http.NewRequest(method, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, err
	}

	req.Header.Set("APIKEY", APIKey)
	req.Header.Set("TIMESTAMP", timestamp)
	req.Header.Set("SIGNATURE", signature)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var result map[string]interface{}
	err = json.Unmarshal(respBody, &result)
	return result, err
}

func main() {
	orderData := map[string]interface{}{
		"symbol":   "BTC-USDT",
		"side":     "BUY",
		"type":     "LIMIT",
		"price":    "68000.00",
		"quantity": "0.001",
	}

	result, err := PlaceOrder(orderData)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println("Order result:", result)
}
```

## WebSocket Authentication

KTX WebSocket also uses HMAC-SHA256 signature for authentication. The authentication process is as follows:

### Authentication Steps

1. **Generate Signature**: Use the same algorithm as HTTP requests
2. **Send Authentication Message**: Send authentication message after establishing WebSocket connection
3. **Wait for Response**: Wait for server authentication result

### Authentication Message Format

```json
{
  "event": "auth",
  "params": {
    "apiKey": "your_api_key",
    "timestamp": "1234567890123",
    "signature": "generated_signature"
  }
}
```

### WebSocket Authentication Example (JavaScript)

```javascript
const crypto = require('crypto');
const WebSocket = require('ws');

// Configuration
const apiKey = 'your_api_key';
const apiSecret = 'your_api_secret';
const wsUrl = 'wss://ws.ktx.info/v1/ws';

// Generate WebSocket signature
function generateWsSignature(timestamp) {
  const signatureString = timestamp;
  return crypto.createHmac('sha256', apiSecret)
    .update(signatureString)
    .digest('hex');
}

// Establish WebSocket connection
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('WebSocket connection established');

  // Send authentication message
  const timestamp = Date.now().toString();
  const signature = generateWsSignature(timestamp);

  const authMessage = {
    event: 'auth',
    params: {
      apiKey: apiKey,
      timestamp: timestamp,
      signature: signature
    }
  };

  ws.send(JSON.stringify(authMessage));
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());

  if (message.event === 'auth') {
    if (message.code === 0) {
      console.log('Authentication successful');
      // Subscribe to required channels
      ws.send(JSON.stringify({
        event: 'subscribe',
        params: {
          channel: 'order.book',
          symbol: 'BTC-USDT'
        }
      }));
    } else {
      console.error('Authentication failed:', message.message);
      ws.close();
    }
  } else {
    console.log('Received message:', message);
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', () => {
  console.log('WebSocket connection closed');
});
```

## Common Errors

### 1. Signature Verification Failed

**Error Message**: `Invalid signature`

**Possible Causes**:
- Incorrect API Secret
- Signature string construction error
- Timestamp discrepancy
- Parameter encoding issue

**Solution**:
1. Confirm API Secret is correct
2. Check signature string construction order: `timestamp + method + requestPath + queryString/body`
3. Ensure timestamp uses milliseconds
4. For POST requests, body must be JSON string without extra spaces

### 2. Timestamp Out of Range

**Error Message**: `Timestamp out of range`

**Possible Causes**:
- System time not synchronized
- Timestamp unit error (should be milliseconds)

**Solution**:
1. Check system time synchronization
2. Confirm timestamp uses milliseconds: `Date.now()` or `time.time() * 1000`

### 3. API Key Invalid

**Error Message**: `Invalid API key`

**Possible Causes**:
- API Key error
- API Key disabled
- IP address restricted

**Solution**:
1. Confirm API Key is correct
2. Log in to KTX platform, check API Key status
3. Check IP whitelist settings

### 4. Unauthorized Operation

**Error Message**: `Unauthorized operation`

**Possible Causes**:
- API Key permission insufficient
- Account frozen or restricted

**Solution**:
1. Confirm API Key has required permissions (trade, withdraw, etc.)
2. Check account status
3. Contact customer support if needed

## Security Best Practices

### 1. API Key Management

- **Do not hardcode** API Key and Secret in code
- Store API Key and Secret in environment variables or configuration files
- Use different API Keys for different environments (development, testing, production)

### 2. Permission Control

- Grant API Key only necessary permissions
- Separate read and write permissions
- Regularly audit API Key usage logs

### 3. Security Protection

- Use HTTPS protocol to encrypt transmission
- Do not share API Key and Secret with anyone
- Rotate API Keys periodically
- Set IP whitelist when possible

### 4. Rate Limiting

- Respect API rate limit rules
- Implement request throttling at client side
- Handle rate limit exceptions gracefully

### 5. Error Handling

- Do not expose API Key and Secret in error messages
- Log error information for troubleshooting
- Implement retry mechanism for transient errors

### 6. Signature Verification

- Use official signature verification tools for testing
- Debug signature generation process when encountering issues
- Pay attention to parameter encoding and sorting

## Signature Verification Tool

KTX provides an online signature verification tool to help developers verify their signature generation logic:

**Tool Address**: https://www.ktx.info/api-docs/signature-tool

Usage:
1. Enter API Key, API Secret, timestamp
2. Select request method
3. Fill in request path and parameters
4. Click "Generate Signature" to view the correct signature
5. Compare with your generated signature to troubleshoot issues

## Appendix: Quick Reference

### Signature String Construction

**GET Request**:
```
timestamp + method + requestPath + queryString
```

**POST Request**:
```
timestamp + method + requestPath + body
```

### Request Headers

```http
APIKEY: your_api_key
TIMESTAMP: 1234567890123
SIGNATURE: generated_signature
```

### Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| 400 | Request parameter error | Check request parameters |
| 401 | Authentication failed | Check API Key and signature |
| 403 | Permission denied | Check API Key permissions |
| 429 | Rate limit exceeded | Reduce request frequency |
| 500 | Server internal error | Contact customer support |

## Support

If you encounter issues during use, please:

1. Check this documentation for solutions
2. Use signature verification tool for debugging
3. Contact KTX technical support: support@ktx.info
4. Join KTX developer community for assistance

---

**Document Version**: 1.0
**Last Updated**: 2025-04-10
**KTX API Documentation**: https://www.ktx.info/api-docs
