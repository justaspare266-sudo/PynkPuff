/**
 * Master-level History Manager for Undo/Redo System
 * Provides comprehensive history tracking with memory optimization
 */

export interface HistoryState {
  id: string;
  timestamp: number;
  action: string;
  description: string;
  data: any;
  elementIds: string[];
  category: 'create' | 'modify' | 'delete' | 'transform' | 'group' | 'ungroup' | 'layer' | 'style' | 'animation';
  isUndoable: boolean;
  isRedoable: boolean;
  memorySize: number; // estimated memory usage in bytes
}

export interface HistoryConfig {
  maxHistorySize: number; // maximum number of history states
  maxMemoryUsage: number; // maximum memory usage in MB
  compressionEnabled: boolean;
  compressionThreshold: number; // compress states larger than this (in bytes)
  autoSave: boolean;
  autoSaveInterval: number; // in milliseconds
  groupSimilarActions: boolean;
  groupTimeWindow: number; // group actions within this time window (in milliseconds)
}

export class HistoryManager {
  private history: HistoryState[] = [];
  private currentIndex: number = -1;
  private config: HistoryConfig;
  private isGrouping: boolean = false;
  private currentGroup: HistoryState[] = [];
  private groupStartTime: number = 0;
  private autoSaveTimer: number | null = null;
  private memoryUsage: number = 0;

  constructor(config: Partial<HistoryConfig> = {}) {
    this.config = {
      maxHistorySize: 100,
      maxMemoryUsage: 50, // 50MB
      compressionEnabled: true,
      compressionThreshold: 1024, // 1KB
      autoSave: false,
      autoSaveInterval: 30000, // 30 seconds
      groupSimilarActions: true,
      groupTimeWindow: 1000, // 1 second
      ...config
    };

    if (this.config.autoSave) {
      this.startAutoSave();
    }
  }

