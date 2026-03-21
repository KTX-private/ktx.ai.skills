const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_PATH = path.join(os.homedir(), '.ktx_exchange_config.json');

/**
 * Save KTX API key configuration automatically
 * This helper function saves configuration without requiring user to run setup_config.js
 *
 * @param {string} apiKey - KTX API key
 * @param {string} apiSecret - KTX API secret
 * @param {string} permission - Permission level ('View' or 'Trade')
 * @returns {Object} - Saved configuration object
 */
function saveKTXConfig(apiKey, apiSecret, permission = 'View') {
  // Validate inputs
  if (!apiKey || apiKey.length < 16) {
    throw new Error('API Key is invalid, minimum length should be 16 characters');
  }
  if (!apiSecret || apiSecret.length < 32) {
    throw new Error('API Secret is invalid, minimum length should be 32 characters');
  }

  // Create configuration object
  const config = {
    apiKey: apiKey.trim(),
    apiSecret: apiSecret.trim(),
    permission: permission,
    createdAt: new Date().toISOString()
  };

  // Save configuration file
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), { mode: 0o600 });

  console.log('====================================');
  console.log('   KTX Configuration Saved!');
  console.log('====================================');
  console.log(`Config file path: ${CONFIG_PATH}`);
  console.log(`API Key: ${config.apiKey.substring(0, 8)}...`);
  console.log(`Permission: ${config.permission}`);
  console.log(`Created at: ${config.createdAt}`);
  console.log('\nSecurity tips:');
  console.log('- Configuration file is saved locally on your computer');
  console.log('- Do not share your configuration file with others');
  console.log('- Do not commit configuration file to version control');
  console.log('- Rotate your API keys regularly');
  console.log('- Create different API keys for different purposes');
  console.log('\nYou can now use KTX skills without running setup_config.js!');

  return config;
}

/**
 * Load KTX API key configuration
 *
 * @returns {Object|null} - Configuration object or null if not found
 */
function loadKTXConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const config = fs.readFileSync(CONFIG_PATH, 'utf8');
      return JSON.parse(config);
    }
    return null;
  } catch (error) {
    throw new Error(`Failed to load configuration: ${error.message}`);
  }
}

/**
 * Check if KTX configuration exists
 *
 * @returns {boolean} - True if configuration file exists
 */
function hasKTXConfig() {
  return fs.existsSync(CONFIG_PATH);
}

/**
 * Remove KTX configuration file
 */
function removeKTXConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    fs.unlinkSync(CONFIG_PATH);
    console.log('KTX configuration file removed:', CONFIG_PATH);
  }
}

/**
 * Get configuration file path
 *
 * @returns {string} - Path to configuration file
 */
function getConfigPath() {
  return CONFIG_PATH;
}

module.exports = {
  saveKTXConfig,
  loadKTXConfig,
  hasKTXConfig,
  removeKTXConfig,
  getConfigPath
};
