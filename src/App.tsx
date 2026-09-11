import { useState, useEffect, useCallback } from 'react';
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

  // App View Mode: 'reader' (3D interactive flipbook), 'admin' (SaaS studio), 'client' (Restricted client portal)
  const [appView, setAppView] = useState<'reader' | 'admin' | 'client'>('reader');

  // Active document
  const [currentDoc, setCurrentDoc] = useState<FlipBookDocument>(SAMPLE_BOOKS[0]);
  const [currentPage, setCurrentPage] = useState<number>(1);

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

  // Handle document switch
  const handleDocumentLoaded = (newDoc: FlipBookDocument) => {
    speechService.stop();
    setIsAudioReaderOpen(false);
    setCurrentDoc(newDoc);
    setCurrentPage(1);
    setIsAutoPlaying(false);
    setAppView('reader');
  };

  // Open flipbook from SaaS admin or client view
  const handleOpenFlipbookFromSaaS = (flipbookId: string) => {
    const found = SAMPLE_BOOKS.find((b) => b.id === flipbookId);
    if (found) {
      setCurrentDoc(found);
    } else {
      // Fallback: pick the first sample
      setCurrentDoc(SAMPLE_BOOKS[0]);
    }
    setCurrentPage(1);
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

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const step = isDualView ? 2 : 1;
        const targetPage = isDualView
          ? (currentPage === 1 ? 2 : Math.min(currentDoc.totalPages, currentPage + step))
          : Math.min(currentDoc.totalPages, currentPage + 1);

        if (targetPage !== currentPage) {
          handlePageChange(targetPage);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const step = isDualView ? 2 : 1;
        const targetPage = isDualView
          ? (currentPage <= 2 ? 1 : Math.max(1, currentPage - step))
          : Math.max(1, currentPage - 1);

        if (targetPage !== currentPage) {
          handlePageChange(targetPage);
        }
      } else if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        setIsAutoPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [appView, currentPage, currentDoc.totalPages, isDualView, isAutoPlaying, handleToggleDeveloperMode]);

  return (
    <div
      className={`w-screen h-screen flex flex-col overflow-hidden select-none ${getThemeBackground()} transition-colors duration-500`}
    >
      {/* SaaS Role Switcher & Multi-Tenant Top Bar */}
      <RoleSwitcherBar currentAppView={appView} onChangeAppView={setAppView} />

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

          {/* Top Application Bar */}
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
            {deviceMode === 'mobile' ? (
              <div className="w-[380px] h-[680px] max-h-[85vh] rounded-[44px] border-[10px] border-zinc-800 shadow-2xl overflow-hidden relative bg-zinc-950 flex flex-col">
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
              <div className="w-[820px] h-[600px] max-h-[85vh] max-w-[95vw] rounded-[32px] border-[12px] border-zinc-800 shadow-2xl overflow-hidden relative bg-zinc-950 flex items-center justify-center">
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
            )}
          </main>

          {/* Mobile Ergonomic Bottom Controls */}
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
        onSelectPage={setCurrentPage}
      />

      <ThumbnailsDrawer
        document={currentDoc}
        currentPage={currentPage}
        isOpen={isThumbnailsOpen}
        onClose={() => setIsThumbnailsOpen(false)}
        onSelectPage={setCurrentPage}
      />

      <SearchModal
        document={currentDoc}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPage={setCurrentPage}
      />

      <BookmarksModal
        documentId={currentDoc.id}
        currentPage={currentPage}
        bookmarks={bookmarks}
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        onAddBookmark={handleAddBookmark}
        onRemoveBookmark={handleRemoveBookmark}
        onSelectPage={setCurrentPage}
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
        formConfig={{
          id: `form-${currentDoc.id}-p${currentPage}`,
          flipbookId: currentDoc.id,
          pageNumber: currentPage,
          title: 'Demande de Renseignements & Devis',
          description: 'Saisissez vos coordonnées pour recevoir notre catalogue détaillé et devis sur-mesure.',
          submitButtonText: 'Transmettre la demande',
          successMessage: 'Demande envoyée avec succès. Un conseiller vous contactera sous 24h.',
          notifyEmail: 'service-client@palace-nice.com',
          fields: [
            { id: 'f_name', type: 'text', label: 'Nom & Prénom', placeholder: 'ex. Paul Martin', required: true },
            { id: 'f_email', type: 'email', label: 'Email professionnel', placeholder: 'paul@entreprise.com', required: true },
            { id: 'f_tel', type: 'tel', label: 'Téléphone direct', placeholder: '+33 6 00 00 00 00', required: false },
            { id: 'f_choice', type: 'select', label: 'Prestation souhaitée', required: true, options: ['Suite Deluxe', 'Séminaire Professionnel', 'Table Gastronomique', 'Événement Privé'] },
            { id: 'f_msg', type: 'textarea', label: 'Message ou date souhaitée', placeholder: 'Précisez votre demande...', required: false },
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
      <AppContent />
    </AuthProvider>
  );
}
