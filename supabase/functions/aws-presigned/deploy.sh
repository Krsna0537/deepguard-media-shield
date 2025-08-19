#!/bin/bash

# Deploy the aws-presigned edge function
supabase functions deploy aws-presigned --project-ref your-project-ref

# Set the environment variables
supabase secrets set REALITY_DEFENDER_API_KEY="$REALITY_DEFENDER_API_KEY" --project-ref your-project-ref

echo "Deployed aws-presigned edge function successfully!"