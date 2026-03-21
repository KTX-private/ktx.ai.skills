/**
 * Example: Auto-configure KTX API keys
 * This script demonstrates how to automatically save KTX API key configuration
 * without running setup_config.js interactively
 */

const { saveKTXConfig, loadKTXConfig, hasKTXConfig } = require('../scripts/config_helper');

async function autoConfigureKTX() {
  console.log('====================================');
  console.log('   KTX Auto-Configuration Example');
  console.log('====================================\n');

  // Method 1: Save configuration programmatically
  console.log('Method 1: Programmatic Configuration');
  console.log('--------------------------------------------\n');

  // Replace these with your actual KTX API credentials
  const API_KEY = 'your_api_key_here';
  const API_SECRET = 'your_api_secret_here';
  const PERMISSION = 'Trade'; // 'View' or 'Trade'

  try {
    const config = saveKTXConfig(API_KEY, API_SECRET, PERMISSION);
    console.log('\nConfiguration saved successfully!');
    console.log('API Key (first 8 chars):', config.apiKey.substring(0, 8) + '...');
  } catch (error) {
    console.error('Failed to save configuration:', error.message);
    process.exit(1);
  }

  // Method 2: Check if configuration exists
  console.log('\n\nMethod 2: Check Existing Configuration');
  console.log('--------------------------------------------\n');

  if (hasKTXConfig()) {
    const existingConfig = loadKTXConfig();
    console.log('Configuration exists:');
    console.log('  API Key:', existingConfig.apiKey.substring(0, 8) + '...');
    console.log('  Permission:', existingConfig.permission);
    console.log('  Created:', existingConfig.createdAt);
  } else {
    console.log('No configuration found. You need to run setup_config.js first.');
  }

  // Method 3: Usage in your code
  console.log('\n\nMethod 3: Usage in Your Code');
  console.log('--------------------------------------------\n');
  console.log('After configuration is saved, you can use KTX clients directly:\n');

  console.log(`
const { KTXPublicClient } = require('./ktx_client');

// Public client (no API key required)
const publicClient = new KTXPublicClient();
const products = await publicClient.getProducts();
console.log('Trading pairs:', products.length);

const { KTXPrivateClient } = require('./ktx_client');

// Private client (requires API key from config)
const privateClient = new KTXPrivateClient();
const accounts = await privateClient.getAccounts();
console.log('Accounts:', accounts);
  `);

  console.log('\n====================================');
  console.log('   Example Completed!');
  console.log('====================================\n');
}

// Run the example
autoConfigureKTX().catch(error => {
  console.error('Example failed:', error);
  process.exit(1);
});
