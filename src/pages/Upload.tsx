
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { MediaService, UploadProgress } from '@/lib/mediaService';

export default function Upload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFiles = (selectedFiles: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    selectedFiles.forEach(file => {
      const validation = MediaService.validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      toast({
        title: "File Validation Errors",
        description: errors.join('\n'),
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const results = [];

    try {
      for (const file of files) {
        console.log('🚀 Starting upload and analysis for:', file.name);
        
        // Upload file
        const mediaFile = await MediaService.uploadFile(file, (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: progress
          }));
        });

        console.log('✅ Upload completed, starting analysis...');
        
        // Start analysis
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: { ...prev[file.name], status: 'processing' }
        }));

        const analysisResult = await MediaService.analyzeFile(mediaFile.id);
        
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: { ...prev[file.name], status: 'completed' }
        }));

        results.push({ mediaFile, analysisResult });
        
        console.log('✅ Analysis completed for:', file.name, {
          confidence: analysisResult.confidence_score,
          classification: analysisResult.classification
        });
      }

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${results.length} file(s) using Reality Defender API`,
      });

      // Navigate to results page for the first analyzed file
      if (results.length > 0) {
        navigate(`/results/${results[0].mediaFile.id}`);
      }
      
    } catch (error: any) {
      console.error('❌ Upload/Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze files",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Upload Media for Analysis</h1>
        <p className="text-muted-foreground">
          Upload images, videos, or audio files for deepfake detection using Reality Defender API
        </p>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Reality Defender API Integration Active</strong> - Your files will be analyzed using professional deepfake detection technology.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
          <CardDescription>
            Supported formats: JPG, PNG, WEBP, MP4, MOV, WEBM, MP3, WAV (Max: 100MB per file)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Drop files here or click to browse</p>
              <p className="text-sm text-muted-foreground">
                Drag and drop your media files, or click the button below
              </p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={handleFileInput}
              className="hidden"
              id="file-input"
            />
            <Button asChild className="mt-4">
              <label htmlFor="file-input" className="cursor-pointer">
                Browse Files
              </label>
            </Button>
          </div>

          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-medium">Selected Files ({files.length})</h3>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB • {file.type}
                      </p>
                    </div>
                  </div>
                  {uploadProgress[file.name] ? (
                    <div className="flex items-center space-x-2">
                      <Progress value={uploadProgress[file.name].progress} className="w-20" />
                      <span className="text-sm text-muted-foreground">
                        {uploadProgress[file.name].status}
                      </span>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={uploadFiles} 
                disabled={uploading || files.length === 0}
                className="px-8"
              >
                {uploading ? 'Analyzing with Reality Defender...' : `Analyze ${files.length} File(s)`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {Object.keys(uploadProgress).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Status</CardTitle>
            <CardDescription>Real-time analysis progress using Reality Defender API</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{fileName}</span>
                    <span className="text-sm text-muted-foreground capitalize">
                      {progress.status}
                    </span>
                  </div>
                  <Progress value={progress.progress} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
