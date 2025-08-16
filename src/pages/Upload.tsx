import { useState, useCallback } from "react";
import { 
  Upload as UploadIcon, 
  X, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface FileUpload {
  id: string;
  file: File;
  status: 'queued' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: {
    confidence: number;
    classification: 'authentic' | 'deepfake' | 'suspicious';
    processingTime: number;
  };
}

const Upload = () => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const supportedTypes = [
    { type: 'image', extensions: ['JPG', 'PNG'], icon: FileImage, color: 'text-primary' },
    { type: 'video', extensions: ['MP4', 'MOV'], icon: FileVideo, color: 'text-secondary' },
    { type: 'audio', extensions: ['MP3', 'WAV'], icon: FileAudio, color: 'text-accent' }
  ];

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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/wav'].includes(file.type);
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB
      return isValidType && isValidSize;
    });

    const fileUploads: FileUpload[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'queued',
      progress: 0
    }));

    setFiles(prev => [...prev, ...fileUploads]);
    
    // Simulate upload and processing
    fileUploads.forEach(upload => {
      simulateProcessing(upload.id);
    });
  };

  const simulateProcessing = async (fileId: string) => {
    // Uploading phase
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'uploading' as const } : f
    ));

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress: i } : f
      ));
    }

    // Processing phase
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'processing' as const, progress: 0 } : f
    ));

    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress: i } : f
      ));
    }

    // Completed
    const mockResult = {
      confidence: Math.random() * 40 + 60, // 60-100%
      classification: ['authentic', 'deepfake', 'suspicious'][Math.floor(Math.random() * 3)] as 'authentic' | 'deepfake' | 'suspicious',
      processingTime: Math.random() * 10 + 5 // 5-15 seconds
    };

    setFiles(prev => prev.map(f => 
      f.id === fileId ? { 
        ...f, 
        status: 'completed' as const, 
        progress: 100,
        result: mockResult
      } : f
    ));
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return FileImage;
    if (file.type.startsWith('video/')) return FileVideo;
    if (file.type.startsWith('audio/')) return FileAudio;
    return FileImage;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued': return Clock;
      case 'uploading': 
      case 'processing': return Loader2;
      case 'completed': return CheckCircle;
      case 'failed': return AlertCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'failed': return 'text-destructive';
      case 'processing': 
      case 'uploading': return 'text-accent';
      default: return 'text-muted-foreground';
    }
  };

  const getResultBadge = (classification: string) => {
    switch (classification) {
      case 'authentic': 
        return <Badge variant="outline" className="text-success border-success/30">Authentic</Badge>;
      case 'deepfake': 
        return <Badge variant="outline" className="text-destructive border-destructive/30">Deepfake</Badge>;
      case 'suspicious': 
        return <Badge variant="outline" className="text-warning border-warning/30">Suspicious</Badge>;
      default: 
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-20 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Upload Media Files</h1>
          <p className="text-muted-foreground">Analyze your images, videos, and audio for deepfake detection</p>
        </div>

        {/* Upload Zone */}
        <Card className="glass border-white/10">
          <CardContent className="p-8">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-accent bg-accent/5 scale-105' 
                  : 'border-white/20 hover:border-accent/50 hover:bg-accent/5'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-6">
                <div className="mx-auto w-16 h-16 rounded-xl gradient-primary flex items-center justify-center">
                  <UploadIcon className="h-8 w-8 text-white" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Drop your files here or click to browse
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Support for JPG, PNG, MP4, MOV, MP3, WAV files up to 100MB
                  </p>
                  
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.mp4,.mov,.mp3,.wav"
                    onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button asChild className="gradient-primary cursor-pointer">
                      <span>
                        <UploadIcon className="h-4 w-4 mr-2" />
                        Choose Files
                      </span>
                    </Button>
                  </label>
                </div>

                {/* Supported formats */}
                <div className="flex flex-wrap justify-center gap-4 pt-6 border-t border-white/10">
                  {supportedTypes.map((type, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-2 glass rounded-lg">
                      <type.icon className={`h-4 w-4 ${type.color}`} />
                      <span className="text-sm font-medium capitalize">{type.type}</span>
                      <span className="text-xs text-muted-foreground">
                        {type.extensions.join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Queue */}
        {files.length > 0 && (
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Processing Queue ({files.length})</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFiles([])}
                  className="border-white/20"
                >
                  Clear All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {files.map((fileUpload) => {
                const Icon = getFileIcon(fileUpload.file);
                const StatusIcon = getStatusIcon(fileUpload.status);
                
                return (
                  <div key={fileUpload.id} className="flex items-center gap-4 p-4 glass rounded-lg border border-white/5 animate-slide-up">
                    <div className="p-2 rounded-lg bg-muted/20">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium truncate">{fileUpload.file.name}</p>
                        <div className="flex items-center gap-2">
                          {fileUpload.result && getResultBadge(fileUpload.result.classification)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(fileUpload.id)}
                            className="h-8 w-8 p-0 hover:bg-destructive/20"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{(fileUpload.file.size / (1024 * 1024)).toFixed(1)} MB</span>
                        <div className="flex items-center gap-1">
                          <StatusIcon className={`h-4 w-4 ${getStatusColor(fileUpload.status)} ${
                            fileUpload.status === 'uploading' || fileUpload.status === 'processing' ? 'animate-spin' : ''
                          }`} />
                          <span className="capitalize">{fileUpload.status}</span>
                        </div>
                        {fileUpload.result && (
                          <span className="font-medium">
                            {fileUpload.result.confidence.toFixed(1)}% confidence
                          </span>
                        )}
                      </div>
                      
                      {(fileUpload.status === 'uploading' || fileUpload.status === 'processing') && (
                        <div className="mt-2">
                          <Progress value={fileUpload.progress} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            {fileUpload.status === 'uploading' ? 'Uploading...' : 'Processing...'} {fileUpload.progress}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Upload;