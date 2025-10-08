/**
 * 🎯 OutcomeTracker - Tracks actual outcomes vs expected outcomes
 * This addresses the fundamental flaw in browser recorders that only track actions, not results
 */

export interface ActionOutcome {
  actionId: string;
  actionType: string;
  timestamp: number;
  expectedResult: any;
  actualResult: any;
  success: boolean;
  deviation: number; // How far off from expected
  errorMessage?: string;
}

export interface DragOutcome extends ActionOutcome {
  actionType: 'drag';
  expectedResult: {
    startPos: { x: number; y: number };
    endPos: { x: number; y: number };
    elementId: string;
  };
  actualResult: {
    startPos: { x: number; y: number };
    endPos: { x: number; y: number };
    elementId: string;
    elementVisible: boolean;
    elementInBounds: boolean;
  };
}

export interface ClickOutcome extends ActionOutcome {
  actionType: 'click';
  expectedResult: {
    elementId: string;
    shouldSelect: boolean;
    shouldActivate: boolean;
  };
  actualResult: {
    elementId: string;
    wasSelected: boolean;
    wasActivated: boolean;
    elementExists: boolean;
    elementVisible: boolean;
  };
}

export class OutcomeTracker {
  private static instance: OutcomeTracker;
  private outcomes: ActionOutcome[] = [];
  private pendingActions: Map<string, any> = new Map();
  private alertSystem: any = null;
  private visualEvidence: any = null;

  static getInstance(): OutcomeTracker {
    if (!OutcomeTracker.instance) {
      OutcomeTracker.instance = new OutcomeTracker();
    }
    return OutcomeTracker.instance;
  }

  // Start tracking an action
  startAction(actionId: string, actionType: string, expectedResult: any): void {
    this.pendingActions.set(actionId, {
      actionType,
      expectedResult,
      timestamp: Date.now()
    });
  }

  // Complete an action and check outcome
  completeAction(actionId: string, actualResult: any): ActionOutcome {
    const pending = this.pendingActions.get(actionId);
    if (!pending) {
      throw new Error(`No pending action found for ${actionId}`);
    }

    const outcome = this.analyzeOutcome(pending, actualResult);
    this.outcomes.push(outcome);
    this.pendingActions.delete(actionId);
    
    // Trigger alerts and visual evidence if failure
    if (!outcome.success) {
      this.handleFailure(outcome, actualResult);
    }
    
    return outcome;
  }

  // Handle failure by triggering alerts and capturing evidence
  private async handleFailure(outcome: ActionOutcome, actualResult: any): Promise<void> {
    // Trigger alerts
    if (this.alertSystem) {
      this.alertSystem.checkOutcome(outcome);
    }

    // Capture visual evidence
    if (this.visualEvidence) {
      try {
        const element = document.getElementById(actualResult.elementId);
        await this.visualEvidence.captureFailureEvidence(
          outcome.actionId,
          actualResult.elementId,
          element
        );
      } catch (error) {
        console.warn('Failed to capture visual evidence:', error);
      }
    }
  }

  // Set alert system
  setAlertSystem(alertSystem: any): void {
    this.alertSystem = alertSystem;
  }

  // Set visual evidence system
  setVisualEvidence(visualEvidence: any): void {
    this.visualEvidence = visualEvidence;
  }

  private analyzeOutcome(pending: any, actualResult: any): ActionOutcome {
    const { actionType, expectedResult, timestamp } = pending;
    
    let success = true;
    let deviation = 0;
    let errorMessage: string | undefined;

    switch (actionType) {
      case 'drag':
        success = this.analyzeDragOutcome(expectedResult, actualResult);
        deviation = this.calculateDragDeviation(expectedResult, actualResult);
        if (!success) {
          errorMessage = this.getDragErrorMessage(expectedResult, actualResult);
        }
        break;
        
      case 'click':
        success = this.analyzeClickOutcome(expectedResult, actualResult);
        if (!success) {
          errorMessage = this.getClickErrorMessage(expectedResult, actualResult);
        }
        break;
        
      default:
        success = this.deepEqual(expectedResult, actualResult);
        if (!success) {
          errorMessage = 'Expected result does not match actual result';
        }
    }

    return {
      actionId: this.generateActionId(),
      actionType,
      timestamp,
      expectedResult,
      actualResult,
      success,
      deviation,
      errorMessage
    };
  }

