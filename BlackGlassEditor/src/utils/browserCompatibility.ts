// Browser Compatibility & Optimization System

interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  platform: string;
  mobile: boolean;
  features: BrowserFeatures;
}

interface BrowserFeatures {
  webgl: boolean;
  webgl2: boolean;
  canvas: boolean;
  offscreenCanvas: boolean;
  webWorkers: boolean;
  sharedArrayBuffer: boolean;
  intersectionObserver: boolean;
  resizeObserver: boolean;
  requestIdleCallback: boolean;
  webAssembly: boolean;
  es6Modules: boolean;
  customElements: boolean;
}

interface PerformanceProfile {
  tier: 'high' | 'medium' | 'low';
  maxCanvasSize: number;
  maxObjects: number;
  animationQuality: 'high' | 'medium' | 'low';
  enableShadows: boolean;
  enableBlur: boolean;
  enableGradients: boolean;
}

class BrowserCompatibility {
  private static instance: BrowserCompatibility;
  private browserInfo: BrowserInfo;
  private performanceProfile: PerformanceProfile;

  constructor() {
    this.browserInfo = this.detectBrowser();
    this.performanceProfile = this.createPerformanceProfile();
  }

  static getInstance(): BrowserCompatibility {
    if (!BrowserCompatibility.instance) {
      BrowserCompatibility.instance = new BrowserCompatibility();
    }
    return BrowserCompatibility.instance;
  }

  // Detect browser and capabilities
  private detectBrowser(): BrowserInfo {
    const ua = navigator.userAgent;
    const platform = navigator.platform;
    const mobile = /Mobile|Android|iPhone|iPad/.test(ua);

    let name = 'Unknown';
    let version = '0';
    let engine = 'Unknown';

    // Detect browser
    if (ua.includes('Chrome') && !ua.includes('Edg')) {
      name = 'Chrome';
      version = ua.match(/Chrome\/(\d+)/)?.[1] || '0';
      engine = 'Blink';
    } else if (ua.includes('Firefox')) {
      name = 'Firefox';
      version = ua.match(/Firefox\/(\d+)/)?.[1] || '0';
      engine = 'Gecko';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      name = 'Safari';
      version = ua.match(/Version\/(\d+)/)?.[1] || '0';
      engine = 'WebKit';
    } else if (ua.includes('Edg')) {
      name = 'Edge';
      version = ua.match(/Edg\/(\d+)/)?.[1] || '0';
      engine = 'Blink';
    }

    return {
      name,
      version,
      engine,
      platform,
      mobile,
      features: this.detectFeatures()
    };
  }

  // Detect browser features
  private detectFeatures(): BrowserFeatures {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    const gl2 = canvas.getContext('webgl2');

    return {
      webgl: !!gl,
      webgl2: !!gl2,
      canvas: !!canvas.getContext('2d'),
      offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
      webWorkers: typeof Worker !== 'undefined',
      sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
      intersectionObserver: typeof IntersectionObserver !== 'undefined',
      resizeObserver: typeof ResizeObserver !== 'undefined',
      requestIdleCallback: typeof requestIdleCallback !== 'undefined',
      webAssembly: typeof WebAssembly !== 'undefined',
      es6Modules: 'noModule' in document.createElement('script'),
      customElements: typeof customElements !== 'undefined'
    };
  }

  // Create performance profile based on browser capabilities
  private createPerformanceProfile(): PerformanceProfile {
    const { name, version, mobile, features } = this.browserInfo;
    const versionNum = parseInt(version);

    // High-end profile
    if (!mobile && features.webgl2 && features.offscreenCanvas) {
      if ((name === 'Chrome' && versionNum >= 90) ||
          (name === 'Firefox' && versionNum >= 85) ||
          (name === 'Safari' && versionNum >= 14)) {
        return {
          tier: 'high',
          maxCanvasSize: 8192,
          maxObjects: 5000,
          animationQuality: 'high',
          enableShadows: true,
          enableBlur: true,
          enableGradients: true
        };
      }
    }

    // Medium profile
    if (features.webgl && features.canvas) {
      return {
        tier: 'medium',
        maxCanvasSize: 4096,
        maxObjects: 2000,
        animationQuality: 'medium',
        enableShadows: true,
        enableBlur: false,
        enableGradients: true
      };
    }

    // Low-end profile
    return {
      tier: 'low',
      maxCanvasSize: 2048,
      maxObjects: 500,
      animationQuality: 'low',
      enableShadows: false,
      enableBlur: false,
      enableGradients: false
    };
  }

  // Get browser info
  getBrowserInfo(): BrowserInfo {
    return this.browserInfo;
  }

  // Get performance profile
  getPerformanceProfile(): PerformanceProfile {
    return this.performanceProfile;
  }

  // Check if feature is supported
  isFeatureSupported(feature: keyof BrowserFeatures): boolean {
    return this.browserInfo.features[feature];
  }

  // Get optimized settings for current browser
  getOptimizedSettings() {
    const profile = this.performanceProfile;
    
    return {
      // Canvas settings
      maxCanvasWidth: profile.maxCanvasSize,
      maxCanvasHeight: profile.maxCanvasSize,
      
      // Rendering settings
      enableHardwareAcceleration: this.isFeatureSupported('webgl'),
      enableOffscreenRendering: this.isFeatureSupported('offscreenCanvas'),
      
      // Animation settings
      enableAnimations: profile.animationQuality !== 'low',
      animationDuration: profile.animationQuality === 'high' ? 300 : 150,
      enableEasing: profile.animationQuality === 'high',
      
      // Visual effects
      enableShadows: profile.enableShadows,
      enableBlur: profile.enableBlur,
      enableGradients: profile.enableGradients,
      
      // Performance settings
      maxObjects: profile.maxObjects,
      enableVirtualization: profile.tier === 'low',
      enableLazyLoading: true,
      
      // Memory settings
      maxMemoryUsage: profile.tier === 'high' ? 200 : profile.tier === 'medium' ? 100 : 50,
      enableMemoryOptimization: profile.tier !== 'high'
    };
  }

