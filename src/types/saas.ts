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

export type CommentCategory = 'GENERAL' | 'TYPO' | 'DESIGN' | 'PRICE' | 'QUESTION' | 'APPROVAL';

export interface CommentReply {
  id: string;
  authorName: string;
  authorRole: UserRole | string;
  content: string;
  createdAt: number;
}

export interface PageComment {
  id: string;
  flipbookId: string;
  pageNumber: number;
  authorName: string;
  authorRole: UserRole | string;
  content: string;
  category: CommentCategory;
  coordinates?: {
    x: number; // percentage 0-100 on page
    y: number; // percentage 0-100 on page
  };
  resolved: boolean;
  replies: CommentReply[];
  color?: string; // Pin color
  createdAt: number;
  updatedAt: number;
}

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

// =========================================================
// 14. PHASE 16: E-COMMERCE & CATALOGUE SHOPPABLE INTERACTIF
// =========================================================

export interface ShoppableProduct {
  id: string;
  flipbookId: string;
  pageNumber: number;
  title: string;
  sku: string;
  price: number;
  currency: string;
  description?: string;
  imageUrl?: string;
  inStock: boolean;
  variants?: { name: string; options: string[] }[];
  category?: string;
}

export interface CartItem {
  product: ShoppableProduct;
  quantity: number;
  selectedVariant?: string;
}

export interface OrderRecord {
  id: string;
  flipbookId: string;
  organizationId: string;
  clientId: string;
  items: CartItem[];
  totalAmount: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress?: string;
  notes?: string;
  checkoutMode: 'WHATSAPP' | 'DIRECT' | 'STRIPE';
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'CANCELLED';
  createdAt: number;
}

// =========================================================
// 15. PHASE 17: MULTI-LANGUE, I18N & LECTURE RTL (ARABE / HÉBREU)
// =========================================================

export type SupportedLanguage = 'fr' | 'en' | 'es' | 'de' | 'it' | 'ar' | 'zh';
export type ReadingDirection = 'ltr' | 'rtl';

export interface LanguageEdition {
  code: SupportedLanguage;
  label: string;
  flag: string;
  direction: ReadingDirection;
  flipbookId: string;
}

// =========================================================
// 16. PHASE 18: PROTECTION PAR MOT DE PASSE & WATERMARK DYNAMIQUE
// =========================================================

export interface SecurityPolicy {
  passwordProtected: boolean;
  passwordHash?: string;
  maxAttempts: number;
  lockoutMinutes: number;
  expiresAt?: number | null;
  enableDynamicWatermark: boolean;
  watermarkTextPattern: string; // Ex: "{{email}} • {{ip}} • {{date}}"
  preventScreenshotsHint: boolean;
}

export interface WatermarkConfig {
  text: string;
  opacity: number; // 0.05 to 0.4
  angle: number;   // -45 to 45 deg
  fontSize: number;
  color: string;
}

// =========================================================
// 17. PHASE 19: ASSISTANT IA GEMINI & RÉSUMÉ INTELLIGENT DE PAGE
// =========================================================

export interface AiQueryMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  referencedPages?: number[];
}

export interface PageAiSummary {
  pageNumber: number;
  title: string;
  keyPoints: string[];
  suggestedQuestions: string[];
  readingTimeMinutes: number;
}

// =========================================================
// 18. PHASE 20: HEATMAPS & ANALYSE D'ATTENTION LECTEUR
// =========================================================

export interface HeatmapPoint {
  x: number; // relative 0-1
  y: number; // relative 0-1
  intensity: number; // 0.1 to 1.0
  type: 'CLICK' | 'HOVER' | 'ZOOM';
}

export interface PageAttentionMetric {
  pageNumber: number;
  averageDwellSeconds: number;
  totalViews: number;
  zoomInteractions: number;
  hotspotClicks: number;
  dropOffRatePercent: number;
  heatmapPoints: HeatmapPoint[];
}

// =========================================================
// 19. PHASE 21: PERSONNALISATION DE MARQUE & THÈMES BLANCS
// =========================================================

export interface ThemeSkinConfig {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  dockStyle: 'floating' | 'bottom-bar' | 'minimalist-top';
  bookSpineColor: string;
  borderRadiusPx: number;
  customLogoUrl?: string;
  showPoweredBy: boolean;
}

// =========================================================
// 20. PHASE 22: AMBIANCE SONORE & AUDIO GUIDE MULTI-PISTES
// =========================================================

export interface AmbientSoundTrack {
  id: string;
  title: string;
  genre: 'LOUNGE' | 'NATURE_SPA' | 'CORPORATE' | 'MINIMAL_JAZZ';
  audioUrl: string;
  volume: number;
  loop: boolean;
}

