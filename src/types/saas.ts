/**
 * SaaS Multi-Tenant Core Architecture & Data Models
 * Conformément au PROMPT MAÎTRE — SAAS DE CRÉATION DE FLIPBOOKS INTERACTIFS
 */

// =========================================================
// 1. RÔLES ET AUTHENTIFICATION
// =========================================================

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'CLIENT';

export interface UserProfile {
  id: string; // Firebase Auth UID
  email: string;
  displayName: string;
  avatarUrl?: string;
  systemRole: 'SUPER_ADMIN' | 'STANDARD_USER';
  createdAt: number;
  updatedAt: number;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
  planId: 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
  customDomain?: string;
  whiteLabelEnabled: boolean;
  maxStorageBytes: number;
  maxVideos: number;
  maxFlipbooks: number;
  usedStorageBytes: number;
  createdAt: number;
  updatedAt: number;
}

export interface Membership {
  id: string;
  organizationId: string;
  userId: string;
  role: 'ADMIN' | 'OPERATOR' | 'CLIENT';
  clientId?: string; // Si role === 'CLIENT', lié à ce client uniquement
  createdAt: number;
}

export interface ClientEntity {
  id: string;
  organizationId: string;
  name: string;
  companyName?: string;
  email: string;
  phone?: string;
  notes?: string;
  activeFlipbookIds: string[];
  createdAt: number;
  updatedAt: number;
}

// =========================================================
// 2. DOCUMENTS SOURCES ET CONVERSION
// =========================================================

export type SourceMimeType =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
  | 'application/msword' // .doc
  | 'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
  | 'application/vnd.ms-powerpoint' // .ppt
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
  | 'application/vnd.ms-excel' // .xls
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp';

export type ConversionStatus =
  | 'UPLOADING'
  | 'QUEUED'
  | 'CONVERTING'
  | 'PROCESSING'
  | 'GENERATING_PAGES'
  | 'OPTIMIZING'
  | 'READY'
  | 'FAILED';

export interface SourceDocument {
  id: string;
  organizationId: string;
  clientId?: string;
  originalFileName: string;
  mimeType: SourceMimeType | string;
  fileSizeBytes: number;
  storagePath: string;
  status: ConversionStatus;
  conversionProgress: number; // 0 to 100%
  errorMessage?: string;
  convertedPdfStoragePath?: string;
  pageCount?: number;
  uploadedBy: string;
  createdAt: number;
  updatedAt: number;
}

// =========================================================
// 3. FLIPBOOK MULTI-PAGES & FORMATS D'IMAGES
// =========================================================

export type FlipbookVisibility = 'PUBLIC' | 'PRIVATE' | 'PASSWORD_PROTECTED' | 'LINK_ONLY';

export interface ImageQualityUrls {
  thumbnail: string; // ~150px
  small: string;     // ~600px
  medium: string;    // ~1200px
  large: string;     // ~2400px HD Retina
}

export interface FlipbookPageAsset {
  id: string;
  pageNumber: number;
  title?: string;
  dimensions: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  imageUrls: ImageQualityUrls;
  rawText?: string; // Indexé pour la recherche plein-texte & synthèse vocale
  hasHotspots: boolean;
  hasVideoAssociations: boolean;
}

export interface DocumentAccessPermissions {
  allowDownload: boolean;
  allowPrint: boolean;
  allowShare: boolean;
  allowIndexing: boolean; // noindex / nofollow pour la discrétion SEO
  passwordProtected: boolean;
  passwordHash?: string; // Jamais en clair !
  expiresAt?: number | null; // Timestamp d'expiration
  isActive: boolean; // Permet au client de désactiver temporairement le lien
}

