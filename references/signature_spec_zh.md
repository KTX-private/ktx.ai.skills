# API签名规范

## 签名算法

KTX API使用HMAC-SHA256签名算法来验证请求的合法性和完整性。

## 签名步骤

### 1. 准备签名数据

**请求过期时间（expire_time）**

```javascript
const expireTime = Date.now() + 30000; // 当前时间 + 30秒
```

建议设置30秒有效期，避免因网络延迟导致签名过期。

**原始字符串构造**

根据HTTP方法构造原始字符串：

- **GET请求**：`expire_time + queryStr`
- **POST请求**：`expire_time + bodyStr`

示例：
```javascript
// GET请求
const queryStr = 'symbol=BTC_USDT&limit=100';
const message = expireTime + queryStr;

// POST请求
const bodyStr = JSON.stringify({ symbol: 'BTC_USDT', side: 'buy', amount: '0.1' });
const message = expireTime + bodyStr;
```

### 2. 计算签名

使用HMAC-SHA256算法，以API Secret为密钥，对原始字符串进行签名：

```javascript
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', apiSecret)
  .update(message)
  .digest('hex');
```

### 3. 设置HTTP头

将签名信息添加到HTTP请求头中：

```javascript
const headers = {
  'api-key': apiKey,
  'api-sign': signature,
  'api-expire-time': String(expireTime),
  'Content-Type': 'application/json'
};
```

## 完整示例

### JavaScript (Node.js)

```javascript
const crypto = require('crypto');
const https = require('https');

// API密钥
const apiKey = 'your_api_key';
const apiSecret = 'your_api_secret';

// GET请求示例
function getAPIRequest(path, params) {
  const expireTime = Date.now() + 30000;
  const queryStr = new URLSearchParams(params).toString();
  const message = expireTime + queryStr;
  const signature = crypto.createHmac('sha256', apiSecret)
    .update(message)
    .digest('hex');

  const options = {
    hostname: 'api.ktx.com',
    port: 443,
    path: `/api${path}?${queryStr}`,
    method: 'GET',
    headers: {
      'api-key': apiKey,
      'api-sign': signature,
      'api-expire-time': String(expireTime),
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });
}

// POST请求示例
function postAPIRequest(path, data) {
  const expireTime = Date.now() + 30000;
  const bodyStr = JSON.stringify(data);
  const message = expireTime + bodyStr;
  const signature = crypto.createHmac('sha256', apiSecret)
    .update(message)
    .digest('hex');

  const options = {
    hostname: 'api.ktx.com',
    port: 443,
    path: `/papi${path}`,
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'api-sign': signature,
      'api-expire-time': String(expireTime),
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

// 使用示例
(async () => {
  try {
    // 查询账户余额
    const accounts = await getAPIRequest('/v1/trade/accounts', {});
    console.log(accounts);

    // 创建订单
    const order = await postAPIRequest('/v1/order', {
      symbol: 'BTC_USDT',
      side: 'buy',
      type: 'limit',
      amount: '0.1',
      price: '50000'
    });
    console.log(order);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

### Python

```python
import hmac
import hashlib
import time
import requests
import json

# API密钥
api_key = 'your_api_key'
api_secret = 'your_api_secret'