export interface PageAudioTourStep {
  pageNumber: number;
  trackUrl: string;
  narratorName: string;
  durationSeconds: number;
  autoPlayOnPageTurn: boolean;
}

// =========================================================
// 21. PHASE 23: MODE KIOSQUE, PRÉSENTATION & SPOTLIGHT LASER
// =========================================================

export interface KioskConfig {
  enabled: boolean;
  idleTimeoutSeconds: number;
  autoReturnToCover: boolean;
  disableOutboundLinks: boolean;
  slideshowIntervalSeconds: number;
  isSlideshowRunning: boolean;
}

// =========================================================
// 22. PHASE 24: COLLABORATION D'ÉQUIPE & RÔLES RBAC AVANCÉS
// =========================================================

export interface TeamMemberRecord {
  id: string;
  organizationId: string;
  email: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'REVIEWER' | 'CLIENT';
  permissions: {
    canEditHotspots: boolean;
    canPublish: boolean;
    canViewLeads: boolean;
    canManageBilling: boolean;
    canExportOfflineZip: boolean;
  };
  lastActiveAt?: number;
  createdAt: number;
}

// =========================================================
// 23. PHASE 25: BIBLIOTHÈQUE DE MODÈLES & PRESETS MÉTIERS
// =========================================================

export interface FlipbookTemplatePreset {
  id: string;
  name: string;
  category: 'HOSPITALITY' | 'REAL_ESTATE' | 'GASTRONOMY' | 'FASHION' | 'CORPORATE' | 'RETAIL';
  description: string;
  themeConfig: Partial<ThemeSkinConfig>;
  sampleHotspotsCount: number;
  recommendedAspect: 'A4' | '16:9' | 'SQUARE';
  previewImageUrl: string;
}

// =========================================================
// 24. PHASE 26: PARTAGE SOCIAL & GÉNÉRATEUR OPEN GRAPH DYNAMIQUE
// =========================================================

export interface SocialCardConfig {
  title: string;
  description: string;
  imageUrl: string;
  targetPage: number;
  targetHotspotId?: string;
  platforms: {
    whatsappText: string;
    twitterHandle?: string;
    linkedinSummary?: string;
  };
}

// =========================================================
// 25. PHASE 27: GESTION EN LOT (BATCH) ET ACTIONS MULTIPLES
// =========================================================

export type BatchOperationType = 'ASSIGN_CLIENT' | 'CHANGE_VISIBILITY' | 'EXPORT_ZIP' | 'ARCHIVE' | 'DELETE';

export interface BatchJobState {
  operation: BatchOperationType;
  selectedIds: string[];
  progressPercent: number;
  status: 'IDLE' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
}

// =========================================================
// 26. PHASE 28: FORMULAIRES, SONDAGES & NPS DIRECTEMENT SUR PAGE
// =========================================================

export interface SurveyQuestion {
  id: string;
  type: 'RATING_5' | 'NPS_10' | 'CHOICE' | 'TEXT';
  prompt: string;
  options?: string[];
}

export interface PageSurveyRecord {
  id: string;
  flipbookId: string;
  pageNumber: number;
  title: string;
  questions: SurveyQuestion[];
  totalSubmissions: number;
  averageRating?: number;
}

export interface SurveySubmission {
  id: string;
  surveyId: string;
  flipbookId: string;
  answers: Record<string, string | number>;
  submittedAt: number;
}

// =========================================================
// 27. PHASE 29: ACCESSIBILITÉ (A11Y) & CONFORMITÉ WCAG 2.1 AAA
// =========================================================

export interface AccessibilitySettings {
  highContrast: boolean;
  dyslexicFont: boolean;
  textScalePercent: number; // 100 to 180
  reducedMotion: boolean;
  screenReaderAnnouncements: boolean;
}

// =========================================================
// 28. PHASE 30: EXPLORATEUR D'API REST & MOTEUR WEBHOOKS AVANCÉ
// =========================================================

export interface ApiEndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  requiresAuth: boolean;
  sampleRequest?: Record<string, unknown>;
  sampleResponse: Record<string, unknown>;
}

export interface WebhookDeliveryLog {
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, unknown>;
  responseCode: number;
  durationMs: number;
  success: boolean;
  timestamp: number;
}

// =========================================================
// 29. PHASE 31: MOTEUR D'EXPORT PDF SÉLECTIF & RECADRAGE HD
// =========================================================

