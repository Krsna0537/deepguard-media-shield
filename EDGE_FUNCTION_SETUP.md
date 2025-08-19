# Edge Function Setup

## AWS Presigned URL Edge Function

This project includes a Supabase Edge Function that proxies requests to the Reality Defender API for generating AWS presigned URLs. This is necessary to avoid CORS issues and to keep the API key secure.

### Deployment

1. Make sure you have the Supabase CLI installed:

```bash
npm install -g supabase
```

2. Login to Supabase:

```bash
supabase login
```

3. Deploy the edge function:

```bash
cd supabase/functions/aws-presigned
supabase functions deploy aws-presigned --project-ref your-project-ref
```

Replace `your-project-ref` with your actual Supabase project reference ID.

4. Set the required environment variables:

```bash
supabase secrets set REALITY_DEFENDER_API_KEY="your-reality-defender-api-key" --project-ref your-project-ref
```

### Testing the Edge Function

You can test the edge function using curl:

```bash
curl -X POST "https://your-project-ref.supabase.co/functions/v1/aws-presigned" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-reality-defender-api-key" \
  -d '{"fileName":"test.jpg"}'
```

### Troubleshooting

If you encounter a 404 error when trying to access `/api/files/aws-presigned`, make sure:

1. The edge function is deployed correctly
2. Your application is configured to use the correct endpoint URL
3. The REALITY_DEFENDER_API_KEY environment variable is set correctly

### Logs

You can view the logs for the edge function using:

```bash
supabase functions logs aws-presigned --project-ref your-project-ref
```