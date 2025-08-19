// Test RealityDefender API with a public image
// Run with: node test-with-public-image.js

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

async function testWithPublicImage() {
  console.log('🖼️  Testing RealityDefender API with Public Image...\n');
  
  const env = loadEnv();
  const apiKey = env.VITE_REALITY_DEFENDER_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No API key found');
    return false;
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 8) + '...');
  
  // Use a public test image
  const publicImageUrl = 'https://picsum.photos/400/300'; // Random public image
  
  try {
    console.log('📡 Fetching public test image...');
    const imageResponse = await fetch(publicImageUrl);
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch test image: ${imageResponse.status}`);
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    console.log('✅ Test image fetched, size:', imageBuffer.byteLength, 'bytes');
    
    // Create form data for RealityDefender API
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    formData.append('file', blob, 'test-image.jpg');
    
    // Add analysis parameters
    formData.append('detailed_analysis', 'true');
    formData.append('confidence_threshold', '0.7');
    formData.append('include_heatmap', 'true');
    
    console.log('📡 Calling RealityDefender API...');
    console.log('API URL: https://api.prd.realitydefender.xyz/api/v2/detect');
    
    const response = await fetch('https://api.prd.realitydefender.xyz/api/v2/detect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'DeepGuard/1.0',
      },
      body: formData
    });
    
    console.log('\n📊 API Response Status:', response.status);
    console.log('📊 API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      console.log('\n✅ SUCCESS! RealityDefender API is working!');
      
      try {
        const result = await response.json();
        console.log('\n📄 Response Data:', JSON.stringify(result, null, 2));
        
        // Check if we got real analysis
        if (result.result || result.classification) {
          console.log('\n🎯 Real analysis received from RealityDefender!');
        } else {
          console.log('\n⚠️  Response received but format might be unexpected');
        }
        
      } catch (parseError) {
        console.log('\n⚠️  Could not parse JSON response:', parseError.message);
      }
      
      return true;
      
    } else {
      console.log('\n❌ API call failed');
      
      try {
        const errorText = await response.text();
        console.log('📄 Error Response:', errorText);
      } catch (e) {
        console.log('📄 Could not read error response');
      }
      
      if (response.status === 403) {
        console.log('\n🔍 403 Forbidden - Check your API key and account status');
      } else if (response.status === 404) {
        console.log('\n🔍 404 Not Found - Check the API endpoint URL');
      } else if (response.status === 429) {
        console.log('\n🔍 429 Too Many Requests - Check your API quota');
      }
      
      return false;
    }
    
  } catch (error) {
    console.log('❌ Error during test:', error.message);
    return false;
  }
}

async function main() {
  const success = await testWithPublicImage();
  
  console.log('\n📋 Summary:');
  if (success) {
    console.log('✅ RealityDefender API is working correctly!');
    console.log('✅ The issue is likely in your edge function or image URL handling');
    console.log('\n🔧 Next steps:');
    console.log('   1. Check your Supabase edge function logs');
    console.log('   2. Verify the image URLs being sent to the edge function');
    console.log('   3. Check if the edge function has proper permissions');
  } else {
    console.log('❌ RealityDefender API has issues');
    console.log('\n🔧 Next steps:');
    console.log('   1. Verify your API key at https://app.realitydefender.ai/');
    console.log('   2. Check your account status and API quota');
    console.log('   3. Contact RealityDefender support if the issue persists');
  }
}

main().catch(console.error);
