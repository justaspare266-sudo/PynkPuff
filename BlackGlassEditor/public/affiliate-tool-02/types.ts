export type ElementName = 'logo' | 'headline' | 'subheadline' | 'cta';

export interface ArtboardSize {
  w: number;
  h: number;
  hlFs: number; // headline font size
  shlFs: number; // subheadline font size
  ctaFs?: number; // cta font size
  hlX?: number; // headline X
  hlY: number; // headline Y
  shlX?: number; // subheadline X
  shlY: number; // subheadline Y
  ctaX?: number; // cta X
  ctaY: number; // cta Y
  logoX?: number; // logo X
  logoY: number; // logo Y
}

export interface ArtboardLayout {
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  align?: 'left' | 'center' | 'right';
}

export interface ArtboardConfig {
  id: string;
  width: number;
  height: number;
  logoLayout: ArtboardLayout;
  headlineLayout: ArtboardLayout;
  subheadlineLayout: ArtboardLayout;
  ctaLayout: ArtboardLayout;
  backgroundPosition?: { x: number; y: number; };
}

export interface AppState {
  headline: string;
  subheadline: string;
  ctaText: string;
  
  fontFamily: string;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  fontSizeAdjustment: number;
  fontColor: string;
  letterSpacing: number;
  lineHeight: number;
  textBgColor: string;
  textBgOpacity: number;
  
  ctaBgColor: string;
  ctaBgOpacity: number;
  ctaTextColor: string;
  ctaStrokeEnabled: boolean;
  ctaStrokeWidth: number;
  ctaStrokeColor: string;
  ctaUnderline: boolean;
  ctaUnderlineThickness: number;
  ctaUnderlineOffset: number;

  logoImage: HTMLImageElement | null;
  
  backgroundType: 'solid' | 'image' | 'gradient';
  backgroundColor: string;
  backgroundImage: HTMLImageElement | null;
  backgroundScale: number;
  gradient: {
    angle: number;
    colors: string[];
  };

  artboardConfigs: ArtboardConfig[];
  
  zoomLevel: number;
  gridSize: number;
  snapToGrid: boolean;

  previewMode: 'carousel' | 'grid';
  focusedArtboardIndex: number;

  history: Partial<AppState>[];
  historyIndex: number;
}

export type SelectedElement = { artboardId: string; elementName: ElementName; } | null;