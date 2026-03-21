/**
 * Real-world example: Using config_helper in your application
 */

const { saveKTXConfig, loadKTXConfig } = require('../scripts/config_helper');
const { KTXPrivateClient } = require('../scripts/ktx_client');

/**
 * Example: Application initialization with auto-configuration
 */
async function initializeApp() {
  console.log('====================================');
  console.log('   Application Initialization');
  console.log('====================================\n');

  // Method 1: Hardcoded credentials (for testing/demo)
  console.log('Method 1: Using Hardcoded Credentials');
  console.log('--------------------------------------------\n');

  const API_KEY = 'your_actual_api_key_from_ktx';
  const API_SECRET = 'your_actual_api_secret_from_ktx';
  const PERMISSION = 'Trade';

  try {
    // Save configuration automatically
    const config = saveKTXConfig(API_KEY, API_SECRET, PERMISSION);
    console.log('✓ Configuration saved automatically');
    console.log('  Path:', config);
  } catch (error) {
    console.error('✗ Failed to save configuration:', error.message);
    console.error('Please check your API credentials and try again.\n');
    process.exit(1);
  }

  // Now use KTX clients (they will automatically load the config)
  console.log('\nMethod 2: Using KTX Private Client');
  console.log('--------------------------------------------\n');

  try {
    const client = new KTXPrivateClient();

    // Test: Get accounts
    console.log('Testing: Get trading accounts...');
    const accounts = await client.getAccounts();
    console.log('✓ Accounts retrieved:', accounts.length, 'accounts');

    if (accounts.length > 0) {
      const firstAccount = accounts[0];
      console.log('  First account:');
      console.log('    Currency:', firstAccount.currency || 'N/A');
      console.log('    Available:', firstAccount.available || '0');
      console.log('    Frozen:', firstAccount.frozen || '0');
    }

    // Test: Get server time
    console.log('\nTesting: Get server time...');
    const time = await client.getTime();
    console.log('✓ Server time:', new Date(time).toLocaleString());

    // Test: Get products
    console.log('\nTesting: Get trading pairs...');
    const products = await client.getProducts();
    console.log('✓ Trading pairs:', products.length);

    if (products.length > 0) {
      console.log('  First 5 pairs:');
      products.slice(0, 5).forEach((p, i) => {
        console.log(`    ${i + 1}. ${p.symbol || p.product}`);
      });
    }

  } catch (error) {
    console.error('✗ Error using KTX client:', error.message);
    console.error('\nCommon issues:');
    console.error('1. Invalid API key or secret');
    console.error('2. Insufficient permission level');
    console.error('3. Network connectivity issues');
    console.error('4. API endpoint changes\n');
  }

  console.log('\n====================================');
  console.log('   Initialization Complete!');
  console.log('====================================\n');
}

/**
 * Example: Environment-based configuration
 * Recommended for production use
 */
async function initializeFromEnv() {
  console.log('\nMethod 3: Environment-Based Configuration');
  console.log('--------------------------------------------\n');

  // Read from environment variables
  const API_KEY = process.env.KTX_API_KEY;
  const API_SECRET = process.env.KTX_API_SECRET;
  const PERMISSION = process.env.KTX_API_PERMISSION || 'Trade';

  if (!API_KEY || !API_SECRET) {
    console.error('✗ Missing environment variables:');
    console.error('  KTX_API_KEY');
    console.error('  KTX_API_SECRET');
    console.error('\nSet them before running:');
    console.error('  export KTX_API_KEY=your_key');
    console.error('  export KTX_API_SECRET=your_secret\n');
    process.exit(1);
  }

  try {
    // Save configuration from environment
    const config = saveKTXConfig(API_KEY, API_SECRET, PERMISSION);
    console.log('✓ Configuration saved from environment variables');

    // Now use KTX client
    const client = new KTXPrivateClient();
    const accounts = await client.getAccounts();
    console.log('✓ Client initialized successfully');
    console.log('  Accounts:', accounts.length);

  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

/**
 * Example: Check existing configuration
 */
function checkExistingConfig() {
  const { hasKTXConfig, loadKTXConfig } = require('../scripts/config_helper');

  console.log('\nMethod 4: Check Existing Configuration');
  console.log('--------------------------------------------\n');

  if (hasKTXConfig()) {
    const config = loadKTXConfig();
    console.log('✓ Configuration exists!');
    console.log('  API Key:', config.apiKey.substring(0, 8) + '...');
    console.log('  Permission:', config.permission);
    console.log('  Created:', new Date(config.createdAt).toLocaleString());

    // Calculate age of configuration
    const age = Date.now() - new Date(config.createdAt).getTime();
    const days = Math.floor(age / (1000 * 60 * 60 * 24));
    console.log('  Age:', days, 'days');

    if (days > 90) {
      console.log('  ⚠ Configuration is old (>90 days), consider rotating API keys');
    }

  } else {
    console.log('✗ No configuration found');
    console.log('  Run setup_config.js or use saveKTXConfig() to create one');
  }
}

// Run examples
async function runExamples() {
  // Run main example
  await initializeApp();

  // Check existing config
  checkExistingConfig();

  // Note: Uncomment to test environment-based config
  // await initializeFromEnv();
}

runExamples().catch(error => {
  console.error('\n✗ Example failed:', error.message);
  process.exit(1);
});
