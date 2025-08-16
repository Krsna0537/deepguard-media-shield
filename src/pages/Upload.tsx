import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Upload as UploadIcon, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  X, 
  Play, 
  Eye, 
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { MediaService, UploadProgress } from "@/lib/mediaService";
import { API_CONFIG } from "@/config/api";

interface FileUpload {
  id: string;
  file: File;
  status: 'queued' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  mediaFileId?: string;
  result?: {
    confidence: number;
    classification: 'authentic' | 'deepfake' | 'suspicious';
    processingTime: number;
  };
  error?: string;
}

const Upload = () => {
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'available' | 'unavailable' | 'no-key'>('checking');
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkAPIStatus();
  }, []);

  const checkAPIStatus = () => {
    const apiKey = API_CONFIG.REALITY_DEFENDER.API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_REALITY_DEFENDER_API_KEY_HERE') {
      setApiStatus('no-key');
    } else {
      // Test API connectivity
      setApiStatus('checking');
      testAPIConnectivity();
    }
  };

  const testAPIConnectivity = async () => {
    try {
      // Simple connectivity test
      const response = await fetch(API_CONFIG.REALITY_DEFENDER.API_URL, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${API_CONFIG.REALITY_DEFENDER.API_KEY}`,
        }
      });
      
      if (response.ok) {
        setApiStatus('available');
      } else {
        setApiStatus('unavailable');
      }
    } catch (error) {
      setApiStatus('unavailable');
    }
  };

  const getAPIStatusDisplay = () => {
    switch (apiStatus) {
      case 'checking':
        return (
          <div className="flex items-center gap-2 text-yellow-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Checking API...</span>
          </div>
        );
      case 'available':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Reality Defender API Available</span>
          </div>
        );
      case 'unavailable':
        return (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-4 w-4" />
            <span className="text-sm">API Unavailable - Using Fallback</span>
          </div>
        );
      case 'no-key':
        return (
          <div className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">No API Key - Using Fallback</span>
          </div>
        );
      default:
        return null;
    }
  };

  const supportedTypes = [
    { type: 'image', extensions: ['JPG', 'PNG'], icon: FileImage, color: 'text-blue-500' },
    { type: 'video', extensions: ['MP4', 'MOV'], icon: FileVideo, color: 'text-green-500' },
    { type: 'audio', extensions: ['MP3', 'WAV'], icon: FileAudio, color: 'text-purple-500' }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const validation = MediaService.validateFile(file);
      if (!validation.isValid) {
        toast({
          title: "Invalid file",
          description: validation.error,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    const fileUploads: FileUpload[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'queued',
      progress: 0
    }));

    setFileUploads(prev => [...prev, ...fileUploads]);
    
    toast({
      title: "Files added",
      description: `${validFiles.length} file(s) added to upload queue`,
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const processFile = async (fileUpload: FileUpload) => {
    try {
      // Upload file
      const mediaFile = await MediaService.uploadFile(
        fileUpload.file,
        (progress: UploadProgress) => {
          setFileUploads(prev => prev.map(f => 
            f.id === fileUpload.id ? { 
              ...f, 
              progress: progress.progress,
              status: progress.status,
              mediaFileId: progress.fileId
            } : f
          ));
        }
      );

      // Start analysis
      setFileUploads(prev => prev.map(f => 
        f.id === fileUpload.id ? { ...f, status: 'processing' as const } : f
      ));

      const analysisResult = await MediaService.analyzeFile(mediaFile.id);

      // Update with results
      setFileUploads(prev => prev.map(f => 
        f.id === fileUpload.id ? { 
          ...f, 
          status: 'completed' as const,
          result: {
            confidence: analysisResult.confidence_score,
            classification: analysisResult.classification as 'authentic' | 'deepfake' | 'suspicious',
            processingTime: analysisResult.processing_time_ms
          }
        } : f
      ));

      toast({
        title: "Analysis complete",
        description: `${fileUpload.file.name} analyzed with ${analysisResult.confidence_score.toFixed(1)}% confidence`,
      });

    } catch (error: any) {
      setFileUploads(prev => prev.map(f => 
        f.id === fileUpload.id ? { 
          ...f, 
          status: 'failed' as const,
          error: error.message 
        } : f
      ));

      toast({
        title: "Processing failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startProcessing = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const queuedFiles = fileUploads.filter(f => f.status === 'queued');
    
    for (const fileUpload of queuedFiles) {
      await processFile(fileUpload);
    }
    
    setUploading(false);
  };

  const removeFile = (fileId: string) => {
    setFileUploads(prev => prev.filter(f => f.id !== fileId));
  };

  const viewResults = (fileUpload: FileUpload) => {
    if (fileUpload.mediaFileId) {
      navigate(`/results/${fileUpload.mediaFileId}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'processing': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      case 'uploading': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'processing': return Loader2;
      case 'failed': return AlertTriangle;
      case 'uploading': return Info;
      default: return Info;
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'authentic': return 'bg-green-100 text-green-800';
      case 'deepfake': return 'bg-red-100 text-red-800';
      case 'suspicious': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const queuedFiles = fileUploads.filter(f => f.status === 'queued');
  const processingFiles = fileUploads.filter(f => ['uploading', 'processing'].includes(f.status));
  const completedFiles = fileUploads.filter(f => f.status === 'completed');
  const failedFiles = fileUploads.filter(f => f.status === 'failed');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Upload Media Files
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Upload images, videos, or audio files for AI-powered deepfake detection analysis.
        </p>
        
        {/* API Status Display */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg inline-block">
          {getAPIStatusDisplay()}
        </div>
      </div>

      {/* Upload Area */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadIcon className="h-5 w-5" />
            Upload Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Drag and drop files here
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              or click to browse files
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              {supportedTypes.map((type) => (
                <div key={type.type} className="flex items-center gap-2 text-sm">
                  <type.icon className={`h-4 w-4 ${type.color}`} />
                  <span className="text-gray-600 dark:text-gray-400">
                    {type.extensions.join(', ')}
                  </span>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Maximum file size: 100MB
            </p>
            
            <Button
              onClick={() => document.getElementById('file-input')?.click()}
              disabled={uploading}
            >
              Choose Files
            </Button>
            <input
              id="file-input"
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.mp4,.mov,.mp3,.wav"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {fileUploads.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  {fileUploads.length} file(s) in queue
                </h3>
                <Button
                  onClick={startProcessing}
                  disabled={uploading || queuedFiles.length === 0}
                  className="flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start Processing
                    </>
                  )}
                </Button>
              </div>

              {/* File List */}
              <div className="space-y-3">
                {fileUploads.map((fileUpload) => (
                  <div
                    key={fileUpload.id}
                    className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex-shrink-0">
                      {fileUpload.file.type.startsWith('image/') && <FileImage className="h-8 w-8 text-blue-500" />}
                      {fileUpload.file.type.startsWith('video/') && <FileVideo className="h-8 w-8 text-green-500" />}
                      {fileUpload.file.type.startsWith('audio/') && <FileAudio className="h-8 w-8 text-purple-500" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {fileUpload.file.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(fileUpload.file.size)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(fileUpload.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <Progress value={fileUpload.progress} className="h-2" />
                      
                      <div className="flex items-center justify-between mt-2">
                                                 <div className="flex items-center gap-2">
                           {(() => {
                             const StatusIcon = getStatusIcon(fileUpload.status);
                             return <StatusIcon className={`h-4 w-4 ${getStatusColor(fileUpload.status)}`} />;
                           })()}
                           <span className={`text-sm ${getStatusColor(fileUpload.status)}`}>
                             {fileUpload.status.charAt(0).toUpperCase() + fileUpload.status.slice(1)}
                           </span>
                         </div>
                        
                        {fileUpload.status === 'completed' && fileUpload.result && (
                          <div className="flex items-center gap-2">
                            <Badge className={getClassificationColor(fileUpload.result.classification)}>
                              {fileUpload.result.classification}
                            </Badge>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {fileUpload.result.confidence.toFixed(1)}% confidence
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewResults(fileUpload)}
                              className="h-6 px-2"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        )}
                        
                        {fileUpload.status === 'failed' && fileUpload.error && (
                          <span className="text-sm text-red-600 dark:text-red-400">
                            {fileUpload.error}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {completedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{fileUploads.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedFiles.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{processingFiles.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{failedFiles.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Upload;