/**
 * 🧠 TextEngineDiagnostics - Modular Diagnostic Library
 * Self-contained diagnostic system for the Advanced Text Engine
 * Can be expanded into a browser extension for broader debugging
 */

export interface DiagnosticRule {
  required?: boolean;
  type?: string;
  structure?: string;
  min?: number;
  max?: number;
  allowed?: string[];
  format?: RegExp;
  error: string;
  fix: string;
  expectedAfter?: string[];
}

export interface DiagnosticConfig {
  [key: string]: DiagnosticRule;
}

export const TextEngineDiagnostics: DiagnosticConfig = {
  canvasRef: {
    required: true,
    type: 'HTMLCanvasElement',
    error: 'Canvas reference is missing or invalid.',
    fix: 'Ensure canvasRef.current is set before calling renderCanvas().'
  },
  ctx: {
    required: true,
    type: 'CanvasRenderingContext2D',
    error: 'Canvas context is null.',
    fix: 'Check that canvas.getContext("2d") returns a valid context.'
  },
  textDoc: {
    required: true,
    structure: 'Array of ops with non-empty insert strings',
    error: 'TextDocument is malformed or empty.',
    fix: 'Ensure ops contain valid insert strings and attributes.'
  },
  fontSize: {
    min: 8,
    max: 128,
    error: 'Font size is out of bounds.',
    fix: 'Use a font size between 8 and 128 for readability and canvas fit.'
  },
  fontFamily: {
    allowed: ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Inter', 'Roboto', 'Open Sans'],
    error: 'Unsupported font family.',
    fix: 'Select a font from the allowed list or extend the validator.'
  },
  textColor: {
    required: true,
    format: /^#([0-9A-F]{3}){1,2}$/i,
    error: 'Invalid text color format.',
    fix: 'Use a valid hex color code like #000000.'
  },
  alignment: {
    allowed: ['left', 'center', 'right', 'justify'],
    error: 'Invalid alignment value.',
    fix: 'Set alignment to one of: left, center, right, justify.'
  },
  lifecycle: {
    renderCanvas: {
      error: 'renderCanvas() fired before dependencies were ready.',
      fix: 'Ensure renderCanvas is called after all relevant state updates.'
    }
  }
};

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  performance: {
    renderTime?: number;
    memoryUsage?: number;
  };
}

export function validateTextEngine({
  canvasRef,
  ctx,
  textDoc,
  fontSize,
  fontFamily,
  textColor,
  alignment
}: {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D | null;
  textDoc: any;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  alignment: string;
}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Canvas validation
  if (!canvasRef?.current) {
    errors.push(TextEngineDiagnostics.canvasRef.error);
  } else {
    suggestions.push(TextEngineDiagnostics.canvasRef.fix);
  }

  // Context validation
  if (!ctx) {
    errors.push(TextEngineDiagnostics.ctx.error);
  }

  // Text document validation
  if (!textDoc?.ops?.length || !textDoc.ops[0]?.insert) {
    errors.push(TextEngineDiagnostics.textDoc.error);
  } else {
    // Check for empty text
    const hasContent = textDoc.ops.some((op: any) => op.insert && op.insert.trim().length > 0);
    if (!hasContent) {
      warnings.push('Text document contains no visible content.');
    }
  }

  // Font size validation
  if (fontSize < TextEngineDiagnostics.fontSize.min! || fontSize > TextEngineDiagnostics.fontSize.max!) {
    errors.push(TextEngineDiagnostics.fontSize.error);
  } else if (fontSize < 12) {
    warnings.push('Font size is quite small and may be hard to read.');
  }

  // Font family validation
  if (!TextEngineDiagnostics.fontFamily.allowed!.includes(fontFamily)) {
    errors.push(TextEngineDiagnostics.fontFamily.error);
  }

  // Color validation
  if (!TextEngineDiagnostics.textColor.format!.test(textColor)) {
    errors.push(TextEngineDiagnostics.textColor.error);
  }

  // Alignment validation
  if (!TextEngineDiagnostics.alignment.allowed!.includes(alignment)) {
    errors.push(TextEngineDiagnostics.alignment.error);
  }

  // Performance suggestions
  if (textDoc?.ops?.length > 10) {
    suggestions.push('Consider optimizing text operations for better performance.');
  }

  if (fontSize > 72) {
    suggestions.push('Large font sizes may impact rendering performance.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    performance: {
      renderTime: performance.now() // Placeholder for actual timing
    }
  };
}

// Performance monitoring
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();
  private static metrics: Map<string, any[]> = new Map();

  static startTimer(label: string): void {
    this.timers.set(label, performance.now());
  }

  static endTimer(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.timers.delete(label);
    
    // Store metric
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(duration);
    
    return duration;
  }

  static getAverageTime(label: string): number {
    const times = this.metrics.get(label) || [];
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  static getMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [label, times] of this.metrics.entries()) {
      result[label] = {
        count: times.length,
        average: this.getAverageTime(label),
        min: Math.min(...times),
        max: Math.max(...times),
        last: times[times.length - 1]
      };
    }
    return result;
  }
}

// Auto-correction utilities
export class AutoCorrector {
  static fixTextColor(color: string): string {
    if (!TextEngineDiagnostics.textColor.format!.test(color)) {
      // Try to fix common color issues
      if (color.startsWith('rgb')) {
        // Convert RGB to hex (simplified)
        return '#000000';
      }
      if (color.length === 3) {
        return `#${color}`;
      }
      return '#000000';
    }
    return color;
  }

  static fixFontSize(size: number): number {
    const min = TextEngineDiagnostics.fontSize.min!;
    const max = TextEngineDiagnostics.fontSize.max!;
    return Math.max(min, Math.min(max, size));
  }

  static fixAlignment(alignment: string): string {
    const allowed = TextEngineDiagnostics.alignment.allowed!;
    return allowed.includes(alignment) ? alignment : 'left';
  }

  static fixFontFamily(fontFamily: string): string {
    const allowed = TextEngineDiagnostics.fontFamily.allowed!;
    return allowed.includes(fontFamily) ? fontFamily : 'Arial';
  }
}
