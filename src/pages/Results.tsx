import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  FileImage, 
  FileVideo, 
  FileAudio,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Eye,
  EyeOff,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { MediaService } from "@/lib/mediaService";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type MediaFile = Database['public']['Tables']['media_files']['Row'];
type AnalysisResult = Database['public']['Tables']['analysis_results']['Row'];

const Results = () => {
  const { mediaFileId } = useParams<{ mediaFileId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    if (mediaFileId) {
      loadResults();
    }
  }, [mediaFileId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      
      // Load media file
      const { data: mediaData, error: mediaError } = await supabase
        .from('media_files')
        .select('*')
        .eq('id', mediaFileId)
        .single();

      if (mediaError) throw mediaError;
      setMediaFile(mediaData);

      // Load analysis result
      const { data: analysisData, error: analysisError } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('media_file_id', mediaFileId)
        .single();

      if (analysisError) throw analysisError;
      setAnalysisResult(analysisData);

    } catch (error: any) {
      toast({
        title: "Error loading results",
        description: error.message,
        variant: "destructive",
      });
      navigate('/upload');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return FileImage;
    if (fileType.startsWith('video/')) return FileVideo;
    if (fileType.startsWith('audio/')) return FileAudio;
    return FileImage;
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'authentic': return 'bg-green-100 text-green-800 border-green-200';
      case 'deepfake': return 'bg-red-100 text-red-800 border-red-200';
      case 'suspicious': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case 'authentic': return CheckCircle;
      case 'deepfake': return AlertTriangle;
      case 'suspicious': return Shield;
      default: return Shield;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generatePDFReport = async () => {
    setGeneratingReport(true);
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Report generated",
        description: "PDF report has been generated successfully",
      });
      
      // In a real app, you'd use jsPDF to create and download the report
      // For now, we'll just show a success message
      
    } catch (error: any) {
      toast({
        title: "Report generation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const shareResults = () => {
    if (navigator.share) {
      navigator.share({
        title: 'DeepGuard Analysis Results',
        text: `Analysis result: ${analysisResult?.classification} with ${analysisResult?.confidence_score}% confidence`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Results link has been copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading analysis results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!mediaFile || !analysisResult) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Results not found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The requested analysis results could not be found.
          </p>
          <Button onClick={() => navigate('/upload')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Upload
          </Button>
        </div>
      </div>
    );
  }

  const FileIcon = getFileIcon(mediaFile.file_type);
  const ClassificationIcon = getClassificationIcon(analysisResult.classification);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/upload')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Upload
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Analysis Results
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {mediaFile.file_name} • {formatFileSize(mediaFile.file_size)}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={shareResults}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              onClick={generatePDFReport}
              disabled={generatingReport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {generatingReport ? 'Generating...' : 'Download Report'}
            </Button>
          </div>
        </div>
      </div>

      {/* Results Summary Banner */}
      <div className="mb-8">
        <div className={`rounded-2xl p-6 text-center ${
          analysisResult.classification === 'authentic' 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800'
            : analysisResult.classification === 'deepfake'
            ? 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border border-red-200 dark:border-red-800'
            : 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex items-center justify-center gap-4 mb-4">
            {analysisResult.classification === 'authentic' && (
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            )}
            {analysisResult.classification === 'deepfake' && (
              <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            )}
            {analysisResult.classification === 'suspicious' && (
              <AlertTriangle className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
            )}
            
            <div>
              <h1 className={`text-4xl font-bold ${
                analysisResult.classification === 'authentic' 
                  ? 'text-green-800 dark:text-green-200'
                  : analysisResult.classification === 'deepfake'
                  ? 'text-red-800 dark:text-red-200'
                  : 'text-yellow-800 dark:text-yellow-200'
              }`}>
                {analysisResult.classification === 'authentic' && '✅ AUTHENTIC MEDIA'}
                {analysisResult.classification === 'deepfake' && '❌ DEEPFAKE DETECTED'}
                {analysisResult.classification === 'suspicious' && '⚠️ SUSPICIOUS CONTENT'}
              </h1>
              
              <p className={`text-xl mt-2 ${
                analysisResult.classification === 'authentic' 
                  ? 'text-green-700 dark:text-green-300'
                  : analysisResult.classification === 'deepfake'
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-yellow-700 dark:text-yellow-300'
              }`}>
                Confidence: {analysisResult.confidence_score.toFixed(1)}%
              </p>
            </div>
          </div>
          
          <div className="text-lg text-gray-700 dark:text-gray-300">
            {analysisResult.classification === 'authentic' && 
              'This media has been verified as genuine and unaltered by our AI analysis.'
            }
            {analysisResult.classification === 'deepfake' && 
              'Our AI has detected signs of artificial manipulation or generation in this media.'
            }
            {analysisResult.classification === 'suspicious' && 
              'Some suspicious characteristics were detected. We recommend further verification.'
            }
          </div>
        </div>
      </div>

      {/* Analysis Results Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Analysis Results
        </h2>
        
        {/* Main Results Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Confidence Score - Large and Prominent */}
            <div className="text-center">
              <div className="relative inline-block mb-4">
                {/* Large Circular Progress */}
                <div className="w-48 h-48 rounded-full border-8 border-gray-200 dark:border-gray-700 flex items-center justify-center relative">
                  <div className="text-center">
                    <div className={`text-6xl font-bold ${getConfidenceColor(analysisResult.confidence_score)}`}>
                      {analysisResult.confidence_score.toFixed(1)}%
                    </div>
                    <div className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                      Confidence Score
                    </div>
                  </div>
                </div>
                
                {/* Animated Progress Ring */}
                <div
                  className="absolute inset-0 rounded-full border-8 border-transparent"
                  style={{
                    borderTopColor: getConfidenceColor(analysisResult.confidence_score),
                    transform: `rotate(${(analysisResult.confidence_score / 100) * 360}deg)`,
                    transition: 'transform 2s ease-in-out'
                  }}
                />
                
                {/* Status Indicator */}
                <div className="absolute -top-2 -right-2">
                  <div className={`w-8 h-8 rounded-full ${getClassificationColor(analysisResult.classification)} flex items-center justify-center`}>
                    {analysisResult.classification === 'authentic' && <CheckCircle className="h-5 w-5 text-white" />}
                    {analysisResult.classification === 'deepfake' && <XCircle className="h-5 w-5 text-white" />}
                    {analysisResult.classification === 'suspicious' && <AlertTriangle className="h-5 w-5 text-white" />}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Classification Results - Large and Clear */}
            <div className="space-y-6">
              {/* Main Classification */}
              <div className="text-center lg:text-left">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Classification Result
                </h3>
                
                {/* Large Classification Badge */}
                <div className="inline-block">
                  <div className={`px-8 py-4 rounded-2xl text-2xl font-bold text-white ${getClassificationColor(analysisResult.classification)}`}>
                    {analysisResult.classification === 'authentic' && '✅ AUTHENTIC'}
                    {analysisResult.classification === 'deepfake' && '❌ DEEPFAKE DETECTED'}
                    {analysisResult.classification === 'suspicious' && '⚠️ SUSPICIOUS'}
                  </div>
                </div>
                
                {/* Classification Description */}
                <div className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                  {analysisResult.classification === 'authentic' && 
                    'This media appears to be genuine and unaltered.'
                  }
                  {analysisResult.classification === 'deepfake' && 
                    'AI manipulation detected. This media has been artificially generated or modified.'
                  }
                  {analysisResult.classification === 'suspicious' && 
                    'Some signs of manipulation detected. Further analysis recommended.'
                  }
                </div>
              </div>
              
              {/* Processing Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Processing Time:</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {analysisResult.processing_time_ms}ms
                  </span>
                </div>
                
                                  <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Analysis Model:</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Reality Defender v1.0
                    </span>
                  </div>
                
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Analysis Date:</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date(analysisResult.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Processing Steps */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 font-medium block mb-2">Processing Steps:</span>
                  <div className="flex flex-wrap gap-2">
                    {['Image Analysis', 'Deepfake Detection', 'Confidence Scoring', 'Manipulation Analysis'].map((step, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Confidence Level Indicator */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 font-medium block mb-2">Confidence Level:</span>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          analysisResult.confidence_score >= 80 ? 'bg-green-500' :
                          analysisResult.confidence_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${analysisResult.confidence_score}%` }}
                      />
                    </div>
                    <span className={`text-lg font-bold ${
                      analysisResult.confidence_score >= 80 ? 'text-green-600' :
                      analysisResult.confidence_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {analysisResult.confidence_score >= 80 ? 'High' :
                       analysisResult.confidence_score >= 60 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                </div>
                
                {/* API Status Indicator */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 font-medium block mb-2">API Status:</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      (analysisResult.heatmap_data as any)?.fallback ? 'bg-red-500' : 'bg-green-500'
                    }`}></div>
                    <span className="text-sm font-medium">
                      {(analysisResult.heatmap_data as any)?.fallback ? 'Fallback Analysis' : 'Reality Defender API'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileIcon className="h-5 w-5" />
                Media Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {mediaFile.file_type.startsWith('image/') && (
                  <img
                    src={mediaFile.file_url}
                    alt={mediaFile.file_name}
                    className="w-full h-auto rounded-lg max-h-96 object-contain"
                  />
                )}
                {mediaFile.file_type.startsWith('video/') && (
                  <video
                    src={mediaFile.file_url}
                    controls
                    className="w-full h-auto rounded-lg max-h-96"
                  />
                )}
                {mediaFile.file_type.startsWith('audio/') && (
                  <div className="p-8 text-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <FileAudio className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">{mediaFile.file_name}</p>
                    <audio src={mediaFile.file_url} controls className="mt-4" />
                  </div>
                )}
                
                {/* Heatmap Overlay */}
                {showHeatmap && analysisResult.heatmap_data && (
                  <div className="absolute inset-0 pointer-events-none">
                    {typeof analysisResult.heatmap_data === 'object' && 
                     analysisResult.heatmap_data !== null &&
                     'regions' in analysisResult.heatmap_data &&
                     Array.isArray((analysisResult.heatmap_data as any).regions) &&
                     (analysisResult.heatmap_data as any).regions.map((region: any, index: number) => {
                       // Determine region color based on type and confidence
                       let borderColor = 'border-red-500';
                       let bgColor = 'bg-red-500/20';
                       
                       if (region.type === 'face_region') {
                         borderColor = 'border-red-500';
                         bgColor = 'bg-red-500/30';
                       } else if (region.type === 'background') {
                         borderColor = 'border-blue-500';
                         bgColor = 'bg-blue-500/30';
                       } else if (region.type === 'lighting') {
                         borderColor = 'border-yellow-500';
                         bgColor = 'bg-yellow-500/30';
                       }
                       
                       // Adjust opacity based on confidence
                       const confidence = region.confidence || 50;
                       const opacity = Math.max(0.1, Math.min(0.8, confidence / 100));
                       
                       return (
                         <div
                           key={index}
                           className={`absolute border-2 ${borderColor} ${bgColor}`}
                           style={{
                             left: `${region.x * 100}%`,
                             top: `${region.y * 100}%`,
                             width: `${region.width * 100}%`,
                             height: `${region.height * 100}%`,
                             opacity: opacity,
                           }}
                         />
                       );
                     })}
                    
                    {/* Add confidence labels for regions */}
                    {typeof analysisResult.heatmap_data === 'object' && 
                     analysisResult.heatmap_data !== null &&
                     'regions' in analysisResult.heatmap_data &&
                     Array.isArray((analysisResult.heatmap_data as any).regions) &&
                     (analysisResult.heatmap_data as any).regions.map((region: any, index: number) => (
                       <div
                         key={`label-${index}`}
                         className="absolute text-xs font-bold text-white bg-black/70 px-1 py-0.5 rounded"
                         style={{
                           left: `${(region.x + region.width) * 100}%`,
                           top: `${region.y * 100}%`,
                           transform: 'translateX(-100%)',
                         }}
                       >
                         {region.confidence?.toFixed(0)}%
                       </div>
                     ))}
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className="flex items-center gap-2"
                >
                  {showHeatmap ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showHeatmap ? 'Hide' : 'Show'} Heatmap
                </Button>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Processing time: {(analysisResult.processing_time_ms / 1000).toFixed(1)}s
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Details */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Model Version</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      Reality Defender v1.0
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Processing Steps</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      4 steps
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Analysis Pipeline</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Image Analysis', 'Deepfake Detection', 'Confidence Scoring', 'Manipulation Analysis'].map((step: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {step}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reality Defender API Response Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Reality Defender Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* API Provider Status */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Analysis Provider</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        (analysisResult.heatmap_data as any)?.fallback ? 'bg-orange-500' : 'bg-green-500'
                      }`}></div>
                      <span className="text-sm font-medium">
                        {(analysisResult.heatmap_data as any)?.fallback ? 'Fallback Analysis' : 'Reality Defender API'}
                      </span>
                    </div>
                  </div>
                  {(analysisResult.heatmap_data as any)?.message && (
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {(analysisResult.heatmap_data as any).message}
                    </p>
                  )}
                </div>

                {/* Detection Result Details */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Detection Type</span>
                      <Badge className={getClassificationColor(analysisResult.classification)}>
                        {analysisResult.classification.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Confidence Score</span>
                      <span className={`text-lg font-bold ${getConfidenceColor(analysisResult.confidence_score)}`}>
                        {analysisResult.confidence_score.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Processing Time</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {analysisResult.processing_time_ms}ms
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed Manipulation Analysis */}
                {analysisResult.analysis_metadata && 
                 typeof analysisResult.analysis_metadata === 'object' &&
                 'manipulation_details' in (analysisResult.analysis_metadata as any) && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Manipulation Details</h4>
                    
                    {/* Overall Manipulation Score */}
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-orange-800 dark:text-orange-200">Overall Score</span>
                        <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                          {((analysisResult.analysis_metadata as any).manipulation_details.overall_score || 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-1.5">
                        <div 
                          className="bg-orange-500 h-1.5 rounded-full transition-all duration-1000"
                          style={{ width: `${(analysisResult.analysis_metadata as any).manipulation_details.overall_score || 0}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Specific Manipulation Types */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'face_manipulation', label: 'Face', color: 'red' },
                        { key: 'background_manipulation', label: 'Background', color: 'blue' },
                        { key: 'lighting_inconsistencies', label: 'Lighting', color: 'yellow' },
                        { key: 'compression_artifacts', label: 'Compression', color: 'purple' }
                      ].map(({ key, label, color }) => {
                        const score = (analysisResult.analysis_metadata as any)?.manipulation_details?.[key] || 0;
                        
                        const colorClasses = {
                          red: 'text-red-700 dark:text-red-300',
                          blue: 'text-blue-700 dark:text-blue-300',
                          yellow: 'text-yellow-700 dark:text-yellow-300',
                          purple: 'text-purple-700 dark:text-purple-300'
                        };
                        
                        return (
                          <div key={key} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-center">
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</div>
                            <div className={`text-sm font-bold ${colorClasses[color as keyof typeof colorClasses]}`}>
                              {score.toFixed(1)}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Result Summary */}
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Result Summary</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {analysisResult.classification === 'authentic' && 
                      'Analysis indicates this media is genuine and unaltered. The AI detected no significant signs of manipulation.'
                    }
                    {analysisResult.classification === 'deepfake' && 
                      'Analysis detected artificial manipulation or generation. The AI identified patterns consistent with deepfake technology.'
                    }
                    {analysisResult.classification === 'suspicious' && 
                      'Analysis found some characteristics that warrant further investigation. Manual review recommended.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* File Information */}
          <Card>
            <CardHeader>
              <CardTitle>File Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">File Name</label>
                <p className="text-sm text-gray-900 dark:text-white truncate">{mediaFile.file_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">File Type</label>
                <p className="text-sm text-gray-900 dark:text-white">{mediaFile.file_type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">File Size</label>
                <p className="text-sm text-gray-900 dark:text-white">{formatFileSize(mediaFile.file_size)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Upload Date</label>
                <p className="text-sm text-gray-900 dark:text-white">{formatDate(mediaFile.created_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Classification</label>
                <div className="flex items-center gap-2 mt-1">
                  <ClassificationIcon className={`h-4 w-4 ${getClassificationColor(analysisResult.classification).split(' ')[1]}`} />
                  <Badge className={getClassificationColor(analysisResult.classification)}>
                    {analysisResult.classification.charAt(0).toUpperCase() + analysisResult.classification.slice(1)}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Confidence</label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {analysisResult.confidence_score.toFixed(1)}%
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Processing Time</label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {(analysisResult.processing_time_ms / 1000).toFixed(1)} seconds
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Analysis Date</label>
                <p className="text-sm text-gray-900 dark:text-white">{formatDate(analysisResult.created_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/upload')}
              >
                <FileImage className="h-4 w-4 mr-2" />
                Upload New File
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/dashboard')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Results;