export interface SelectivePrintOptions {
  mode: 'ALL' | 'CURRENT' | 'CUSTOM_RANGE' | 'CROPPED_SELECTION';
  customPages: number[]; // e.g. [1, 2, 4, 7]
  qualityDpi: 150 | 300 | 600;
  format: 'A4' | 'LETTER' | 'BOOKLET_2UP';
  includeAnnotations: boolean;
  includeWatermark: boolean;
  cropArea?: RelativeRegion;
}

// =========================================================
// 30. PHASE 32: FORM BUILDER INTÉGRÉ SUR PAGE (LEAD SHEETS & DEVIS)
// =========================================================

export type FormFieldType =
  | 'TEXT'
  | 'EMAIL'
  | 'PHONE'
  | 'NUMBER'
  | 'TEXTAREA'
  | 'SELECT'
  | 'RADIO'
  | 'CHECKBOX'
  | 'DATE'
  | 'RANGE_SLIDER'
  | 'CALCULATOR';

export interface FormFieldConfig {
  id: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required: boolean;
  options?: string[];
  defaultValue?: string | number;
  unit?: string; // e.g. "€", "m²", "jours"
}

export interface InPageFormConfig {
  id: string;
  flipbookId: string;
  pageNumber: number;
  title: string;
  subtitle?: string;
  submitButtonText: string;
  successMessage: string;
  fields: FormFieldConfig[];
  targetEmailNotification?: string;
  targetWebhookUrl?: string;
  enablePriceCalculation?: boolean;
  priceFormula?: string;
}

export interface InPageFormSubmission {
  id: string;
  formId: string;
  flipbookId: string;
  pageNumber: number;
  values: Record<string, string | number | boolean>;
  submittedAt: number;
  calculatedQuoteTotal?: number;
}

// =========================================================
// 31. PHASE 33: MOTEUR A/B TESTING & SPLIT TRAFFIC
// =========================================================

export interface AbTestVariant {
  id: string;
  name: string;
  description: string;
  coverImageUrl?: string;
  ctaText?: string;
  ctaColor?: string;
  startPage?: number;
  weightPercent: number; // e.g. 50
  viewsCount: number;
  conversionsCount: number;
  ordersTotalAmount: number;
}

export interface AbTestExperiment {
  id: string;
  organizationId: string;
  flipbookId: string;
  title: string;
  status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'CONCLUDED';
  goalMetric: 'LEADS' | 'ORDERS' | 'READING_TIME' | 'HOTSPOT_CLICKS';
  startDate: number;
  endDate?: number;
  winnerVariantId?: string;
  variants: AbTestVariant[];
  confidenceLevel: number; // e.g. 95%
}

// =========================================================
// 32. PHASE 34: MODÈLES 3D INTERACTIFS & HOTSPOTS WEB-AR
// =========================================================

export interface Model3DHotspot {
  id: string;
  flipbookId: string;
  pageNumber: number;
  title: string;
  category: 'FURNITURE' | 'JEWELRY' | 'WATCH' | 'AUTOMOTIVE' | 'ARCHI' | 'PRODUCT';
  modelType: 'GLTF' | 'USDZ' | 'PROCEDURAL_PRESET';
  modelUrl: string;
  presetKey?: 'LUXURY_WATCH' | 'DESIGNER_CHAIR' | 'PERFUME_BOTTLE' | 'VILLA_PAVILION';
  autoRotate: boolean;
  roughness: number;
  metalness: number;
  baseColor: string;
  arEnabled: boolean;
  dimensionsText: string;
  price?: number;
}

// =========================================================
// 33. PHASE 35: GOUVERNANCE DRM, COMPTE À REBOURS & GEO-FENCING
// =========================================================

export interface DrmGovernancePolicy {
  flipbookId: string;
  isDrmEnabled: boolean;
  expiresAt: number | null; // Ephemeral shredding timestamp
  autoRevokeAfterMinutesFromFirstOpen?: number;
  allowedCountryCodes: string[]; // e.g. ['FR', 'BE', 'CH', 'CA']
  blockedCountryCodes: string[];
  preventScreenshots: boolean;
  blurOnWindowBlur: boolean;
  blockPrinting: boolean;
  disableDevToolsInspect: boolean;
  screenDynamicFingerprint: boolean; // Overlays user IP + Timestamp in micro-pattern
  accessKeyMaxUses?: number;
  totalAccessesSoFar: number;
}

// =========================================================
// 34. PHASE 36: CO-BROWSING EN DIRECT & VISITE GUIDÉE COMMERCIALE
// =========================================================

