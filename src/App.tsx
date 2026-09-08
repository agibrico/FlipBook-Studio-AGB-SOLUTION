import { useState, useEffect } from 'react';
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

  // SpeechSynthesis state subscription
  const [speechState, setSpeechState] = useState<SpeechState>(speechService.getState());

  useEffect(() => {
    return speechService.subscribe((state) => {
      setSpeechState(state);
    });
  }, []);

  // Handle page change (if listening, auto-speak the next page smoothly)
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
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
          />

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