# GET请求示例
def get_api_request(path, params=None):
    if params is None:
        params = {}

    expire_time = int(time.time() * 1000) + 30000
    query_str = '&'.join([f'{k}={v}' for k, v in params.items()])
    message = str(expire_time) + query_str
    signature = hmac.new(
        api_secret.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    headers = {
        'api-key': api_key,
        'api-sign': signature,
        'api-expire-time': str(expire_time),
        'Content-Type': 'application/json'
    }

    response = requests.get(
        f'https://api.ktx.com/api{path}?{query_str}',
        headers=headers
    )
    return response.json()

# POST请求示例
def post_api_request(path, data):
    expire_time = int(time.time() * 1000) + 30000
    body_str = json.dumps(data)
    message = str(expire_time) + body_str
    signature = hmac.new(
        api_secret.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    headers = {
        'api-key': api_key,
        'api-sign': signature,
        'api-expire-time': str(expire_time),
        'Content-Type': 'application/json'
    }

    response = requests.post(
        f'https://api.ktx.com/papi{path}',
        data=body_str,
        headers=headers
    )
    return response.json()

# 使用示例
if __name__ == '__main__':
    # 查询账户余额
    accounts = get_api_request('/v1/trade/accounts')
    print(accounts)

    # 创建订单
    order = post_api_request('/v1/order', {
        'symbol': 'BTC_USDT',
        'side': 'buy',
        'type': 'limit',
        'amount': '0.1',
        'price': '50000'
    })
    print(order)
```

### Go

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
	"net/url"
	"strconv"
	"time"
)

const (
	apiKey    = "your_api_key"
	apiSecret = "your_api_secret"
)

// 计算签名
func signRequest(secret string, expireTime int64, data string) string {
	message := fmt.Sprintf("%d%s", expireTime, data)
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(message))
	return hex.EncodeToString(h.Sum(nil))
}

// GET请求
func getAPIRequest(path string, params map[string]string) (map[string]interface{}, error) {
	expireTime := time.Now().Add(30 * time.Second).UnixMilli()
	queryValues := url.Values{}
	for k, v := range params {
		queryValues.Add(k, v)
	}
	queryStr := queryValues.Encode()

	signature := signRequest(apiSecret, expireTime, queryStr)

	req, err := http.NewRequest("GET", "https://api.ktx.com/api"+path+"?"+queryStr, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("api-key", apiKey)
	req.Header.Set("api-sign", signature)
	req.Header.Set("api-expire-time", strconv.FormatInt(expireTime, 10))
	req.Header.Set("Content-Type", "application/json")

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

// POST请求
func postAPIRequest(path string, data map[string]interface{}) (map[string]interface{}, error) {
	expireTime := time.Now().Add(30 * time.Second).UnixMilli()
	bodyBytes, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}
	bodyStr := string(bodyBytes)

	signature := signRequest(apiSecret, expireTime, bodyStr)

	req, err := http.NewRequest("POST", "https://api.ktx.com/papi"+path, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, err
	}

	req.Header.Set("api-key", apiKey)
	req.Header.Set("api-sign", signature)
	req.Header.Set("api-expire-time", strconv.FormatInt(expireTime, 10))
	req.Header.Set("Content-Type", "application/json")

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
	// 查询账户余额
	accounts, err := getAPIRequest("/v1/trade/accounts", nil)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println(accounts)

	// 创建订单
	order, err := postAPIRequest("/v1/order", map[string]interface{}{
		"symbol": "BTC_USDT",
		"side":   "buy",
		"type":   "limit",
		"amount": "0.1",
		"price":  "50000",
	})
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println(order)
}
```

## WebSocket签名

用户数据WebSocket也需要签名认证：

```javascript
const crypto = require('crypto');
const WebSocket = require('ws');

// 计算WebSocket签名
function signWSRequest(secret, expireTime, message) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(expireTime + message);
  return hmac.digest('hex');
}

// 连接和登录
const ws = new WebSocket('wss://u-stream.ktx.com');

ws.on('open', () => {
  const expireTime = Date.now() + 30000;
  const loginMessage = { method: 'LOGIN' };
  const messageStr = JSON.stringify(loginMessage);
  const signature = signWSRequest(apiSecret, String(expireTime), messageStr);

  ws.send(JSON.stringify({
    method: 'LOGIN',
    auth: {
      'api-key': apiKey,
      'api-sign': signature
    }
  }));
});
```

## 常见问题

### 1. 签名错误（-12003）

**可能原因：**
- API Key或API Secret不正确
- 签名计算错误
- 原始字符串构造错误

**排查步骤：**
1. 确认API Key和API Secret是否正确复制
2. 检查原始字符串是否按照规范构造
3. 使用官方提供的示例代码进行对比
4. 确认时间戳格式正确（毫秒级）

### 2. 请求过期（-12103）

**可能原因：**
- 本地系统时间不准确
- 签名过期时间设置过短
- 网络延迟导致请求超时

**排查步骤：**
1. 同步本地系统时间
2. 将过期时间延长至60秒
3. 检查网络连接稳定性

### 3. 权限不足（-10002）

**可能原因：**
- API Key权限不足
- 请求的接口需要更高权限

**排查步骤：**
1. 确认API Key权限设置
2. View权限只能查询，Trade权限可以交易
3. 在交易所后台为API Key添加所需权限

### 4. 参数错误（-12001, -12002）

**可能原因：**
- 缺少必需参数
- 参数格式不正确
- 参数值超出范围

**排查步骤：**
1. 检查是否包含所有必需参数
2. 确认参数格式（字符串、数字等）
3. 查看API文档确认参数范围和格式

## 调试技巧

### 1. 打印签名信息

```javascript
console.log('expire_time:', expireTime);
console.log('message:', message);
console.log('signature:', signature);
```

### 2. 使用官方测试工具

KTX交易所可能提供API签名验证工具，可以用来验证签名计算是否正确。

### 3. 对比时间戳

```javascript
const serverTime = await client.getTime();
const localTime = Date.now();
console.log('Server time:', serverTime.server_time);
console.log('Local time:', localTime);
console.log('Difference:', localTime - serverTime.server_time);
```

### 4. 捕获详细错误信息

```javascript
try {
  const result = await client.someMethod();
} catch (error) {
  console.error('Error details:', {
    message: error.message,
    stack: error.stack,
    response: error.response
  });
}
```

## 安全建议

1. **不要硬编码API密钥**：使用配置文件或环境变量
2. **使用HTTPS**：确保所有API调用都使用HTTPS协议
3. **定期轮换密钥**：定期更换API Key和API Secret
4. **设置IP白名单**：在交易所后台设置IP白名单限制
5. **最小权限原则**：根据实际需求设置API Key权限
6. **不要提交到版本控制**：将配置文件添加到.gitignore
7. **加密存储**：对敏感数据进行加密存储
