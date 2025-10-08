/**
 * Event Optimizer for Konva Canvas
 * Implements event delegation, throttling, and smart event handling
 */

export interface EventConfig {
  enableEventDelegation: boolean;
  enableThrottling: boolean;
  enableDebouncing: boolean;
  throttleDelay: number; // in ms
  debounceDelay: number; // in ms
  maxEventListeners: number;
  enableEventPooling: boolean;
  enableSmartEventHandling: boolean;
  eventBatchSize: number;
}

export interface EventStats {
  totalEvents: number;
  throttledEvents: number;
  debouncedEvents: number;
  delegatedEvents: number;
  pooledEvents: number;
  eventListeners: number;
  averageEventTime: number;
  droppedEvents: number;
}

export interface EventHandler {
  id: string;
  type: string;
  handler: Function;
  element: any;
  throttled: boolean;
  debounced: boolean;
  priority: number;
}

export class EventOptimizer {
  private config: EventConfig;
  private stats: EventStats;
  private eventHandlers: Map<string, EventHandler> = new Map();
  private eventQueue: Array<{ type: string; data: any; timestamp: number }> = [];
  private throttledHandlers: Map<string, number> = new Map();
  private debouncedHandlers: Map<string, number> = new Map();
  private eventPool: Array<{ type: string; data: any; timestamp: number }> = [];
  private isProcessing: boolean = false;

  constructor(config: Partial<EventConfig> = {}) {
    this.config = {
      enableEventDelegation: true,
      enableThrottling: true,
      enableDebouncing: true,
      throttleDelay: 16, // ~60fps
      debounceDelay: 100,
      maxEventListeners: 1000,
      enableEventPooling: true,
      enableSmartEventHandling: true,
      eventBatchSize: 10,
      ...config
    };

    this.stats = {
      totalEvents: 0,
      throttledEvents: 0,
      debouncedEvents: 0,
      delegatedEvents: 0,
      pooledEvents: 0,
      eventListeners: 0,
      averageEventTime: 0,
      droppedEvents: 0
    };
  }

  /**
   * Add event handler with optimization
   */
  addEventHandler(
    id: string,
    type: string,
    handler: Function,
    element: any,
    options: {
      throttled?: boolean;
      debounced?: boolean;
      priority?: number;
    } = {}
  ): void {
    // Check if we're at the limit
    if (this.eventHandlers.size >= this.config.maxEventListeners) {
      this.stats.droppedEvents++;
      console.warn('Maximum event listeners reached, dropping event');
      return;
    }

    const eventHandler: EventHandler = {
      id,
      type,
      handler,
      element,
      throttled: options.throttled || false,
      debounced: options.debounced || false,
      priority: options.priority || 0
    };

    this.eventHandlers.set(id, eventHandler);
    this.stats.eventListeners++;

    // Add to element if not using delegation
    if (!this.config.enableEventDelegation) {
      element.on(type, handler);
    }
  }

  /**
   * Remove event handler
   */
  removeEventHandler(id: string): void {
    const handler = this.eventHandlers.get(id);
    if (handler) {
      this.eventHandlers.delete(id);
      this.stats.eventListeners--;

      // Remove from element if not using delegation
      if (!this.config.enableEventDelegation) {
        handler.element.off(handler.type, handler.handler);
      }
    }
  }

  /**
   * Handle event with optimization
   */
  handleEvent(type: string, data: any, element?: any): void {
    const startTime = performance.now();
    this.stats.totalEvents++;

    // Get pooled event object
    const eventObj = this.getPooledEvent(type, data);
    
    // Add to queue for batch processing
    this.eventQueue.push(eventObj);

    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processEventQueue();
    }

