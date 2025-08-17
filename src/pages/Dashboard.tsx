import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { VideoRecorder } from '@/components/VideoRecorder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Video, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Calendar,
  RefreshCw,
  Eye,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService, Report, VideoAnalysisResponse } from '@/services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated] = useState(true); // In a real app, this would come from auth context
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);

  // Test backend connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const isConnected = await apiService.testConnection();
        setIsBackendConnected(isConnected);
        if (!isConnected) {
          toast({
            title: "Backend Connection Failed",
            description: "Unable to connect to the video analysis service. Please check if the backend is running.",
            variant: "destructive",
          });
        }
      } catch (error) {
        setIsBackendConnected(false);
        toast({
          title: "Connection Error",
          description: "Failed to connect to the backend service.",
          variant: "destructive",
        });
      }
    };

    testConnection();
  }, [toast]);

  const handleVideoSubmit = async (videoBlob: Blob, description: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Create a temporary report with pending status
      const tempReport: Report = {
        id: Date.now().toString(),
        description,
        status: 'pending',
        submittedAt: new Date(),
        videoSize: videoBlob.size / (1024 * 1024) // Convert to MB
      };
      
      setReports(prev => [tempReport, ...prev]);

      // Upload video to backend for analysis
      const response: VideoAnalysisResponse = await apiService.uploadVideoForAnalysis(videoBlob, description);
      
      if (response.success) {
        // Update the report with analysis results
        const updatedReport: Report = {
          ...tempReport,
          status: 'completed',
          analysis: response.data.analysis,
          analysisDate: response.data.analysisDate
        };
        
        setReports(prev => prev.map(report => 
          report.id === tempReport.id ? updatedReport : report
        ));

        toast({
          title: "Analysis Complete!",
          description: "Your video has been analyzed successfully. View the results below.",
        });
      } else {
        // Update report status to indicate failure
        setReports(prev => prev.map(report => 
          report.id === tempReport.id 
            ? { ...report, status: 'reviewing' as const }
            : report
        ));

        toast({
          title: "Analysis Failed",
          description: response.message || "Failed to analyze video. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Video submission error:', error);
      
      // Update report status to indicate failure
      setReports(prev => prev.map(report => 
        report.id === Date.now().toString()
          ? { ...report, status: 'reviewing' as const }
          : report
      ));

      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAnalysis = (report: Report) => {
    setSelectedReport(report);
    setShowAnalysis(true);
  };

  const handleTestConnection = async () => {
    try {
      const isConnected = await apiService.testConnection();
      setIsBackendConnected(isConnected);
      
      if (isConnected) {
        toast({
          title: "Connection Successful",
          description: "Backend service is running and ready for video analysis.",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Unable to connect to the backend service.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsBackendConnected(false);
      toast({
        title: "Connection Error",
        description: "Failed to test backend connection.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: Report['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'reviewing':
        return <AlertTriangle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: Report['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary' as const;
      case 'reviewing':
        return 'default' as const;
      case 'completed':
        return 'outline' as const;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleSignOut = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        isAuthenticated={isAuthenticated} 
        onSignOut={handleSignOut} 
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground">
              Report Dashboard
            </h1>
            <div className="flex items-center space-x-2">
              {isBackendConnected !== null && (
                <Badge variant={isBackendConnected ? "outline" : "destructive"}>
                  {isBackendConnected ? (
                    <>
                      <Wifi className="h-3 w-3 mr-1" />
                      Connected
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3 mr-1" />
                      Disconnected
                    </>
                  )}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={isLoading}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Test Connection
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Record and submit video reports for residential problems
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Recorder Section */}
          <div className="lg:col-span-2">
            <VideoRecorder onVideoSubmit={handleVideoSubmit} />
          </div>

          {/* Reports History */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Recent Reports
                  </div>
                  {isLoading && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      No reports yet. Record your first video to get started!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant={getStatusVariant(report.status)} className="mb-2">
                            {getStatusIcon(report.status)}
                            <span className="ml-1 capitalize">{report.status}</span>
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {report.videoSize.toFixed(1)} MB
                          </span>
                        </div>
                        
                        <p className="text-sm font-medium text-foreground mb-2 line-clamp-2">
                          {report.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(report.submittedAt)}
                          </div>
                          
                          {report.status === 'completed' && report.analysis && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewAnalysis(report)}
                              className="h-6 px-2 text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Analysis
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Uploading to server
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="default">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Reviewing
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Processing failed
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Analysis complete
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Analysis Modal */}
        {showAnalysis && selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Video Analysis</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAnalysis(false)}
                  >
                    ×
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Problem Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">AI Analysis</h4>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{selectedReport.analysis}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Video Size: {selectedReport.videoSize.toFixed(1)} MB</span>
                    <span>Analyzed: {selectedReport.analysisDate ? new Date(selectedReport.analysisDate).toLocaleString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;