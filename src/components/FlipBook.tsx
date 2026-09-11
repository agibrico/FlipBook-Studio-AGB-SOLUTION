import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FlipBookDocument, ViewLayout, ReaderTheme } from '../types';
import { HotspotRecord, AnnotationType, UserRole, PageComment } from '../types/saas';
import { FlipPageRenderer } from './FlipPageRenderer';
import { HotspotActionModal } from './common/HotspotActionModal';
import { soundEngine } from '../services/sound';
import { analyticsService } from '../services/analyticsService';
import { SearchDrawer } from './reader/SearchDrawer';
import { TocDrawer } from './reader/TocDrawer';
import { AnnotationLayer } from './reader/AnnotationLayer';
import { PageCommentLayer } from './reader/PageCommentLayer';
import { PageCommentsDrawer } from './reader/PageCommentsDrawer';
import { commentService } from '../services/commentService';
import { ReviewWorkflowModal } from './reader/ReviewWorkflowModal';
import { LeadCaptureModal } from './leads/LeadCaptureModal';
import { offlineExportService } from '../services/offlineExportService';
import { ecommerceService } from '../services/ecommerceService';
import { ShoppingCartDrawer } from './ShoppingCartDrawer';
import { AiAssistantModal } from './AiAssistantModal';
import { AmbientSoundPlayer } from './AmbientSoundPlayer';
import { AccessibilityBar } from './AccessibilityBar';
import { SocialShareModal } from './SocialShareModal';
import { PresentationControls } from './PresentationControls';
import { PasswordGateModal } from './PasswordGateModal';
import { WatermarkLayer } from './WatermarkLayer';
import { PageSurveyModal } from './PageSurveyModal';
import { AccessibilitySettings } from '../types/saas';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Search,
  List,
  Edit3,
  ShieldCheck,
  Download,
  Sparkles,
  MessageSquare,
  Highlighter,
  Crosshair,
  ShoppingBag,
  Bot,
  Share2,
  Lock,
  Languages,
} from 'lucide-react';

export interface DynamicShadowValues {
  leafDropShadow: string;
  castShadowOpacity: number;
  spineShadowOpacity?: number;
  ambientOcclusionSpread?: number;
}

export interface FlipBookProps {
  document: FlipBookDocument;
  currentPage: number;
  onPageChange: (page: number) => void;
  viewLayout: ViewLayout;
  theme: ReaderTheme;
  isAutoPlaying: boolean;
  onStopAutoPlay?: () => void;
  flipPhysics?: import('../types/saas').FlipPhysicsSettings;
  calculateDynamicShadow?: (
    curlAngleDeg: number,
    progress: number,
    direction: 'forward' | 'backward'
  ) => DynamicShadowValues;
}

