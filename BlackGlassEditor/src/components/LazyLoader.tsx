import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Image as ImageIcon, Layers } from 'lucide-react';

interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  priority?: 'low' | 'normal' | 'high';
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
}

interface LoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  error: Error | null;
}

// Lazy Image Component
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  options?: LazyLoadOptions;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}> = ({ src, alt, className, options = {}, onLoad, onError }) => {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    isLoaded: false,
    error: null
  });
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { threshold = 0.1, rootMargin = '50px', priority = 'normal' } = options;

  // Setup intersection observer
  useEffect(() => {
    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observerRef.current?.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observerRef.current.observe(imgRef.current);

    return () => observerRef.current?.disconnect();
  }, [threshold, rootMargin]);

  // Load image when visible
  useEffect(() => {
    if (!isVisible || state.isLoaded || state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true }));

    const img = new Image();
    
    img.onload = () => {
      setState({ isLoading: false, isLoaded: true, error: null });
      onLoad?.();
    };

    img.onerror = () => {
      const error = new Error(`Failed to load image: ${src}`);
      setState({ isLoading: false, isLoaded: false, error });
      onError?.(error);
    };

    // Set loading priority
    if (priority === 'high') {
      img.loading = 'eager';
    } else {
      img.loading = 'lazy';
    }

    img.src = src;
  }, [isVisible, src, priority, state.isLoaded, state.isLoading, onLoad, onError]);

  if (state.error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        {options.fallback || (
          <div className="text-center p-4">
            <ImageIcon className="mx-auto mb-2 text-gray-400" size={24} />
            <p className="text-sm text-gray-500">Failed to load image</p>
          </div>
        )}
      </div>
    );
  }

  if (!state.isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} ref={imgRef}>
        {options.placeholder || (
          <div className="text-center p-4">
            {state.isLoading ? (
              <Loader2 className="mx-auto mb-2 text-blue-500 animate-spin" size={24} />
            ) : (
              <ImageIcon className="mx-auto mb-2 text-gray-400" size={24} />
            )}
            <p className="text-sm text-gray-500">
              {state.isLoading ? 'Loading...' : 'Image'}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.img
      ref={imgRef}
      src={src}
      alt={alt}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
};

// Lazy Component Loader
export const LazyComponent: React.FC<{
  loader: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  props?: any;
}> = ({ loader, fallback, props = {} }) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    
    loader()
      .then(module => {
        setComponent(() => module.default);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err);
        setIsLoading(false);
      });
  }, [loader]);

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Failed to load component</p>
      </div>
    );
  }

  if (isLoading || !Component) {
    return (
      <div className="flex items-center justify-center p-4">
        {fallback || <Loader2 className="animate-spin" size={24} />}
      </div>
    );
  }

  return <Component {...props} />;
};

// Lazy List for large datasets
export const LazyList: React.FC<{
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
  className?: string;
}> = ({ 
  items, 
  renderItem, 
  itemHeight = 50, 
  containerHeight = 400, 
  overscan = 5,
  className 
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + overscan,
    items.length
  );

  const visibleItems = items.slice(
    Math.max(0, visibleStart - overscan),
    visibleEnd
  );

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => {
          const actualIndex = Math.max(0, visibleStart - overscan) + index;
          return (
            <div
              key={actualIndex}
              style={{
                position: 'absolute',
                top: actualIndex * itemHeight,
                height: itemHeight,
                width: '100%'
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Progressive Loading Manager
class ProgressiveLoader {
  private static instance: ProgressiveLoader;
  private loadQueue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  private maxConcurrent = 3;
  private currentLoading = 0;

  static getInstance(): ProgressiveLoader {
    if (!ProgressiveLoader.instance) {
      ProgressiveLoader.instance = new ProgressiveLoader();
    }
    return ProgressiveLoader.instance;
  }

  // Add item to load queue
  enqueue(loader: () => Promise<void>, priority = 0): void {
    this.loadQueue.push(loader);
    // this.loadQueue.sort((a, b) => b.priority - a.priority);
    this.processQueue();
  }

  // Process load queue
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.currentLoading >= this.maxConcurrent) {
      return;
    }

    this.isProcessing = true;

    while (this.loadQueue.length > 0 && this.currentLoading < this.maxConcurrent) {
      const loader = this.loadQueue.shift();
      if (loader) {
        this.currentLoading++;
        
        loader()
          .catch(error => console.error('Progressive loading failed:', error))
          .finally(() => {
            this.currentLoading--;
            this.processQueue();
          });
      }
    }

    this.isProcessing = false;
  }

  // Clear queue
  clear(): void {
    this.loadQueue = [];
  }

  // Get queue status
  getStatus(): { queued: number; loading: number } {
    return {
      queued: this.loadQueue.length,
      loading: this.currentLoading
    };
  }
}

export const progressiveLoader = ProgressiveLoader.getInstance();

// Hook for lazy loading
export const useLazyLoad = function<T>(
  loader: () => Promise<T>,
  dependencies: any[] = []
): [T | null, boolean, Error | null] {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    progressiveLoader.enqueue(async () => {
      try {
        const result = await loader();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Loading failed'));
      } finally {
        setIsLoading(false);
      }
    });
  }, dependencies);

  return [data, isLoading, error];
}

// Preload manager for critical resources
export const preloadManager = {
  images: new Set<string>(),
  
  preloadImage(src: string): Promise<HTMLImageElement> {
    if (this.images.has(src)) {
      return Promise.resolve(document.querySelector(`img[src="${src}"]`) as HTMLImageElement);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.add(src);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  },

  preloadImages(sources: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(sources.map(src => this.preloadImage(src)));
  }
};