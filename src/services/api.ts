const API_BASE_URL = 'https://startup-main.onrender.com/api';

export interface VideoAnalysisResponse {
  success: boolean;
  message: string;
  data: {
    originalName: string;
    fileSize: number;
    fileSizeInMB: number;
    analysis: string;
    analysisDate: string;
  };
}

export interface Report {
  id: string;
  description: string;
  status: 'pending' | 'reviewing' | 'completed';
  submittedAt: Date;
  videoSize: number;
  analysis?: string;
  analysisDate?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async uploadVideoForAnalysis(videoBlob: Blob, description: string): Promise<VideoAnalysisResponse> {
    const formData = new FormData();
    
    // Validate that we have a video blob
    if (!videoBlob || videoBlob.size === 0) {
      throw new Error('Invalid video blob: empty or missing');
    }
    
    // Always create a new File with video/mp4 type for backend compatibility
    const videoFile = new File([videoBlob], 'video.mp4', { type: 'video/mp4' });
    
    formData.append('video', videoFile);
    formData.append('description', description);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

    try {
      console.log('Uploading video to:', `${this.baseUrl}/videos/analyze-video`);
      console.log('Video blob size:', videoBlob.size);
      console.log('Video blob type:', videoBlob.type);
      console.log('Video file type:', videoFile.type);
      console.log('Video file name:', videoFile.name);
      console.log('Description:', description);

      const response = await fetch(`${this.baseUrl}/videos/analyze-video`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Upload error:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Upload success:', result);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Upload failed:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - video analysis is taking longer than expected');
        }
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing connection to:', `${this.baseUrl}/videos/test-gemini`);
      
      const response = await fetch(`${this.baseUrl}/videos/test-gemini`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Connection test response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Connection test success:', data);
        return true;
      } else {
        console.error('Connection test failed with status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async getHealth(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/health`);
      return response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService; 