  // Apply browser-specific optimizations
  applyOptimizations(): void {
    const settings = this.getOptimizedSettings();
    
    // Apply CSS optimizations
    this.applyCSSOptimizations(settings);
    
    // Apply JavaScript optimizations
    this.applyJSOptimizations(settings);
    
    // Apply canvas optimizations
    this.applyCanvasOptimizations(settings);
  }

  // Apply CSS optimizations
  private applyCSSOptimizations(settings: any): void {
    const style = document.createElement('style');
    style.textContent = `
      /* Browser-specific optimizations */
      * {
        ${settings.enableHardwareAcceleration ? 'transform: translateZ(0);' : ''}
        ${!settings.enableAnimations ? 'transition: none !important;' : ''}
      }
      
      canvas {
        ${settings.enableHardwareAcceleration ? 'will-change: transform;' : ''}
      }
      
      ${!settings.enableShadows ? '.shadow { box-shadow: none !important; }' : ''}
      ${!settings.enableBlur ? '.blur { filter: none !important; }' : ''}
    `;
    document.head.appendChild(style);
  }

  // Apply JavaScript optimizations
  private applyJSOptimizations(settings: any): void {
    // Polyfills for missing features
    if (!this.isFeatureSupported('requestIdleCallback')) {
      (window as any).requestIdleCallback = (callback: Function) => {
        return setTimeout(callback, 1);
      };
    }

    if (!this.isFeatureSupported('intersectionObserver')) {
      // Simple polyfill for intersection observer
      (window as any).IntersectionObserver = class {
        constructor(callback: Function) {
          (this as any).callback = callback;
        }
        observe() {}
        disconnect() {}
      };
    }

    // Performance optimizations
    if (settings.enableMemoryOptimization) {
      // Enable aggressive garbage collection
      setInterval(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      }, 30000);
    }
  }

  // Apply canvas optimizations
  private applyCanvasOptimizations(settings: any): void {
    const canvases = document.querySelectorAll('canvas');
    
    canvases.forEach(canvas => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Optimize canvas context
        if (settings.enableHardwareAcceleration) {
          ctx.imageSmoothingEnabled = true;
          // Only set imageSmoothingQuality if it's a valid value
          const validQualities = ['low', 'medium', 'high'];
          if (validQualities.includes(settings.animationQuality)) {
            ctx.imageSmoothingQuality = settings.animationQuality as ImageSmoothingQuality;
          }
        } else {
          ctx.imageSmoothingEnabled = false;
        }
      }
    });
  }

  // Get compatibility warnings
  getCompatibilityWarnings(): string[] {
    const warnings: string[] = [];
    const { name, version, features } = this.browserInfo;

    if (!features.webgl) {
      warnings.push('WebGL not supported. Some features may be limited.');
    }

    if (!features.canvas) {
      warnings.push('Canvas not supported. Editor may not function properly.');
    }

    if (!features.webWorkers) {
      warnings.push('Web Workers not supported. Performance may be reduced.');
    }

    if (name === 'Safari' && parseInt(version) < 14) {
      warnings.push('Safari version is outdated. Please update for better performance.');
    }

    if (name === 'Firefox' && parseInt(version) < 80) {
      warnings.push('Firefox version is outdated. Some features may not work.');
    }

    if (this.performanceProfile.tier === 'low') {
      warnings.push('Limited performance detected. Some features are disabled for better experience.');
    }

    return warnings;
  }

  // Get recommended browser settings
  getRecommendedSettings(): string[] {
    const recommendations: string[] = [];
    
    if (this.browserInfo.mobile) {
      recommendations.push('Use landscape orientation for better experience');
      recommendations.push('Close other apps to free up memory');
    }

    if (this.performanceProfile.tier === 'low') {
      recommendations.push('Reduce canvas size for better performance');
      recommendations.push('Limit the number of objects in your project');
      recommendations.push('Disable visual effects if experiencing lag');
    }

    if (!this.isFeatureSupported('webgl')) {
      recommendations.push('Update your browser for hardware acceleration');
    }

    return recommendations;
  }

  // Test browser performance
  async testPerformance(): Promise<{
    renderScore: number;
    memoryScore: number;
    overallScore: number;
  }> {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext('2d')!;

    // Render performance test
    const renderStart = performance.now();
    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle = `hsl(${i % 360}, 50%, 50%)`;
      ctx.fillRect(Math.random() * 500, Math.random() * 500, 10, 10);
    }
    const renderTime = performance.now() - renderStart;
    const renderScore = Math.max(0, 100 - renderTime / 10);

    // Memory test
    const memoryBefore = (performance as any).memory?.usedJSHeapSize || 0;
    const testData = new Array(10000).fill(0).map(() => ({ x: Math.random(), y: Math.random() }));
    const memoryAfter = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryUsed = memoryAfter - memoryBefore;
    const memoryScore = Math.max(0, 100 - memoryUsed / 100000);

    const overallScore = (renderScore + memoryScore) / 2;

    return { renderScore, memoryScore, overallScore };
  }
}

export default BrowserCompatibility.getInstance();