# Automatic Configuration Quick Start

## Overview

The KTX skills now support **automatic API key configuration**, eliminating the need for manual `setup_config.js` execution.

## Methods

### Method 1: Programmatic Configuration (Recommended)

```javascript
const { saveKTXConfig } = require('./scripts/config_helper');

// Save your KTX API credentials directly
saveKTXConfig(
  'your_ktx_api_key',
  'your_ktx_api_secret',
  'Trade'  // 'View' or 'Trade'
);
```

**Advantages:**
- ✅ No interactive prompts
- ✅ Can be integrated into application initialization
- ✅ Suitable for CI/CD pipelines
- ✅ Environment variable support

### Method 2: Environment Variables (Production)

```bash
# Set environment variables
export KTX_API_KEY=your_api_key
export KTX_API_SECRET=your_api_secret
export KTX_API_PERMISSION=Trade

# Your application can then read them
```

```javascript
// In your Node.js application
const { saveKTXConfig } = require('./scripts/config_helper');

const config = saveKTXConfig(
  process.env.KTX_API_KEY,
  process.env.KTX_API_SECRET,
  process.env.KTX_API_PERMISSION || 'Trade'
);
```

### Method 3: Interactive Setup (Traditional)

```bash
# Interactive setup (prompts for input)
npm run setup
```

## Usage Examples

### Example 1: Simple Application Initialization

```javascript
const { saveKTXConfig } = require('./scripts/config_helper');
const { KTXPrivateClient } = require('./scripts/ktx_client');

// Initialize app with configuration
async function initApp() {
  // Step 1: Save configuration programmatically
  saveKTXConfig(
    'my_api_key',
    'my_api_secret',
    'Trade'
  );

  // Step 2: Create KTX client (auto-loads config)
  const client = new KTXPrivateClient();

  // Step 3: Use the client
  const accounts = await client.getAccounts();
  console.log('Ready to trade!', accounts);
}

initApp();
```

### Example 2: Bot/Trading Bot Configuration

```javascript
const { saveKTXConfig } = require('./scripts/config_helper');
const { KTXPrivateClient } = require('./scripts/ktx_client');

// Bot startup script
async function startBot() {
  // Load credentials from environment (recommended)
  const apiKey = process.env.KTX_API_KEY;
  const apiSecret = process.env.KTX_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.error('Please set KTX_API_KEY and KTX_API_SECRET environment variables');
    process.exit(1);
  }

  // Save configuration
  saveKTXConfig(apiKey, apiSecret, 'Trade');

  // Initialize bot
  const client = new KTXPrivateClient();

  console.log('Bot started with KTX integration');
  // ... bot logic here
}

startBot();
```

### Example 3: Configuration Check

```javascript
const { loadKTXConfig, hasKTXConfig } = require('./scripts/config_helper');

// Check if configuration exists before starting
if (hasKTXConfig()) {
  const config = loadKTXConfig();
  console.log('Configuration loaded:', config.apiKey.substring(0, 8) + '...');

  // Check if config is old (recommend rotation)
  const age = Date.now() - new Date(config.createdAt).getTime();
  const days = Math.floor(age / (1000 * 60 * 60 * 24));

  if (days > 90) {
    console.warn('Configuration is older than 90 days. Consider rotating API keys.');
  }
} else {
  console.log('No configuration found. Please run setup first.');
  process.exit(1);
}
```

## Configuration File Location

Configuration is saved to: `~/.ktx_exchange_config.json`

This file:
- Is stored in your home directory (not project directory)
- Has secure permissions (read/write by owner only)
- Is automatically excluded from version control (starts with `.`)
- Contains: apiKey, apiSecret, permission, createdAt

## API Helper Reference

```javascript
const {
  saveKTXConfig,    // Save configuration
  loadKTXConfig,    // Load configuration
  hasKTXConfig,      // Check if exists
  removeKTXConfig,  // Remove configuration
  getConfigPath        // Get file path
} = require('./scripts/config_helper');
```

## Test the Helper

Run the test suite:

```bash
node test/test_config_helper.js
```

## Complete Examples

- `scripts/examples/auto_configure_ktx.js` - Basic usage example
- `scripts/examples/real_world_config.js` - Real-world integration examples
- `scripts/examples/CONFIGURATION_GUIDE.md` - Comprehensive guide

## Comparison: Old vs New

| Aspect | Old Way | New Way |
|---------|-----------|-----------|
| Setup | `npm run setup` (interactive) | `saveKTXConfig(key, secret, perm)` |
| Time | 2-3 minutes | 1 second |
| Automation | Manual | Programmatic |
| CI/CD | ❌ Not suitable | ✅ Fully compatible |
| Environment | ❌ Requires manual input | ✅ Reads from env vars |

## Security Best Practices

1. ✅ Use environment variables in production
2. ✅ Never hardcode credentials in code
3. ✅ Rotate API keys regularly
4. ✅ Use appropriate permission levels (View vs Trade)
5. ✅ Never commit `.ktx_exchange_config.json` to version control

## Troubleshooting

**"Private client requires API key configuration"**
- Solution: Run `saveKTXConfig()` first or set environment variables

**"API Key format is incorrect"**
- Solution: Ensure API key is at least 16 characters
- Solution: Ensure API secret is at least 32 characters

**"Failed to load configuration"**
- Solution: Configuration file is corrupted, delete it and re-create
- Solution: Check file permissions on `~/.ktx_exchange_config.json`

## Next Steps

After configuration is saved, you can:

1. Use `KTXPublicClient` for public market data
2. Use `KTXPrivateClient` for private operations and trading
3. Use `KTXWSClient` for real-time WebSocket streams
4. Run `npm test` to verify everything works

See `README.md` for full API documentation.
