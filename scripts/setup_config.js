const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');

const CONFIG_PATH = path.join(os.homedir(), '.ktx_exchange_config.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Read user input
 */
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

/**
 * Validate API key format
 */
function validateApiKey(apiKey) {
  if (!apiKey || apiKey.length < 16) {
    throw new Error('API Key format is incorrect, minimum length should be 16 characters');
  }
  return true;
}

/**
 * Validate API Secret format
 */
function validateApiSecret(apiSecret) {
  if (!apiSecret || apiSecret.length < 32) {
    throw new Error('API Secret format is incorrect, minimum length should be 32 characters');
  }
  return true;
}

/**
 * Main function
 */
async function setupConfig() {
  console.log('====================================');
  console.log('   KTX Exchange API Key Configuration');
  console.log('====================================\n');

  try {
    // Check if config file already exists
    if (fs.existsSync(CONFIG_PATH)) {
      const overwrite = await question('Config file already exists, overwrite? (y/n): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Configuration cancelled');
        rl.close();
        return;
      }
    }

    // Collect configuration information
    console.log('\nPlease enter your KTX API key information:\n');

    const apiKey = await question('API Key: ');
    try {
      validateApiKey(apiKey);
    } catch (error) {
      console.error('Error:', error.message);
      rl.close();
      process.exit(1);
    }

    const apiSecret = await question('API Secret: ');
    try {
      validateApiSecret(apiSecret);
    } catch (error) {
      console.error('Error:', error.message);
      rl.close();
      process.exit(1);
    }

    console.log('\nPlease select API key permission:');
    console.log('1. View - View permission only');
    console.log('2. Trade - Trade permission (includes view)');

    const permissionChoice = await question('Please enter option (1/2): ');
    let permission = 'View';
    if (permissionChoice === '2') {
      permission = 'Trade';
    } else if (permissionChoice !== '1') {
      console.error('Invalid option');
      rl.close();
      process.exit(1);
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

    console.log('\n====================================');
    console.log('   Configuration saved successfully!');
    console.log('====================================');
    console.log(`Config file path: ${CONFIG_PATH}`);
    console.log(`API Key: ${config.apiKey.substring(0, 8)}...`);
    console.log(`Permission: ${config.permission}`);
    console.log(`Created at: ${config.createdAt}`);
    console.log('\nSecurity tips:');
    console.log('- Configuration file is saved locally on your computer');
    console.log('- Do not share the configuration file with others');
    console.log('- Do not submit the configuration file to version control');
    console.log('- Rotate your API keys regularly');
    console.log('- Create different API keys for different purposes');
    console.log('\nNext steps:');
    console.log('Run node test_connection.js to test connection\n');

  } catch (error) {
    console.error('Configuration failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run configuration wizard
setupConfig();
