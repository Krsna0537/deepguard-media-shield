// API Configuration
export const API_CONFIG = {
  // Reality Defender Configuration
  REALITY_DEFENDER: {
    API_KEY: import.meta.env.VITE_REALITY_DEFENDER_API_KEY || 'YOUR_REALITY_DEFENDER_API_KEY_HERE',
    API_URL: 'https://api.realitydefender.ai/v1/detect',
    FREE_TIER_LIMIT: 100, // requests per month (adjust based on Reality Defender's actual limits)
    TIMEOUT_MS: 30000, // 30 second timeout
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 1000,
    BATCH_SIZE: 5, // Process multiple files in one API call if supported
  },
  
  // Alternative APIs (for future use)
  ALTERNATIVES: {
    // Amazon Rekognition
    AWS_REKOGNITION: {
      REGION: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      ACCESS_KEY: import.meta.env.VITE_AWS_ACCESS_KEY || '',
      SECRET_KEY: import.meta.env.VITE_AWS_SECRET_KEY || '',
    },
    
    // Google Cloud Vision
    GOOGLE_CLOUD: {
      API_KEY: import.meta.env.VITE_GOOGLE_CLOUD_API_KEY || '',
      PROJECT_ID: import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID || '',
    },
    
    // Microsoft Azure
    AZURE: {
      ENDPOINT: import.meta.env.VITE_AZURE_ENDPOINT || '',
      API_KEY: import.meta.env.VITE_AZURE_API_KEY || '',
    }
  }
};

// API Response Types
export interface RealityDefenderResponse {
  id: string;
  result: {
    score?: number;
    confidence?: number;
    fake_probability?: number;
    real_probability?: number;
    classification?: string;
    manipulation_score?: number;
    authenticity_score?: number;
    [key: string]: any;
  };
  status: string;
  message?: string;
  error?: string;
  usage?: {
    requests_remaining?: number;
    requests_used?: number;
    reset_date?: string;
  };
}

export interface AnalysisResult {
  confidence_score: number;
  classification: 'authentic' | 'deepfake' | 'suspicious';
  processing_time_ms: number;
  heatmap_data: any;
  api_provider: string;
  api_response?: any;
  manipulation_details?: {
    overall_score: number;
    face_manipulation?: number;
    background_manipulation?: number;
    lighting_inconsistencies?: number;
    compression_artifacts?: number;
  };
}