  private analyzeDragOutcome(expected: any, actual: any): boolean {
    // Check if element actually moved (user's primary expectation)
    const expectedDistance = this.calculateDistance(expected.startPos, expected.endPos);
    const actualDistance = this.calculateDistance(actual.startPos, actual.endPos);
    
    // Allow for small tolerance (5px) - user might not be pixel-perfect
    const distanceMatch = Math.abs(expectedDistance - actualDistance) < 5;
    
    // Check if element is still visible and in bounds (user expects it to be usable)
    const visibilityMatch = actual.elementVisible && actual.elementInBounds;
    
    // Check if element ID matches (user expects same element)
    const idMatch = expected.elementId === actual.elementId;
    
    // Check if element actually moved from start position (user's core intent)
    const actuallyMoved = this.calculateDistance(actual.startPos, actual.endPos) > 1;
    
    // Check if element moved in the right direction (user's directional intent)
    const directionMatch = this.checkDirectionMatch(expected, actual);
    
    return distanceMatch && visibilityMatch && idMatch && actuallyMoved && directionMatch;
  }

  private analyzeClickOutcome(expected: any, actual: any): boolean {
    return (
      expected.elementId === actual.elementId &&
      expected.shouldSelect === actual.wasSelected &&
      expected.shouldActivate === actual.wasActivated &&
      actual.elementExists &&
      actual.elementVisible
    );
  }

  private calculateDragDeviation(expected: any, actual: any): number {
    const expectedEnd = expected.endPos;
    const actualEnd = actual.endPos;
    
    return Math.sqrt(
      Math.pow(expectedEnd.x - actualEnd.x, 2) + 
      Math.pow(expectedEnd.y - actualEnd.y, 2)
    );
  }

  private calculateDistance(pos1: { x: number; y: number }, pos2: { x: number; y: number }): number {
    return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
  }

  private checkDirectionMatch(expected: any, actual: any): boolean {
    // Calculate expected direction vector
    const expectedDx = expected.endPos.x - expected.startPos.x;
    const expectedDy = expected.endPos.y - expected.startPos.y;
    
    // Calculate actual direction vector
    const actualDx = actual.endPos.x - actual.startPos.x;
    const actualDy = actual.endPos.y - actual.startPos.y;
    
    // If both are zero (no movement), that's a match
    if (expectedDx === 0 && expectedDy === 0 && actualDx === 0 && actualDy === 0) {
      return true;
    }
    
    // Calculate dot product to check if directions are similar
    const dotProduct = expectedDx * actualDx + expectedDy * actualDy;
    const expectedMagnitude = Math.sqrt(expectedDx * expectedDx + expectedDy * expectedDy);
    const actualMagnitude = Math.sqrt(actualDx * actualDx + actualDy * actualDy);
    
    // Avoid division by zero
    if (expectedMagnitude === 0 || actualMagnitude === 0) {
      return expectedMagnitude === actualMagnitude;
    }
    
    // Calculate cosine similarity (1 = same direction, -1 = opposite direction)
    const cosineSimilarity = dotProduct / (expectedMagnitude * actualMagnitude);
    
    // Allow for some tolerance in direction (0.7 = roughly 45 degrees)
    return cosineSimilarity > 0.7;
  }

