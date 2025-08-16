import { useState } from "react";
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
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState("7d");

  const stats = [
    {
      title: "Total Files Analyzed",
      value: "1,247",
      change: "+12%",
      icon: BarChart3,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Deepfakes Detected",
      value: "89",
      change: "+3%",
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      title: "Accuracy Rate",
      value: "99.2%",
      change: "+0.1%",
      icon: Shield,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Avg. Processing Time",
      value: "8.3s",
      change: "-2.1s",
      icon: Clock,
      color: "text-accent",
      bgColor: "bg-accent/10"
    }
  ];

  const recentFiles = [
    {
      name: "interview_video.mp4",
      type: "video",
      status: "authentic",
      confidence: 98.7,
      timestamp: "2 minutes ago",
      size: "45.2 MB"
    },
    {
      name: "profile_image.jpg", 
      type: "image",
      status: "deepfake",
      confidence: 94.3,
      timestamp: "5 minutes ago",
      size: "2.1 MB"
    },
    {
      name: "audio_statement.wav",
      type: "audio", 
      status: "authentic",
      confidence: 96.1,
      timestamp: "12 minutes ago",
      size: "8.7 MB"
    },
    {
      name: "news_footage.mov",
      type: "video",
      status: "suspicious",
      confidence: 73.2,
      timestamp: "1 hour ago",
      size: "78.4 MB"
    }
  ];

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
      case "authentic": return "text-success";
      case "deepfake": return "text-destructive";
      case "suspicious": return "text-warning";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "authentic": return <Badge variant="outline" className="text-success border-success/30">Authentic</Badge>;
      case "deepfake": return <Badge variant="outline" className="text-destructive border-destructive/30">Deepfake</Badge>;
      case "suspicious": return <Badge variant="outline" className="text-warning border-warning/30">Suspicious</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen pt-20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Monitor your media authentication activity</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="glass border-white/20">
              <BarChart3 className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button className="gradient-primary">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="glass border-white/10 hover:glass-strong transition-all duration-300 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-success' : 'text-accent'}`}>
                      {stat.change} from last week
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Confidence Distribution */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Confidence Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { range: "90-100%", count: 856, color: "bg-success" },
                  { range: "80-89%", count: 234, color: "bg-primary" },
                  { range: "70-79%", count: 98, color: "bg-warning" },
                  { range: "60-69%", count: 45, color: "bg-destructive" },
                  { range: "0-59%", count: 14, color: "bg-muted" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-16 text-sm text-muted-foreground">{item.range}</div>
                    <div className="flex-1 h-6 bg-muted/20 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                        style={{ 
                          width: `${(item.count / 856) * 100}%`,
                          animationDelay: `${index * 0.2}s`
                        }}
                      />
                    </div>
                    <div className="w-12 text-sm font-medium text-right">{item.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* File Type Breakdown */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-secondary" />
                File Type Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { type: "Images", count: 645, percentage: 52, icon: FileImage, color: "text-primary" },
                  { type: "Videos", count: 432, percentage: 35, icon: FileVideo, color: "text-secondary" },
                  { type: "Audio", count: 170, percentage: 13, icon: FileAudio, color: "text-accent" }
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                        <span className="text-sm font-medium">{item.type}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{item.count} files</div>
                    </div>
                    <div className="w-full h-2 bg-muted/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${item.percentage}%`,
                          animationDelay: `${index * 0.3}s`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Files */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Recent Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 glass rounded-lg border border-white/5 hover:border-white/20 transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted/20">
                      {(() => {
                        const Icon = getFileIcon(file.type);
                        return <Icon className="h-5 w-5 text-muted-foreground" />;
                      })()}
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{file.size} • {file.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{file.confidence}% confidence</p>
                      <div className="w-20 h-1 bg-muted/20 rounded-full mt-1">
                        <div 
                          className={`h-full rounded-full ${
                            file.confidence > 90 ? 'bg-success' : 
                            file.confidence > 75 ? 'bg-warning' : 'bg-destructive'
                          }`}
                          style={{ width: `${file.confidence}%` }}
                        />
                      </div>
                    </div>
                    {getStatusBadge(file.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;