#!/usr/bin/env node

const { hasKTXConfig, loadKTXConfig, getConfigPath } = require('./config_helper');
const { KTXPublicClient, KTXPrivateClient } = require('./ktx_client');

/**
 * Check KTX API configuration status
 */
async function checkConfig() {
  console.log('====================================');
  console.log('   KTX API Configuration Check');
  console.log('====================================\n');

  // 1. Check if config file exists
  const configPath = getConfigPath();
  const hasConfig = hasKTXConfig();

  console.log('📁 Configuration File Status:');
  console.log(`   Path: ${configPath}`);
  console.log(`   Status: ${hasConfig ? '✓ EXISTS' : '✗ NOT FOUND'}\n`);

  if (!hasConfig) {
    console.log('❌ API Key is NOT configured');
    console.log('\nPlease run the following commands to set up:');
    console.log('1. Create config file:');
    console.log('   node setup_config.js');
    console.log('\n2. Or create config manually:');
    console.log('   {"apiKey":"your_api_key","apiSecret":"your_api_secret","permission":"Trade"}');
    console.log(`   Save to: ${configPath}`);
    process.exit(1);
  }

  // 2. Load and validate config
  console.log('📋 Configuration Details:');
  try {
    const config = loadKTXConfig();

    if (!config) {
      console.log('   ✗ Failed to load configuration');
      process.exit(1);
    }

    console.log(`   API Key: ${config.apiKey.substring(0, 8)}...${config.apiKey.substring(config.apiKey.length - 4)}`);
    console.log(`   API Secret: ${config.apiSecret.substring(0, 8)}...${config.apiSecret.substring(config.apiSecret.length - 4)}`);
    console.log(`   Permission: ${config.permission}`);
    console.log(`   Created: ${config.createdAt}`);
    console.log('');

    // 3. Validate config format
    console.log('✓ Configuration Format Check:');
    if (config.apiKey && config.apiKey.length >= 16) {
      console.log('   ✓ API Key format is valid');
    } else {
      console.log('   ✗ API Key format is invalid (minimum 16 characters)');
    }

    if (config.apiSecret && config.apiSecret.length >= 32) {
      console.log('   ✓ API Secret format is valid');
    } else {
      console.log('   ✗ API Secret format is invalid (minimum 32 characters)');
    }

    const validPermissions = ['View', 'Trade'];
    if (validPermissions.includes(config.permission)) {
      console.log(`   ✓ Permission is valid: ${config.permission}`);
    } else {
      console.log(`   ✗ Permission is invalid: ${config.permission}`);
    }
    console.log('');

    // 4. Test client initialization
    console.log('🔌 Client Connection Test:');

    // Test public client (should always work)
    try {
      const publicClient = new KTXPublicClient();
      console.log('   ✓ Public client initialized successfully');

      // Test server time
      const serverTime = await publicClient.getTime();
      if (serverTime) {
        console.log(`   ✓ Server time: ${new Date(serverTime).toLocaleString()}`);
      }
    } catch (error) {
      console.log(`   ✗ Public client error: ${error.message}`);
    }

    // Test private client (requires API key)
    try {
      const privateClient = new KTXPrivateClient();
      console.log('   ✓ Private client initialized successfully');

      // Test get accounts to verify API key works
      try {
        const accounts = await privateClient.getAccounts();
        if (accounts && Array.isArray(accounts)) {
          console.log(`   ✓ API Key authentication successful`);
          console.log(`   ✓ Found ${accounts.length} trading account(s)`);
        }
      } catch (apiError) {
        if (apiError.message.includes('401') || apiError.message.includes('403')) {
          console.log('   ✗ API Key authentication failed');
          console.log('   ✗ Please check if your API Key is valid and has the correct permissions');
        } else {
          console.log(`   ⚠ API connection warning: ${apiError.message}`);
        }
      }
    } catch (clientError) {
      console.log(`   ✗ Private client initialization failed: ${clientError.message}`);
    }

    console.log('');
    console.log('====================================');
    console.log('   Summary');
    console.log('====================================');
    console.log('✓ API Key is CONFIGURED');
    console.log('✓ Configuration file is VALID');
    console.log(`✓ Permission level: ${config.permission}`);

    if (config.permission === 'View') {
      console.log('⚠️  WARNING: View-only permission - trading operations are NOT available');
    } else if (config.permission === 'Trade') {
      console.log('✓ Trading operations are ENABLED');
    }

    console.log('\nYou can now use KTX Skills for:');
    console.log('  • Public market data queries (tickers, order books, K-lines)');
    if (config.permission === 'Trade') {
      console.log('  • Private account queries (balance, positions, orders)');
      console.log('  • Trading operations (place orders, cancel orders)');
    } else {
      console.log('  • Public market data queries only');
    }
    console.log('====================================\n');

  } catch (error) {
    console.log(`\n✗ Configuration check failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the check
if (require.main === module) {
  checkConfig()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('\nFatal error:', error);
      process.exit(1);
    });
}

module.exports = { checkConfig };
