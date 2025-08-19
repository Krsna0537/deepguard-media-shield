// Test direct RealityDefender API integration
// Run with: node test-direct-api.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const env = {};
      
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      });
      
      return env;
    }
  } catch (error) {
    console.error('Error loading .env file:', error.message);
  }
  return {};
}

async function testDirectAPI() {
  console.log('🚀 Testing Direct RealityDefender API Integration...\n');
  
  const env = loadEnv();
  const apiKey = env.VITE_REALITY_DEFENDER_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No API key found in .env file');
    return false;
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 8) + '...');
  
  // Test different possible RealityDefender endpoints
  const endpoints = [
    'https://api.realitydefender.ai/detect',
    'https://api.realitydefender.ai/api/detect',
    'https://api.realitydefender.ai/v1/detect',
    'https://api.realitydefender.ai/api/v1/detect',
    'https://realitydefender.ai/api/detect',
    'https://realitydefender.ai/detect',
    'https://api.app.realitydefender.ai/detect',
    'https://api.app.realitydefender.ai/api/detect'
  ];
  
  console.log('🔍 Testing different RealityDefender endpoints...\n');
  
  for (const endpoint of endpoints) {
    console.log(`📡 Testing: ${endpoint}`);
    
    try {
      // Test with a simple request first
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': 'DeepGuard/1.0',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: true })
      });
      
      console.log(`   Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log(`   ✅ SUCCESS! Found working endpoint: ${endpoint}`);
        console.log('\n🎯 This is the correct RealityDefender API endpoint!');
        return endpoint;
      } else if (response.status === 401) {
        console.log(`   ❌ 401 Unauthorized - API key issue`);
      } else if (response.status === 403) {
        console.log(`   ❌ 403 Forbidden - Permission issue`);
      } else if (response.status === 404) {
        console.log(`   ❌ 404 Not Found - Endpoint doesn't exist`);
      } else {
        console.log(`   ⚠️  ${response.status} - Unexpected status`);
      }
      
      // Try to get response body for more info
      try {
        const responseText = await response.text();
        if (responseText.length < 200) {
          console.log(`   Response: ${responseText}`);
        }
      } catch (e) {
        // Ignore response body errors
      }
      
    } catch (error) {
      console.log(`   ❌ Network error: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('❌ No working endpoints found');
  return false;
}

async function main() {
  const workingEndpoint = await testDirectAPI();
  
  if (workingEndpoint) {
    console.log('\n🔧 Next Steps:');
    console.log('   1. Update your frontend code to use this endpoint');
    console.log('   2. Remove the Supabase edge function dependency');
    console.log('   3. Send images directly to RealityDefender');
    console.log('\n📝 Working endpoint:', workingEndpoint);
  } else {
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your RealityDefender account status');
    console.log('   2. Verify your API key is correct');
    console.log('   3. Contact RealityDefender support');
    console.log('   4. Check if you need to activate API access');
  }
}

main().catch(console.error);