export interface CoBrowsingSession {
  id: string;
  sessionCode: string; // 6-digit PIN e.g. "849201"
  flipbookId: string;
  hostName: string;
  hostRole: 'SALES_REP' | 'GUIDE';
  activePage: number;
  laserCoordinates: { x: number; y: number };
  zoomLevel: number;
  guestCount: number;
  isLive: boolean;
  audioVoiceStatus: 'MUTED' | 'SPEAKING' | 'LISTENING';
  notes: string;
  startedAt: number;
}

// =========================================================
// 35. PHASE 37: AVATAR VIDÉO TRANSPARENT & CHROMA-KEY (FOND VERT)
// =========================================================

export interface ChromaKeyAvatarConfig {
  id: string;
  flipbookId: string;
  enabled: boolean;
  videoUrl: string;
  avatarName: string;
  position: 'BOTTOM_RIGHT' | 'BOTTOM_LEFT' | 'CENTER_FLOATING' | 'CORNER_BADGE';
  chromaKeyColor: string; // Default "#00FF00" for green screen removal
  similarityThreshold: number; // 0.05 to 0.4
  autoPlayOnPageArrival: boolean;
  speechBubbleText?: string;
  ctaText?: string;
  ctaUrl?: string;
}

// =========================================================
// 36. PHASE 38: SYNCHRONISATION CATALOGUE PRODUITS CSV / ERP
// =========================================================

export interface SyncedProductItem {
  sku: string;
  title: string;
  category: string;
  currentPrice: number;
  previousPrice?: number;
  stockQuantity: number;
  inStock: boolean;
  mappedPageNumber: number;
  lastSyncedAt: number;
}

export interface CatalogSyncStatus {
  totalProducts: number;
  inStockCount: number;
  outOfStockCount: number;
  lastSyncTimestamp: number;
  sourceType: 'CSV_UPLOAD' | 'SHOPIFY_API' | 'ERP_WEBHOOK' | 'GOOGLE_SHEETS';
}

// =========================================================
// 37. PHASE 39: CAMPAGNES D'EMAILS AUTOMATISÉES & SMART RETARGETING
// =========================================================

export type CampaignTriggerType =
  | 'ABANDONED_READER' // Viewed cover but dropped before page 3
  | 'HIGH_ENGAGEMENT'  // Spent > 3 min or zoomed on pricing
  | 'CART_ABANDONED'   // Added to cart but no checkout
  | 'SURVEY_COMPLETED';

export interface EmailCampaignSequence {
  id: string;
  organizationId: string;
  flipbookId: string;
  name: string;
  trigger: CampaignTriggerType;
  delayHours: number;
  subject: string;
  emailBodyHtml: string;
  active: boolean;
  stats: {
    sentCount: number;
    openRatePercent: number;
    clickRatePercent: number;
    conversionsCount: number;
  };
}

// =========================================================
// 38. PHASE 40: MOTEUR DE PHYSIQUE DU PAPIER & TRANSITIONS 3D
// =========================================================

export type PageFlipEngineMode =
  | 'CLASSIC_3D_PAGE_CURL'    // Papier glacé avec reflets de courbure
  | 'HARDCOVER_BOUND_BOOK'    // Reliure livre rigide épaisse
  | 'SPIRAL_WIRE_NOTEBOOK'    // Carnet à spirale métallique
  | 'CONTINUOUS_INFINITE_SCROLL' // Défilement fluide sans cassure
  | 'ACCORDION_PANORAMIC';    // Dépliant panoramique 3 volets

export interface FlipPhysicsSettings {
  engineMode: PageFlipEngineMode;
  paperStiffness: number; // 0.1 (très souple) à 1.0 (cartonné)
  shadowIntensity: number; // 0.1 à 1.0
  cornerCurlRadius: number; // Courbure interactive au survol
  soundEffect: 'NONE' | 'SOFT_PAPER' | 'CRISP_MAGAZINE' | 'HEAVY_HARDBACK';
}

// =========================================================
// 39. PHASE 41: CONFORMITÉ RGPD / GDPR & CENTRE DE CONFIDENTIALITÉ
// =========================================================

export interface GdprConsentSettings {
  cookieBannerEnabled: boolean;
  allowEssential: boolean; // Always true
  allowAnalyticsTelemetry: boolean;
  allowMarketingRetargeting: boolean;
  allowHeatmapTracking: boolean;
  retentionPeriodDays: 30 | 90 | 180 | 365;
  anonymizeIpAddresses: boolean;
  privacyPolicyUrl: string;
  dpoContactEmail: string;
}

export interface GdprDataSubjectRequest {
  id: string;
  email: string;
  requestType: 'EXPORT_DATA' | 'DELETE_PURGE' | 'RECTIFY';
  status: 'PENDING' | 'PROCESSED' | 'REJECTED';
  requestedAt: number;
  completedAt?: number;
}