  /**
   * Add a new state to history
   */
  addState(
    action: string,
    description: string,
    data: any,
    elementIds: string[] = [],
    category: HistoryState['category'] = 'modify'
  ): void {
    const state: HistoryState = {
      id: `state-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      action,
      description,
      data: this.config.compressionEnabled ? this.compressData(data) : data,
      elementIds,
      category,
      isUndoable: true,
      isRedoable: false,
      memorySize: this.estimateMemoryUsage(data)
    };

    // Check if we should group this action
    if (this.config.groupSimilarActions && this.shouldGroupAction(state)) {
      this.addToGroup(state);
      return;
    }

    // Clear redo history if we're not at the end
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add new state
    this.history.push(state);
    this.currentIndex = this.history.length - 1;
    this.memoryUsage += state.memorySize;

    // Cleanup if necessary
    this.cleanupHistory();

    // Update redoable flags
    this.updateRedoableFlags();
  }

  /**
   * Undo the last action
   */
  undo(): HistoryState | null {
    if (!this.canUndo()) return null;

    const state = this.history[this.currentIndex];
    this.currentIndex--;
    this.updateRedoableFlags();
    
    return state;
  }

  /**
   * Redo the next action
   */
  redo(): HistoryState | null {
    if (!this.canRedo()) return null;

    this.currentIndex++;
    const state = this.history[this.currentIndex];
    this.updateRedoableFlags();
    
    return state;
  }

  /**
   * Check if undo is possible
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * Check if redo is possible
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current state
   */
  getCurrentState(): HistoryState | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * Get all history states
   */
  getHistory(): HistoryState[] {
    return [...this.history];
  }

  /**
   * Get history states for specific elements
   */
  getElementHistory(elementIds: string[]): HistoryState[] {
    return this.history.filter(state => 
      state.elementIds.some(id => elementIds.includes(id))
    );
  }

  /**
   * Get history states by category
   */
  getHistoryByCategory(category: HistoryState['category']): HistoryState[] {
    return this.history.filter(state => state.category === category);
  }

  /**
   * Clear all history
   */
  clearHistory(): void {
    this.history = [];
    this.currentIndex = -1;
    this.memoryUsage = 0;
    this.updateRedoableFlags();
  }

  /**
   * Clear history for specific elements
   */
  clearElementHistory(elementIds: string[]): void {
    this.history = this.history.filter(state => 
      !state.elementIds.some(id => elementIds.includes(id))
    );
    this.currentIndex = Math.min(this.currentIndex, this.history.length - 1);
    this.updateRedoableFlags();
  }

  /**
   * Get history statistics
   */
  getStatistics(): {
    totalStates: number;
    memoryUsage: number;
    undoableStates: number;
    redoableStates: number;
    categories: Record<string, number>;
    averageStateSize: number;
  } {
    const categories = this.history.reduce((acc, state) => {
      acc[state.category] = (acc[state.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalStates: this.history.length,
      memoryUsage: this.memoryUsage,
      undoableStates: this.history.filter(state => state.isUndoable).length,
      redoableStates: this.history.filter(state => state.isRedoable).length,
      categories,
      averageStateSize: this.history.length > 0 ? this.memoryUsage / this.history.length : 0
    };
  }

  /**
   * Export history data
   */
  exportHistory(): string {
    const exportData = {
      history: this.history,
      currentIndex: this.currentIndex,
      config: this.config,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import history data
   */
  importHistory(data: string): void {
    try {
      const importData = JSON.parse(data);
      this.history = importData.history || [];
      this.currentIndex = importData.currentIndex || -1;
      this.updateRedoableFlags();
    } catch (error) {
      console.error('Failed to import history:', error);
    }
  }

  /**
   * Start grouping actions
   */
  startGrouping(): void {
    this.isGrouping = true;
    this.currentGroup = [];
    this.groupStartTime = Date.now();
  }

  /**
   * End grouping actions
   */
  endGrouping(): void {
    if (!this.isGrouping || this.currentGroup.length === 0) {
      this.isGrouping = false;
      return;
    }

    // Create a grouped state
    const groupedState: HistoryState = {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: this.groupStartTime,
      action: 'group',
      description: `${this.currentGroup.length} actions grouped`,
      data: this.currentGroup.map(state => state.data),
      elementIds: Array.from(new Set(this.currentGroup.flatMap(state => state.elementIds))),
      category: 'group',
      isUndoable: true,
      isRedoable: false,
      memorySize: this.currentGroup.reduce((sum, state) => sum + state.memorySize, 0)
    };

    // Add grouped state
    this.history.push(groupedState);
    this.currentIndex = this.history.length - 1;
    this.memoryUsage += groupedState.memorySize;

    // Reset grouping
    this.isGrouping = false;
    this.currentGroup = [];
    this.groupStartTime = 0;

    // Cleanup and update
    this.cleanupHistory();
    this.updateRedoableFlags();
  }

  /**
   * Get memory usage in MB
   */
  getMemoryUsage(): number {
    return this.memoryUsage / (1024 * 1024);
  }

  /**
   * Check if memory usage is within limits
   */
  isMemoryUsageWithinLimits(): boolean {
    return this.getMemoryUsage() < this.config.maxMemoryUsage;
  }

  // Private methods

  private shouldGroupAction(state: HistoryState): boolean {
    if (!this.isGrouping) return false;
    
    const timeDiff = state.timestamp - this.groupStartTime;
    return timeDiff < this.config.groupTimeWindow;
  }

  private addToGroup(state: HistoryState): void {
    this.currentGroup.push(state);
  }

  private compressData(data: any): any {
    if (this.config.compressionEnabled && this.estimateMemoryUsage(data) > this.config.compressionThreshold) {
      // Simple compression - in a real implementation, you'd use a proper compression library
      return {
        compressed: true,
        data: JSON.stringify(data)
      };
    }
    return data;
  }

  private decompressData(data: any): any {
    if (data && typeof data === 'object' && data.compressed) {
      try {
        return JSON.parse(data.data);
      } catch (error) {
        console.error('Failed to decompress data:', error);
        return data;
      }
    }
    return data;
  }

  private estimateMemoryUsage(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch (error) {
      return 1024; // fallback estimate
    }
  }

  private cleanupHistory(): void {
    // Remove old states if we exceed max history size
    while (this.history.length > this.config.maxHistorySize) {
      const removedState = this.history.shift();
      if (removedState) {
        this.memoryUsage -= removedState.memorySize;
        this.currentIndex--;
      }
    }

    // Remove states if memory usage is too high
    while (this.getMemoryUsage() > this.config.maxMemoryUsage && this.history.length > 1) {
      const removedState = this.history.shift();
      if (removedState) {
        this.memoryUsage -= removedState.memorySize;
        this.currentIndex--;
      }
    }
  }

  private updateRedoableFlags(): void {
    this.history.forEach((state, index) => {
      state.isUndoable = index <= this.currentIndex;
      state.isRedoable = index > this.currentIndex;
    });
  }

  private startAutoSave(): void {
    this.autoSaveTimer = window.setInterval(() => {
      // Auto-save logic would go here
      console.log('Auto-saving history...');
    }, this.config.autoSaveInterval);
  }

  private stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopAutoSave();
    this.clearHistory();
  }
}

export default HistoryManager;
