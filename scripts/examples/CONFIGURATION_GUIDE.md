# KTX Configuration Helper - Quick Guide

## Overview

The `config_helper.js` module provides convenient functions to manage KTX API key configuration programmatically, eliminating the need for users to manually run `setup_config.js`.

## Features

- **Automatic Configuration**: Save API keys programmatically
- **Easy Loading**: Load existing configuration
- **Validation**: Built-in validation for API keys
- **Security**: Secure file permissions (0o600)

## Usage

### 1. Import the Helper

```javascript
const { saveKTXConfig, loadKTXConfig, hasKTXConfig } = require('./config_helper');
```

### 2. Save Configuration Programmatically

```javascript
const API_KEY = 'your_api_key_here';
const API_SECRET = 'your_api_secret_here';
const PERMISSION = 'Trade'; // 'View' or 'Trade'

// Save configuration automatically
const config = saveKTXConfig(API_KEY, API_SECRET, PERMISSION);
```

### 3. Load Existing Configuration

```javascript
// Check if configuration exists
if (hasKTXConfig()) {
  const config = loadKTXConfig();
  console.log('API Key:', config.apiKey.substring(0, 8) + '...');
  console.log('Permission:', config.permission);
}
```

### 4. Remove Configuration

```javascript
const { removeKTXConfig } = require('./config_helper');

// Remove configuration file
removeKTXConfig();
```

## API Reference

### `saveKTXConfig(apiKey, apiSecret, permission)`

Saves KTX API configuration to `.ktx_exchange_config.json`.

**Parameters:**
- `apiKey` (string): Your KTX API key (min 16 characters)
- `apiSecret` (string): Your KTX API secret (min 32 characters)
- `permission` (string): Permission level - 'View' or 'Trade' (default: 'View')

**Returns:**
- Object: Saved configuration object

**Throws:**
- Error: If validation fails or save fails

### `loadKTXConfig()`

Loads existing KTX API configuration from `.ktx_exchange_config.json`.

**Returns:**
- Object: Configuration object
- null: If configuration file not found

**Throws:**
- Error: If file exists but is invalid JSON

### `hasKTXConfig()`

Checks if KTX configuration file exists.

**Returns:**
- boolean: True if configuration file exists

### `removeKTXConfig()`

Removes the KTX configuration file.

### `getConfigPath()`

Returns the path to the configuration file.

**Returns:**
- string: Full path to `.ktx_exchange_config.json`

## Integration with KTX Clients

### Automatic Configuration Flow

```javascript
const { saveKTXConfig } = require('./config_helper');

// Step 1: Save configuration programmatically
saveKTXConfig(
  'your_api_key',
  'your_api_secret',
  'Trade'
);

// Step 2: Use KTX clients (they will auto-load the config)
const { KTXPrivateClient } = require('./ktx_client');
const client = new KTXPrivateClient();

// Now you can use all private features
const accounts = await client.getAccounts();
const orders = await client.getHistoryOrders();
```

## Configuration File Format

The configuration file is saved at `~/.ktx_exchange_config.json` with the following format:

```json
{
  "apiKey": "your_api_key_here",
  "apiSecret": "your_api_secret_here",
  "permission": "Trade",
  "createdAt": "2026-03-20T08:00:00.000Z"
}
```

## Security Notes

1. **File Permissions**: Configuration file is saved with `0o600` permissions (read/write owner only)
2. **Local Storage**: File is stored in user's home directory, not in project folder
3. **Version Control**: Configuration file is automatically excluded by `.ktx_exchange_config.json` naming convention
4. **Key Rotation**: Recommended to rotate API keys regularly

## Migration from setup_config.js

### Old Way (Interactive)

```javascript
// User must run interactive setup
node scripts/setup_config.js
// Then answer prompts...
```

### New Way (Programmatic)

```javascript
const { saveKTXConfig } = require('./config_helper');

// Direct save - no interaction needed
saveKTXConfig(apiKey, apiSecret, 'Trade');
```

## Examples

See `scripts/examples/auto_configure_ktx.js` for complete usage examples.

## Error Handling

```javascript
try {
  const config = saveKTXConfig(apiKey, apiSecret, permission);
  console.log('Configuration saved:', config);
} catch (error) {
  if (error.message.includes('16 characters')) {
    console.error('API key is too short');
  } else if (error.message.includes('32 characters')) {
    console.error('API secret is too short');
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

## Testing

```javascript
const { saveKTXConfig, loadKTXConfig, hasKTXConfig } = require('./config_helper');

// Test save
const testConfig = saveKTXConfig('test_key_12345678', 'test_secret_abcdefghijklmnopqrstuvwxyz123456', 'View');
console.log('Saved:', testConfig);

// Test load
const loaded = loadKTXConfig();
console.log('Loaded:', loaded);

// Test check
const exists = hasKTXConfig();
console.log('Exists:', exists);
```

## Tips

1. Use environment variables for sensitive data
2. Never hardcode API keys in your application code
3. Use the config helper in your initialization scripts
4. Validate API key format before saving
5. Choose appropriate permission level based on your needs
