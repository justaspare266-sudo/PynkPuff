// Fix: Define all the necessary types for the application. The original file had incorrect content.
export type ElementName = 'logo' | 'headline' | 'subheadline' | 'cta';

export interface ArtboardLayout {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fontSize?: number;
  align?: 'left' | 'center' | 'right';
  textAlign?: 'left' | 'center' | 'right';
  vAlign?: 'top' | 'middle' | 'bottom';
}

export interface ArtboardConfig {
  id: string;
  width: number;
  height: number;
  logoLayout: ArtboardLayout;
  headlineLayout: ArtboardLayout;
  subheadlineLayout: ArtboardLayout;
  ctaLayout: ArtboardLayout;
  backgroundPosition: { x: number; y: number };
}

export interface ArtboardSize {
  w: number;
  h: number;
  hlFs?: number;
  shlFs?: number;
  ctaFs?: number;
  hlY?: number;
  shlY?: number;
  ctaY?: number;
  logoY?: number;
  hlX?: number;
  shlX?: number;
  ctaX?: number;
}

export type SelectedElement = {
  artboardId: string;
  elementName: ElementName;
} | null;

// Using a non-exported core interface to avoid recursive type issues with history.
interface AppStateCore {
  headline: string;
  subheadline: string;
  ctaText: string;
  fontFamily: string;
  fontWeight: number;
  fontStyle: string;
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
  backgroundType: 'solid' | 'gradient' | 'image';
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
  previewMode: 'grid' | 'carousel';
  focusedArtboardIndex: number;
  alignAsGroup: boolean;
  selectedArtboardId: string | null;
}

export interface AppState extends AppStateCore {
  history: AppStateCore[];
  historyIndex: number;
}
