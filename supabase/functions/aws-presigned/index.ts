import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface PresignedUrlRequest {
  fileName: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract the API key from the request headers
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      throw new Error('API key is required');
    }

    const { fileName }: PresignedUrlRequest = await req.json();
    
    if (!fileName) {
      throw new Error('File name is required');
    }

    console.log(`Requesting presigned URL for file: ${fileName}`);

    // Forward the request to Reality Defender API
    const response = await fetch('https://api.prd.realitydefender.xyz/api/files/aws-presigned', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Origin': 'https://app.realitydefender.ai'
      },
      body: JSON.stringify({
        fileName: fileName
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to get signed URL: ${response.status} ${response.statusText}`);
      console.error('Error response:', errorText);
      throw new Error(`Failed to get signed URL: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in aws-presigned function:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      code: 'error',
      status: 500
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});