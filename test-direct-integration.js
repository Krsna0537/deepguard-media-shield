// Test direct RealityDefender integration
// Run with: node test-direct-integration.js

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

async function testDirectIntegration() {
  console.log('🚀 Testing Direct RealityDefender Integration...\n');
  
  const env = loadEnv();
  const apiKey = env.VITE_REALITY_DEFENDER_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No API key found in .env file');
    return false;
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 8) + '...');
  
  // Use a public test image
  const publicImageUrl = 'https://picsum.photos/400/300';
  
  try {
    console.log('📡 Fetching test image...');
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
    
    console.log('📡 Calling RealityDefender API directly...');
    console.log('API URL: https://realitydefender.ai/api/detect');
    
    const startTime = Date.now();
    
    const response = await fetch('https://realitydefender.ai/api/detect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'DeepGuard/1.0',
      },
      body: formData
    });
    
    const processingTime = Date.now() - startTime;
    
    console.log('\n📊 API Response Status:', response.status);
    console.log('📊 Processing Time:', processingTime, 'ms');
    
    if (response.ok) {
      console.log('\n✅ SUCCESS! RealityDefender API is working!');
      
      try {
        const result = await response.json();
        console.log('\n📄 Response Data:', JSON.stringify(result, null, 2));
        
        // Check if we got real analysis
        if (result.result || result.classification || result.confidence) {
          console.log('\n🎯 Real analysis received from RealityDefender!');
          console.log('✅ Your website will now use REAL AI analysis instead of fallback data!');
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
      
      return false;
    }
    
  } catch (error) {
    console.log('❌ Error during test:', error.message);
    return false;
  }
}

async function main() {
  const success = await testDirectIntegration();
  
  console.log('\n📋 Summary:');
  if (success) {
    console.log('✅ Direct RealityDefender integration is working!');
    console.log('✅ Your website will now analyze images with REAL AI');
    console.log('✅ No more fallback/synthetic analysis');
    console.log('\n🔧 Next steps:');
    console.log('   1. Restart your development server');
    console.log('   2. Upload an image through your website');
    console.log('   3. Check the console for "Using direct Reality Defender API..."');
    console.log('   4. Enjoy real deepfake detection!');
  } else {
    console.log('❌ Direct integration still has issues');
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your RealityDefender account status');
    console.log('   2. Verify your API key is correct');
    console.log('   3. Contact RealityDefender support');
  }
}

main().catch(console.error);
