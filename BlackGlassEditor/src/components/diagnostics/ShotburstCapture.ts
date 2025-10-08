/**
 * 📸 ShotburstCapture - Advanced screenshot system for animations and complex interactions
 * Captures up to 4 staggered screenshots with video recording for maximum context
 */

export interface ShotburstFrame {
  id: string;
  timestamp: number;
  screenshot: string;
  elementBounds?: { x: number; y: number; width: number; height: number };
  viewport: { width: number; height: number };
  step: number; // 1, 2, 3, or 4
  description?: string;
}

export interface ShotburstSequence {
  id: string;
  timestamp: number;
  frames: ShotburstFrame[];
  videoBlob?: Blob;
  duration: number;
  context: {
    action: string;
    elementId: string;
    userAgent: string;
    viewport: { width: number; height: number };
  };
  metadata: {
    totalFrames: number;
    compressionRatio: number;
    fileSize: number;
    quality: 'low' | 'medium' | 'high';
  };
}

export interface ShotburstOptions {
  frameCount: 1 | 2 | 3 | 4;
  interval: number; // ms between frames
  quality: 'low' | 'medium' | 'high';
  includeVideo: boolean;
  videoDuration: number; // seconds
  compression: number; // 0.1 to 1.0
  autoTrigger: boolean; // Auto-trigger on certain events
}

export class ShotburstCapture {
  private static instance: ShotburstCapture;
  private sequences: ShotburstSequence[] = [];
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;

  static getInstance(): ShotburstCapture {
    if (!ShotburstCapture.instance) {
      ShotburstCapture.instance = new ShotburstCapture();
    }
    return ShotburstCapture.instance;
  }

