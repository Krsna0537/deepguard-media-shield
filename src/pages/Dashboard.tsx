import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Upload, 
  Shield, 
  Clock, 
  FileImage, 
  FileVideo, 
  FileAudio,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { MediaService } from "@/lib/mediaService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type MediaFile = Database['public']['Tables']['media_files']['Row'];
type AnalysisResult = Database['public']['Tables']['analysis_results']['Row'];

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [stats, setStats] = useState({
    totalFiles: 0,
    completedFiles: 0,
    deepfakes: 0,
    avgProcessingTime: 0,
    avgConfidence: 0,
    accuracyRate: 0
  });
  const [recentFiles, setRecentFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    confidenceDistribution: [],
    resultsOverTime: [],
    fileTypeBreakdown: []
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user stats
      const userStats = await MediaService.getUserStats();
      setStats(userStats);
      
      // Load recent files
      const files = await MediaService.getUserFiles();
      setRecentFiles(files.slice(0, 10)); // Show last 10 files
      
      // Load analysis results for charts
      const { data: results, error } = await supabase
        .from('analysis_results')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process chart data
      processChartData(results || []);
      
    } catch (error: any) {
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (results: AnalysisResult[]) => {
    // Confidence distribution (histogram)
    const confidenceRanges = [
      { range: '0-20%', min: 0, max: 20, count: 0 },
      { range: '21-40%', min: 21, max: 40, count: 0 },
      { range: '41-60%', min: 41, max: 60, count: 0 },
      { range: '61-80%', min: 61, max: 80, count: 0 },
      { range: '81-100%', min: 81, max: 100, count: 0 }
    ];
    
    results.forEach(result => {
      const range = confidenceRanges.find(r => 
        result.confidence_score >= r.min && result.confidence_score <= r.max
      );
      if (range) range.count++;
    });
    
    // Results over time (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    const resultsByDate = last7Days.map(date => {
      const dayResults = results.filter(result => 
        result.created_at.startsWith(date)
      );
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        authentic: dayResults.filter(r => r.classification === 'authentic').length,
        deepfake: dayResults.filter(r => r.classification === 'deepfake').length,
        suspicious: dayResults.filter(r => r.classification === 'suspicious').length
      };
    });
    
    // File type breakdown
    const fileTypes = recentFiles.reduce((acc, file) => {
      const type = file.file_type.split('/')[0];
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const fileTypeData = Object.entries(fileTypes).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count
    }));
    
    setChartData({
      confidenceDistribution: confidenceRanges,
      resultsOverTime: resultsByDate,
      fileTypeBreakdown: fileTypeData
    });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image": return FileImage;
      case "video": return FileVideo;
      case "audio": return FileAudio;
      default: return FileImage;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "processing": return "text-blue-600";
      case "failed": return "text-red-600";
      case "uploading": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "processing": return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case "failed": return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case "uploading": return <Badge className="bg-yellow-100 text-yellow-800">Uploading</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const exportData = async () => {
    try {
      const files = await MediaService.getUserFiles();
      const csvContent = [
        ['File Name', 'File Type', 'File Size', 'Status', 'Upload Date'].join(','),
        ...files.map(file => [
          file.file_name,
          file.file_type,
          formatFileSize(file.file_size),
          file.status,
          new Date(file.created_at).toLocaleDateString()
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deepguard-files-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Data exported",
        description: "Your data has been exported successfully",
      });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
  return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
          </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Overview of your media analysis activities
                    </p>
                  </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={loadDashboardData}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={exportData}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
                  </div>
                </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files Analyzed</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFiles}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedFiles} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deepfakes Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.deepfakes}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalFiles > 0 ? ((stats.deepfakes / stats.totalFiles) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.accuracyRate}%</div>
            <p className="text-xs text-muted-foreground">
              Based on completed analyses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.avgProcessingTime / 1000).toFixed(1)}s</div>
            <p className="text-xs text-muted-foreground">
              Per file analysis
            </p>
              </CardContent>
            </Card>
        </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Confidence Distribution */}
        <Card>
            <CardHeader>
            <CardTitle>Confidence Distribution</CardTitle>
            </CardHeader>
            <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.confidenceDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
            </CardContent>
          </Card>

        {/* Results Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Results Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.resultsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="authentic" stroke="#16a34a" strokeWidth={2} />
                <Line type="monotone" dataKey="deepfake" stroke="#dc2626" strokeWidth={2} />
                <Line type="monotone" dataKey="suspicious" stroke="#ca8a04" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

          {/* File Type Breakdown */}
      <Card className="mb-8">
            <CardHeader>
          <CardTitle>File Type Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.fileTypeBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.fileTypeBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="flex flex-col justify-center space-y-4">
              {chartData.fileTypeBreakdown.map((type, index) => (
                <div key={type.name} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">{type.name}</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {type.value} files
                  </span>
                  </div>
                ))}
            </div>
              </div>
            </CardContent>
          </Card>

        {/* Recent Files */}
      <Card>
          <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Files</span>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
            {recentFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No files uploaded yet</p>
                <p className="text-sm">Start by uploading your first media file</p>
              </div>
            ) : (
              recentFiles.map((file) => {
                const FileIcon = getFileIcon(file.file_type.split('/')[0]);
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex-shrink-0">
                      <FileIcon className="h-8 w-8 text-blue-500" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {file.file_name}
                        </p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(file.status)}
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.file_size)}
                          </span>
                    </div>
                  </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{file.file_type}</span>
                        <span>{formatDate(file.created_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            </div>
          </CardContent>
        </Card>
    </div>
  );
};

export default Dashboard;