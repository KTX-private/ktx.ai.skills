const WebSocket = require('ws');
const EventEmitter = require('events');
const crypto = require('crypto');

// WebSocket endpoint configuration
const WS_CONFIG = {
  market: 'wss://m-stream.ktx.one',
  user: 'wss://u-stream.ktx.one'
};

/**
 * KTX WebSocket client class
 */
class KTXWSClient extends EventEmitter {
  constructor() {
    super();
    this.marketWS = null;
    this.userWS = null;
    this.reconnectInterval = 5000; // Reconnect interval 5 seconds
    this.heartbeatInterval = null;
  }

  // ============ Market WebSocket ============

  /**
   * Connect to market WebSocket
   */
  connectMarketWS() {
    return new Promise((resolve, reject) => {
      try {
        this.marketWS = new WebSocket(WS_CONFIG.market);

        this.marketWS.on('open', () => {
          console.log('Market WebSocket connected successfully');
          this.startHeartbeat('market');
          resolve();
        });

        this.marketWS.on('message', (data) => {
          try {
            const message = JSON.parse(data);
            this.handleMarketMessage(message);
          } catch (error) {
            console.error('Failed to parse market message:', error);
          }
        });

        this.marketWS.on('error', (error) => {
          console.error('Market WebSocket error:', error);
          this.emit('error', { type: 'market', error });
          reject(error);
        });

        this.marketWS.on('close', () => {
          console.log('Market WebSocket disconnected');
          this.stopHeartbeat('market');
          this.emit('market_disconnected');
          this.autoReconnect('market');
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle market message
   */
  handleMarketMessage(message) {
    if (message.result) {
      // Dispatch message based on stream type
      if (message.stream && typeof message.stream === 'string' && message.stream.includes('order_book')) {
        this.emit('order_book', message);
      } else if (message.stream && typeof message.stream === 'string' && message.stream.includes('trades')) {
        this.emit('trades', message);
      } else if (message.stream && typeof message.stream === 'string' && message.stream.includes('candles')) {
        this.emit('candles', message);
      } else if (message.stream && typeof message.stream === 'string' && message.stream.includes('ticker')) {
        this.emit('ticker', message);
      }
    } else if (message.error) {
      this.emit('error', { type: 'market', error: message.error });
    }
  }

  /**
   * Subscribe to market streams
   */
  subscribe(streams) {
    if (!this.marketWS || this.marketWS.readyState !== WebSocket.OPEN) {
      throw new Error('Market WebSocket not connected');
    }

    const message = {
      id: Date.now(),
      method: 'SUBSCRIBE',
      params: Array.isArray(streams) ? streams : [streams]
    };

    this.marketWS.send(JSON.stringify(message));
    console.log('Subscribed to market streams:', streams);
  }

  /**
   * Unsubscribe from market streams
   */
  unsubscribe(streams) {
    if (!this.marketWS || this.marketWS.readyState !== WebSocket.OPEN) {
      throw new Error('Market WebSocket not connected');
    }

    const message = {
      id: Date.now(),
      method: 'UNSUBSCRIBE',
      params: Array.isArray(streams) ? streams : [streams]
    };

    this.marketWS.send(JSON.stringify(message));
    console.log('Unsubscribed from market streams:', streams);
  }

  // ============ User Data WebSocket ============

  /**
   * Connect to user data WebSocket
   */
  connectUserWS() {
    return new Promise((resolve, reject) => {
      try {
        this.userWS = new WebSocket(WS_CONFIG.user);

        this.userWS.on('open', () => {
          console.log('User data WebSocket connected successfully');
          this.startHeartbeat('user');
          resolve();
        });

        this.userWS.on('message', (data) => {
          try {
            const message = JSON.parse(data);
            this.handleUserMessage(message);
          } catch (error) {
            console.error('Failed to parse user data message:', error);
          }
        });

        this.userWS.on('error', (error) => {
          console.error('User data WebSocket error:', error);
          this.emit('error', { type: 'user', error });
          reject(error);
        });

        this.userWS.on('close', () => {
          console.log('User data WebSocket disconnected');
          this.stopHeartbeat('user');
          this.emit('user_disconnected');
          this.autoReconnect('user');
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Login to user data WebSocket
   */
  loginUser(apiKey, apiSecret) {
    if (!this.userWS || this.userWS.readyState !== WebSocket.OPEN) {
      throw new Error('User data WebSocket not connected');
    }

    // Generate signature
    const expireTime = Date.now() + 30000; // Expire after 30 seconds
    const message = { method: 'LOGIN' };
    const messageStr = JSON.stringify(message);
    const apiSign = this._signWSRequest(apiSecret, String(expireTime), messageStr);

    const loginMessage = {
      method: 'LOGIN',
      auth: {
        'api-key': apiKey,
        'api-sign': apiSign
      }
    };

    this.userWS.send(JSON.stringify(loginMessage));
    console.log('User data login request sent');
  }

  /**
   * Generate WebSocket request signature
   */
  _signWSRequest(secret, expireTime, data) {
    const message = expireTime + data;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(message);
    return hmac.digest('hex');
  }

  /**
   * Handle user data message
   */
  handleUserMessage(message) {
    if (message.event === 'subscribe') {
      console.log('Subscription successful:', message.stream);
      this.emit('subscribed', message.stream);
    } else if (message.event === 'unsubscribe') {
      console.log('Unsubscription successful:', message.stream);
      this.emit('unsubscribed', message.stream);
    } else if (message.event === 'login') {
      console.log('Login successful');
      this.emit('logged_in');
    } else if (message.event === 'error') {
      this.emit('error', { type: 'user', error: message });
    } else if (message.result) {
      // Dispatch message based on stream type
      if (message.stream === 'account') {
        this.emit('account_update', message);
      } else if (message.stream === 'order') {
        this.emit('order_update', message);
      } else if (message.stream === 'position') {
        this.emit('position_update', message);
      }
    }
  }

  /**
   * Subscribe to account balance updates
   */
  subscribeAccount() {
    if (!this.userWS || this.userWS.readyState !== WebSocket.OPEN) {
      throw new Error('User data WebSocket not connected');
    }

    const message = {
      id: Date.now(),
      method: 'SUBSCRIBE',
      params: ['account']
    };

    this.userWS.send(JSON.stringify(message));
    console.log('Subscribed to account balance updates');
  }

  /**
   * Subscribe to order updates
   */
  subscribeOrder() {
    if (!this.userWS || this.userWS.readyState !== WebSocket.OPEN) {
      throw new Error('User data WebSocket not connected');
    }

    const message = {
      id: Date.now(),
      method: 'SUBSCRIBE',
      params: ['order']
    };

    this.userWS.send(JSON.stringify(message));
    console.log('Subscribed to order updates');
  }

  /**
   * Subscribe to position updates
   */
  subscribePosition() {
    if (!this.userWS || this.userWS.readyState !== WebSocket.OPEN) {
      throw new Error('User data WebSocket not connected');
    }

    const message = {
      id: Date.now(),
      method: 'SUBSCRIBE',
      params: ['position']
    };

    this.userWS.send(JSON.stringify(message));
    console.log('Subscribed to position updates');
  }

  /**
   * Unsubscribe from user data stream
   */
  unsubscribeUser(stream) {
    if (!this.userWS || this.userWS.readyState !== WebSocket.OPEN) {
      throw new Error('User data WebSocket not connected');
    }

    const message = {
      id: Date.now(),
      method: 'UNSUBSCRIBE',
      params: [stream]
    };

    this.userWS.send(JSON.stringify(message));
    console.log('Unsubscribed from user data stream:', stream);
  }

  // ============ Heartbeat and Reconnect ============

  /**
   * Start heartbeat
   */
  startHeartbeat(type) {
    const ws = type === 'market' ? this.marketWS : this.userWS;
    if (!ws) return;

    this[`${type}Heartbeat`] = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ ping: Date.now() }));
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat(type) {
    if (this[`${type}Heartbeat`]) {
      clearInterval(this[`${type}Heartbeat`]);
      this[`${type}Heartbeat`] = null;
    }
  }

  /**
   * Auto reconnect
   */
  autoReconnect(type) {
    console.log(`${type} WebSocket will attempt to reconnect in 5 seconds...`);

    setTimeout(() => {
      if (type === 'market') {
        this.connectMarketWS().catch(error => {
          console.error('Reconnection failed:', error);
        });
      } else if (type === 'user') {
        this.connectUserWS().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }
    }, this.reconnectInterval);
  }

  /**
   * Set reconnection interval
   */
  setReconnectInterval(interval) {
    this.reconnectInterval = interval;
  }

  // ============ Disconnect ============

  /**
   * Disconnect market WebSocket
   */
  disconnectMarketWS() {
    if (this.marketWS) {
      this.stopHeartbeat('market');
      this.marketWS.close();
      this.marketWS = null;
      console.log('Market WebSocket disconnected');
    }
  }

  /**
   * Disconnect user data WebSocket
   */
  disconnectUserWS() {
    if (this.userWS) {
      this.stopHeartbeat('user');
      this.userWS.close();
      this.userWS = null;
      console.log('User data WebSocket disconnected');
    }
  }

  /**
   * Disconnect all connections
   */
  disconnectAll() {
    this.disconnectMarketWS();
    this.disconnectUserWS();
  }
}

module.exports = KTXWSClient;
