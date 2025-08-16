-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-files',
  'media-files',
  true,
  104857600, -- 100MB in bytes
  ARRAY['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/wav']
);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy for users to upload their own files
CREATE POLICY "Users can upload their own media files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for users to view their own files
CREATE POLICY "Users can view their own media files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'media-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for users to update their own files
CREATE POLICY "Users can update their own media files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for users to delete their own files
CREATE POLICY "Users can delete their own media files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