export const FlipBook: React.FC<FlipBookProps> = ({
  document: doc,
  currentPage,
  onPageChange,
  viewLayout,
  isAutoPlaying,
  onStopAutoPlay,
  flipPhysics,
  calculateDynamicShadow,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [flipProgress, setFlipProgress] = useState<number | null>(null); // -1 (turning back) to 1 (turning forward)
  const [flipDirection, setFlipDirection] = useState<'forward' | 'backward' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Zoom and pan state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 });

  // Pinch-to-zoom state & gesture tracking
  const isPinchingRef = useRef<boolean>(false);
  const initialPinchDistRef = useRef<number>(0);
  const initialPinchZoomRef = useRef<number>(1);
  const pinchCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Audio effect: Trigger realistic paper-turning sound on page change
  const lastSoundPageRef = useRef<number>(currentPage);
  const isFirstMountRef = useRef<boolean>(true);

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      lastSoundPageRef.current = currentPage;
      return;
    }

    if (lastSoundPageRef.current !== currentPage) {
      soundEngine.playFlip();
      lastSoundPageRef.current = currentPage;
    }
  }, [currentPage]);

  // Touch drag gesture tracking
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isDraggingPageRef = useRef(false);

  // Corner hover curl state
  const [hoveredCorner, setHoveredCorner] = useState<'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | null>(null);

  // Phase 7 & 8: Interactivity, Rotation, Audio and Hotspots
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotRecord | null>(null);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.isSoundMuted());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Phase 11: Lead Generation & Gate Lock
  const [hasUnlockedLeadGate, setHasUnlockedLeadGate] = useState(false);
  const [isLeadGateOpen, setIsLeadGateOpen] = useState(false);
  const [isCustomInquiryModalOpen, setIsCustomInquiryModalOpen] = useState(false);

  useEffect(() => {
    // Lead gate triggers after 3 pages (at page 4)
    if (currentPage >= 4 && !hasUnlockedLeadGate) {
      setIsLeadGateOpen(true);
    }
  }, [currentPage, hasUnlockedLeadGate]);

  // Phase 12: Search & TOC Drawers
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);

  // Phase 13: Offline Standalone ZIP Export
  const [isExportingZip, setIsExportingZip] = useState(false);
  const handleDownloadOfflineZip = async () => {
    setIsExportingZip(true);
    try {
      await offlineExportService.downloadOfflineZip(doc);
    } finally {
      setIsExportingZip(false);
    }
  };

  // Phase 14: Visual Annotations & Review Workflow
  const [isAnnotationMode, setIsAnnotationMode] = useState(false);
  const [activeAnnotationTool, setActiveAnnotationTool] = useState<AnnotationType>('STICKY_NOTE');
  const [annotationColor, setAnnotationColor] = useState('#fde047');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Per-Page Comment System
  const [isCommentsDrawerOpen, setIsCommentsDrawerOpen] = useState(false);
  const [isPlacingCommentPin, setIsPlacingCommentPin] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [allComments, setAllComments] = useState<PageComment[]>(() => commentService.getComments(doc.id));
  const [pageCommentCounts, setPageCommentCounts] = useState<{ total: number; unresolved: number }>({
    total: 0,
    unresolved: 0,
  });

  // Phases 16-30 States
  // Phase 16: E-commerce Cart
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState<number>(() =>
    ecommerceService.getCart().reduce((sum, it) => sum + it.quantity, 0)
  );

  useEffect(() => {
    return ecommerceService.subscribe(() => {
      setCartCount(ecommerceService.getCart().reduce((sum, it) => sum + it.quantity, 0));
    });
  }, []);

  // Phase 17: Multi-language & RTL
  const [currentLang, setCurrentLang] = useState<'fr' | 'en' | 'ar'>('fr');

  // Phase 18: Security & Password Gate
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState(true);
  const [isPasswordGateOpen, setIsPasswordGateOpen] = useState(false);

  // Phase 19: AI Assistant
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Phase 23: Presentation / Kiosk / Virtual Laser
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: -100, y: -100 });

  // Phase 26: Social Sharing
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Phase 28: In-Page Survey
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);

  // Phase 29: Accessibility (WCAG 2.1 AAA)
  const [a11ySettings, setA11ySettings] = useState<AccessibilitySettings>({
    highContrast: false,
    dyslexicFont: false,
    textScalePercent: 100,
    showAriaAnnouncer: true,
  });

  useEffect(() => {
    const updateCounts = () => {
      setAllComments(commentService.getComments(doc.id));
      setPageCommentCounts(commentService.getCommentCounts(doc.id, currentPage));
    };
    updateCounts();
    const unsub = commentService.subscribe(updateCounts);
    return () => unsub();
  }, [doc.id, currentPage]);

  const pageCommentCountsMap = useMemo(() => {
    const map = new Map<number, { total: number; unresolved: number }>();
    allComments.forEach((c) => {
      const current = map.get(c.pageNumber) || { total: 0, unresolved: 0 };
      current.total += 1;
      if (!c.resolved) current.unresolved += 1;
      map.set(c.pageNumber, current);
    });
    return map;
  }, [allComments]);

  const getPageCommentInfo = (pageNum: number) => {
    return pageCommentCountsMap.get(pageNum) || { total: 0, unresolved: 0 };
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!window.document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      window.document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Track page view in analytics
  useEffect(() => {
    analyticsService.trackEvent({
      organizationId: 'org-azur-group',
      flipbookId: doc.id,
      eventType: 'page_view',
      pageNumber: currentPage,
    });
  }, [doc.id, currentPage]);

  const handleHotspotClick = (h: HotspotRecord) => {
    analyticsService.trackEvent({
      organizationId: 'org-azur-group',
      flipbookId: doc.id,
      eventType: h.type === 'WHATSAPP' ? 'whatsapp_click' : 'hotspot_click',
      pageNumber: h.pageNumber,
    });
    setSelectedHotspot(h);
  };

  // Detect responsive viewport and dimensions
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mobile = rect.width < 768;
      setIsMobile(mobile);
      setContainerSize({
        width: rect.width,
        height: rect.height,
      });
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Determine active layout: Single or Double
  const isSinglePage =
    viewLayout === 'single' || (viewLayout === 'auto' && isMobile);

  // Auto-play page turn loop
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      if (currentPage < doc.totalPages) {
        goToNext();
      } else {
        onStopAutoPlay();
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentPage, doc.totalPages]);

  // Reset zoom on page change
  useEffect(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [currentPage]);

  // Turn page forward animation
  const goToNext = useCallback(() => {
    if (isAnimating) return;
    if (isSinglePage) {
      if (currentPage >= doc.totalPages) return;
      const targetPage = Math.min(doc.totalPages, currentPage + 1);
      lastSoundPageRef.current = targetPage;
      setIsAnimating(true);
      setFlipDirection('forward');
      soundEngine.playFlip();

      let start = performance.now();
      const duration = 400;

      const animate = (time: number) => {
        const elapsed = time - start;
        const p = Math.min(1, elapsed / duration);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - p, 3);
        setFlipProgress(eased);

        if (p < 1) {
          requestAnimationFrame(animate);
        } else {
          onPageChange(targetPage);
          setFlipProgress(null);
          setFlipDirection(null);
          setIsAnimating(false);
        }
      };
      requestAnimationFrame(animate);
    } else {
      // Dual page mode
      const step = currentPage === 1 ? 1 : 2;
      const targetPage = Math.min(doc.totalPages, currentPage + step);
      if (currentPage >= doc.totalPages) return;

      lastSoundPageRef.current = targetPage;
      setIsAnimating(true);
      setFlipDirection('forward');
      soundEngine.playFlip();

      let start = performance.now();
      const duration = 500;

      const animate = (time: number) => {
        const elapsed = time - start;
        const p = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setFlipProgress(eased);

        if (p < 1) {
          requestAnimationFrame(animate);
        } else {
          onPageChange(targetPage);
          setFlipProgress(null);
          setFlipDirection(null);
          setIsAnimating(false);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [currentPage, doc.totalPages, isAnimating, isSinglePage, onPageChange]);

  // Turn page backward animation
  const goToPrev = useCallback(() => {
    if (isAnimating) return;
    if (currentPage <= 1) return;

    const targetPage = isSinglePage
      ? Math.max(1, currentPage - 1)
      : currentPage === 2
      ? 1
      : Math.max(1, currentPage - 2);

    lastSoundPageRef.current = targetPage;
    setIsAnimating(true);
    setFlipDirection('backward');
    soundEngine.playFlip();

    let start = performance.now();
    const duration = isSinglePage ? 400 : 500;

    const animate = (time: number) => {
      const elapsed = time - start;
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setFlipProgress(eased);

      if (p < 1) {
        requestAnimationFrame(animate);
      } else {
        onPageChange(targetPage);
        setFlipProgress(null);
        setFlipDirection(null);
        setIsAnimating(false);
      }
    };
    requestAnimationFrame(animate);
  }, [currentPage, isAnimating, isSinglePage, onPageChange]);

  // Keyboard navigation & Shortcuts (Arrows and Space handled globally in App.tsx)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'PageDown') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setIsCommentsDrawerOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (isPlacingCommentPin) {
          setIsPlacingCommentPin(false);
        } else if (zoomLevel > 1) {
          setZoomLevel(1);
          setPanOffset({ x: 0, y: 0 });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, zoomLevel, isPlacingCommentPin]);

  // Touch, pinch-to-zoom and drag handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    // Multi-touch pinch detection
    if ('touches' in e && e.touches.length === 2) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const midX = (t0.clientX + t1.clientX) / 2;
      const midY = (t0.clientY + t1.clientY) / 2;

      isPinchingRef.current = true;
      initialPinchDistRef.current = dist;
      initialPinchZoomRef.current = zoomLevel;
      pinchCenterRef.current = { x: midX, y: midY };
      initialPanRef.current = { ...panOffset };

      touchStartRef.current = null;
      isDraggingPageRef.current = false;
      setIsPanning(false);
      return;
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (zoomLevel > 1) {
      setIsPanning(true);
      panStartRef.current = {
        x: clientX,
        y: clientY,
        initialPanX: panOffset.x,
        initialPanY: panOffset.y,
      };
      return;
    }

    touchStartRef.current = {
      x: clientX,
      y: clientY,
      time: Date.now(),
    };
    isDraggingPageRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    // Pinch-to-zoom in progress
    if ('touches' in e && e.touches.length === 2) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);

      if (!isPinchingRef.current || initialPinchDistRef.current === 0) {
        isPinchingRef.current = true;
        initialPinchDistRef.current = dist;
        initialPinchZoomRef.current = zoomLevel;
        pinchCenterRef.current = { x: (t0.clientX + t1.clientX) / 2, y: (t0.clientY + t1.clientY) / 2 };
        initialPanRef.current = { ...panOffset };
        return;
      }

      const scale = dist / initialPinchDistRef.current;
      // Allow zoom up to 3.5x for inspecting small text details, fine print, and charts
      const targetZoom = Math.min(3.5, Math.max(1, +(initialPinchZoomRef.current * scale).toFixed(2)));

      const currentMidX = (t0.clientX + t1.clientX) / 2;
      const currentMidY = (t0.clientY + t1.clientY) / 2;
      const deltaMidX = currentMidX - pinchCenterRef.current.x;
      const deltaMidY = currentMidY - pinchCenterRef.current.y;

      setZoomLevel(targetZoom);
      if (targetZoom > 1) {
        setPanOffset({
          x: initialPanRef.current.x + deltaMidX,
          y: initialPanRef.current.y + deltaMidY,
        });
      } else {
        setPanOffset({ x: 0, y: 0 });
      }
      return;
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (isPanning && zoomLevel > 1) {
      const deltaX = clientX - panStartRef.current.x;
      const deltaY = clientY - panStartRef.current.y;

      const totalW = pageWidth * (isSinglePage ? 1 : 2);
      const maxPanX = Math.max(0, (totalW * (zoomLevel - 1)) / 2 + 100);
      const maxPanY = Math.max(0, (pageHeight * (zoomLevel - 1)) / 2 + 100);

      const nextX = panStartRef.current.initialPanX + deltaX;
      const nextY = panStartRef.current.initialPanY + deltaY;

      setPanOffset({
        x: Math.max(-maxPanX, Math.min(maxPanX, nextX)),
        y: Math.max(-maxPanY, Math.min(maxPanY, nextY)),
      });
      return;
    }

    if (!isDraggingPageRef.current || !touchStartRef.current || isAnimating) return;
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    // End of pinch gesture
    if (isPinchingRef.current) {
      if (!('touches' in e) || e.touches.length < 2) {
        isPinchingRef.current = false;
        initialPinchDistRef.current = 0;

        // Snap back to 1x if barely zoomed
        setZoomLevel((curr) => {
          if (curr < 1.08) {
            setPanOffset({ x: 0, y: 0 });
            return 1;
          }
          return curr;
        });

        touchStartRef.current = null;
        isDraggingPageRef.current = false;
        setIsPanning(false);
        return;
      }
    }

    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!touchStartRef.current || !isDraggingPageRef.current) return;

    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;

    const deltaX = clientX - touchStartRef.current.x;
    const deltaY = clientY - touchStartRef.current.y;
    const elapsed = Date.now() - touchStartRef.current.time;

    // Tap or Swipe detection
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swiped left -> Next page
        goToNext();
      } else {
        // Swiped right -> Previous page
        goToPrev();
      }
    } else if (Math.abs(deltaX) < 15 && Math.abs(deltaY) < 15 && elapsed < 350) {
      // Tap on left or right third of the screen
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const relativeX = clientX - rect.left;
        if (relativeX > rect.width * 0.7) {
          goToNext();
        } else if (relativeX < rect.width * 0.3) {
          goToPrev();
        }
      }
    }

    touchStartRef.current = null;
    isDraggingPageRef.current = false;
  };

  // Double tap to zoom
  const lastTapRef = useRef<number>(0);
  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPinchingRef.current) return;
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (zoomLevel > 1) {
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
      } else {
        setZoomLevel(2.2);
      }
      e.stopPropagation();
    }
    lastTapRef.current = now;
  };

  // Prevent browser native pinch-zoom gestures from conflicting with flipbook pinch
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleNativeTouch = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
      }
    };

    el.addEventListener('touchstart', handleNativeTouch, { passive: false });
    el.addEventListener('touchmove', handleNativeTouch, { passive: false });

    return () => {
      el.removeEventListener('touchstart', handleNativeTouch);
      el.removeEventListener('touchmove', handleNativeTouch);
    };
  }, []);

  // Compute dimensions to fit container perfectly while preserving book aspect ratio
  const bookRatio = doc.aspectRatio || 0.707; // single page ratio (width / height)
  const paddingX = isMobile ? 16 : 48;
  const paddingY = isMobile ? 32 : 56;
  const maxW = containerSize.width - paddingX;
  const maxH = containerSize.height - paddingY;

  let pageWidth: number;
  let pageHeight: number;

  if (isSinglePage) {
    // Single page fits maxW x maxH
    const heightByWidth = maxW / bookRatio;
    if (heightByWidth <= maxH) {
      pageHeight = heightByWidth;
      pageWidth = maxW;
    } else {
      pageHeight = maxH;
      pageWidth = maxH * bookRatio;
    }
  } else {
    // Dual page spread: 2 * pageWidth x pageHeight
    const spreadRatio = bookRatio * 2;
    const heightByWidth = maxW / spreadRatio;
    if (heightByWidth <= maxH) {
      pageHeight = heightByWidth;
      pageWidth = (maxW / 2);
    } else {
      pageHeight = maxH;
      pageWidth = maxH * bookRatio;
    }
  }

  // Ensure minimum sizing
  pageWidth = Math.max(180, pageWidth);
  pageHeight = Math.max(260, pageHeight);

  // Page index helper
  const getPage = (num: number) => doc.pages.find((p) => p.pageNumber === num);

  // Active spread pages
  const leftPageNum = isSinglePage ? currentPage : currentPage === 1 ? 0 : currentPage % 2 === 0 ? currentPage : currentPage - 1;
  const rightPageNum = isSinglePage ? currentPage : currentPage === 1 ? 1 : leftPageNum + 1;

  const leftPage = getPage(leftPageNum);
  const rightPage = getPage(rightPageNum);

  // Turning page rotation angle
  const turnAngle = flipProgress !== null
    ? flipDirection === 'forward'
      ? -flipProgress * 180
      : 180 - flipProgress * 180
    : 0;

  return (
    <div
      ref={containerRef}
      id="flipbook-viewport"
      className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none touch-none ${
        a11ySettings.highContrast ? 'contrast-125 brightness-105' : ''
      } ${a11ySettings.dyslexicFont ? 'font-sans tracking-wide' : ''}`}
      onMouseDown={handleTouchStart}
      onMouseMove={(e) => {
        handleTouchMove(e);
        if (isLaserActive && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setLaserPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
      }}
      onMouseUp={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleDoubleTap}
      style={{
        cursor: isLaserActive ? 'crosshair' : zoomLevel > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
        fontSize: a11ySettings.textScalePercent !== 100 ? `${a11ySettings.textScalePercent}%` : undefined,
      }}
    >
      {/* Virtual Laser Pointer (Phase 23) */}
      {isLaserActive && (
        <div
          className="pointer-events-none absolute z-50 w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_16px_6px_rgba(244,63,94,0.9)] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{ left: `${laserPos.x}px`, top: `${laserPos.y}px` }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}

      {/* Security Dynamic Watermark (Phase 18) */}
      <WatermarkLayer enabled={true} watermarkText="FLIPBOOK STUDIO • CONFIDENTIEL" />
      {/* Zoom / Pan Container */}
      <div
        className="transition-transform duration-100 ease-out origin-center flex items-center justify-center"
        style={{
          transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px) rotate(${rotation}deg)`,
        }}
      >
        {isSinglePage ? (
          // ================= SINGLE PAGE VIEW (Mobile Portrait) =================
          <div
            className="relative rounded-lg overflow-hidden border border-zinc-300/40 bg-white transition-shadow duration-300"
            style={{
              width: `${pageWidth}px`,
              height: `${pageHeight}px`,
              perspective: '2200px',
              perspectiveOrigin: 'center',
              boxShadow: isAnimating
                ? '0 30px 60px -12px rgba(0, 0, 0, 0.45), 0 0 25px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                : '0 20px 45px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Base Current Page */}
            <div className="w-full h-full relative">
              <FlipPageRenderer
                page={getPage(currentPage)}
                pageNumber={currentPage}
                totalPages={doc.totalPages}
                side="single"
                onHotspotClick={(h) => setSelectedHotspot(h)}
                onNavigateToPage={onPageChange}
                commentCount={getPageCommentInfo(currentPage).total}
                unresolvedCommentCount={getPageCommentInfo(currentPage).unresolved}
                onCommentClick={() => setIsCommentsDrawerOpen(true)}
              />
              {/* Phase 14: Visual Annotation Layer */}
              <AnnotationLayer
                flipbookId={doc.id}
                pageNumber={currentPage}
                isAnnotationMode={isAnnotationMode}
                activeTool={activeAnnotationTool}
                currentColor={annotationColor}
                currentUser={{ name: 'Client Relecteur', role: 'CLIENT' }}
              />
              {/* Page-Specific Comment & Note Pins Layer */}
              <PageCommentLayer
                flipbookId={doc.id}
                pageNumber={currentPage}
                isPlacingPin={isPlacingCommentPin}
                onPinPlaced={() => setIsPlacingCommentPin(false)}
                selectedCommentId={selectedCommentId}
                onSelectComment={(id) => {
                  setSelectedCommentId(id);
                  setIsCommentsDrawerOpen(true);
                }}
                currentUser={{ name: 'Client Relecteur', role: 'CLIENT' }}
              />

              {/* Dynamic cast shadow on base page beneath turning sheet */}
              {isAnimating && flipProgress !== null && (() => {
                const curlAngle = Math.abs(turnAngle);
                const customShadow = calculateDynamicShadow
                  ? calculateDynamicShadow(curlAngle, flipProgress, flipDirection || 'forward')
                  : null;
                const castOpacity = customShadow ? customShadow.castShadowOpacity : Math.sin(flipProgress * Math.PI) * 0.75;
                return (
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-150"
                    style={{
                      background:
                        flipDirection === 'forward'
                          ? 'linear-gradient(to right, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.12) 35%, transparent 70%)'
                          : 'linear-gradient(to left, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.12) 35%, transparent 70%)',
                      opacity: castOpacity,
                      zIndex: 35,
                    }}
                  />
                );
              })()}
            </div>

            {/* Turning Overlay in Single Page Mode */}
            {isAnimating && flipProgress !== null && (() => {
              const curlAngle = Math.abs(turnAngle);
              const customShadow = calculateDynamicShadow
                ? calculateDynamicShadow(curlAngle, flipProgress, flipDirection || 'forward')
                : null;
              const leafElevation = Math.sin(flipProgress * Math.PI);
              const shadowOffset = flipDirection === 'forward'
                ? -Math.round(20 * leafElevation)
                : Math.round(20 * leafElevation);
              const fallbackShadow = `${shadowOffset}px 14px ${Math.round(28 + 22 * leafElevation)}px rgba(0, 0, 0, ${0.25 + 0.35 * leafElevation})`;
              const dynamicShadow = customShadow?.leafDropShadow ?? fallbackShadow;

              return (
                <div
                  className="absolute inset-0 origin-left transition-transform duration-0 pointer-events-none"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `rotateY(${flipDirection === 'forward' ? -flipProgress * 180 : (1 - flipProgress) * 180 - 180}deg)`,
                    zIndex: 40,
                    filter: `drop-shadow(${dynamicShadow})`,
                  }}
                >
                  {/* Front of flipping sheet */}
                  <div
                    className="absolute inset-0 bg-white shadow-xl"
                    style={{
                      backfaceVisibility: 'hidden',
                      boxShadow: `inset 0 0 35px rgba(0,0,0,${0.06 + 0.12 * leafElevation})`,
                    }}
                  >
                    <FlipPageRenderer
                      page={getPage(flipDirection === 'forward' ? currentPage : currentPage - 1)}
                      pageNumber={currentPage}
                      totalPages={doc.totalPages}
                      side="single"
                      onHotspotClick={(h) => setSelectedHotspot(h)}
                      onNavigateToPage={onPageChange}
                    />
                    {/* Dynamic 3D lighting sheen & curve gradient */}
                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity"
                      style={{
                        background: `linear-gradient(to right, rgba(0,0,0,0.25) 0%, rgba(255,255,255,${0.28 * leafElevation}) ${Math.round(15 + flipProgress * 70)}%, rgba(0,0,0,${0.32 * leafElevation}) 100%)`,
                        opacity: leafElevation,
                      }}
                    />
                  </div>

                  {/* Back of flipping sheet */}
                  <div
                    className="absolute inset-0 bg-white shadow-xl"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      boxShadow: `inset 0 0 35px rgba(0,0,0,${0.06 + 0.12 * leafElevation})`,
                    }}
                  >
                    <FlipPageRenderer
                      page={getPage(flipDirection === 'forward' ? currentPage + 1 : currentPage)}
                      pageNumber={currentPage + 1}
                      totalPages={doc.totalPages}
                      side="single"
                      onHotspotClick={handleHotspotClick}
                      onNavigateToPage={onPageChange}
                    />
                    {/* Dynamic light sheen on back face */}
                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity"
                      style={{
                        background: `linear-gradient(to left, rgba(0,0,0,0.25) 0%, rgba(255,255,255,${0.28 * leafElevation}) ${Math.round(15 + (1 - flipProgress) * 70)}%, rgba(0,0,0,${0.32 * leafElevation}) 100%)`,
                        opacity: leafElevation,
                      }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Subtle Corner Dog-Ear Cue for Mobile Tap */}
            {currentPage < doc.totalPages && (
              <div
                id="corner-curl-hint"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute bottom-0 right-0 w-12 h-12 overflow-hidden cursor-pointer z-30 group"
              >
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-zinc-400/40 to-transparent transform rotate-45 translate-x-3 translate-y-3 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform shadow-md rounded-tl" />
              </div>
            )}
          </div>
        ) : (
          // ================= DUAL PAGE SPREAD VIEW (Tablet & Desktop) =================
          <div
            id="flipbook-spread"
            className="relative flex items-center justify-center rounded-lg transition-shadow duration-300"
            style={{
              width: `${pageWidth * 2}px`,
              height: `${pageHeight}px`,
              perspective: '2600px',
              perspectiveOrigin: 'center',
              boxShadow: isAnimating
                ? '0 32px 75px -15px rgba(0, 0, 0, 0.55), 0 0 30px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.06)'
                : '0 25px 60px -15px rgba(0, 0, 0, 0.45), 0 0 25px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            }}
          >
            {/* Book Spine Center Shadow / Crease */}
            <div
              className="absolute top-0 bottom-0 left-1/2 w-8 -translate-x-1/2 z-30 pointer-events-none"
              style={{
                background: 'linear-gradient(to right, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.35) 48%, rgba(0,0,0,0.42) 50%, rgba(0,0,0,0.35) 52%, rgba(0,0,0,0.18) 100%)',
              }}
            />

            {/* Left Page Container */}
            <div
              className="relative overflow-hidden rounded-l-md bg-white border-y border-l border-zinc-300/60 shadow-inner"
              style={{
                width: `${pageWidth}px`,
                height: `${pageHeight}px`,
              }}
            >
              {leftPageNum > 0 ? (
                <>
                  <FlipPageRenderer
                    page={leftPage}
                    pageNumber={leftPageNum}
                    totalPages={doc.totalPages}
                    side="left"
                    onHotspotClick={handleHotspotClick}
                    onNavigateToPage={onPageChange}
                    commentCount={getPageCommentInfo(leftPageNum).total}
                    unresolvedCommentCount={getPageCommentInfo(leftPageNum).unresolved}
                    onCommentClick={() => setIsCommentsDrawerOpen(true)}
                  />
                  {/* Phase 14: Left Page Annotation Layer */}
                  <AnnotationLayer
                    flipbookId={doc.id}
                    pageNumber={leftPageNum}
                    isAnnotationMode={isAnnotationMode}
                    activeTool={activeAnnotationTool}
                    currentColor={annotationColor}
                    currentUser={{ name: 'Client Relecteur', role: 'CLIENT' }}
                  />
                  {/* Page Comment Pins Layer (Left Page) */}
                  <PageCommentLayer
                    flipbookId={doc.id}
                    pageNumber={leftPageNum}
                    isPlacingPin={isPlacingCommentPin}
                    onPinPlaced={() => setIsPlacingCommentPin(false)}
                    selectedCommentId={selectedCommentId}
                    onSelectComment={(id) => {
                      setSelectedCommentId(id);
                      setIsCommentsDrawerOpen(true);
                    }}
                    currentUser={{ name: 'Client Relecteur', role: 'CLIENT' }}
                  />

                  {/* Dynamic cast shadow on left page when turning leaf approaches */}
                  {isAnimating && flipProgress !== null && (() => {
                    const curlAngle = Math.abs(turnAngle);
                    const customShadow = calculateDynamicShadow
                      ? calculateDynamicShadow(curlAngle, flipProgress, flipDirection || 'forward')
                      : null;
                    const opacity = customShadow
                      ? (flipDirection === 'forward' ? customShadow.castShadowOpacity : customShadow.castShadowOpacity * 0.5)
                      : (flipDirection === 'forward'
                          ? flipProgress * Math.sin(flipProgress * Math.PI) * 0.95
                          : (1 - flipProgress) * Math.sin(flipProgress * Math.PI) * 0.95);
                    return (
                      <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-150"
                        style={{
                          background:
                            'linear-gradient(to left, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.14) 35%, transparent 70%)',
                          opacity,
                          zIndex: 25,
                        }}
                      />
                    );
                  })()}
                </>
              ) : (
                <div className="w-full h-full bg-zinc-900/90 flex items-center justify-center text-zinc-600 font-mono text-xs select-none">
                  Plat de couverture
                </div>
              )}

              {/* Corner Curl on Left Page for Previous */}
              {leftPageNum > 0 && (
                <div
                  onMouseEnter={() => setHoveredCorner('bottom-left')}
                  onMouseLeave={() => setHoveredCorner(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrev();
                  }}
                  className="absolute bottom-0 left-0 w-12 h-12 cursor-pointer z-30 group"
                  title="Page précédente"
                >
                  <div
                    className={`absolute bottom-0 left-0 w-8 h-8 bg-gradient-to-tr from-zinc-400/40 to-transparent transform -rotate-45 -translate-x-3 translate-y-3 transition-transform shadow rounded-tr ${
                      hoveredCorner === 'bottom-left' ? '-translate-x-1 translate-y-1' : ''
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Right Page Container */}
            <div
              className="relative overflow-hidden rounded-r-md bg-white border-y border-r border-zinc-300/60 shadow-inner"
              style={{
                width: `${pageWidth}px`,
                height: `${pageHeight}px`,
              }}
            >
              {rightPageNum <= doc.totalPages ? (
                <>
                  <FlipPageRenderer
                    page={rightPage}
                    pageNumber={rightPageNum}
                    totalPages={doc.totalPages}
                    side="right"
                    onHotspotClick={handleHotspotClick}
                    onNavigateToPage={onPageChange}
                    commentCount={getPageCommentInfo(rightPageNum).total}
                    unresolvedCommentCount={getPageCommentInfo(rightPageNum).unresolved}
                    onCommentClick={() => setIsCommentsDrawerOpen(true)}
                  />
                  {/* Phase 14: Right Page Annotation Layer */}
                  <AnnotationLayer
                    flipbookId={doc.id}
                    pageNumber={rightPageNum}
                    isAnnotationMode={isAnnotationMode}
                    activeTool={activeAnnotationTool}
                    currentColor={annotationColor}
                    currentUser={{ name: 'Client Relecteur', role: 'CLIENT' }}
                  />
                  {/* Page Comment Pins Layer (Right Page) */}
                  <PageCommentLayer
                    flipbookId={doc.id}
                    pageNumber={rightPageNum}
                    isPlacingPin={isPlacingCommentPin}
                    onPinPlaced={() => setIsPlacingCommentPin(false)}
                    selectedCommentId={selectedCommentId}
                    onSelectComment={(id) => {
                      setSelectedCommentId(id);
                      setIsCommentsDrawerOpen(true);
                    }}
                    currentUser={{ name: 'Client Relecteur', role: 'CLIENT' }}
                  />

                  {/* Dynamic cast shadow on right page when turning leaf lifts */}
                  {isAnimating && flipProgress !== null && (() => {
                    const curlAngle = Math.abs(turnAngle);
                    const customShadow = calculateDynamicShadow
                      ? calculateDynamicShadow(curlAngle, flipProgress, flipDirection || 'forward')
                      : null;
                    const opacity = customShadow
                      ? (flipDirection === 'forward' ? customShadow.castShadowOpacity * 0.5 : customShadow.castShadowOpacity)
                      : (flipDirection === 'forward'
                          ? (1 - flipProgress) * Math.sin(flipProgress * Math.PI) * 0.95
                          : flipProgress * Math.sin(flipProgress * Math.PI) * 0.95);
                    return (
                      <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-150"
                        style={{
                          background:
                            'linear-gradient(to right, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.14) 35%, transparent 70%)',
                          opacity,
                          zIndex: 25,
                        }}
                      />
                    );
                  })()}
                </>
              ) : (
                <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-400 font-mono text-xs">
                  Fin du document
                </div>
              )}

              {/* Corner Curl on Right Page for Next */}
              {rightPageNum < doc.totalPages && (
                <div
                  onMouseEnter={() => setHoveredCorner('bottom-right')}
                  onMouseLeave={() => setHoveredCorner(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute bottom-0 right-0 w-12 h-12 cursor-pointer z-30 group"
                  title="Page suivante"
                >
                  <div
                    className={`absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-zinc-400/40 to-transparent transform rotate-45 translate-x-3 translate-y-3 transition-transform shadow rounded-tl ${
                      hoveredCorner === 'bottom-right' ? 'translate-x-1 translate-y-1' : ''
                    }`}
                  />
                </div>
              )}
            </div>

            {/* 3D TURNING SHEET OVERLAY (Double Page Spread) */}
            {isAnimating && flipProgress !== null && (() => {
              const curlAngle = Math.abs(turnAngle);
              const customShadow = calculateDynamicShadow
                ? calculateDynamicShadow(curlAngle, flipProgress, flipDirection || 'forward')
                : null;
              const leafElevation = Math.sin(flipProgress * Math.PI);
              const shadowOffsetX = flipDirection === 'forward'
                ? Math.round((1 - flipProgress * 2) * 26)
                : Math.round((flipProgress * 2 - 1) * 26);
              const fallbackShadow = `${shadowOffsetX}px ${Math.round(14 + leafElevation * 18)}px ${Math.round(30 + leafElevation * 35)}px rgba(0, 0, 0, ${0.25 + leafElevation * 0.4})`;
              const dynamicLeafShadow = customShadow?.leafDropShadow ?? fallbackShadow;

              return (
                <div
                  className="absolute top-0 bottom-0 pointer-events-none"
                  style={{
                    left: `${pageWidth}px`,
                    width: `${pageWidth}px`,
                    height: `${pageHeight}px`,
                    transformOrigin: 'left center',
                    transformStyle: 'preserve-3d',
                    transform: `rotateY(${turnAngle}deg)`,
                    zIndex: 50,
                    filter: `drop-shadow(${dynamicLeafShadow})`,
                  }}
                >
                  {/* Front face of flipping leaf */}
                  <div
                    className="absolute inset-0 bg-white rounded-r-md overflow-hidden"
                    style={{
                      backfaceVisibility: 'hidden',
                      boxShadow: `inset 0 0 32px rgba(0,0,0,${0.06 + leafElevation * 0.12})`,
                    }}
                  >
                    <FlipPageRenderer
                      page={flipDirection === 'forward' ? rightPage : getPage(leftPageNum)}
                      pageNumber={flipDirection === 'forward' ? rightPageNum : leftPageNum}
                      totalPages={doc.totalPages}
                      side="right"
                      onHotspotClick={handleHotspotClick}
                      onNavigateToPage={onPageChange}
                      commentCount={getPageCommentInfo(flipDirection === 'forward' ? rightPageNum : leftPageNum).total}
                      unresolvedCommentCount={getPageCommentInfo(flipDirection === 'forward' ? rightPageNum : leftPageNum).unresolved}
                      onCommentClick={() => setIsCommentsDrawerOpen(true)}
                    />
                    {/* Dynamic 3D lighting sheen & curve gradient */}
                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity"
                      style={{
                        background: `linear-gradient(to right, rgba(0,0,0,0.25) 0%, rgba(255,255,255,${0.32 * leafElevation}) ${Math.round(15 + flipProgress * 65)}%, rgba(0,0,0,${0.38 * leafElevation}) 100%)`,
                        opacity: leafElevation,
                      }}
                    />
                  </div>

                  {/* Back face of flipping leaf */}
                  <div
                    className="absolute inset-0 bg-white rounded-l-md overflow-hidden"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      boxShadow: `inset 0 0 32px rgba(0,0,0,${0.06 + leafElevation * 0.12})`,
                    }}
                  >
                    <FlipPageRenderer
                      page={flipDirection === 'forward' ? getPage(rightPageNum + 1) : getPage(leftPageNum - 1)}
                      pageNumber={flipDirection === 'forward' ? rightPageNum + 1 : leftPageNum - 1}
                      totalPages={doc.totalPages}
                      side="left"
                      onHotspotClick={handleHotspotClick}
                      onNavigateToPage={onPageChange}
                      commentCount={getPageCommentInfo(flipDirection === 'forward' ? rightPageNum + 1 : leftPageNum - 1).total}
                      unresolvedCommentCount={getPageCommentInfo(flipDirection === 'forward' ? rightPageNum + 1 : leftPageNum - 1).unresolved}
                      onCommentClick={() => setIsCommentsDrawerOpen(true)}
                    />
                    {/* Dynamic 3D lighting sheen & curve gradient on reverse face */}
                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity"
                      style={{
                        background: `linear-gradient(to left, rgba(0,0,0,0.25) 0%, rgba(255,255,255,${0.32 * leafElevation}) ${Math.round(15 + (1 - flipProgress) * 65)}%, rgba(0,0,0,${0.38 * leafElevation}) 100%)`,
                        opacity: leafElevation,
                      }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Floating Zoom Indicator on Mobile */}
      {isMobile && zoomLevel > 1 && (
        <div
          id="mobile-zoom-indicator"
          className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 rounded-full bg-zinc-900/90 text-white border border-white/20 shadow-xl backdrop-blur-md flex items-center gap-2 text-xs font-mono pointer-events-auto animate-in fade-in zoom-in-95 duration-150"
        >
          <span className="text-amber-400 font-semibold">{Math.round(zoomLevel * 100)}%</span>
          <span className="text-zinc-400 text-[11px]">Glisser pour inspecter</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="px-2 py-0.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-200 border border-zinc-700 cursor-pointer font-sans"
          >
            Réinitialiser
          </button>
        </div>
      )}

      {/* Floating Side Navigation Arrows (Desktop / Tablet) */}
      {!isMobile && (
        <>
          <button
            id="prev-page-arrow"
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            disabled={currentPage <= 1 || isAnimating}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 disabled:opacity-0 text-white backdrop-blur-md flex items-center justify-center transition-all z-40 shadow-lg cursor-pointer"
            aria-label="Page précédente"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            id="next-page-arrow"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            disabled={currentPage >= doc.totalPages || isAnimating}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 disabled:opacity-0 text-white backdrop-blur-md flex items-center justify-center transition-all z-40 shadow-lg cursor-pointer"
            aria-label="Page suivante"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Zoom & Viewer Controls Overlay (Top Right) */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-1.5 bg-black/50 backdrop-blur-md p-1 rounded-xl text-white shadow-lg border border-white/10">
        <button
          id="zoom-out-btn"
          onClick={(e) => {
            e.stopPropagation();
            setZoomLevel((z) => {
              const next = Math.max(1, +(z - 0.3).toFixed(1));
              if (next === 1) setPanOffset({ x: 0, y: 0 });
              return next;
            });
          }}
          disabled={zoomLevel <= 1}
          className="p-1.5 hover:bg-white/20 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
          title="Dézoomer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="text-xs font-mono px-1.5 min-w-[42px] text-center">
          {Math.round(zoomLevel * 100)}%
        </span>

        <button
          id="zoom-in-btn"
          onClick={(e) => {
            e.stopPropagation();
            setZoomLevel((z) => Math.min(3.5, +(z + 0.3).toFixed(1)));
          }}
          disabled={zoomLevel >= 3.5}
          className="p-1.5 hover:bg-white/20 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
          title="Zoomer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {zoomLevel > 1 && (
          <button
            id="reset-zoom-btn"
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-amber-300"
            title="Réinitialiser le zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Phase 7: Rotation control */}
        <div className="w-px h-4 bg-white/20 mx-0.5" />
        <button
          id="rotate-btn"
          onClick={(e) => {
            e.stopPropagation();
            setRotation((r) => ((r + 90) % 360) as any);
          }}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          title="Pivoter à 90°"
        >
          <RotateCw className="w-4 h-4 text-indigo-300" />
        </button>

        {/* Phase 7: Audio Sound Mute */}
        <button
          id="sound-toggle-btn"
          onClick={(e) => {
            e.stopPropagation();
            soundEngine.toggleMute();
            setIsMuted(soundEngine.isSoundMuted());
          }}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          title={isMuted ? 'Activer le son du papier' : 'Couper le son'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-zinc-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          )}
        </button>

        {/* Phase 7: Fullscreen Toggle */}
        <button
          id="fullscreen-toggle-btn"
          onClick={(e) => {
            e.stopPropagation();
            toggleFullscreen();
          }}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-zinc-300" />
          ) : (
            <Maximize2 className="w-4 h-4 text-zinc-300" />
          )}
        </button>

        {/* Phase 12: Table of Contents & Bookmarks */}
        <div className="w-px h-4 bg-white/20 mx-0.5" />
        <button
          id="toc-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsTocOpen(true);
          }}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-zinc-300 hover:text-white"
          title="Sommaire & Signets"
        >
          <List className="w-4 h-4" />
        </button>

        {/* Phase 12: Full-Text Search */}
        <button
          id="search-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsSearchOpen(true);
          }}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-zinc-300 hover:text-white"
          title="Rechercher dans le document"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Page Comments & Notes System Button */}
        <button
          id="page-comments-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsCommentsDrawerOpen((prev) => !prev);
          }}
          className={`relative p-1.5 rounded-lg transition-colors cursor-pointer ${
            isCommentsDrawerOpen
              ? 'bg-indigo-600 text-white shadow-md'
              : 'hover:bg-white/20 text-zinc-300 hover:text-white'
          }`}
          title="Commentaires et notes par page (Touche 'C')"
        >
          <MessageSquare className="w-4 h-4" />
          {pageCommentCounts.total > 0 && (
            <span
              className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center text-white border border-zinc-950 shadow-sm ${
                pageCommentCounts.unresolved > 0 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            >
              {pageCommentCounts.total}
            </span>
          )}
        </button>

        {/* Phase 14: Visual Annotation Mode Toggle */}
        <button
          id="annotate-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsAnnotationMode((prev) => !prev);
          }}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isAnnotationMode
              ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'hover:bg-white/20 text-zinc-300 hover:text-white'
          }`}
          title="Outils d’annotation & relecture"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        {/* Phase 14: Client Review / Sign-Off */}
        <button
          id="review-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsReviewModalOpen(true);
          }}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-indigo-300 hover:text-indigo-200"
          title="Workflow de validation client & B.A.T."
        >
          <ShieldCheck className="w-4 h-4" />
        </button>

        {/* Phase 13: Download Autonomous Offline ZIP */}
        <button
          id="download-offline-zip-btn"
          disabled={isExportingZip}
          onClick={(e) => {
            e.stopPropagation();
            handleDownloadOfflineZip();
          }}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-zinc-300 hover:text-emerald-300"
          title="Télécharger le package autonome hors-ligne (ZIP)"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Phase 16: Shoppable Cart Button with Badge */}
        <button
          id="shopping-cart-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsCartOpen(true);
          }}
          className="relative p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-amber-300 hover:text-amber-200"
          title="Panier interactif"
        >
          <ShoppingBag className="w-4 h-4" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center bg-amber-500 text-black border border-zinc-950 shadow-sm animate-pulse">
              {cartCount}
            </span>
          )}
        </button>

        {/* Phase 19: Gemini AI Assistant */}
        <button
          id="ai-assistant-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsAiModalOpen(true);
          }}
          className="p-1.5 hover:bg-indigo-600/30 rounded-lg transition-colors cursor-pointer text-indigo-400 hover:text-indigo-200"
          title="Assistant IA Gemini - Analyse et questions sur le document"
        >
          <Bot className="w-4 h-4" />
        </button>

        {/* Phase 22: Ambient Sound Player */}
        <AmbientSoundPlayer />

        {/* Phase 23: Presentation / Kiosk / Laser */}
        <PresentationControls
          totalPages={doc.totalPages}
          currentPage={currentPage}
          onNextPage={goToNext}
          onPrevPage={goToPrev}
          onGoToPage={onPageChange}
          isLaserActive={isLaserActive}
          onToggleLaser={() => setIsLaserActive((v) => !v)}
        />

        {/* Phase 26: Social Sharing Modal */}
        <button
          id="share-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsShareModalOpen(true);
          }}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-zinc-300 hover:text-white"
          title="Partager ce catalogue (WhatsApp, LinkedIn, Twitter)"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Phase 28: Interactive Page Survey */}
        <button
          id="survey-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsSurveyOpen(true);
          }}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-zinc-300 hover:text-amber-300"
          title="Donner votre avis sur cette page"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Phase 29: Accessibility Suite (WCAG AAA) */}
        <AccessibilityBar
          settings={a11ySettings}
          onChange={(newSettings) => setA11ySettings(newSettings)}
        />

        {/* Phase 17: Language Selector */}
        <div className="flex items-center gap-0.5 bg-black/40 p-0.5 rounded-lg border border-white/10 text-[10px] font-mono">
          {(['fr', 'en', 'ar'] as const).map((lang) => (
            <button
              key={lang}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentLang(lang);
              }}
              className={`px-1.5 py-0.5 rounded transition-all uppercase ${
                currentLang === lang ? 'bg-indigo-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Phase 11: In-Flipbook Lead Inquiry CTA */}
        <button
          id="inquire-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsCustomInquiryModalOpen(true);
          }}
          className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
          title="Demande de devis & privatisation"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Devis</span>
        </button>
      </div>

      {/* Floating Annotation Toolbar */}
      {isAnnotationMode && (
        <div className="absolute top-16 right-4 z-40 bg-zinc-950/90 backdrop-blur-md px-3 py-2 rounded-xl border border-zinc-700 shadow-2xl flex items-center gap-3 text-xs text-white animate-in fade-in slide-in-from-top-2">
          <span className="font-semibold text-[11px] text-amber-400 flex items-center gap-1">
            <Edit3 className="w-3.5 h-3.5" /> Mode Révision
          </span>

          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
            <button
              onClick={() => setActiveAnnotationTool('STICKY_NOTE')}
              className={`p-1.5 rounded flex items-center gap-1 text-[11px] font-medium transition-colors ${
                activeAnnotationTool === 'STICKY_NOTE'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Ajouter une note adhésive"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Note</span>
            </button>
            <button
              onClick={() => setActiveAnnotationTool('HIGHLIGHT')}
              className={`p-1.5 rounded flex items-center gap-1 text-[11px] font-medium transition-colors ${
                activeAnnotationTool === 'HIGHLIGHT'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Surligneur"
            >
              <Highlighter className="w-3 h-3" />
              <span>Surligneur</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {['#fde047', '#a7f3d0', '#fbcfe8', '#fed7aa'].map((col) => (
              <button
                key={col}
                onClick={() => setAnnotationColor(col)}
                className={`w-4 h-4 rounded-full border transition-transform ${
                  annotationColor === col ? 'scale-125 border-white shadow' : 'border-black/30'
                }`}
                style={{ backgroundColor: col }}
              />
            ))}
          </div>

          <button
            onClick={() => setIsAnnotationMode(false)}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
            title="Quitter le mode annotation"
          >
            ✕
          </button>
        </div>
      )}

      {/* PHASE 7: Bottom Fast Navigation Scrubber */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 bg-zinc-950/85 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-xl flex items-center gap-3 text-xs text-white max-w-[90vw] select-none">
        <span className="font-mono text-[11px] text-zinc-400 whitespace-nowrap">
          Page <strong className="text-white font-bold">{currentPage}</strong> / {doc.totalPages}
        </span>
        <input
          type="range"
          min={1}
          max={doc.totalPages}
          value={currentPage}
          onChange={(e) => onPageChange(Number(e.target.value))}
          className="w-24 sm:w-44 accent-indigo-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
          title="Navigation rapide entre les pages"
        />
        {allComments.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsCommentsDrawerOpen(true);
            }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 text-[10px] font-medium transition-all cursor-pointer whitespace-nowrap"
            title="Ouvrir toutes les notes et commentaires"
          >
            <MessageSquare className="w-3 h-3 text-indigo-400" />
            <span>{allComments.length} note{allComments.length > 1 ? 's' : ''}</span>
          </button>
        )}
      </div>

      {/* PHASE 8: Interactive Hotspot Modal Trigger */}
      {selectedHotspot && (
        <HotspotActionModal
          hotspot={selectedHotspot}
          onClose={() => setSelectedHotspot(null)}
          onNavigateToPage={(targetPage) => {
            onPageChange(targetPage);
            setSelectedHotspot(null);
          }}
        />
      )}

      {/* PHASE 11: Lead Generation Gate Modal */}
      <LeadCaptureModal
        isOpen={isLeadGateOpen}
        onClose={() => setIsLeadGateOpen(false)}
        onSuccess={() => {
          setHasUnlockedLeadGate(true);
          setIsLeadGateOpen(false);
        }}
        flipbookId={doc.id}
        flipbookTitle={doc.title}
        pageNumber={currentPage}
        organizationId="org-azur-group"
        clientId="cli-hotel-azur-nice"
        isGateLock={true}
        formType="GATE_LOCK"
      />

      {/* In-Flipbook Custom Lead / Quote Modal */}
      <LeadCaptureModal
        isOpen={isCustomInquiryModalOpen}
        onClose={() => setIsCustomInquiryModalOpen(false)}
        onSuccess={() => setIsCustomInquiryModalOpen(false)}
        flipbookId={doc.id}
        flipbookTitle={doc.title}
        pageNumber={currentPage}
        organizationId="org-azur-group"
        clientId="cli-hotel-azur-nice"
        isGateLock={false}
        formType="QUOTE"
        title="Demande de Devis & Privatisation"
        subtitle="Renseignez vos coordonnées pour recevoir une proposition tarifaire détaillée."
      />

      {/* PHASE 12: Search Drawer */}
      <SearchDrawer
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        doc={doc}
        currentPage={currentPage}
        onNavigateToPage={(targetPage) => {
          onPageChange(targetPage);
          setIsSearchOpen(false);
        }}
      />

      {/* PHASE 12: Table of Contents & Bookmarks Drawer */}
      <TocDrawer
        isOpen={isTocOpen}
        onClose={() => setIsTocOpen(false)}
        doc={doc}
        currentPage={currentPage}
        onNavigateToPage={(targetPage) => {
          onPageChange(targetPage);
          setIsTocOpen(false);
        }}
      />

      {/* Active Comment Pin Placement Mode Banner */}
      {isPlacingCommentPin && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-indigo-950/95 border border-indigo-500/60 shadow-2xl px-4 py-2 rounded-2xl flex items-center gap-3 text-white text-xs backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <div className="p-1 rounded-full bg-indigo-500 text-white">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium">
            Cliquez sur un élément de la page pour déposer votre note ciblée
          </span>
          <button
            type="button"
            onClick={() => setIsPlacingCommentPin(false)}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white text-xs font-medium cursor-pointer transition-colors"
          >
            Annuler
          </button>
        </div>
      )}

      {/* Per-Page Comments & Notes Drawer */}
      <PageCommentsDrawer
        isOpen={isCommentsDrawerOpen}
        onClose={() => setIsCommentsDrawerOpen(false)}
        flipbookId={doc.id}
        flipbookTitle={doc.title}
        currentPage={currentPage}
        totalPages={doc.totalPages}
        onNavigateToPage={onPageChange}
        onStartPlacingPin={() => {
          setIsPlacingCommentPin(true);
        }}
        selectedCommentId={selectedCommentId}
        onSelectComment={(id) => setSelectedCommentId(id)}
        currentUser={{ name: 'Client Relecteur', role: 'CLIENT' }}
      />

      {/* PHASE 14: Client Review & Approval Modal */}
      <ReviewWorkflowModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        flipbookId={doc.id}
        flipbookTitle={doc.title}
        currentUser={{ name: 'Client Relecteur', role: 'CLIENT' }}
      />

      {/* PHASE 16: E-commerce Shoppable Cart Drawer */}
      <ShoppingCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        flipbookId={doc.id}
        organizationId="org-azur-group"
        clientId="cli-hotel-azur-nice"
      />

      {/* PHASE 19: Gemini AI Document Assistant */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        document={doc}
        currentPageNumber={currentPage}
        onNavigateToPage={onPageChange}
      />

      {/* PHASE 26: Social Sharing Modal */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        document={doc}
        currentPageNumber={currentPage}
      />

      {/* PHASE 28: Interactive Page Survey */}
      <PageSurveyModal
        isOpen={isSurveyOpen}
        onClose={() => setIsSurveyOpen(false)}
        pageNumber={currentPage}
        documentTitle={doc.title}
      />

      {/* PHASE 18: Password Gate Protection */}
      {isPasswordGateOpen && !isPasswordUnlocked && (
        <PasswordGateModal
          documentTitle={doc.title}
          expectedPassword="1234"
          onUnlocked={() => {
            setIsPasswordUnlocked(true);
            setIsPasswordGateOpen(false);
          }}
        />
      )}
    </div>
  );
};
