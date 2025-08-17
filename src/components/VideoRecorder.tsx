import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Upload, 
  Camera, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoRecorderProps {
  onVideoSubmit: (videoBlob: Blob, description: string) => Promise<void>;
}

export const VideoRecorder = ({ onVideoSubmit }: VideoRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    try {
      // Mobile-optimized camera constraints
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          aspectRatio: 9/16,
          // Use back camera on mobile by default
          facingMode: isMobile ? "environment" : "user"
        },
        audio: true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = stream;
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Ensure video loads and plays on mobile
        videoRef.current.load();
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.log('Auto-play prevented, user interaction required');
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to record videos.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    
    // Debug: Check what formats are supported
    console.log('Checking MediaRecorder support:');
    const testFormats = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
      'video/ogg;codecs=theora',
      'video/ogg'
    ];
    
    testFormats.forEach(format => {
      console.log(`${format}: ${MediaRecorder.isTypeSupported(format)}`);
    });
    
    // Use compatible video format for mobile
    const options: MediaRecorderOptions = {};
    
    // Try to find the best supported video format
    const supportedFormats = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
      'video/ogg;codecs=theora',
      'video/ogg'
    ];
    
    for (const format of supportedFormats) {
      if (MediaRecorder.isTypeSupported(format)) {
        options.mimeType = format;
        console.log('Using MediaRecorder format:', format);
        break;
      }
    }
    
    if (!options.mimeType) {
      console.log('No supported video format found, using default');
    }
    
    console.log('MediaRecorder options:', options);
    const mediaRecorder = new MediaRecorder(streamRef.current, options);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      console.log('Data available:', event.data.size, 'bytes, type:', event.data.type);
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const mimeType = mediaRecorder.mimeType || 'video/webm';
      const blob = new Blob(chunksRef.current, { type: mimeType });
      
      // Always create a new blob with video/mp4 type for backend compatibility
      const finalBlob = new Blob(chunksRef.current, { type: 'video/mp4' });
      
      const url = URL.createObjectURL(finalBlob);
      
      console.log('Video recorded:', { 
        originalSize: blob.size, 
        originalType: blob.type,
        finalSize: finalBlob.size,
        finalType: finalBlob.type,
        url 
      });
      
      setRecordedVideoUrl(url);
      setRecordedBlob(finalBlob);
      
      // Stop the camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Clear the video element source to ensure clean transition
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    console.log('Starting MediaRecorder...');
    mediaRecorder.start();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const resetRecording = useCallback(() => {
    setRecordedVideoUrl(null);
    setRecordedBlob(null);
    setDescription('');
    chunksRef.current = [];
    
    // Restart camera
    startCamera();
  }, [startCamera]);

  const handleSubmit = useCallback(async () => {
    if (!recordedBlob || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a description of the problem.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onVideoSubmit(recordedBlob, description.trim());
      toast({
        title: "Report Submitted",
        description: "Your video report has been submitted successfully!",
      });
      setRecordedVideoUrl(null);
      setRecordedBlob(null);
      setDescription('');
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [recordedBlob, description, onVideoSubmit, toast]);

  // Initialize camera on component mount
  useEffect(() => {
    startCamera();
  }, [startCamera]);

  if (hasPermission === false) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
          <p className="text-muted-foreground mb-4">
            To record a video report, please allow camera access in your browser.
          </p>
          <Button onClick={startCamera}>
            <Camera className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Record Your Problem Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Display */}
          <div className="relative bg-muted rounded-lg overflow-hidden aspect-[9/16] max-w-sm mx-auto">
            {recordedVideoUrl ? (
              <video
                src={recordedVideoUrl}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
                onLoadStart={() => console.log('Video loading started')}
                onCanPlay={() => console.log('Video can play')}
                onError={(e) => console.error('Video error:', e)}
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                webkit-playsinline="true"
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
            )}
            
            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center bg-destructive text-destructive-foreground px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-destructive-foreground rounded-full mr-2 animate-pulse" />
                Recording...
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {!recordedVideoUrl ? (
              !isRecording ? (
                <Button onClick={startRecording} variant="hero" size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="destructive" size="lg">
                  <Square className="h-5 w-5 mr-2" />
                  Stop Recording
                </Button>
              )
            ) : (
              <Button onClick={resetRecording} variant="outline" size="lg">
                <RotateCcw className="h-5 w-5 mr-2" />
                Record Again
              </Button>
            )}
          </div>

          {/* Description Input */}
          {recordedVideoUrl && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="description" className="text-base font-medium">
                  Describe the Problem
                </Label>
                <Textarea
                  id="description"
                  placeholder="Please describe the residential problem you're reporting (e.g., leaky faucet in kitchen, broken cabinet door, etc.)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 min-h-[100px]"
                />
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !description.trim()}
                variant="success"
                size="lg"
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-success-foreground mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-success" />
            Recording Tips
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Make sure you have good lighting when recording</li>
            <li>• Hold your device steady and speak clearly</li>
            <li>• Show the problem area clearly in the video</li>
            <li>• Keep recordings under 2 minutes for best results</li>
            <li>• Describe what you're showing as you record</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};