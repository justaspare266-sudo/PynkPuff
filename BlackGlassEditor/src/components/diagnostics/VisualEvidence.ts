/**
 * 📸 VisualEvidence - Captures screenshots and visual context when failures occur
 * This bridges the gap between abstract error messages and visual understanding
 */

export interface VisualEvidence {
  id: string;
  timestamp: number;
  actionId: string;
  elementId: string;
  screenshot: string;
  elementBounds: { x: number; y: number; width: number; height: number };
  viewport: { width: number; height: number };
  beforeAfter?: {
    before: string;
    after: string;
  };
}

export class VisualEvidenceCapture {
  private static instance: VisualEvidenceCapture;
  private evidence: VisualEvidence[] = [];

  static getInstance(): VisualEvidenceCapture {
    if (!VisualEvidenceCapture.instance) {
      VisualEvidenceCapture.instance = new VisualEvidenceCapture();
    }
    return VisualEvidenceCapture.instance;
  }

  // Capture visual evidence when a failure occurs
  async captureFailureEvidence(
    actionId: string,
    elementId: string,
    element: HTMLElement | null
  ): Promise<VisualEvidence> {
    const timestamp = Date.now();
    
    // Capture screenshot of the entire viewport
    const screenshot = await this.captureScreenshot();
    
    // Get element bounds if element exists
    const elementBounds = element ? this.getElementBounds(element) : { x: 0, y: 0, width: 0, height: 0 };
    
    // Get viewport dimensions
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const evidence: VisualEvidence = {
      id: `evidence-${timestamp}`,
      timestamp,
      actionId,
      elementId,
      screenshot,
      elementBounds,
      viewport
    };

    this.evidence.push(evidence);
    return evidence;
  }

  // Capture before/after screenshots for drag operations
  async captureBeforeAfter(
    actionId: string,
    elementId: string,
    element: HTMLElement | null
  ): Promise<{ before: string; after: string }> {
    const before = await this.captureScreenshot();
    
    // Wait a moment for any animations to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const after = await this.captureScreenshot();
    
    return { before, after };
  }

  private async captureScreenshot(): Promise<string> {
    try {
      // Use html2canvas if available, otherwise fallback to canvas
      if (typeof window !== 'undefined' && (window as any).html2canvas) {
        const canvas = await (window as any).html2canvas(document.body, {
          useCORS: true,
          allowTaint: true,
          scale: 0.5 // Reduce size for performance
        });
        return canvas.toDataURL('image/png');
      } else {
        // Fallback: create a simple representation
        return this.createFallbackScreenshot();
      }
    } catch (error) {
      console.warn('Failed to capture screenshot:', error);
      return this.createFallbackScreenshot();
    }
  }

  private createFallbackScreenshot(): string {
    // Create a simple canvas representation
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
    
    return canvas.toDataURL('image/png');
  }

  private getElementBounds(element: HTMLElement): { x: number; y: number; width: number; height: number } {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    };
  }

  // Get evidence for a specific action
  getEvidenceForAction(actionId: string): VisualEvidence[] {
    return this.evidence.filter(e => e.actionId === actionId);
  }

  // Get all evidence
  getAllEvidence(): VisualEvidence[] {
    return [...this.evidence];
  }

  // Clear old evidence (keep last 50)
  cleanup(): void {
    if (this.evidence.length > 50) {
      this.evidence = this.evidence.slice(-50);
    }
  }

  // Export evidence for analysis
  exportEvidence(): any {
    return {
      totalEvidence: this.evidence.length,
      evidence: this.evidence,
      summary: this.generateSummary()
    };
  }

  private generateSummary(): any {
    const failures = this.evidence.filter(e => e.elementBounds.width === 0);
    const offScreen = this.evidence.filter(e => 
      e.elementBounds.x < 0 || 
      e.elementBounds.y < 0 || 
      e.elementBounds.x > e.viewport.width || 
      e.elementBounds.y > e.viewport.height
    );

    return {
      totalCaptures: this.evidence.length,
      invisibleElements: failures.length,
      offScreenElements: offScreen.length,
      commonViewportSizes: this.getCommonViewportSizes()
    };
  }

  private getCommonViewportSizes(): Record<string, number> {
    const sizes: Record<string, number> = {};
    this.evidence.forEach(e => {
      const size = `${e.viewport.width}x${e.viewport.height}`;
      sizes[size] = (sizes[size] || 0) + 1;
    });
    return sizes;
  }
}

// Global instance
export const visualEvidence = VisualEvidenceCapture.getInstance();