  private getDragErrorMessage(expected: any, actual: any): string {
    if (expected.elementId !== actual.elementId) {
      return `Element ID mismatch: expected ${expected.elementId}, got ${actual.elementId}`;
    }
    
    if (!actual.elementVisible) {
      return 'Element became invisible after drag - user expects it to remain visible';
    }
    
    if (!actual.elementInBounds) {
      return 'Element flew off screen - user expects it to stay within canvas bounds';
    }
    
    const deviation = this.calculateDragDeviation(expected, actual);
    if (deviation > 5) {
      return `Element did not move to where user released mouse (deviation: ${deviation.toFixed(2)}px)`;
    }
    
    // Check if element didn't move at all
    const actualDistance = this.calculateDistance(actual.startPos, actual.endPos);
    if (actualDistance < 1) {
      return 'Element did not move despite drag action - user expects movement';
    }
    
    // Check direction mismatch
    const expectedDx = expected.endPos.x - expected.startPos.x;
    const expectedDy = expected.endPos.y - expected.startPos.y;
    const actualDx = actual.endPos.x - actual.startPos.x;
    const actualDy = actual.endPos.y - actual.startPos.y;
    
    if (expectedDx !== 0 || expectedDy !== 0) {
      const dotProduct = expectedDx * actualDx + expectedDy * actualDy;
      const expectedMagnitude = Math.sqrt(expectedDx * expectedDx + expectedDy * expectedDy);
      const actualMagnitude = Math.sqrt(actualDx * actualDx + actualDy * actualDy);
      
      if (expectedMagnitude > 0 && actualMagnitude > 0) {
        const cosineSimilarity = dotProduct / (expectedMagnitude * actualMagnitude);
        if (cosineSimilarity < 0.7) {
          return `Element moved in wrong direction - user dragged ${expectedDx > 0 ? 'right' : 'left'}, ${expectedDy > 0 ? 'down' : 'up'} but element went ${actualDx > 0 ? 'right' : 'left'}, ${actualDy > 0 ? 'down' : 'up'}`;
        }
      }
    }
    
    return 'Unknown drag error';
  }

  private getClickErrorMessage(expected: any, actual: any): string {
    if (expected.elementId !== actual.elementId) {
      return `Element ID mismatch: expected ${expected.elementId}, got ${actual.elementId}`;
    }
    
    if (!actual.elementExists) {
      return 'Element does not exist';
    }
    
    if (!actual.elementVisible) {
      return 'Element is not visible';
    }
    
    if (expected.shouldSelect && !actual.wasSelected) {
      return 'Element was not selected as expected';
    }
    
    if (expected.shouldActivate && !actual.wasActivated) {
      return 'Element was not activated as expected';
    }
    
    return 'Unknown click error';
  }

  private deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== typeof obj2) return false;
    
    if (typeof obj1 === 'object') {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      
      if (keys1.length !== keys2.length) return false;
      
      for (let key of keys1) {
        if (!keys2.includes(key)) return false;
        if (!this.deepEqual(obj1[key], obj2[key])) return false;
      }
      
      return true;
    }
    
    return false;
  }

  private generateActionId(): string {
    return `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get outcomes for analysis
  getOutcomes(): ActionOutcome[] {
    return [...this.outcomes];
  }

  // Get failed outcomes
  getFailedOutcomes(): ActionOutcome[] {
    return this.outcomes.filter(outcome => !outcome.success);
  }

  // Get outcomes by type
  getOutcomesByType(actionType: string): ActionOutcome[] {
    return this.outcomes.filter(outcome => outcome.actionType === actionType);
  }

  // Get success rate
  getSuccessRate(): number {
    if (this.outcomes.length === 0) return 0;
    const successful = this.outcomes.filter(outcome => outcome.success).length;
    return (successful / this.outcomes.length) * 100;
  }

  // Get average deviation for drag operations
  getAverageDragDeviation(): number {
    const dragOutcomes = this.getOutcomesByType('drag');
    if (dragOutcomes.length === 0) return 0;
    
    const totalDeviation = dragOutcomes.reduce((sum, outcome) => sum + outcome.deviation, 0);
    return totalDeviation / dragOutcomes.length;
  }

  // Export outcomes for analysis
  exportOutcomes(): any {
    return {
      totalActions: this.outcomes.length,
      successRate: this.getSuccessRate(),
      averageDragDeviation: this.getAverageDragDeviation(),
      failedOutcomes: this.getFailedOutcomes(),
      allOutcomes: this.outcomes
    };
  }
}

// Global instance
export const outcomeTracker = OutcomeTracker.getInstance();
