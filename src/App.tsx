import { useState, useEffect, useCallback } from 'react';
import { BookOpen, RotateCcw, X, Eye, EyeOff } from 'lucide-react';
import { FlipBookDocument, ViewLayout, ReaderTheme, DeviceMode, Bookmark } from './types';
import { SAMPLE_BOOKS } from './services/sampleBooks';
import { FlipBook } from './components/FlipBook';
import { HeaderBar } from './components/HeaderBar';
import { MobileControls } from './components/MobileControls';
import { UploadModal } from './components/UploadModal';
import { TableOfContentsModal } from './components/TableOfContentsModal';
import { ThumbnailsDrawer } from './components/ThumbnailsDrawer';
import { SearchModal } from './components/SearchModal';
import { BookmarksModal } from './components/BookmarksModal';
import { ExportShareModal } from './components/ExportShareModal';
import { AudioReaderBar } from './components/AudioReaderBar';
import { speechService, SpeechState } from './services/speech';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UiThemeProvider, useUiTheme } from './contexts/UiThemeContext';
import { RoleSwitcherBar } from './components/common/RoleSwitcherBar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ClientPortal } from './components/client/ClientPortal';
import { FlipbookVisualEditor } from './components/editor/FlipbookVisualEditor';
import { PrintSelectionModal } from './components/PrintSelectionModal';
import { InPageFormModal } from './components/InPageFormModal';
import { Model3DViewerModal } from './components/Model3DViewerModal';
import { CoBrowsingBar } from './components/CoBrowsingBar';
import { ChromaKeyVideoOverlay } from './components/ChromaKeyVideoOverlay';
import { FlipPhysicsSelectorModal } from './components/FlipPhysicsSelectorModal';
import { GdprConsentBanner } from './components/GdprConsentBanner';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { coBrowsingService } from './services/coBrowsingService';
import { FlipPhysicsSettings, Model3DHotspot, InPageFormConfig, CoBrowsingSession } from './types/saas';

