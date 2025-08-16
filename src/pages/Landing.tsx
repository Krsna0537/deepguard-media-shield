import { ArrowRight, Shield, Zap, Globe, CheckCircle, Upload, BarChart3, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartAnalyzing = () => {
    if (user) {
      navigate('/upload');
    } else {
      navigate('/auth');
    }
  };

  const handleViewDashboard = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/upload');
    } else {
      navigate('/auth');
    }
  };

  const handleScheduleDemo = () => {
    alert('Demo scheduling feature coming soon! Please contact us at demo@deepguard.com');
  };

  const features = [
    {
      icon: Shield,
      title: "AI-Powered Detection",
      description: "Advanced machine learning algorithms detect even the most sophisticated deepfakes with 99.2% accuracy.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process videos, images, and audio files in seconds, not minutes. Get results instantly.",
    },
    {
      icon: Globe,
      title: "Multi-Format Support",
      description: "Analyze JPG, PNG, MP4, MOV, MP3, WAV files up to 100MB with comprehensive metadata analysis.",
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "Bank-grade encryption ensures your sensitive media files remain private and secure.",
    },
  ];

  const useCases = [
    "Content Creators & Influencers",
    "Journalists & News Organizations", 
    "Security Professionals",
    "Legal & Forensic Teams",
    "Social Media Platforms",
    "Academic Researchers"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 glass border-accent/20">
            <Zap className="h-3 w-3 mr-1" />
            Powered by Advanced AI
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Authenticate
            </span>
            <br />
            <span className="text-foreground">Media with AI</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Detect deepfakes and verify media authenticity with cutting-edge AI technology. 
            Protect yourself from misinformation and ensure content integrity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="gradient-primary hover:shadow-lg hover:scale-105 transition-all duration-300" onClick={handleStartAnalyzing}>
              <Upload className="h-5 w-5 mr-2" />
              Start Analyzing
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="glass border-white/20 hover:glass-strong" onClick={handleViewDashboard}>
              <BarChart3 className="h-5 w-5 mr-2" />
              View Dashboard
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center animate-fade-in">
              <div className="text-3xl font-bold text-accent mb-2">99.2%</div>
              <div className="text-muted-foreground">Detection Accuracy</div>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="text-3xl font-bold text-primary mb-2">5M+</div>
              <div className="text-muted-foreground">Files Analyzed</div>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="text-3xl font-bold text-secondary mb-2">&lt;10s</div>
              <div className="text-muted-foreground">Average Processing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Why Choose <span className="text-primary">DeepGuard</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Industry-leading technology trusted by security professionals worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass border-white/10 hover:glass-strong transition-all duration-300 hover:scale-105 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-3 rounded-xl gradient-primary mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Trusted by Professionals</h2>
            <p className="text-xl text-muted-foreground">
              From content creators to security experts, DeepGuard protects what matters most
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((useCase, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 glass rounded-lg border border-white/10 hover:border-accent/30 transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                <span className="text-foreground">{useCase}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-strong rounded-2xl p-12 border border-white/20">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Secure Your Content?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of professionals protecting their media with AI-powered authentication
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gradient-primary hover:shadow-lg hover:scale-105 transition-all duration-300" onClick={handleGetStarted}>
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="border-white/20 hover:glass" onClick={handleScheduleDemo}>
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;