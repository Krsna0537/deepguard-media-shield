# RealityDefender API Debugging Guide

## Current Issues
- Input images are not being analyzed properly
- Confidence scores seem too low (60%, 48%, 54%)
- Classification may be incorrect
- Heatmap shows synthetic data instead of real analysis

## What We Fixed

### 1. Improved Response Parsing
- Added support for more RealityDefender response fields
- Better handling of different response formats
- Status-based classification logic
- Enhanced confidence score calculation

### 2. Better Heatmap Generation
- Prioritizes RealityDefender-provided regions
- Uses manipulation scores when available
- Only generates synthetic data as last resort
- Clear warnings when using synthetic data

### 3. Enhanced Logging
- Full API response logging
- Response structure validation
- Field-by-field parsing logs
- Classification decision logging

## Debugging Steps

### Step 1: Check Browser Console
Look for these log messages:
```
Starting Reality Defender analysis...
Using edge function approach for Reality Defender API...
```

### Step 2: Check Supabase Edge Function Logs
In your Supabase dashboard, check the Edge Function logs for:
```
Raw RealityDefender response: {...}
Available result fields: [...]
Field values: {...}
Using [field] field: [value] -> [confidence]
Final confidence score: [value]
Final classification: [classification]
```

### Step 3: Verify API Response Format
The logs should show the actual RealityDefender API response. Look for:
- `result` object with analysis data
- `confidence`, `score`, or `probability` fields
- `status` or `classification` fields
- `regions` array for heatmap data

### Step 4: Check Heatmap Source
Look for these messages:
```
Using RealityDefender-provided regions for heatmap
Generated heatmap regions from manipulation scores: [...]
Using synthetic heatmap data - RealityDefender did not provide specific regions
```

## Expected Behavior

### For Authentic Images:
- Confidence score: 75-100%
- Classification: "authentic"
- Heatmap: RealityDefender regions or manipulation-based regions

### For Manipulated Images:
- Confidence score: 0-40%
- Classification: "deepfake"
- Heatmap: RealityDefender regions or manipulation-based regions

### For Uncertain Images:
- Confidence score: 40-74%
- Classification: "suspicious"
- Heatmap: RealityDefender regions or manipulation-based regions

## Common Issues

### 1. Low Confidence Scores (like 60%, 48%, 54%)
**Cause**: Using synthetic heatmap data instead of real analysis
**Solution**: Check if RealityDefender API is returning proper data

### 2. Wrong Classification
**Cause**: Incorrect confidence score interpretation
**Solution**: Verify the API response format and field mapping

### 3. Synthetic Heatmap
**Cause**: RealityDefender API not providing region data
**Solution**: Check API response for `regions` or manipulation scores

## Next Steps

1. **Test with a new image** and check the console logs
2. **Look for the "Raw RealityDefender response" log** to see actual API data
3. **Check if confidence scores are realistic** (should be 75%+ for authentic images)
4. **Verify heatmap source** (should not be synthetic for real analysis)

## If Still Not Working

The issue might be:
- RealityDefender API key not working
- API response format different than expected
- Edge function not receiving proper data
- Frontend not calling edge function correctly

Check the logs to identify which step is failing.
