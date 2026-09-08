import { HotspotRecord, MediaAssociation } from './types/saas';

export type PageOrientation = 'portrait' | 'landscape';

export interface BookPage {
  pageNumber: number;
  title?: string;
  // Type of content: 'image' (from PDF/converted image) or 'html' (from Word/DOCX or sample)
  type: 'image' | 'html';
  imageUrl?: string;
  htmlContent?: string;
  text?: string; // Raw text for document search
  hotspots?: HotspotRecord[];
  mediaAssociations?: MediaAssociation[];
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  pageNumber: number;
  level?: number;
}

export interface Bookmark {
  id: string;
  pageNumber: number;
  label: string;
  note?: string;
  timestamp: number;
}

export interface FlipBookDocument {
  id: string;
  title: string;
  author?: string;
  sourceType: 'pdf' | 'docx' | 'txt' | 'images' | 'sample';
  totalPages: number;
  pages: BookPage[];
  tableOfContents?: TableOfContentsItem[];
  aspectRatio: number; // width / height, e.g. 0.707 for A4 portrait
  createdAt: number;
}

export type ViewLayout = 'auto' | 'single' | 'double';

export type ReaderTheme = 'studio-dark' | 'wood-desk' | 'paper-light' | 'sepia-warm';

export type DeviceMode = 'responsive' | 'mobile' | 'tablet' | 'desktop';

// Re-export SaaS Multi-Tenant Architecture & Data Models
export * from './types/saas';
