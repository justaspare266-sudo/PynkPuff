/**
 * 🧠 MasterEditorDiagnostics - Comprehensive Diagnostic System
 * Self-contained diagnostic system for the Master Image Editor
 * Monitors tool behavior, state changes, and performance
 */

import { TextEngineDiagnostics, validateTextEngine, PerformanceMonitor, AutoCorrector } from './TextEngineDiagnostics';

export interface ToolDiagnostic {
  toolName: string;
  isActive: boolean;
  lastUsed: number;
  usageCount: number;
  errors: string[];
  warnings: string[];
  performance: {
    averageResponseTime: number;
    memoryUsage: number;
  };
}

export interface EditorState {
  selectedTool: string;
  selectedShapeIds: string[];
  shapes: any[];
  layers: any[];
  canvasSize: { width: number; height: number };
  viewportZoom: number;
  isDrawing: boolean;
  dragState: any;
  cropArea: any;
}

export interface DiagnosticReport {
  timestamp: number;
  overallHealth: 'healthy' | 'warning' | 'error';
  tools: ToolDiagnostic[];
  state: {
    isValid: boolean;
    issues: string[];
  };
  performance: {
    renderTime: number;
    memoryUsage: number;
    fps: number;
  };
  suggestions: string[];
}

export class MasterEditorDiagnostics {
  private static instance: MasterEditorDiagnostics;
  private toolMetrics: Map<string, ToolDiagnostic> = new Map();
  private stateHistory: EditorState[] = [];
  private performanceHistory: any[] = [];
  private isEnabled: boolean = false;

  static getInstance(): MasterEditorDiagnostics {
    if (!MasterEditorDiagnostics.instance) {
      MasterEditorDiagnostics.instance = new MasterEditorDiagnostics();
    }
    return MasterEditorDiagnostics.instance;
  }

  enable(): void {
    this.isEnabled = true;
    console.log('🧠 Master Editor Diagnostics enabled');
  }

  disable(): void {
    this.isEnabled = false;
    console.log('🧠 Master Editor Diagnostics disabled');
  }

  // Tool monitoring
  trackToolUsage(toolName: string, action: string, duration?: number): void {
    if (!this.isEnabled) return;

    if (!this.toolMetrics.has(toolName)) {
      this.toolMetrics.set(toolName, {
        toolName,
        isActive: false,
        lastUsed: 0,
        usageCount: 0,
        errors: [],
        warnings: [],
        performance: {
          averageResponseTime: 0,
          memoryUsage: 0
        }
      });
    }

    const tool = this.toolMetrics.get(toolName)!;
    tool.lastUsed = Date.now();
    tool.usageCount++;
    
    if (action === 'activate') {
      tool.isActive = true;
    } else if (action === 'deactivate') {
      tool.isActive = false;
    }

    if (duration) {
      tool.performance.averageResponseTime = 
        (tool.performance.averageResponseTime + duration) / 2;
    }
  }

  // State validation
  validateEditorState(state: EditorState): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Validate selected tool
    if (!state.selectedTool) {
      issues.push('No tool selected');
    }

    // Validate shapes
    if (state.shapes.length === 0 && state.selectedShapeIds.length > 0) {
      issues.push('Selected shapes reference non-existent shapes');
    }

    // Validate canvas size
    if (state.canvasSize.width <= 0 || state.canvasSize.height <= 0) {
      issues.push('Invalid canvas dimensions');
    }

    // Validate zoom
    if (state.viewportZoom <= 0 || state.viewportZoom > 10) {
      issues.push('Viewport zoom is out of reasonable range');
    }

    // Validate drag state
    if (state.dragState?.isActive && !state.dragState.startPos) {
      issues.push('Drag state is active but missing start position');
    }

