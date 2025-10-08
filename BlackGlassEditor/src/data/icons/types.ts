/**
 * Enhanced Iconsax Icon Types
 * Auto-generated from Enhanced Iconsax crawler
 * Generated 2024 icons across 15 categories
 */

export interface IconsaxIcon {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  svg: string;
  variants: string[];
  tags: string[];
  author?: string;
  license?: string;
  createdAt?: Date;
  updatedAt?: Date;
  downloads?: number;
  views?: number;
}

export interface IconCategory {
  name: string;
  count: number;
  icons: IconsaxIcon[];
}

export const ICON_CATEGORIES = [
  "household",
  "people",
  "emotions",
  "media",
  "system",
  "business",
  "shopping",
  "travel",
  "food",
  "sports",
  "health",
  "education",
  "technology",
  "nature",
  "transportation"
];

export const TOTAL_ICONS = 2024;

export const ICON_VARIANTS = ['outline', 'bold', 'bulk', 'linear'];

export const ICON_STATS = {
  totalIcons: 2024,
  totalCategories: 15,
  totalVariants: 4,
  averageIconsPerCategory: 135,
  mostPopularCategory: 'household',
  leastPopularCategory: 'transportation'
};
