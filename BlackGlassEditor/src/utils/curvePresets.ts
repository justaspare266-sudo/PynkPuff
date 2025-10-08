// Professional curve presets for image editing
export interface CurvePoint {
  x: number;
  y: number;
}

export interface CurvePreset {
  name: string;
  brightness: { points: CurvePoint[]; enabled: boolean };
  contrast: { points: CurvePoint[]; enabled: boolean };
  saturation: { points: CurvePoint[]; enabled: boolean };
  gamma: { points: CurvePoint[]; enabled: boolean };
}

export const curvePresets: Record<string, CurvePreset> = {
  'Strong Contrast': {
    name: 'Strong Contrast',
    brightness: { 
      points: [
        { x: 0, y: 0 },
        { x: 0.25, y: 0.15 },
        { x: 0.75, y: 0.85 },
        { x: 1, y: 1 }
      ], 
      enabled: true 
    },
    contrast: { 
      points: [
        { x: 0, y: 0 },
        { x: 0.25, y: 0.15 },
        { x: 0.75, y: 0.85 },
        { x: 1, y: 1 }
      ], 
      enabled: true 
    },
    saturation: { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }], enabled: false },
    gamma: { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }], enabled: false }
  },
  'Lighter': {
    name: 'Lighter',
    brightness: { 
      points: [
        { x: 0, y: 0.1 },
        { x: 1, y: 1 }
      ], 
      enabled: true 
    },
    contrast: { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }], enabled: false },
    saturation: { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }], enabled: false },
    gamma: { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }], enabled: false }
  },
  'Darker': {
    name: 'Darker',
    brightness: { 
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 0.9 }
      ], 
      enabled: true 
    },
    contrast: { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }], enabled: false },
    saturation: { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }], enabled: false },
    gamma: { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }], enabled: false }
  },
  'Cross Process': {
    name: 'Cross Process',
    brightness: { 
      points: [
        { x: 0, y: 0.05 },
        { x: 0.3, y: 0.2 },
        { x: 0.7, y: 0.8 },
        { x: 1, y: 0.95 }
      ], 
      enabled: true 
    },
    contrast: { 
      points: [
        { x: 0, y: 0 },
        { x: 0.25, y: 0.1 },
        { x: 0.75, y: 0.9 },
        { x: 1, y: 1 }
      ], 
      enabled: true 
    },
    saturation: { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }], enabled: false },
    gamma: { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }], enabled: false }
  },
  'Vintage': {
    name: 'Vintage',
    brightness: { 
      points: [
        { x: 0, y: 0.1 },
        { x: 0.5, y: 0.6 },
        { x: 1, y: 0.95 }
      ], 
      enabled: true 
    },
    contrast: { 
      points: [
        { x: 0, y: 0.05 },
        { x: 0.5, y: 0.45 },
        { x: 1, y: 0.9 }
      ], 
      enabled: true 
    },
    saturation: { 
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 0.8 }
      ], 
      enabled: true 
    },
    gamma: { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }], enabled: false }
  }
};

// Apply curve preset to Konva filters
export const applyCurvePreset = (preset: CurvePreset, imageNode: any) => {
  const filters = [];
  
  if (preset.brightness.enabled) {
    filters.push('Brighten');
    // Calculate brightness adjustment from curve
    const midPoint = preset.brightness.points.find(p => p.x === 0.5) || { y: 0.5 };
    imageNode.brightness(midPoint.y - 0.5);
  }
  
  if (preset.contrast.enabled) {
    filters.push('Contrast');
    // Calculate contrast from curve steepness
    const start = preset.contrast.points[0];
    const end = preset.contrast.points[preset.contrast.points.length - 1];
    const contrast = (end.y - start.y) / (end.x - start.x) - 1;
    imageNode.contrast(contrast * 100);
  }
  
  if (preset.saturation.enabled) {
    filters.push('HSV');
    const satPoint = preset.saturation.points.find(p => p.x === 1) || { y: 1 };
    imageNode.saturation(satPoint.y - 1);
  }
  
  imageNode.filters(filters);
  imageNode.cache();
};