function AppContent() {
  const { role, activeClient } = useAuth();
  const { uiTheme, toggleUiTheme, isDark } = useUiTheme();

  // App View Mode: 'reader' (3D interactive flipbook), 'admin' (SaaS studio), 'client' (Restricted client portal)
  const [appView, setAppView] = useState<'reader' | 'admin' | 'client'>('reader');

  // Active document with localStorage restoration
  const [currentDoc, setCurrentDoc] = useState<FlipBookDocument>(() => {
    try {
      const savedDocId = localStorage.getItem('flipbook_last_document_id');
      if (savedDocId) {
        const found = SAMPLE_BOOKS.find((b) => b.id === savedDocId);
        if (found) return found;
      }
    } catch {
      // Storage unavailable
    }
    return SAMPLE_BOOKS[0];
  });

  // Current reading page with automatic localStorage resume
  const [currentPage, setCurrentPage] = useState<number>(() => {
    try {
      const savedDocId = localStorage.getItem('flipbook_last_document_id') || SAMPLE_BOOKS[0].id;
      const targetDoc = SAMPLE_BOOKS.find((b) => b.id === savedDocId) || SAMPLE_BOOKS[0];
      const saved =
        localStorage.getItem(`flipbook_last_page_${savedDocId}`) ||
        localStorage.getItem('flipbook_current_page');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= targetDoc.totalPages) {
          return parsed;
        }
      }
    } catch {
      // Storage unavailable
    }
    return 1;
  });

  // Automatic reading resumption toast indicator
  const [resumedNotice, setResumedNotice] = useState<{ page: number; totalPages: number } | null>(() => {
    try {
      const savedDocId = localStorage.getItem('flipbook_last_document_id') || SAMPLE_BOOKS[0].id;
      const targetDoc = SAMPLE_BOOKS.find((b) => b.id === savedDocId) || SAMPLE_BOOKS[0];
      const saved =
        localStorage.getItem(`flipbook_last_page_${savedDocId}`) ||
        localStorage.getItem('flipbook_current_page');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 1 && parsed <= targetDoc.totalPages) {
          return { page: parsed, totalPages: targetDoc.totalPages };
        }
      }
    } catch {
      // Storage unavailable
    }
    return null;
  });

  // Auto-dismiss resume notification after 6 seconds
  useEffect(() => {
    if (resumedNotice) {
      const timer = setTimeout(() => {
        setResumedNotice(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [resumedNotice]);

  // Automatically persist current reading progress to localStorage
  useEffect(() => {
    try {
      if (currentPage && currentDoc?.id) {
        localStorage.setItem(`flipbook_last_page_${currentDoc.id}`, String(currentPage));
        localStorage.setItem('flipbook_last_document_id', currentDoc.id);
        localStorage.setItem('flipbook_current_page', String(currentPage));
      }
    } catch {
      // Storage unavailable or quota exceeded
    }
  }, [currentPage, currentDoc?.id]);

  // Settings & Modes
  const [viewLayout, setViewLayout] = useState<ViewLayout>('auto');
  const [theme, setTheme] = useState<ReaderTheme>('studio-dark');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('responsive');
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Automatically adapt view if switched to CLIENT role
  useEffect(() => {
    if (role === 'CLIENT' && appView === 'admin') {
      setAppView('client');
    }
  }, [role, appView]);

  // Bookmarks state (persistent in localStorage)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem('flipbook_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('flipbook_bookmarks', JSON.stringify(bookmarks));
    } catch {
      // Storage unavailable
    }
  }, [bookmarks]);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);
  const [isThumbnailsOpen, setIsThumbnailsOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isAudioReaderOpen, setIsAudioReaderOpen] = useState<boolean>(false);
  const [isVisualEditorOpen, setIsVisualEditorOpen] = useState<boolean>(false);

  // New Extended Modals & States (Phases 31, 32, 34, 36, 37, 40)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [is3DModalOpen, setIs3DModalOpen] = useState<boolean>(false);
  const [isPhysicsModalOpen, setIsPhysicsModalOpen] = useState<boolean>(false);
  const [isChromaAvatarActive, setIsChromaAvatarActive] = useState<boolean>(false);

  // Phase 40: Flip physics engine settings
  const [flipPhysics, setFlipPhysics] = useState<FlipPhysicsSettings>({
    mode: 'realistic-paper',
    stiffness: 0.75,
    curlCornerElevation: 45,
    soundVolume: 0.8,
    shadowHardness: 0.6,
    perspectiveFov: 55,
    autoCenterSinglePage: true,
  });

  // Developer Mode (Performance Monitor & Telemetry)
  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('flipbook_developer_mode') === 'true' ||
        window.location.search.includes('dev=true')
      );
    } catch {
      return false;
    }
  });

  const handleToggleDeveloperMode = useCallback(() => {
    setIsDeveloperMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('flipbook_developer_mode', String(next));
      } catch {
        // storage fallback
      }
      return next;
    });
  }, []);

  // Eye-Strain Reduction Focus Mode state (dims surrounding UI in reader mode)
  const [isFocusMode, setIsFocusMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('flipbook_focus_mode') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleFocusMode = useCallback(() => {
    setIsFocusMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('flipbook_focus_mode', String(next));
      } catch {}
      return next;
    });
  }, []);

  // Phase 36: Live Co-browsing session subscription
  const [coBrowsingSession, setCoBrowsingSession] = useState<CoBrowsingSession | null>(
    coBrowsingService.getSession()
  );

  useEffect(() => {
    return coBrowsingService.subscribe((session) => {
      setCoBrowsingSession(session);
      if (session && session.activePage !== currentPage) {
        setCurrentPage(session.activePage);
      }
    });
  }, [currentPage]);

  // SpeechSynthesis state subscription
  const [speechState, setSpeechState] = useState<SpeechState>(speechService.getState());

  useEffect(() => {
    return speechService.subscribe((state) => {
      setSpeechState(state);
    });
  }, []);

  // Handle page change (if listening, auto-speak the next page smoothly; if co-browsing, broadcast)
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setResumedNotice(null);
    if (coBrowsingSession) {
      coBrowsingService.updatePage(newPage);
    }
    if (speechState.isSpeaking) {
      const targetPage = currentDoc.pages.find((p) => p.pageNumber === newPage);
      if (targetPage) {
        speechService.speakPage(targetPage, true);
      }
    }
  };

  // Toggle SpeechSynthesis Audio Reader
  const handleToggleAudioReader = () => {
    if (!isAudioReaderOpen) {
      setIsAudioReaderOpen(true);
      if (!speechState.isSpeaking) {
        const activePage = currentDoc.pages.find((p) => p.pageNumber === currentPage);
        if (activePage) {
          speechService.speakPage(activePage, true);
        }
      }
    } else {
      if (speechState.isSpeaking) {
        speechService.pause();
      } else {
        setIsAudioReaderOpen(false);
        speechService.stop();
      }
    }
  };

  // Handle document switch with reading position restoration
  const handleDocumentLoaded = (newDoc: FlipBookDocument) => {
    speechService.stop();
    setIsAudioReaderOpen(false);
    setCurrentDoc(newDoc);

    let resumePage = 1;
    try {
      const saved = localStorage.getItem(`flipbook_last_page_${newDoc.id}`);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= newDoc.totalPages) {
          resumePage = parsed;
        }
      }
    } catch {
      // fallback
    }
    setCurrentPage(resumePage);
    setIsAutoPlaying(false);
    setAppView('reader');
  };

  // Open flipbook from SaaS admin or client view with reading position restoration
  const handleOpenFlipbookFromSaaS = (flipbookId: string) => {
    const found = SAMPLE_BOOKS.find((b) => b.id === flipbookId);
    const targetDoc = found || SAMPLE_BOOKS[0];
    setCurrentDoc(targetDoc);

    let resumePage = 1;
    try {
      const saved = localStorage.getItem(`flipbook_last_page_${targetDoc.id}`);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= targetDoc.totalPages) {
          resumePage = parsed;
        }
      }
    } catch {
      // fallback
    }
    setCurrentPage(resumePage);
    setIsAutoPlaying(false);
    setAppView('reader');
  };

  // Bookmark management
  const handleAddBookmark = (pageNumber: number, label: string, note?: string) => {
    const newBookmark: Bookmark = {
      id: `bm-${Date.now()}`,
      pageNumber,
      label,
      note,
      timestamp: Date.now(),
    };
    setBookmarks((prev) => [...prev.filter((b) => b.pageNumber !== pageNumber), newBookmark]);
  };

  const handleRemoveBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  // AutoPlay Page Flip Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setCurrentPage((prev) => {
          if (prev >= currentDoc.totalPages) {
            setIsAutoPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, currentDoc.totalPages]);

  // Fullscreen toggle handler
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Theme background styles
  const getThemeBackground = () => {
    switch (theme) {
      case 'wood-desk':
        return 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#3a2016] via-[#24140d] to-[#120804]';
      case 'paper-light':
        return 'bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300';
      case 'sepia-warm':
        return 'bg-gradient-to-br from-[#f8f1e5] via-[#ecdfcc] to-[#dbcab0]';
      case 'studio-dark':
      default:
        return 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black';
    }
  };

  const isDualView = viewLayout === 'double' || (viewLayout === 'auto' && deviceMode !== 'mobile');

  // Mathematical calculation of dynamic page-flip drop shadow based on curl angle
  const calculateDynamicShadow = useCallback(
    (curlAngleDeg: number, progress: number, direction: 'forward' | 'backward' = 'forward') => {
      // Trigonometric model based on curl angle (0° to 180°)
      const curlRad = (curlAngleDeg * Math.PI) / 180;
      // Leaf elevation peaks when leaf is perpendicular (90° curl angle, progress ~ 0.5)
      const leafElevation = Math.sin(progress * Math.PI);

      const stiffness = flipPhysics.stiffness ?? 0.75;
      const hardness = flipPhysics.shadowHardness ?? 0.6;

      // Horizontal shadow shift: light source casts shadow opposite to turn direction
      const dirFactor = direction === 'forward' ? -1 : 1;
      const angleCos = Math.cos(curlRad);
      const shadowOffsetX = Math.round(dirFactor * (16 + Math.abs(angleCos) * 22) * (1 - progress * 0.35));

      // Vertical drop shadow increases as page curls upwards from the desk
      const shadowOffsetY = Math.round(12 + leafElevation * 24 * (1.35 - stiffness * 0.5));

      // Blur radius expands as elevation increases
      const blurRadius = Math.round(22 + leafElevation * 42 * (1.2 - stiffness * 0.3));

      // Primary shadow intensity (peaks around mid-turn)
      const primaryOpacity = Math.max(0.18, Math.min(0.85, (0.22 + leafElevation * 0.44) * hardness));

      // Secondary contact shadow near the hinge
      const contactBlur = Math.round(5 + leafElevation * 8);
      const contactOpacity = Math.max(0.1, (0.16 + (1 - leafElevation) * 0.22) * hardness).toFixed(2);

      const leafDropShadow = `${shadowOffsetX}px ${shadowOffsetY}px ${blurRadius}px rgba(0, 0, 0, ${primaryOpacity.toFixed(3)}), 0 3px ${contactBlur}px rgba(0, 0, 0, ${contactOpacity})`;

      // Cast shadow onto the static page beneath: proportional to sine of curl angle
      const castShadowOpacity = Math.max(0, Math.min(0.95, Math.sin(curlRad) * 0.9 * hardness));
      const spineShadowOpacity = Math.max(0.2, Math.min(0.85, 0.25 + leafElevation * 0.35));
      const ambientOcclusionSpread = Math.round(leafElevation * 28);

      return {
        leafDropShadow,
        castShadowOpacity,
        spineShadowOpacity,
        ambientOcclusionSpread,
      };
    },
    [flipPhysics.stiffness, flipPhysics.shadowHardness]
  );

  // Global Event Listeners for Keyboard Navigation
  // (ArrowLeft/ArrowRight to flip pages, Space to toggle AutoPlay)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input, textarea, or contentEditable element
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable ||
        target?.tagName === 'SELECT'
      ) {
        return;
      }

      // Quick developer mode shortcut: Ctrl+Shift+D or Alt+D
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) ||
        (e.altKey && (e.key === 'd' || e.key === 'D'))
      ) {
        e.preventDefault();
        handleToggleDeveloperMode();
        return;
      }

      // Keyboard navigation is active in Reader mode
      if (appView !== 'reader') return;

      // Focus Mode toggle via 'f' / 'F' key (Eye-strain reduction)
      if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        handleToggleFocusMode();
        return;
      }

      // Exit Focus Mode on Escape
      if (e.key === 'Escape' && isFocusMode) {
        e.preventDefault();
        setIsFocusMode(false);
        try {
          localStorage.setItem('flipbook_focus_mode', 'false');
        } catch {}
        return;
      }

      // Next page or skip to last page (Ctrl+ArrowRight)
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
          // Skip to last page of the document
          handlePageChange(currentDoc.totalPages);
          return;
        }
        const step = isDualView ? 2 : 1;
        const targetPage = isDualView
          ? (currentPage === 1 ? 2 : Math.min(currentDoc.totalPages, currentPage + step))
          : Math.min(currentDoc.totalPages, currentPage + 1);

        if (targetPage !== currentPage) {
          handlePageChange(targetPage);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
          // Skip to first page of the document
          handlePageChange(1);
          return;
        }
        const step = isDualView ? 2 : 1;
        const targetPage = isDualView
          ? (currentPage <= 2 ? 1 : Math.max(1, currentPage - step))
          : Math.max(1, currentPage - 1);

        if (targetPage !== currentPage) {
          handlePageChange(targetPage);
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        handlePageChange(1);
      } else if (e.key === 'End') {
        e.preventDefault();
        handlePageChange(currentDoc.totalPages);
      } else if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        setIsAutoPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    appView,
    currentPage,
    currentDoc.totalPages,
    isDualView,
    isAutoPlaying,
    handleToggleDeveloperMode,
    isFocusMode,
    handleToggleFocusMode,
  ]);

  return (
    <div
      className={`w-screen h-screen flex flex-col overflow-hidden select-none ${
        appView === 'reader'
          ? getThemeBackground()
          : isDark
          ? 'bg-zinc-950 text-white'
          : 'bg-zinc-100 text-zinc-900'
      } transition-colors duration-500`}
    >
      {/* SaaS Role Switcher & Multi-Tenant Top Bar */}
      <div
        className={`transition-all duration-500 z-40 ${
          isFocusMode ? 'opacity-0 -translate-y-full pointer-events-none h-0 overflow-hidden' : 'opacity-100 translate-y-0'
        }`}
      >
        <RoleSwitcherBar currentAppView={appView} onChangeAppView={setAppView} />
      </div>

      {/* VIEW 1: ADMIN STUDIO & CLIENTS */}
      {appView === 'admin' && (
        <AdminDashboard
          onOpenFlipbook={handleOpenFlipbookFromSaaS}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenVisualEditor={(fbId) => {
            handleOpenFlipbookFromSaaS(fbId);
            setIsVisualEditorOpen(true);
          }}
        />
      )}

      {/* VIEW 2: CLIENT PORTAL (STRICTLY RESTRICTED) */}
      {appView === 'client' && (
        <ClientPortal onOpenFlipbook={handleOpenFlipbookFromSaaS} />
      )}

      {/* VIEW 3: INTERACTIVE 3D FLIPBOOK READER */}
      {appView === 'reader' && (
        <>
          {/* Floating Exit Focus Mode Badge */}
          {isFocusMode && (
            <div className="fixed top-3 right-3 z-50 animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-auto">
              <button
                id="exit-focus-mode-btn"
                onClick={handleToggleFocusMode}
                className="px-3 py-1.5 rounded-full bg-zinc-900/90 text-amber-300 hover:text-white hover:bg-zinc-800 border border-amber-500/40 shadow-xl shadow-black/80 backdrop-blur-md text-xs flex items-center gap-2 cursor-pointer transition-all"
                title="Quitter le Mode Focus (Touche F ou Échap)"
                aria-label="Quitter le Mode Focus"
              >
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium hidden sm:inline">Mode Focus Actif</span>
                <span className="text-[10px] bg-zinc-800/80 text-zinc-400 px-1.5 py-0.5 rounded font-mono">F / Échap</span>
              </button>
            </div>
          )}

          {/* Phase 36: Live Co-Browsing Bar (if active) */}
          {coBrowsingSession && (
            <CoBrowsingBar
              session={coBrowsingSession}
              currentPage={currentPage}
              totalPages={currentDoc.totalPages}
              onPageChange={handlePageChange}
              onLeaveSession={() => coBrowsingService.endSession()}
              onToggleMute={() => coBrowsingService.toggleAudio()}
            />
          )}

          {/* Top Application Bar (Dimmed in Focus Mode, lights up on hover) */}
          <div
            className={`transition-all duration-500 z-30 ${
              isFocusMode
                ? 'opacity-15 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300'
                : 'opacity-100'
            }`}
          >
            <HeaderBar
              document={currentDoc}
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenVisualEditor={() => setIsVisualEditorOpen(true)}
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenBookmarks={() => setIsBookmarksOpen(true)}
              onOpenShare={() => setIsShareOpen(true)}
              isAudioReaderOpen={isAudioReaderOpen}
              isSpeaking={speechState.isSpeaking}
              onToggleAudioReader={handleToggleAudioReader}
              viewLayout={viewLayout}
              onChangeViewLayout={setViewLayout}
              theme={theme}
              onChangeTheme={setTheme}
              uiTheme={uiTheme}
              onToggleUiTheme={toggleUiTheme}
              isFocusMode={isFocusMode}
              onToggleFocusMode={handleToggleFocusMode}
              deviceMode={deviceMode}
              onChangeDeviceMode={setDeviceMode}
              bookmarkCount={bookmarks.length}
              onOpenPrintSelection={() => setIsPrintModalOpen(true)}
              onOpenFlipPhysics={() => setIsPhysicsModalOpen(true)}
              onOpen3DViewer={() => setIs3DModalOpen(true)}
              onOpenInPageForm={() => setIsFormModalOpen(true)}
              onToggleChromaAvatar={() => setIsChromaAvatarActive(!isChromaAvatarActive)}
              isChromaAvatarActive={isChromaAvatarActive}
              isDeveloperMode={isDeveloperMode}
              onToggleDeveloperMode={handleToggleDeveloperMode}
            />
          </div>

          {/* Developer Mode Frame-Rate & 3D Physics Performance Monitor */}
          {isDeveloperMode && (
            <PerformanceMonitor
              physicsSettings={flipPhysics}
              onClose={() => setIsDeveloperMode(false)}
            />
          )}

          {/* Floating Audio Reader Bar (SpeechSynthesis Web API) */}
          <AudioReaderBar
            document={currentDoc}
            currentPage={currentPage}
            isOpen={isAudioReaderOpen}
            onClose={() => setIsAudioReaderOpen(false)}
            onPageChange={handlePageChange}
            isDualView={isDualView}
          />

          {/* Main FlipBook Viewport Area */}
          <main className="flex-1 w-full relative flex items-center justify-center overflow-hidden p-2 sm:p-4 pb-20 sm:pb-24">
            {/* Eye-Strain Reduction Ambient Dimming Backdrop in Focus Mode */}
            {isFocusMode && (
              <div
                id="focus-mode-backdrop"
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none bg-black/65 backdrop-blur-[1px] transition-opacity duration-500 z-0"
              />
            )}

            {deviceMode === 'mobile' ? (
              <div className="w-[380px] h-[680px] max-h-[85vh] rounded-[44px] border-[10px] border-zinc-800 shadow-2xl overflow-hidden relative bg-zinc-950 flex flex-col z-10">
                <div className="h-6 w-32 bg-zinc-800 rounded-b-2xl mx-auto z-40 relative flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-zinc-900 mr-2" />
                  <div className="w-10 h-1 rounded-full bg-zinc-700" />
                </div>
                <div className="flex-1 w-full relative">
                  <FlipBook
                    document={currentDoc}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    viewLayout="single"
                    theme={theme}
                    isAutoPlaying={isAutoPlaying}
                    flipPhysics={flipPhysics}
                    calculateDynamicShadow={calculateDynamicShadow}
                    onStopAutoPlay={() => setIsAutoPlaying(false)}
                  />
                </div>
              </div>
            ) : deviceMode === 'tablet' ? (
              <div className="w-[820px] h-[600px] max-h-[85vh] max-w-[95vw] rounded-[32px] border-[12px] border-zinc-800 shadow-2xl overflow-hidden relative bg-zinc-950 flex items-center justify-center z-10">
                <FlipBook
                  document={currentDoc}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  viewLayout={viewLayout}
                  theme={theme}
                  isAutoPlaying={isAutoPlaying}
                  flipPhysics={flipPhysics}
                  calculateDynamicShadow={calculateDynamicShadow}
                  onStopAutoPlay={() => setIsAutoPlaying(false)}
                />
              </div>
            ) : (
              <div className="relative z-10 flex items-center justify-center">
                <FlipBook
                  document={currentDoc}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  viewLayout={viewLayout}
                  theme={theme}
                  isAutoPlaying={isAutoPlaying}
                  flipPhysics={flipPhysics}
                  calculateDynamicShadow={calculateDynamicShadow}
                  onStopAutoPlay={() => setIsAutoPlaying(false)}
                />
              </div>
            )}
          </main>

          {/* Automatic Reading Resume Floating Banner */}
          {resumedNotice && (
            <div
              id="reading-resume-banner"
              className="fixed bottom-24 sm:bottom-20 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/95 text-zinc-100 border border-amber-500/40 shadow-2xl shadow-black/80 backdrop-blur-md px-4 py-2.5 rounded-2xl flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-3 duration-300 select-none max-w-[92vw]"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-zinc-200">
                  Reprise de lecture à la page {resumedNotice.page}
                </span>
                <span className="text-[11px] text-zinc-400 hidden sm:inline">
                  Reprenez exactement là où vous vous étiez arrêté
                </span>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  id="resume-reset-to-page-1-btn"
                  onClick={() => {
                    handlePageChange(1);
                    setResumedNotice(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1 font-medium text-[11px] transition cursor-pointer"
                  title="Revenir à la première page"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Page 1</span>
                </button>
                <button
                  id="resume-dismiss-banner-btn"
                  onClick={() => setResumedNotice(null)}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                  title="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Mobile Ergonomic Bottom Controls (Dimmed in Focus Mode, lights up on hover) */}
          <div
            className={`transition-all duration-500 z-30 ${
              isFocusMode
                ? 'opacity-15 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300'
                : 'opacity-100'
            }`}
          >
            <MobileControls
              currentPage={currentPage}
              totalPages={currentDoc.totalPages}
              onPageChange={handlePageChange}
              onOpenToc={() => setIsTocOpen(true)}
              onOpenThumbnails={() => setIsThumbnailsOpen(true)}
              isAutoPlaying={isAutoPlaying}
              onToggleAutoPlay={() => setIsAutoPlaying(!isAutoPlaying)}
              isFullscreen={isFullscreen}
              onToggleFullscreen={handleToggleFullscreen}
              isAudioReaderOpen={isAudioReaderOpen}
              isSpeaking={speechState.isSpeaking}
              onToggleAudioReader={handleToggleAudioReader}
            />
          </div>
        </>
      )}

      {/* Floating Modals & Drawers */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDocumentLoaded={handleDocumentLoaded}
      />

      <TableOfContentsModal
        document={currentDoc}
        currentPage={currentPage}
        isOpen={isTocOpen}
        onClose={() => setIsTocOpen(false)}
        onSelectPage={handlePageChange}
      />

      <ThumbnailsDrawer
        document={currentDoc}
        currentPage={currentPage}
        isOpen={isThumbnailsOpen}
        onClose={() => setIsThumbnailsOpen(false)}
        onSelectPage={handlePageChange}
      />

      <SearchModal
        document={currentDoc}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPage={handlePageChange}
      />

      <BookmarksModal
        documentId={currentDoc.id}
        currentPage={currentPage}
        bookmarks={bookmarks}
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        onAddBookmark={handleAddBookmark}
        onRemoveBookmark={handleRemoveBookmark}
        onSelectPage={handlePageChange}
      />

      <ExportShareModal
        document={currentDoc}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* Visual Hotspot & Interactivity Editor Modal */}
      {isVisualEditorOpen && (
        <FlipbookVisualEditor
          document={currentDoc}
          onClose={() => setIsVisualEditorOpen(false)}
          onSave={(updatedDoc) => {
            setCurrentDoc(updatedDoc);
          }}
        />
      )}

      {/* Phase 31: Selective & Booklet Printing Modal */}
      <PrintSelectionModal
        document={currentDoc}
        currentPage={currentPage}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />

      {/* Phase 32: In-Page Interactive Form Modal */}
      <InPageFormModal
        form={{
          id: `form-${currentDoc.id}-p${currentPage}`,
          flipbookId: currentDoc.id,
          pageNumber: currentPage,
          title: 'Demande de Renseignements & Devis',
          subtitle: 'Saisissez vos coordonnées pour recevoir notre catalogue détaillé et devis sur-mesure.',
          submitButtonText: 'Transmettre la demande',
          successMessage: 'Demande envoyée avec succès. Un conseiller vous contactera sous 24h.',
          targetEmailNotification: 'service-client@palace-nice.com',
          fields: [
            { id: 'f_name', type: 'TEXT', label: 'Nom & Prénom', placeholder: 'ex. Paul Martin', required: true },
            { id: 'f_email', type: 'EMAIL', label: 'Email professionnel', placeholder: 'paul@entreprise.com', required: true },
            { id: 'f_tel', type: 'PHONE', label: 'Téléphone direct', placeholder: '+33 6 00 00 00 00', required: false },
            { id: 'f_choice', type: 'SELECT', label: 'Prestation souhaitée', required: true, options: ['Suite Deluxe', 'Séminaire Professionnel', 'Table Gastronomique', 'Événement Privé'] },
            { id: 'f_msg', type: 'TEXTAREA', label: 'Message ou date souhaitée', placeholder: 'Précisez votre demande...', required: false },
          ],
        }}
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
      />

      {/* Phase 34: 3D Model & AR Viewer Modal */}
      <Model3DViewerModal
        hotspot={{
          id: `3d-hotspot-page-${currentPage}`,
          modelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
          title: `Objet 3D Interactif - Page ${currentPage}`,
          description: 'Modèle 3D spatial avec textures haute définition, éclairage temps réel et projection en Réalité Augmentée.',
          autoRotate: true,
          cameraControls: true,
          arEnabled: true,
          backgroundColor: '#09090b',
          scale: 1,
        }}
        isOpen={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
      />

      {/* Phase 37: Chroma-Key Transparent Host Avatar Video */}
      {isChromaAvatarActive && appView === 'reader' && (
        <ChromaKeyVideoOverlay
          config={{
            id: 'avatar-host-1',
            flipbookId: currentDoc.id,
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-talking-in-front-of-a-green-screen-40763-large.mp4',
            position: 'bottom-right',
            keyColor: '#00ff00',
            similarity: 0.42,
            smoothness: 0.12,
            autoPlay: true,
            loop: true,
            muted: false,
            scale: 1,
            speakerName: 'Léa - Conseillère Virtuelle',
          }}
          isActive={isChromaAvatarActive}
          onClose={() => setIsChromaAvatarActive(false)}
        />
      )}

      {/* Phase 40: Realistic Physics Engine Selector Modal */}
      <FlipPhysicsSelectorModal
        currentSettings={flipPhysics}
        isOpen={isPhysicsModalOpen}
        onClose={() => setIsPhysicsModalOpen(false)}
        onApplySettings={(newSettings) => setFlipPhysics(newSettings)}
      />

      {/* Phase 41: GDPR & Privacy Consent Banner */}
      <GdprConsentBanner />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <UiThemeProvider>
        <AppContent />
      </UiThemeProvider>
    </AuthProvider>
  );
}
