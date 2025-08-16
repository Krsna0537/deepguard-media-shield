import { useState } from "react";
import { 
  HelpCircle, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  Shield, 
  Upload,
  BarChart3,
  Settings,
  MessageCircle,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Help = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const faqData = [
    {
      question: "What file types does DeepGuard support?",
      answer: "DeepGuard supports JPG, PNG images, MP4, MOV videos, and MP3, WAV audio files. Maximum file size is 100MB per file."
    },
    {
      question: "How accurate is the deepfake detection?",
      answer: "Our AI model achieves 99.2% accuracy on average. Results include confidence scores and detailed analysis metadata to help you make informed decisions."
    },
    {
      question: "How long does analysis take?",
      answer: "Analysis typically takes 3-10 seconds depending on file size and complexity. Large video files may take longer due to frame-by-frame analysis."
    },
    {
      question: "Is my data secure and private?",
      answer: "Yes, all files are encrypted in transit and at rest. Files are automatically deleted after analysis unless you choose to save them. We never share your data with third parties."
    },
    {
      question: "Can I export my analysis results?",
      answer: "Yes, you can download detailed PDF reports for each analysis, including confidence scores, classification results, and processing metadata."
    },
    {
      question: "What happens if analysis fails?",
      answer: "If analysis fails, you'll receive detailed error messages. Common issues include unsupported file formats, corrupted files, or network issues. You can retry the upload."
    }
  ];

  const guides = [
    {
      title: "Getting Started",
      icon: Upload,
      description: "Learn how to upload and analyze your first media file",
      steps: [
        "Sign up for a DeepGuard account",
        "Navigate to the Upload page",
        "Drag and drop or select your media file",
        "Wait for analysis to complete",
        "Review your results and download reports"
      ]
    },
    {
      title: "Understanding Results",
      icon: BarChart3,
      description: "Learn how to interpret analysis results and confidence scores",
      steps: [
        "Check the confidence score (0-100%)",
        "Review the classification (Authentic, Suspicious, or Deepfake)",
        "Examine the heatmap overlay for visual analysis",
        "Download the detailed PDF report",
        "Use the confidence thresholds to make decisions"
      ]
    },
    {
      title: "Best Practices",
      icon: Shield,
      description: "Tips for getting the most accurate results",
      steps: [
        "Use high-quality, uncompressed files when possible",
        "Ensure good lighting and clear audio for media files",
        "Upload original files rather than screenshots",
        "Check file size limits (100MB max)",
        "Review multiple analysis results for consistency"
      ]
    }
  ];

  const supportedFormats = [
    {
      type: "Images",
      icon: FileImage,
      formats: ["JPG", "PNG"],
      maxSize: "100MB",
      description: "High-resolution images work best for analysis"
    },
    {
      type: "Videos",
      icon: FileVideo,
      formats: ["MP4", "MOV"],
      maxSize: "100MB",
      description: "Video analysis examines each frame for inconsistencies"
    },
    {
      type: "Audio",
      icon: FileAudio,
      formats: ["MP3", "WAV"],
      maxSize: "100MB",
      description: "Audio analysis detects artificial voice patterns"
    }
  ];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
          <HelpCircle className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Help & Support
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Get help with DeepGuard, learn how to use the platform effectively, and find answers to common questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Start Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Quick Start Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {guides.map((guide, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-start gap-3 mb-3">
                      <guide.icon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {guide.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {guide.description}
                        </p>
                      </div>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300 ml-8">
                      {guide.steps.map((step, stepIndex) => (
                        <li key={stepIndex}>{step}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Supported Formats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="h-5 w-5" />
                Supported File Formats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {supportedFormats.map((format, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <format.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {format.type}
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format.formats.join(', ')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Max: {format.maxSize}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {format.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqData.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-600 dark:text-gray-400">
                        {item.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open('mailto:support@deepguard.ai', '_blank')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open('https://docs.deepguard.ai', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Documentation
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">API Status</span>
                  <Badge className="bg-green-100 text-green-800">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Processing</span>
                  <Badge className="bg-green-100 text-green-800">Normal</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
                  <span className="text-sm font-medium">99.9%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-200">
                    <strong>Tip:</strong> Use the dashboard to track your analysis history and identify patterns.
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-green-800 dark:text-green-200">
                    <strong>Tip:</strong> Enable auto-export in settings to automatically generate PDF reports.
                  </p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-purple-800 dark:text-purple-200">
                    <strong>Tip:</strong> High confidence scores (80%+) typically indicate more reliable results.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help;
