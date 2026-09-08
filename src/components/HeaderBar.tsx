import React, { useState } from 'react';
import { FlipBookDocument, ViewLayout, ReaderTheme, DeviceMode } from '../types';
import {
  Upload,
  Search,
  Bookmark as BookmarkIcon,
  Smartphone,
  Tablet,
  Monitor,
  Share2,
  BookOpen,
  Palette,
  Columns,
  Square,
  Sparkles,
  Headphones,
} from 'lucide-react';

interface HeaderBarProps {
  document: FlipBookDocument;
  onOpenUpload: () => void;
  onOpenVisualEditor?: () => void;
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
  onOpenShare: () => void;
  isAudioReaderOpen: boolean;
  isSpeaking: boolean;
  onToggleAudioReader: () => void;
  viewLayout: ViewLayout;
  onChangeViewLayout: (layout: ViewLayout) => void;
  theme: ReaderTheme;
  onChangeTheme: (theme: ReaderTheme) => void;
  deviceMode: DeviceMode;
  onChangeDeviceMode: (mode: DeviceMode) => void;
  bookmarkCount: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  document: doc,
  onOpenUpload,
  onOpenVisualEditor,
  onOpenSearch,
  onOpenBookmarks,
  onOpenShare,
  isAudioReaderOpen,
  isSpeaking,
  onToggleAudioReader,
  viewLayout,
  onChangeViewLayout,
  theme,
  onChangeTheme,
  deviceMode,
  onChangeDeviceMode,
  bookmarkCount,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const themeLabels: Record<ReaderTheme, { name: string; color: string }> = {
    'studio-dark': { name: 'Studio Sombre', color: 'bg-zinc-900' },
    'wood-desk': { name: 'Bureau Bois', color: 'bg-amber-950' },
    'paper-light': { name: 'Papier Épuré', color: 'bg-stone-100' },
    'sepia-warm': { name: 'Sépia Vintage', color: 'bg-amber-100' },
  };

  return (
    <header
      id="flipbook-header"
      className="w-full bg-zinc-950/80 backdrop-blur-xl border-b border-white/10 px-4 py-2.5 flex items-center justify-between gap-2 z-40 text-white select-none"
    >
      {/* Left: Brand & Document Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
          <BookOpen className="w-4 h-4" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold truncate text-white leading-tight">
              {doc.title}
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-950 text-indigo-300 border border-indigo-800/60">
              {doc.sourceType}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-mono hidden sm:block">
            {doc.totalPages} pages • FlipBook Interactif
          </p>
        </div>
      </div>

      {/* Center: Device Simulator & Layout Controls (Desktop / Tablet view) */}
      <div className="hidden lg:flex items-center gap-2 bg-zinc-900/90 border border-white/10 p-1 rounded-xl">
        {/* Device Viewport Selector */}
        <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-1">
          <button
            onClick={() => onChangeDeviceMode('mobile')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              deviceMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
            title="Aperçu Mobile (iPhone 15)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
          <button
            onClick={() => onChangeDeviceMode('tablet')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              deviceMode === 'tablet' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
            title="Aperçu Tablette (iPad)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablette</span>
          </button>
          <button
            onClick={() => onChangeDeviceMode('responsive')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              deviceMode === 'responsive' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
            title="Plein Écran Réactif"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Auto</span>
          </button>
        </div>

        {/* Layout toggle (Single vs Double page) */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChangeViewLayout('single')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              viewLayout === 'single' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
            }`}
            title="1 Page à la fois"
          >
            <Square className="w-3.5 h-3.5" />
            <span>1 Page</span>
          </button>
          <button
            onClick={() => onChangeViewLayout('double')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              viewLayout === 'double' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
            }`}
            title="Double Page (Magazine / Livre)"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>2 Pages</span>
          </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Audio Speech Synthesis Reader */}
        <button
          id="header-audio-read-btn"
          onClick={onToggleAudioReader}
          className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            isSpeaking
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400/50 animate-pulse'
              : isAudioReaderOpen
              ? 'bg-white/20 text-white'
              : 'text-zinc-300 hover:text-white hover:bg-white/10'
          }`}
          title={isSpeaking ? 'Lecture audio en cours (cliquer pour gérer)' : 'Écouter le texte de la page (Synthèse vocale)'}
          aria-label="Synthèse vocale"
        >
          <Headphones className="w-4 h-4" />
          {isSpeaking && (
            <span className="hidden sm:inline-block text-[11px] font-medium pr-0.5">
              En écoute
            </span>
          )}
        </button>

        {/* Search */}
        <button
          id="header-search-btn"
          onClick={onOpenSearch}
          className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Rechercher dans le texte"
          aria-label="Recherche"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Bookmarks */}
        <button
          id="header-bookmarks-btn"
          onClick={onOpenBookmarks}
          className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 relative transition-colors cursor-pointer"
          title="Signets & Notes"
          aria-label="Signets"
        >
          <BookmarkIcon className="w-4 h-4" />
          {bookmarkCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-zinc-950" />
          )}
        </button>

        {/* Theme Chooser Dropdown */}
        <div className="relative">
          <button
            id="theme-toggle-btn"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Ambiance & Décor"
            aria-label="Thème"
          >
            <Palette className="w-4 h-4" />
          </button>

          {showThemeMenu && (
            <div
              id="theme-dropdown-menu"
              className="absolute right-0 mt-2 w-44 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider px-2 py-1">
                Ambiance de fond
              </div>
              {(Object.keys(themeLabels) as ReaderTheme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    onChangeTheme(t);
                    setShowThemeMenu(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs flex items-center justify-between cursor-pointer ${
                    theme === t ? 'bg-indigo-600 text-white' : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <span>{themeLabels[t].name}</span>
                  <span className={`w-3 h-3 rounded-full border border-white/20 ${themeLabels[t].color}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Visual Editor (Hotspots & Interactivity) */}
        {onOpenVisualEditor && (
          <button
            id="header-visual-editor-btn"
            onClick={onOpenVisualEditor}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
            title="Éditeur visuel de zones et hotspots interactifs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Éditeur Visuel</span>
          </button>
        )}

        {/* Share & Export */}
        <button
          id="header-share-btn"
          onClick={onOpenShare}
          className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Partager / Exporter"
          aria-label="Partager"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Import / Change Document button */}
        <button
          id="header-import-btn"
          onClick={onOpenUpload}
          className="ml-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          title="Importer un autre fichier"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Importer</span>
        </button>
      </div>
    </header>
  );
};