    // Update average event time
    const eventTime = performance.now() - startTime;
    this.stats.averageEventTime = (this.stats.averageEventTime + eventTime) / 2;
  }

  /**
   * Process event queue in batches
   */
  private processEventQueue(): void {
    if (this.isProcessing || this.eventQueue.length === 0) return;

    this.isProcessing = true;

    const batch = this.eventQueue.splice(0, this.config.eventBatchSize);
    
    // Sort by priority
    batch.sort((a, b) => {
      const handlerA = this.findHandlerByType(a.type);
      const handlerB = this.findHandlerByType(b.type);
      return (handlerB?.priority || 0) - (handlerA?.priority || 0);
    });

    // Process each event
    for (const event of batch) {
      this.processEvent(event);
    }

    this.isProcessing = false;

    // Continue processing if there are more events
    if (this.eventQueue.length > 0) {
      requestAnimationFrame(() => this.processEventQueue());
    }
  }

  /**
   * Process individual event
   */
  private processEvent(event: { type: string; data: any; timestamp: number }): void {
    const handlers = this.findHandlersByType(event.type);
    
    for (const handler of handlers) {
      if (this.shouldExecuteHandler(handler, event)) {
        try {
          handler.handler(event.data);
        } catch (error) {
          console.error('Event handler error:', error);
        }
      }
    }

    // Return event to pool
    this.returnEventToPool(event);
  }

  /**
   * Check if handler should execute
   */
  private shouldExecuteHandler(handler: EventHandler, event: { type: string; data: any; timestamp: number }): boolean {
    // Throttling check
    if (handler.throttled && this.config.enableThrottling) {
      const lastExecution = this.throttledHandlers.get(handler.id);
      const now = performance.now();
      
      if (lastExecution && now - lastExecution < this.config.throttleDelay) {
        this.stats.throttledEvents++;
        return false;
      }
      
      this.throttledHandlers.set(handler.id, now);
    }

    // Debouncing check
    if (handler.debounced && this.config.enableDebouncing) {
      const timeoutId = this.debouncedHandlers.get(handler.id);
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      const newTimeoutId = window.setTimeout(() => {
        handler.handler(event.data);
        this.debouncedHandlers.delete(handler.id);
      }, this.config.debounceDelay);
      
      this.debouncedHandlers.set(handler.id, newTimeoutId);
      this.stats.debouncedEvents++;
      return false;
    }

    return true;
  }

  /**
   * Find handlers by type
   */
  private findHandlersByType(type: string): EventHandler[] {
    const handlers: EventHandler[] = [];
    
    for (const handler of this.eventHandlers.values()) {
      if (handler.type === type) {
        handlers.push(handler);
      }
    }
    
    return handlers;
  }

  /**
   * Find handler by type (first match)
   */
  private findHandlerByType(type: string): EventHandler | undefined {
    for (const handler of this.eventHandlers.values()) {
      if (handler.type === type) {
        return handler;
      }
    }
    return undefined;
  }

  /**
   * Get pooled event object
   */
  private getPooledEvent(type: string, data: any): { type: string; data: any; timestamp: number } {
    if (this.config.enableEventPooling && this.eventPool.length > 0) {
      const event = this.eventPool.pop()!;
      event.type = type;
      event.data = data;
      event.timestamp = performance.now();
      this.stats.pooledEvents++;
      return event;
    }

    return {
      type,
      data,
      timestamp: performance.now()
    };
  }

  /**
   * Return event to pool
   */
  private returnEventToPool(event: { type: string; data: any; timestamp: number }): void {
    if (this.config.enableEventPooling && this.eventPool.length < 100) {
      // Reset event
      event.type = '';
      event.data = null;
      event.timestamp = 0;
      this.eventPool.push(event);
    }
  }

  /**
   * Throttle function
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number = this.config.throttleDelay
  ): T {
    let lastCall = 0;
    let timeoutId: number | null = null;

    return ((...args: Parameters<T>) => {
      const now = performance.now();
      
      if (now - lastCall >= delay) {
        lastCall = now;
        return func(...args);
      } else if (!timeoutId) {
        timeoutId = window.setTimeout(() => {
          lastCall = performance.now();
          timeoutId = null;
          func(...args);
        }, delay - (now - lastCall));
      }
    }) as T;
  }

  /**
   * Debounce function
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number = this.config.debounceDelay
  ): T {
    let timeoutId: number | null = null;

    return ((...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = window.setTimeout(() => {
        timeoutId = null;
        func(...args);
      }, delay);
    }) as T;
  }

  /**
   * Batch event handlers
   */
  batchEvents(events: Array<{ type: string; data: any }>): void {
    for (const event of events) {
      this.handleEvent(event.type, event.data);
    }
  }

  /**
   * Get event stats
   */
  getStats(): EventStats {
    return { ...this.stats };
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.stats.eventListeners > this.config.maxEventListeners * 0.8) {
      recommendations.push('High event listener count. Consider using event delegation or removing unused listeners.');
    }

    if (this.stats.throttledEvents > this.stats.totalEvents * 0.5) {
      recommendations.push('Many throttled events. Consider increasing throttle delay or reducing event frequency.');
    }

    if (this.stats.droppedEvents > 0) {
      recommendations.push(`${this.stats.droppedEvents} events dropped. Consider increasing max event listeners or optimizing event handling.`);
    }

    if (this.stats.averageEventTime > 5) {
      recommendations.push('Slow event processing. Consider optimizing event handlers or using batching.');
    }

    return recommendations;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    // Clear all timeouts
    for (const timeoutId of this.debouncedHandlers.values()) {
      clearTimeout(timeoutId);
    }

    // Remove all event handlers
    for (const handler of this.eventHandlers.values()) {
      if (!this.config.enableEventDelegation) {
        handler.element.off(handler.type, handler.handler);
      }
    }

    this.eventHandlers.clear();
    this.eventQueue = [];
    this.throttledHandlers.clear();
    this.debouncedHandlers.clear();
    this.eventPool = [];
    this.reset();
  }

  /**
   * Reset stats
   */
  reset(): void {
    this.stats = {
      totalEvents: 0,
      throttledEvents: 0,
      debouncedEvents: 0,
      delegatedEvents: 0,
      pooledEvents: 0,
      eventListeners: 0,
      averageEventTime: 0,
      droppedEvents: 0
    };
  }
}

export default EventOptimizer;