    // Validate crop area
    if (state.cropArea && (state.cropArea.width <= 0 || state.cropArea.height <= 0)) {
      issues.push('Crop area has invalid dimensions');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  // Performance monitoring
  trackPerformance(operation: string, duration: number): void {
    if (!this.isEnabled) return;

    this.performanceHistory.push({
      operation,
      duration,
      timestamp: Date.now(),
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
    });

    // Keep only last 100 entries
    if (this.performanceHistory.length > 100) {
      this.performanceHistory.shift();
    }
  }

  // Event monitoring
  trackEvent(eventType: string, data: any): void {
    if (!this.isEnabled) return;

    console.log(`🧠 Event: ${eventType}`, data);

    // Detect potential issues
    if (eventType === 'tool_click' && data.tool === 'gradient' && !data.selectedShapes?.length) {
      console.warn('🧠 Warning: Gradient tool used without selected shapes');
    }

    if (eventType === 'shape_create' && data.type === 'text' && !data.text?.trim()) {
      console.warn('🧠 Warning: Empty text shape created');
    }

    if (eventType === 'drag_start' && !data.startPos) {
      console.error('🧠 Error: Drag started without start position');
    }
  }

  // Generate comprehensive report
  generateReport(): DiagnosticReport {
    const now = Date.now();
    const recentPerformance = this.performanceHistory
      .filter(p => now - p.timestamp < 60000) // Last minute
      .map(p => p.duration);

    const avgRenderTime = recentPerformance.length > 0 
      ? recentPerformance.reduce((a, b) => a + b, 0) / recentPerformance.length 
      : 0;

    const currentMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const fps = this.calculateFPS();

    const toolIssues = Array.from(this.toolMetrics.values())
      .filter(tool => tool.errors.length > 0 || tool.warnings.length > 0);

    const overallHealth = toolIssues.length === 0 ? 'healthy' : 
                         toolIssues.some(t => t.errors.length > 0) ? 'error' : 'warning';

    return {
      timestamp: now,
      overallHealth,
      tools: Array.from(this.toolMetrics.values()),
      state: {
        isValid: true, // Will be set by validateEditorState
        issues: []
      },
      performance: {
        renderTime: avgRenderTime,
        memoryUsage: currentMemory,
        fps
      },
      suggestions: this.generateSuggestions()
    };
  }

  private calculateFPS(): number {
    // Simplified FPS calculation
    const recentFrames = this.performanceHistory
      .filter(p => p.operation === 'render' && Date.now() - p.timestamp < 1000)
      .length;
    return recentFrames;
  }

  private generateSuggestions(): string[] {
    const suggestions: string[] = [];

    // Tool usage suggestions
    const unusedTools = Array.from(this.toolMetrics.values())
      .filter(tool => tool.usageCount === 0);
    
    if (unusedTools.length > 0) {
      suggestions.push(`Consider using unused tools: ${unusedTools.map(t => t.toolName).join(', ')}`);
    }

    // Performance suggestions
    const slowOperations = this.performanceHistory
      .filter(p => p.duration > 100)
      .map(p => p.operation);

    if (slowOperations.length > 0) {
      suggestions.push(`Optimize slow operations: ${[...new Set(slowOperations)].join(', ')}`);
    }

    // Memory suggestions
    const currentMemory = (performance as any).memory?.usedJSHeapSize || 0;
    if (currentMemory > 50 * 1024 * 1024) { // 50MB
      suggestions.push('Consider clearing unused shapes or reducing canvas size');
    }

    return suggestions;
  }

  // Auto-correction
  autoCorrect(state: EditorState): EditorState {
    const corrected = { ...state };

    // Fix zoom
    if (corrected.viewportZoom <= 0) {
      corrected.viewportZoom = 1;
    } else if (corrected.viewportZoom > 10) {
      corrected.viewportZoom = 10;
    }

    // Fix canvas size
    if (corrected.canvasSize.width <= 0) {
      corrected.canvasSize.width = 800;
    }
    if (corrected.canvasSize.height <= 0) {
      corrected.canvasSize.height = 600;
    }

    // Fix selected shapes
    corrected.selectedShapeIds = corrected.selectedShapeIds.filter(id => 
      corrected.shapes.some(shape => shape.id === id)
    );

    return corrected;
  }

  // Export diagnostics for browser extension
  exportDiagnostics(): any {
    return {
      toolMetrics: Object.fromEntries(this.toolMetrics),
      stateHistory: this.stateHistory.slice(-50), // Last 50 states
      performanceHistory: this.performanceHistory.slice(-100), // Last 100 operations
      report: this.generateReport()
    };
  }
}

// Global instance
export const diagnostics = MasterEditorDiagnostics.getInstance();
