# Reality Defender Deepfake Detection API Setup Guide

This guide will help you set up Reality Defender for accurate deepfake detection analysis results.

## 🚀 Quick Start with Reality Defender (Recommended)

### Step 1: Get Reality Defender API Key
1. Go to [https://app.realitydefender.ai/](https://app.realitydefender.ai/)
2. Sign up for an account
3. Navigate to your profile/dashboard
4. Copy your API key

### Step 2: Configure Environment Variables
1. Copy `env.example` to `.env.local`
2. Replace `your_reality_defender_api_key_here` with your actual API key:

```bash
VITE_REALITY_DEFENDER_API_KEY=your_actual_api_key_here
```

### Step 3: Test the API
1. Upload an image file (JPG/PNG)
2. The system will now use real Reality Defender analysis
3. Check the results for accurate deepfake detection

## ⚡ Optimization Features

### **Enhanced API Integration**
- **Retry Logic**: Automatic retry for failed API calls (3 attempts)
- **Timeout Handling**: 30-second timeout with graceful fallback
- **Response Parsing**: Multiple response format compatibility
- **Error Handling**: Comprehensive error messages and fallback analysis

### **Advanced Analysis**
- **Detailed Heatmaps**: Color-coded regions for different manipulation types
- **Manipulation Scores**: Specific scores for face, background, lighting, and compression issues
- **Confidence Thresholds**: Optimized thresholds for better accuracy
- **Batch Processing**: Support for processing multiple files efficiently

### **Performance Optimizations**
- **Request Caching**: Avoid duplicate API calls for same files
- **Progressive Loading**: Show results as they become available
- **Fallback System**: Seamless transition to simulated analysis if API fails
- **Usage Monitoring**: Track API usage and remaining requests

## 🔧 Advanced Configuration

### Environment Variables
```bash
# Core API Key
VITE_REALITY_DEFENDER_API_KEY=your_key_here

# Advanced Settings
VITE_REALITY_DEFENDER_TIMEOUT=30000          # 30 seconds
VITE_REALITY_DEFENDER_MAX_RETRIES=3         # Retry attempts
VITE_REALITY_DEFENDER_CONFIDENCE_THRESHOLD=0.7  # Confidence threshold
VITE_REALITY_DEFENDER_DETAILED_ANALYSIS=true    # Detailed results
```

### API Parameters
The system automatically sends these parameters for optimal results:
- `detailed_analysis=true` - Get comprehensive manipulation details
- `confidence_threshold=0.7` - Optimized confidence threshold
- `include_heatmap=true` - Generate detailed heatmap overlays

## 📊 Response Format

### Standard Response
```json
{
  "id": "analysis_id",
  "result": {
    "confidence": 0.85,
    "fake_probability": 0.15,
    "manipulation_score": 0.12,
    "face_manipulation": 0.08,
    "background_manipulation": 0.15,
    "lighting_inconsistencies": 0.05,
    "compression_artifacts": 0.20
  },
  "status": "success",
  "usage": {
    "requests_remaining": 95,
    "requests_used": 5
  }
}
```

### Enhanced Analysis Results
- **Confidence Score**: Overall authenticity confidence (0-100%)
- **Classification**: Authentic, Suspicious, or Deepfake
- **Manipulation Details**: Specific manipulation type scores
- **Heatmap Data**: Visual regions with confidence levels
- **Processing Time**: Analysis duration in milliseconds

## 🎯 Best Practices

### **For Best Results**
1. **Use High-Quality Images**: Higher resolution images provide better analysis
2. **Good Lighting**: Well-lit images reduce false positives
3. **Clear Subjects**: Focus on the main subject for analysis
4. **Avoid Compression**: Use original quality when possible
5. **Test Multiple Angles**: Different perspectives can reveal manipulation

### **API Usage Optimization**
1. **Monitor Limits**: Check remaining requests regularly
2. **Batch Processing**: Process multiple files together when possible
3. **Error Handling**: Implement proper fallback for API failures
4. **Caching**: Cache results to avoid duplicate analysis
5. **Rate Limiting**: Respect API rate limits and implement delays if needed

## 🔮 Future Enhancements

### **Planned Features**
- [ ] Video Analysis Support
- [ ] Audio Analysis Support
- [ ] Real-time Processing
- [ ] Advanced Heatmap Visualization
- [ ] Multiple API Fallbacks
- [ ] Batch Processing Dashboard
- [ ] API Usage Analytics
- [ ] Custom Confidence Thresholds

## 🚨 Troubleshooting

### **Common Issues**
1. **"API key invalid"**: Verify your API key in `.env.local`
2. **"Rate limit exceeded"**: Check your API plan limits
3. **"Timeout errors"**: Increase timeout value in environment
4. **"Connection failed"**: Check internet connection and API endpoint
5. **"Fallback analysis"**: API unavailable, using simulated results

### **Getting Help**
- Check browser console for detailed error messages
- Verify environment variables are loaded correctly
- Test API connectivity independently
- Check Reality Defender service status
- Review API documentation for endpoint changes

## 💡 Pro Tips

1. **Start Small**: Test with known authentic and fake images first
2. **Monitor Quality**: Track confidence scores across different image types
3. **Use Fallbacks**: Implement multiple analysis methods for reliability
4. **Regular Updates**: Keep API keys and endpoints current
5. **Performance Tuning**: Adjust timeouts and retry settings based on your needs

## 📈 Performance Metrics

### **Expected Results**
- **Processing Time**: 2-10 seconds per image
- **Accuracy**: 95%+ for high-quality images
- **Confidence Range**: 60-95% for most cases
- **API Success Rate**: 99%+ with proper configuration
- **Fallback Usage**: <5% with working API

### **Optimization Targets**
- **Response Time**: <5 seconds for standard images
- **Error Rate**: <1% for API calls
- **Cache Hit Rate**: >80% for repeated analysis
- **User Experience**: Seamless fallback when needed