export interface FlipbookRecord {
  id: string;
  organizationId: string;
  clientId: string; // Attribué à un client unique
  title: string;
  slug: string;
  description?: string;
  category?: string;
  sourceDocumentId: string;
  status: 'DRAFT' | 'READY' | 'ARCHIVED';
  visibility: FlipbookVisibility;
  permissions: DocumentAccessPermissions;
  totalPages: number;
  coverUrl?: string;
  logoUrl?: string;
  language: string;
  publicToken: string; // Identifiant public non devinable
  viewCount: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

// =========================================================
// 4. HOTSPOTS & COORDONNÉES RELATIVES
// =========================================================

/**
 * Coordonnées STRICTEMENT relatives (0.0 à 1.0).
 * Indispensable pour la fidélité responsive sur mobile, tablette et 4K.
 */
export interface RelativeRegion {
  x: number;      // 0.0 to 1.0 (ex: 0.20 = 20% from left)
  y: number;      // 0.0 to 1.0 (ex: 0.35 = 35% from top)
  width: number;  // 0.0 to 1.0 (ex: 0.30 = 30% of page width)
  height: number; // 0.0 to 1.0 (ex: 0.18 = 18% of page height)
}

export type HotspotType =
  | 'URL'
  | 'VIDEO'
  | 'WHATSAPP'
  | 'PHONE'
  | 'EMAIL'
  | 'MAP'
  | 'DOWNLOAD'
  | 'IMAGE'
  | 'PRODUCT'
  | 'FORM'
  | 'TOOLTIP';

export interface HotspotRecord {
  id: string;
  flipbookId: string;
  pageNumber: number;
  type: HotspotType;
  region: RelativeRegion;
  label: string;
  targetUrl?: string;
  phoneNumber?: string;
  emailAddress?: string;
  whatsappMessage?: string;
  videoAssetId?: string;
  productPrice?: string;
  icon?: string;
  tooltipText?: string;
}

// =========================================================
// 5. WORKFLOW PHOTO → VIDÉO & VIDEO ASSETS
// =========================================================

export type VideoProviderType = 'CLOUDFLARE_STREAM' | 'VIMEO' | 'YOUTUBE' | 'STORAGE_PRIVATE';

export type VideoAssetStatus = 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED' | 'ARCHIVED';

export interface VideoAsset {
  id: string;
  organizationId: string;
  flipbookId: string;
  pageNumber: number;
  title: string;
  provider: VideoProviderType;
  providerVideoId: string;
  status: VideoAssetStatus;
  publicToken: string;
  publicUrl: string; // BASE_URL + "/v/" + publicToken
  thumbnailUrl?: string;
  durationSeconds?: number;
  aspectRatio?: string; // e.g. "16:9" or "9:16"
  createdAt: number;
  updatedAt: number;
}

export type VideoDisplayMode = 'overlay' | 'below' | 'popup' | 'fullscreen';

export interface MediaAssociation {
  id: string;
  flipbookId: string;
  pageNumber: number;
  imageRegion: RelativeRegion;
  hasVideo: boolean;
  videoAssetId?: string;
  displayMode: VideoDisplayMode;
  label: string; // Ex: "Voir la chambre Deluxe"
  icon: 'play' | 'camera' | 'info';
  autoplay: boolean;
}

// =========================================================
// 6. LIENS DE PARTAGE (SHARE LINKS)
// =========================================================

export interface ShareLinkRecord {
  id: string;
  token: string;
  flipbookId: string;
  organizationId: string;
  clientId: string;
  label?: string; // Ex: "Lien Campagne Été WhatsApp"
  expiresAt?: number | null;
  passwordRequired: boolean;
  passwordHash?: string;
  allowDownload: boolean;
  allowPrint: boolean;
  allowShare: boolean;
  active: boolean;
  accessCount: number;
  lastAccessedAt?: number;
  createdBy: string;
  createdAt: number;
}

// =========================================================
// 7. ANALYTICS & AUDIT LOGS
// =========================================================

export type AnalyticsDeviceType = 'mobile' | 'tablet' | 'desktop';

export interface FlipbookAnalyticsEvent {
  id: string;
  organizationId: string;
  flipbookId: string;
  clientId: string;
  shareLinkId?: string;
  eventType:
    | 'view'
    | 'page_view'
    | 'zoom'
    | 'download_attempt'
    | 'print_attempt'
    | 'share_click'
    | 'whatsapp_click'
    | 'hotspot_click';
  pageNumber?: number;
  deviceType: AnalyticsDeviceType;
  os?: string;
  browser?: string;
  countryCode?: string;
  timestamp: number;
}

export interface VideoAnalyticsEvent {
  id: string;
  organizationId: string;
  flipbookId: string;
  videoAssetId: string;
  pageNumber: number;
  eventType:
    | 'videoOpened'
    | 'videoStarted'
    | 'video25Percent'
    | 'video50Percent'
    | 'video75Percent'
    | 'videoCompleted';
  timestamp: number;
}

export type AuditAction =
  | 'DOCUMENT_CREATED'
  | 'DOCUMENT_DELETED'
  | 'CONVERSION_STARTED'
  | 'CONVERSION_SUCCEEDED'
  | 'CONVERSION_FAILED'
  | 'FLIPBOOK_PUBLISHED'
  | 'FLIPBOOK_DISABLED'
  | 'PERMISSION_CHANGED'
  | 'VIDEO_ADDED'
  | 'VIDEO_REMOVED'
  | 'HOTSPOT_ADDED'
  | 'HOTSPOT_REMOVED'
  | 'SHARE_LINK_CREATED'
  | 'SHARE_LINK_DISABLED'
  | 'CLIENT_CREATED'
  | 'CLIENT_ASSIGNED';

export interface AuditLogRecord {
  id: string;
  organizationId: string;
  userId: string;
  userEmail: string;
  action: AuditAction;
  targetId: string; // flipbookId, videoId, clientId, etc.
  targetType: 'DOCUMENT' | 'FLIPBOOK' | 'VIDEO' | 'HOTSPOT' | 'CLIENT' | 'SHARE_LINK';
  details?: Record<string, unknown>;
  timestamp: number;
}

// =========================================================
// 8. ABONNEMENTS ET QUOTAS SAAS
// =========================================================

export interface SubscriptionRecord {
  id: string;
  organizationId: string;
  planId: 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING';
  currentPeriodStart: number;
  currentPeriodEnd: number;
  limits: {
    maxFlipbooks: number;
    maxPagesPerBook: number;
    maxStorageBytes: number;
    maxVideoStorageBytes: number;
    maxClients: number;
    allowWhiteLabel: boolean;
    allowCustomDomain: boolean;
    allowAdvancedAnalytics: boolean;
  };
}

// =========================================================
// 9. PHASE 11: LEAD GENERATION & CRM
// =========================================================

export type LeadFormType = 'GATE_LOCK' | 'INQUIRY' | 'NEWSLETTER' | 'QUOTE';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED';

export interface LeadRecord {
  id: string;
  organizationId: string;
  clientId: string;
  flipbookId: string;
  flipbookTitle: string;
  pageNumber: number;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  formType: LeadFormType;
  status: LeadStatus;
  createdAt: number;
}

export interface LeadGateSettings {
  enabled: boolean;
  gatePageNumber: number; // Ex: page 3 - blocks further reading until submitted
  requiredFields: 'email_only' | 'full_contact';
  title: string;
  subtitle: string;
  allowSkip: boolean;
}

// =========================================================
// 10. PHASE 12: RECHERCHE PLEIN TEXTE, TOC & MARQUE-PAGES
// =========================================================

export interface SearchMatch {
  pageNumber: number;
  term: string;
  snippetBefore: string;
  matchText: string;
  snippetAfter: string;
}

export interface TocItem {
  id: string;
  title: string;
  pageNumber: number;
  level: number;
  children?: TocItem[];
}

export interface BookmarkRecord {
  id: string;
  flipbookId: string;
  pageNumber: number;
  title: string;
  color?: string;
  createdAt: number;
}

// =========================================================
// 11. PHASE 13: EXPORT AUTONOME HORS-LIGNE & PWA
// =========================================================

export interface OfflineExportOptions {
  includeVideos: boolean;
  includeSound: boolean;
  watermark: boolean;
  quality: 'STANDARD' | 'HIGH' | 'MAXIMUM';
}

// =========================================================
// 12. PHASE 14: ANNOTATIONS VISUELLES & WORKFLOW VALIDATION
// =========================================================

export type AnnotationType = 'HIGHLIGHT' | 'STICKY_NOTE' | 'DRAWING';
export type ReviewWorkflowStatus = 'DRAFT' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'PUBLISHED';

export interface VisualAnnotation {
  id: string;
  flipbookId: string;
  pageNumber: number;
  type: AnnotationType;
  authorName: string;
  authorRole: UserRole;
  color: string;
  coordinates: {
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    width?: number;
    height?: number;
  };
  content?: string; // Text for sticky note
  pathPoints?: { x: number; y: number }[]; // Coordinates for freehand drawing
  resolved: boolean;
  createdAt: number;
}

export interface ReviewFeedback {
  id: string;
  flipbookId: string;
  authorName: string;
  role: UserRole;
  message: string;
  requestedStatus: ReviewWorkflowStatus;
  createdAt: number;
}

// =========================================================
// 13. PHASE 15: EMBED WIDGET, QR CODE & WEBHOOKS DÉVELOPPEUR
// =========================================================

export interface EmbedSettings {
  width: string;
  height: string;
  aspectRatio: '16:9' | '4:3' | 'A4' | 'RESPONSIVE';
  autoplay: boolean;
  startPage: number;
  hideControls: boolean;
  theme: 'dark' | 'light' | 'transparent';
  allowFullscreen: boolean;
}

export interface OutboundWebhook {
  id: string;
  organizationId: string;
  url: string;
  secretKey: string;
  active: boolean;
  events: ('lead.captured' | 'flipbook.viewed' | 'flipbook.approved')[];
  lastDeliveryStatus?: 'SUCCESS' | 'FAILED';
  lastDeliveryAt?: number;
}

export interface ApiKeyRecord {
  id: string;
  organizationId: string;
  keyPrefix: string;
  label: string;
  active: boolean;
  createdAt: number;
  lastUsedAt?: number;
}

