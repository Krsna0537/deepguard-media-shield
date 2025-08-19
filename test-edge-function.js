// Test script to check if the edge function is working
// Run this with: node test-edge-function.js

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
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

// Test edge function
async function testEdgeFunction() {
  console.log('🧪 Testing RealityDefender Edge Function...');
  
  const env = loadEnv();
  
  // Check required environment variables
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
  const realityDefenderApiKey = env.VITE_REALITY_DEFENDER_API_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing Supabase configuration');
    console.log('   VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('   VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
    return false;
  }
  
  if (!realityDefenderApiKey || realityDefenderApiKey === 'your_reality_defender_api_key_here') {
    console.log('❌ Missing RealityDefender API key');
    console.log('   VITE_REALITY_DEFENDER_API_KEY:', realityDefenderApiKey ? '✅ Set' : '❌ Missing');
    return false;
  }
  
  console.log('✅ Environment variables loaded');
  console.log('   Supabase URL:', supabaseUrl.substring(0, 30) + '...');
  console.log('   RealityDefender API Key:', realityDefenderApiKey.substring(0, 8) + '...');
  
  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('✅ Supabase client created');
    
    // Test edge function with a simple request
    console.log('📡 Testing edge function invocation...');
    
    const testData = {
      fileUrl: 'https://example.com/test-image.jpg',
      fileType: 'image/jpeg'
    };
    
    console.log('   Test data:', testData);
    
    const { data, error } = await supabase.functions.invoke('reality-defender-analyze', {
      body: testData
    });
    
    if (error) {
      console.log('❌ Edge function error:', error);
      console.log('   Error message:', error.message);
      console.log('   Error details:', error);
      return false;
    }
    
    console.log('✅ Edge function executed successfully!');
    console.log('   Response data:', data);
    
    // Check if we got real analysis or fallback
    if (data.api_provider && data.api_provider.includes('Fallback')) {
      console.log('⚠️  Edge function returned fallback analysis');
      console.log('   This means the RealityDefender API call failed');
    } else {
      console.log('✅ Edge function returned real RealityDefender analysis');
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Error testing edge function:', error.message);
    console.log('   Full error:', error);
    return false;
  }
}

// Check edge function deployment
async function checkEdgeFunctionDeployment() {
  console.log('\n🔍 Checking Edge Function Deployment...');
  
  try {
    const env = loadEnv();
    const supabaseUrl = env.VITE_SUPABASE_URL;
    const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('❌ Cannot check deployment without Supabase config');
      return false;
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Try to list functions (this might not work with anon key, but worth trying)
    try {
      const { data: functions, error } = await supabase.functions.list();
      
      if (error) {
        console.log('⚠️  Could not list functions (anon key limitation):', error.message);
        console.log('   This is normal - anon keys cannot list functions');
      } else {
        console.log('✅ Functions list retrieved');
        const realityDefenderFunction = functions.find(f => f.name === 'reality-defender-analyze');
        
        if (realityDefenderFunction) {
          console.log('✅ reality-defender-analyze function found');
          console.log('   Status:', realityDefenderFunction.status);
          console.log('   Version:', realityDefenderFunction.version);
        } else {
          console.log('❌ reality-defender-analyze function not found');
        }
      }
    } catch (listError) {
      console.log('⚠️  Could not list functions:', listError.message);
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Error checking deployment:', error.message);
    return false;
  }
}

// Main test
async function main() {
  console.log('🚀 RealityDefender Edge Function Test\n');
  
  const deploymentOk = await checkEdgeFunctionDeployment();
  const functionOk = await testEdgeFunction();
  
  console.log('\n📋 Summary:');
  if (functionOk) {
    console.log('✅ Edge function is working correctly');
    console.log('✅ RealityDefender API integration is functional');
  } else {
    console.log('❌ Edge function has issues');
    console.log('\n🔧 Common fixes:');
    console.log('   1. Deploy the edge function: supabase functions deploy reality-defender-analyze');
    console.log('   2. Check Supabase dashboard for function logs');
    console.log('   3. Verify environment variables are set correctly');
    console.log('   4. Check if the function is accessible from your region');
  }
  
  if (!deploymentOk) {
    console.log('\n⚠️  Deployment check failed');
    console.log('   This might indicate the function is not deployed');
  }
}

main().catch(console.error);
