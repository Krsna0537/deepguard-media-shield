// Test different RealityDefender API endpoints
// Run with: node test-correct-endpoints.js

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

async function testEndpoint(url, description, apiKey) {
  console.log(`\n🔍 Testing: ${description}`);
  console.log(`   URL: ${url}`);
  
  try {
    const response = await fetch(url, {
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
      console.log(`   ✅ SUCCESS! This endpoint works!`);
      return { url, status: 200, working: true };
    } else if (response.status === 401) {
      console.log(`   ❌ 401 Unauthorized - API key issue`);
      return { url, status: 401, working: false };
    } else if (response.status === 403) {
      console.log(`   ❌ 403 Forbidden - Permission issue`);
      return { url, status: 403, working: false };
    } else if (response.status === 404) {
      console.log(`   ❌ 404 Not Found - Endpoint doesn't exist`);
      return { url, status: 404, working: false };
    } else {
      console.log(`   ⚠️  ${response.status} - Unexpected status`);
      return { url, status: response.status, working: false };
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { url, status: 'ERROR', working: false };
  }
}

async function main() {
  console.log('🔍 Testing RealityDefender API Endpoints...\n');
  
  const env = loadEnv();
  const apiKey = env.VITE_REALITY_DEFENDER_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No API key found in .env file');
    return;
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 8) + '...');
  
  // Test different possible endpoints
  const endpoints = [
    {
      url: 'https://api.prd.realitydefender.xyz/api/v2/detect',
      description: 'Current endpoint (v2)'
    },
    {
      url: 'https://api.prd.realitydefender.xyz/api/v1/detect',
      description: 'Version 1 endpoint'
    },
    {
      url: 'https://api.prd.realitydefender.xyz/detect',
      description: 'No version endpoint'
    },
    {
      url: 'https://api.prd.realitydefender.xyz/api/detect',
      description: 'No version in path'
    },
    {
      url: 'https://api.realitydefender.xyz/api/v2/detect',
      description: 'No prd subdomain'
    },
    {
      url: 'https://api.realitydefender.xyz/detect',
      description: 'No prd, no version'
    }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.url, endpoint.description, apiKey);
    results.push(result);
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📋 Summary:');
  const workingEndpoints = results.filter(r => r.working);
  
  if (workingEndpoints.length > 0) {
    console.log('✅ Found working endpoints:');
    workingEndpoints.forEach(endpoint => {
      console.log(`   • ${endpoint.url}`);
    });
    console.log('\n🔧 Update your edge function with the working endpoint!');
  } else {
    console.log('❌ No working endpoints found');
    console.log('\n🔧 Possible issues:');
    console.log('   1. API key is invalid or expired');
    console.log('   2. Account needs activation');
    console.log('   3. API endpoint format has changed');
    console.log('   4. Contact RealityDefender support');
  }
}

main().catch(console.error);
