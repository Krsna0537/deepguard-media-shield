// Test RealityDefender API key directly
// Run with: node test-api-key.js

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

async function testAPIKey() {
  console.log('🔑 Testing RealityDefender API Key...\n');
  
  const env = loadEnv();
  const apiKey = env.VITE_REALITY_DEFENDER_API_KEY;
  
  if (!apiKey || apiKey === 'your_reality_defender_api_key_here') {
    console.log('❌ No API key found in .env file');
    return false;
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 8) + '...');
  console.log('📡 Testing API key validity...\n');
  
  try {
    // Test with a simple API call
    const response = await fetch('https://api.prd.realitydefender.xyz/api/v2/detect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'DeepGuard/1.0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Simple test payload
        test: true
      })
    });
    
    console.log('📊 API Response Status:', response.status);
    console.log('📊 API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 403) {
      console.log('\n❌ 403 Forbidden - API Key Issues:');
      console.log('   • API key might be invalid or expired');
      console.log('   • Account might not have proper permissions');
      console.log('   • Account might be suspended or inactive');
      console.log('   • API quota might be exceeded');
    } else if (response.status === 401) {
      console.log('\n❌ 401 Unauthorized - Invalid API Key');
    } else if (response.status === 200) {
      console.log('\n✅ API Key is working!');
    } else {
      console.log('\n⚠️  Unexpected response status:', response.status);
    }
    
    // Try to get response body
    try {
      const responseText = await response.text();
      console.log('\n📄 Response Body:', responseText.substring(0, 500));
    } catch (e) {
      console.log('\n📄 Could not read response body');
    }
    
    return response.status === 200;
    
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return false;
  }
}

async function main() {
  const success = await testAPIKey();
  
  console.log('\n📋 Summary:');
  if (success) {
    console.log('✅ API key is valid and working');
    console.log('✅ The issue might be in the edge function configuration');
  } else {
    console.log('❌ API key has issues');
    console.log('\n🔧 Next steps:');
    console.log('   1. Verify your API key at https://app.realitydefender.ai/');
    console.log('   2. Check your account status and permissions');
    console.log('   3. Ensure your account is active and not suspended');
    console.log('   4. Check if you have API quota remaining');
  }
}

main().catch(console.error);
