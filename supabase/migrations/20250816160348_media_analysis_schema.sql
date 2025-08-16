-- Create media_files table for storing uploaded files
CREATE TABLE public.media_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'uploading', 'processing', 'completed', 'failed')),
  upload_progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analysis_results table for storing analysis outcomes
CREATE TABLE public.analysis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_file_id UUID NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
  confidence_score DECIMAL(5,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  classification TEXT NOT NULL CHECK (classification IN ('authentic', 'deepfake', 'suspicious')),
  processing_time_ms INTEGER NOT NULL,
  analysis_metadata JSONB,
  heatmap_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_feedback table for storing user ratings and feedback
CREATE TABLE public.user_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_result_id UUID NOT NULL REFERENCES public.analysis_results(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_preferences table for storing user settings
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  high_contrast BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
  auto_export_results BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for media_files
CREATE POLICY "Users can view their own media files" 
ON public.media_files FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own media files" 
ON public.media_files FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media files" 
ON public.media_files FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media files" 
ON public.media_files FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for analysis_results
CREATE POLICY "Users can view results of their own files" 
ON public.analysis_results FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.media_files 
    WHERE media_files.id = analysis_results.media_file_id 
    AND media_files.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert results for their own files" 
ON public.analysis_results FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.media_files 
    WHERE media_files.id = analysis_results.media_file_id 
    AND media_files.user_id = auth.uid()
  )
);

-- Create policies for user_feedback
CREATE POLICY "Users can view feedback on their own results" 
ON public.user_feedback FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.analysis_results ar
    JOIN public.media_files mf ON ar.media_file_id = mf.id
    WHERE ar.id = user_feedback.analysis_result_id 
    AND mf.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own feedback" 
ON public.user_feedback FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for user_preferences
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
ON public.user_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_media_files_user_id ON public.media_files(user_id);
CREATE INDEX idx_media_files_status ON public.media_files(status);
CREATE INDEX idx_media_files_created_at ON public.media_files(created_at);
CREATE INDEX idx_analysis_results_media_file_id ON public.analysis_results(media_file_id);
CREATE INDEX idx_analysis_results_classification ON public.analysis_results(classification);
CREATE INDEX idx_user_feedback_analysis_result_id ON public.user_feedback(analysis_result_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_media_files_updated_at
  BEFORE UPDATE ON public.media_files
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user preferences
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger for new user preferences
CREATE TRIGGER on_auth_user_created_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_preferences();
