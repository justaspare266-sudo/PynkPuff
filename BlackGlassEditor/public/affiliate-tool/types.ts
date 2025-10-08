export type ElementName = 'headline' | 'subheadline' | 'cta' | 'logo';

export interface ArtboardLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  align?: 'left' | 'center' | 'right';
  vAlign?: 'top' | 'middle' | 'bottom';
  textAlign?: 'left' | 'center' | 'right';
}

export interface TextStyle {
  fontFamily: string;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  letterSpacing: number;
  lineHeight: number;
  fontColor: string;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration: 'none' | 'underline';
  textBgColor: string;
  textBgOpacity: number;
  overflowBehavior?: 'wrap' | 'ellipsis';
}

export interface ArtboardConfig {
  id: string;
  width: number;
  height: number;
  headlineLayout: ArtboardLayout;
  subheadlineLayout: ArtboardLayout;
  ctaLayout: ArtboardLayout;
  logoLayout: ArtboardLayout;
  backgroundPosition: { x: number; y: number; };
  isComplete: boolean;
}

export type SortOrder = 'default' | 'width-asc' | 'width-desc' | 'height-asc' | 'height-desc' | 'area-asc' | 'area-desc';

export interface AppState {
  headline: string;
  subheadline: string;
  ctaText: string;
  logoImage: HTMLImageElement | null;
  logoAspectRatio: number | null;
  backgroundImage: HTMLImageElement | null;
  backgroundColor: string;
  backgroundType: 'solid' | 'gradient' | 'image';
  gradient: {
    angle: number;
    colors: [string, string];
  };
  backgroundScale: number;
  fontSizeAdjustment: number;
  headlineStyle: TextStyle;
  subheadlineStyle: TextStyle;
  ctaStyle: TextStyle;
  ctaStrokeEnabled: boolean;
  ctaStrokeWidth: number;
  ctaStrokeColor: string;
  ctaUnderlineThickness: number;
  ctaUnderlineOffset: number;
  snapToGrid: boolean;
  gridSize: number;
  zoomLevel: number;
  artboardConfigs: ArtboardConfig[];
  alignAsGroup: boolean;
  sortOrder: SortOrder;
}

export type SelectedElement = {
  artboardId: string;
  elementName: ElementName;
} | null;

export interface ArtboardSize {
  w: number;
  h: number;
  hlFs: number;
  shlFs: number;
  ctaFs: number;
  hlX?: number;
  hlY: number;
  shlX?: number;
  shlY: number;
  ctaX?: number;
  ctaY: number;
  logoX?: number;
  logoY: number;
}

export interface LayoutTemplate {
  name: string;
  configs: ArtboardConfig[];
}