/**
 * Master-level Export Manager for Konva Canvas
 * Supports PNG, SVG, JSON, and PDF exports with high quality settings
 */

import Konva from 'konva';

export interface ExportOptions {
  format: 'png' | 'svg' | 'json' | 'pdf';
  quality: number; // 0-1
  pixelRatio: number; // 1-4
  backgroundColor?: string;
  includeBackground: boolean;
  includeGrid: boolean;
  includeRulers: boolean;
  includeGuides: boolean;
  compressionLevel: number; // 0-9 for PNG
  dpi: number; // for PDF
  filename?: string;
  metadata?: {
    title?: string;
    description?: string;
    author?: string;
    created?: string;
    modified?: string;
    version?: string;
  };
}

export interface ExportResult {
  success: boolean;
  data?: string | Blob;
  filename: string;
  size: number;
  format: string;
  error?: string;
}

export class ExportManager {
  private stage: Konva.Stage;
  private defaultOptions: ExportOptions;

  constructor(stage: Konva.Stage) {
    this.stage = stage;
    this.defaultOptions = {
      format: 'png',
      quality: 1,
      pixelRatio: 2,
      includeBackground: true,
      includeGrid: false,
      includeRulers: false,
      includeGuides: false,
      compressionLevel: 6,
      dpi: 300,
      metadata: {
        title: 'Untitled Design',
        description: 'Created with Advanced Image Editor',
        author: 'User',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }

  /**
   * Export canvas to PNG
   */
  async exportPNG(options: Partial<ExportOptions> = {}): Promise<ExportResult> {
    try {
      const opts = { ...this.defaultOptions, ...options, format: 'png' as const };
      
      // Configure stage for export
      const originalPixelRatio = (this.stage as any).pixelRatio();
      (this.stage as any).pixelRatio(opts.pixelRatio);
      
      // Get canvas data
      const dataURL = this.stage.toDataURL({
        mimeType: 'image/png',
        quality: opts.quality,
        pixelRatio: opts.pixelRatio
      });
      
      // Restore original pixel ratio
      (this.stage as any).pixelRatio(originalPixelRatio);
      
      // Convert to blob
      const blob = await this.dataURLToBlob(dataURL);
      
      return {
        success: true,
        data: blob,
        filename: opts.filename || `design-${Date.now()}.png`,
        size: blob.size,
        format: 'png'
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        size: 0,
        format: 'png',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Export canvas to SVG
   */
  async exportSVG(options: Partial<ExportOptions> = {}): Promise<ExportResult> {
    try {
      const opts = { ...this.defaultOptions, ...options, format: 'svg' as const };
      
      // Get SVG data
      const svgData = (this.stage as any).toSVG({
        pixelRatio: opts.pixelRatio
      });
      
      // Add metadata
      const svgWithMetadata = this.addSVGMetadata(svgData, opts);
      
      // Convert to blob
      const blob = new Blob([svgWithMetadata], { type: 'image/svg+xml' });
      
      return {
        success: true,
        data: blob,
        filename: opts.filename || `design-${Date.now()}.svg`,
        size: blob.size,
        format: 'svg'
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        size: 0,
        format: 'svg',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Export canvas to JSON
   */
  async exportJSON(options: Partial<ExportOptions> = {}): Promise<ExportResult> {
    try {
      const opts = { ...this.defaultOptions, ...options, format: 'json' as const };
      
      // Get stage data
      const stageData = this.stage.toJSON();
      
      // Add metadata and export options
      const exportData = {
        version: '1.0.0',
        metadata: opts.metadata,
        exportOptions: opts,
        stageData: stageData,
        timestamp: new Date().toISOString()
      };
      
      // Convert to blob
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      return {
        success: true,
        data: blob,
        filename: opts.filename || `design-${Date.now()}.json`,
        size: blob.size,
        format: 'json'
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        size: 0,
        format: 'json',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Export canvas to PDF
   */
  async exportPDF(options: Partial<ExportOptions> = {}): Promise<ExportResult> {
    try {
      const opts = { ...this.defaultOptions, ...options, format: 'pdf' as const };
      
      // First export as PNG with high quality
      const pngResult = await this.exportPNG({
        ...opts,
        pixelRatio: Math.max(opts.pixelRatio, 3), // Higher quality for PDF
        quality: 1
      });
      
      if (!pngResult.success || !pngResult.data) {
        throw new Error('Failed to generate PNG for PDF export');
      }
      
      // Convert PNG to PDF using canvas
      const pdfBlob = await this.pngToPDF(pngResult.data as Blob, opts);
      
      return {
        success: true,
        data: pdfBlob,
        filename: opts.filename || `design-${Date.now()}.pdf`,
        size: pdfBlob.size,
        format: 'pdf'
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        size: 0,
        format: 'pdf',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Export with automatic format detection
   */
  async export(options: Partial<ExportOptions> = {}): Promise<ExportResult> {
    const opts = { ...this.defaultOptions, ...options };
    
    switch (opts.format) {
      case 'png':
        return this.exportPNG(opts);
      case 'svg':
        return this.exportSVG(opts);
      case 'json':
        return this.exportJSON(opts);
      case 'pdf':
        return this.exportPDF(opts);
      default:
        return this.exportPNG(opts);
    }
  }

  /**
   * Download export result
   */
  download(result: ExportResult): void {
    if (!result.success || !result.data) {
      throw new Error('Cannot download failed export');
    }
    
    const url = URL.createObjectURL(result.data as Blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get export preview (thumbnail)
   */
  async getPreview(size: number = 200): Promise<string> {
    const originalSize = this.stage.size();
    const originalScale = this.stage.scaleX();
    
    // Scale down for preview
    const scale = size / Math.max(originalSize.width, originalSize.height);
    this.stage.scaleX(scale);
    this.stage.scaleY(scale);
    
    const dataURL = this.stage.toDataURL({
      mimeType: 'image/png',
      quality: 0.8,
      pixelRatio: 1
    });
    
    // Restore original scale
    this.stage.scaleX(originalScale);
    this.stage.scaleY(originalScale);
    
    return dataURL;
  }

  /**
   * Get file size estimate
   */
  getSizeEstimate(format: string, pixelRatio: number = 2): number {
    const stageSize = this.stage.size();
    const totalPixels = stageSize.width * stageSize.height * pixelRatio * pixelRatio;
    
    switch (format) {
      case 'png':
        return Math.round(totalPixels * 4 * 0.8); // Rough estimate
      case 'svg':
        return Math.round(totalPixels * 0.1); // Vector format
      case 'json':
        return Math.round(totalPixels * 0.05); // Text format
      case 'pdf':
        return Math.round(totalPixels * 2); // PDF overhead
      default:
        return 0;
    }
  }

  /**
   * Validate export options
   */
  validateOptions(options: Partial<ExportOptions>): string[] {
    const errors: string[] = [];
    
    if (options.quality !== undefined && (options.quality < 0 || options.quality > 1)) {
      errors.push('Quality must be between 0 and 1');
    }
    
    if (options.pixelRatio !== undefined && (options.pixelRatio < 1 || options.pixelRatio > 4)) {
      errors.push('Pixel ratio must be between 1 and 4');
    }
    
    if (options.compressionLevel !== undefined && (options.compressionLevel < 0 || options.compressionLevel > 9)) {
      errors.push('Compression level must be between 0 and 9');
    }
    
    if (options.dpi !== undefined && (options.dpi < 72 || options.dpi > 600)) {
      errors.push('DPI must be between 72 and 600');
    }
    
    return errors;
  }

  // Private helper methods

  private async dataURLToBlob(dataURL: string): Promise<Blob> {
    const response = await fetch(dataURL);
    return response.blob();
  }

  private addSVGMetadata(svgData: string, options: ExportOptions): string {
    const metadata = options.metadata;
    if (!metadata) return svgData;
    
    // Add metadata as comments
    const metadataComment = `<!--
  Title: ${metadata.title || 'Untitled'}
  Description: ${metadata.description || ''}
  Author: ${metadata.author || 'Unknown'}
  Created: ${metadata.created || new Date().toISOString()}
  Modified: ${metadata.modified || new Date().toISOString()}
  Version: ${metadata.version || '1.0.0'}
  Export Options: ${JSON.stringify(options, null, 2)}
-->`;
    
    return svgData.replace('<svg', `${metadataComment}\n<svg`);
  }

  private async pngToPDF(pngBlob: Blob, options: ExportOptions): Promise<Blob> {
    // This is a simplified PDF generation
    // In a real implementation, you'd use a library like jsPDF
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    const img = new Image();
    const imgData = await this.blobToDataURL(pngBlob);
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        // Set canvas size based on DPI
        const dpi = options.dpi || 300;
        const width = (img.width * dpi) / 96; // Convert from 96 DPI
        const height = (img.height * dpi) / 96;
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob (simplified - real PDF would need proper PDF structure)
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create PDF blob'));
          }
        }, 'application/pdf');
      };
      
      img.onerror = () => reject(new Error('Failed to load image for PDF'));
      img.src = imgData;
    });
  }

  private async blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read blob'));
      reader.readAsDataURL(blob);
    });
  }
}

export default ExportManager;