  // Manual shotburst trigger
  async captureShotburst(
    options: Partial<ShotburstOptions> = {},
    elementId?: string,
    description?: string
  ): Promise<ShotburstSequence> {
    const defaultOptions: ShotburstOptions = {
      frameCount: 4,
      interval: 250, // 250ms between frames
      quality: 'medium',
      includeVideo: true,
      videoDuration: 3, // 3 seconds
      compression: 0.7,
      autoTrigger: false
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    console.log('📸 Starting shotburst capture...', finalOptions);

    // Start video recording if enabled
    if (finalOptions.includeVideo) {
      await this.startVideoRecording(finalOptions.videoDuration);
    }

    // Capture frames
    const frames: ShotburstFrame[] = [];
    const startTime = Date.now();

    for (let i = 0; i < finalOptions.frameCount; i++) {
      const frame = await this.captureFrame(
        i + 1,
        finalOptions.quality,
        finalOptions.compression,
        elementId,
        description
      );
      frames.push(frame);

      // Wait for interval (except for last frame)
      if (i < finalOptions.frameCount - 1) {
        await this.delay(finalOptions.interval);
      }
    }

    // Stop video recording
    let videoBlob: Blob | undefined;
    if (finalOptions.includeVideo) {
      videoBlob = await this.stopVideoRecording();
    }

    // Create sequence
    const sequence: ShotburstSequence = {
      id: `shotburst-${Date.now()}`,
      timestamp: Date.now(),
      frames,
      videoBlob,
      duration: Date.now() - startTime,
      context: {
        action: 'manual_shotburst',
        elementId: elementId || 'unknown',
        userAgent: navigator.userAgent,
        viewport: { width: window.innerWidth, height: window.innerHeight }
      },
      metadata: {
        totalFrames: frames.length,
        compressionRatio: finalOptions.compression,
        fileSize: this.calculateTotalSize(frames, videoBlob),
        quality: finalOptions.quality
      }
    };

    this.sequences.push(sequence);
    console.log('📸 Shotburst capture complete:', sequence);

    return sequence;
  }

  // Auto-trigger shotburst on specific events
  async autoCaptureShotburst(
    event: string,
    elementId: string,
    options: Partial<ShotburstOptions> = {}
  ): Promise<ShotburstSequence | null> {
    const autoTriggerEvents = [
      'animation_start',
      'video_play',
      'drag_start',
      'element_error',
      'performance_degradation'
    ];

    if (!autoTriggerEvents.includes(event)) {
      return null;
    }

    console.log(`📸 Auto-capturing shotburst for ${event} on ${elementId}`);
    
    return this.captureShotburst({
      ...options,
      frameCount: 3, // Fewer frames for auto-capture
      interval: 200,
      quality: 'medium'
    }, elementId, `Auto-capture: ${event}`);
  }

  // Capture a single frame
  private async captureFrame(
    step: number,
    quality: string,
    compression: number,
    elementId?: string,
    description?: string
  ): Promise<ShotburstFrame> {
    const timestamp = Date.now();
    
    try {
      // Capture screenshot
      const screenshot = await this.captureScreenshot(quality, compression);
      
      // Get element bounds if elementId provided
      let elementBounds;
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          const rect = element.getBoundingClientRect();
          elementBounds = {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
          };
        }
      }

      return {
        id: `frame-${timestamp}-${step}`,
        timestamp,
        screenshot,
        elementBounds,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        step,
        description: description || `Frame ${step}`
      };
    } catch (error) {
      console.error('Failed to capture frame:', error);
      throw error;
    }
  }

  // Capture screenshot with quality and compression
  private async captureScreenshot(quality: string, compression: number): Promise<string> {
    try {
      // Use html2canvas if available
      if (typeof window !== 'undefined' && (window as any).html2canvas) {
        const canvas = await (window as any).html2canvas(document.body, {
          useCORS: true,
          allowTaint: true,
          scale: this.getQualityScale(quality),
          logging: false
        });
        
        // Apply compression
        return canvas.toDataURL('image/jpeg', compression);
      } else {
        // Fallback: create a simple representation
        return this.createFallbackScreenshot();
      }
    } catch (error) {
      console.warn('Failed to capture screenshot:', error);
      return this.createFallbackScreenshot();
    }
  }

  private getQualityScale(quality: string): number {
    switch (quality) {
      case 'high': return 1.0;
      case 'medium': return 0.7;
      case 'low': return 0.5;
      default: return 0.7;
    }
  }

  private createFallbackScreenshot(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Draw a simple representation
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.fillText('Screenshot not available', 20, 40);
    ctx.fillText(`Viewport: ${canvas.width}x${canvas.height}`, 20, 70);
    ctx.fillText(`Time: ${new Date().toLocaleTimeString()}`, 20, 100);
    
    return canvas.toDataURL('image/png');
  }

  // Start video recording
  private async startVideoRecording(duration: number): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      this.recordedChunks = [];
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();

      // Auto-stop after duration
      setTimeout(() => {
        if (this.isRecording) {
          this.stopVideoRecording();
        }
      }, duration * 1000);

      console.log('📹 Video recording started');
    } catch (error) {
      console.warn('Failed to start video recording:', error);
    }
  }

  // Stop video recording
  private async stopVideoRecording(): Promise<Blob | undefined> {
    if (!this.mediaRecorder || !this.isRecording) {
      return undefined;
    }

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.isRecording = false;
        console.log('📹 Video recording stopped');
        resolve(blob);
      };

      this.mediaRecorder!.stop();
    });
  }

  // Calculate total file size
  private calculateTotalSize(frames: ShotburstFrame[], videoBlob?: Blob): number {
    let totalSize = 0;
    
    // Add frame sizes
    frames.forEach(frame => {
      // Estimate size from base64 string
      totalSize += Math.floor(frame.screenshot.length * 0.75);
    });
    
    // Add video size
    if (videoBlob) {
      totalSize += videoBlob.size;
    }
    
    return totalSize;
  }

  // Delay utility
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get all sequences
  getAllSequences(): ShotburstSequence[] {
    return [...this.sequences];
  }

  // Get sequence by ID
  getSequence(id: string): ShotburstSequence | undefined {
    return this.sequences.find(seq => seq.id === id);
  }

  // Get sequences for specific element
  getSequencesForElement(elementId: string): ShotburstSequence[] {
    return this.sequences.filter(seq => seq.context.elementId === elementId);
  }

  // Export sequence as downloadable file
  exportSequence(sequenceId: string): void {
    const sequence = this.getSequence(sequenceId);
    if (!sequence) return;

    // Create a zip-like structure with frames and video
    const exportData = {
      sequence,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `shotburst-${sequenceId}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  // Download video separately
  downloadVideo(sequenceId: string): void {
    const sequence = this.getSequence(sequenceId);
    if (!sequence || !sequence.videoBlob) return;

    const url = URL.createObjectURL(sequence.videoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shotburst-video-${sequenceId}.webm`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  // Clear old sequences (keep last 20)
  cleanup(): void {
    if (this.sequences.length > 20) {
      this.sequences = this.sequences.slice(-20);
    }
  }

  // Get statistics
  getStatistics(): any {
    const totalSequences = this.sequences.length;
    const totalFrames = this.sequences.reduce((sum, seq) => sum + seq.frames.length, 0);
    const totalSize = this.sequences.reduce((sum, seq) => sum + seq.metadata.fileSize, 0);
    const withVideo = this.sequences.filter(seq => seq.videoBlob).length;

    return {
      totalSequences,
      totalFrames,
      totalSize,
      withVideo,
      averageFramesPerSequence: totalFrames / totalSequences,
      averageSizePerSequence: totalSize / totalSequences
    };
  }
}

// Global instance
export const shotburstCapture = ShotburstCapture.getInstance();
