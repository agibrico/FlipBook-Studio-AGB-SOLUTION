import React, { useState } from 'react';
import { FlipBookDocument, ViewLayout, ReaderTheme, DeviceMode, UiTheme } from '../types';
import { useUiTheme } from '../contexts/UiThemeContext';
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
  Printer,
  Box,
  FileText,
  Sliders,
  Video,
  ChevronDown,
  Activity,
  Sun,
  Moon,
  Eye,
  EyeOff,
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
  uiTheme?: UiTheme;
  onToggleUiTheme?: () => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
  deviceMode: DeviceMode;
  onChangeDeviceMode: (mode: DeviceMode) => void;
  bookmarkCount: number;
  onOpenPrintSelection?: () => void;
  onOpenFlipPhysics?: () => void;
  onOpen3DViewer?: () => void;
  onOpenInPageForm?: () => void;
  onToggleChromaAvatar?: () => void;
  isChromaAvatarActive?: boolean;
  isDeveloperMode?: boolean;
  onToggleDeveloperMode?: () => void;
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
  onOpenPrintSelection,
  onOpenFlipPhysics,
  onOpen3DViewer,
  onOpenInPageForm,
  onToggleChromaAvatar,
  isChromaAvatarActive,
  isDeveloperMode,
  onToggleDeveloperMode,
  uiTheme,
  onToggleUiTheme,
  isFocusMode,
  onToggleFocusMode,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);

  const { uiTheme: contextUiTheme, toggleUiTheme: contextToggleUiTheme } = useUiTheme();
  const currentUiTheme = uiTheme ?? contextUiTheme;
  const handleToggleUiTheme = onToggleUiTheme ?? contextToggleUiTheme;
  const isLight = currentUiTheme === 'light';

  const themeLabels: Record<ReaderTheme, { name: string; color: string }> = {
    'studio-dark': { name: 'Studio Sombre', color: 'bg-zinc-900' },
    'wood-desk': { name: 'Bureau Bois', color: 'bg-amber-950' },
    'paper-light': { name: 'Papier Épuré', color: 'bg-stone-100' },
    'sepia-warm': { name: 'Sépia Vintage', color: 'bg-amber-100' },
  };

  const iconBtnClass = isLight
    ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
    : 'text-zinc-300 hover:text-white hover:bg-white/10';

  return (
    <header
      id="flipbook-header"
      className={`w-full px-4 py-2.5 flex items-center justify-between gap-2 z-40 select-none transition-colors duration-300 ${
        isLight
          ? 'bg-white/95 backdrop-blur-xl border-b border-zinc-200 text-zinc-900 shadow-xs'
          : 'bg-zinc-950/80 backdrop-blur-xl border-b border-white/10 text-white'
      }`}
    >
      {/* Left: Brand & Document Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
          <BookOpen className="w-4 h-4" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className={`text-sm font-semibold truncate leading-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              {doc.title}
            </h1>
            <span className={`hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
              isLight
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
            }`}>
              {doc.sourceType}
            </span>
          </div>
          <p className={`text-[11px] font-mono hidden sm:block ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {doc.totalPages} pages • FlipBook Interactif
          </p>
        </div>
      </div>

      {/* Center: Device Simulator & Layout Controls (Desktop / Tablet view) */}
      <div className={`hidden lg:flex items-center gap-2 p-1 rounded-xl border ${
        isLight
          ? 'bg-zinc-100/90 border-zinc-200 text-zinc-800'
          : 'bg-zinc-900/90 border-white/10 text-white'
      }`}>
        {/* Device Viewport Selector */}
        <div className={`flex items-center gap-1 border-r pr-2 mr-1 ${isLight ? 'border-zinc-200' : 'border-white/10'}`}>
          <button
            onClick={() => onChangeDeviceMode('mobile')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              deviceMode === 'mobile'
                ? 'bg-indigo-600 text-white shadow-xs'
                : isLight
                ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            title="Aperçu Mobile (iPhone 15)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
          <button
            onClick={() => onChangeDeviceMode('tablet')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              deviceMode === 'tablet'
                ? 'bg-indigo-600 text-white shadow-xs'
                : isLight
                ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            title="Aperçu Tablette (iPad)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablette</span>
          </button>
          <button
            onClick={() => onChangeDeviceMode('responsive')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              deviceMode === 'responsive'
                ? 'bg-indigo-600 text-white shadow-xs'
                : isLight
                ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
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
              viewLayout === 'single'
                ? isLight
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'bg-zinc-700 text-white'
                : isLight
                ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            title="1 Page à la fois"
          >
            <Square className="w-3.5 h-3.5" />
            <span>1 Page</span>
          </button>
          <button
            onClick={() => onChangeViewLayout('double')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              viewLayout === 'double'
                ? isLight
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'bg-zinc-700 text-white'
                : isLight
                ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
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
              ? isLight
                ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300'
                : 'bg-white/20 text-white'
              : iconBtnClass
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
          className={`p-2 rounded-xl transition-colors cursor-pointer ${iconBtnClass}`}
          title="Rechercher dans le texte"
          aria-label="Recherche"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Bookmarks */}
        <button
          id="header-bookmarks-btn"
          onClick={onOpenBookmarks}
          className={`p-2 rounded-xl relative transition-colors cursor-pointer ${iconBtnClass}`}
          title="Signets & Notes"
          aria-label="Signets"
        >
          <BookmarkIcon className="w-4 h-4" />
          {bookmarkCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-zinc-950" />
          )}
        </button>

        {/* Global UI Shell Dark / Light Theme Toggle Button */}
        <button
          id="header-ui-theme-toggle-btn"
          onClick={handleToggleUiTheme}
          className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center relative ${
            isLight
              ? 'text-amber-700 bg-amber-100 hover:bg-amber-200 ring-1 ring-amber-400/40 shadow-xs'
              : 'text-amber-300 hover:text-amber-200 hover:bg-white/10'
          }`}
          title={
            isLight
              ? 'Mode sombre global (Interface UI) • Actuellement en mode clair'
              : 'Mode clair global (Interface UI) • Actuellement en mode sombre'
          }
          aria-label={isLight ? 'Basculer vers le mode sombre' : 'Basculer vers le mode clair'}
        >
          {isLight ? (
            <Moon className="w-4 h-4 text-zinc-800 transition-transform duration-200 hover:-rotate-12" />
          ) : (
            <Sun className="w-4 h-4 text-amber-300 transition-transform duration-300 hover:rotate-45" />
          )}
        </button>

        {/* Eye Strain Reduction Focus Mode Toggle Button */}
        {onToggleFocusMode && (
          <button
            id="header-focus-mode-btn"
            onClick={onToggleFocusMode}
            className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center relative ${
              isFocusMode
                ? 'text-indigo-400 bg-indigo-500/20 ring-1 ring-indigo-500/40 shadow-xs'
                : iconBtnClass
            }`}
            title={
              isFocusMode
                ? "Désactiver le Mode Focus (Rétablir l'interface) [Touche F ou Échap]"
                : "Activer le Mode Focus (Atténuer l'interface & repos visuel) [Touche F]"
            }
            aria-label="Mode Focus repos visuel"
          >
            {isFocusMode ? (
              <EyeOff className="w-4 h-4 text-indigo-400" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Theme Chooser Dropdown (Reader Environment Ambiance) */}
        <div className="relative">
          <button
            id="theme-toggle-btn"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${iconBtnClass}`}
            title="Ambiance & Décor 3D (Fond du lecteur)"
            aria-label="Thème du lecteur"
          >
            <Palette className="w-4 h-4" />
          </button>

          {showThemeMenu && (
            <div
              id="theme-dropdown-menu"
              className={`absolute right-0 mt-2 w-48 border rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100 ${
                isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-white'
              }`}
            >
              <div className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 ${isLight ? 'text-zinc-400' : 'text-zinc-400'}`}>
                Ambiance du lecteur 3D
              </div>
              {(Object.keys(themeLabels) as ReaderTheme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    onChangeTheme(t);
                    setShowThemeMenu(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs flex items-center justify-between cursor-pointer ${
                    theme === t
                      ? 'bg-indigo-600 text-white font-medium'
                      : isLight
                      ? 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                      : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <span>{themeLabels[t].name}</span>
                  <span className={`w-3 h-3 rounded-full border border-black/10 dark:border-white/20 ${themeLabels[t].color}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Advanced Tools Dropdown */}
        <div className="relative">
          <button
            id="tools-toggle-btn"
            onClick={() => setShowToolsMenu(!showToolsMenu)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isLight
                ? 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 border-zinc-200'
                : 'text-zinc-300 hover:text-white hover:bg-white/10 border-white/5'
            }`}
            title="Outils interactifs & multimédias"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden md:inline">Outils Pro</span>
            <ChevronDown className={`w-3 h-3 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`} />
          </button>

          {showToolsMenu && (
            <div
              id="tools-dropdown-menu"
              className={`absolute right-0 mt-2 w-56 border rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100 ${
                isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-white'
              }`}
            >
              <div className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 ${isLight ? 'text-zinc-400' : 'text-zinc-400'}`}>
                Expérience & Rendu
              </div>

              {onOpenFlipPhysics && (
                <button
                  onClick={() => {
                    onOpenFlipPhysics();
                    setShowToolsMenu(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs flex items-center gap-2.5 cursor-pointer ${
                    isLight ? 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div className="font-medium">Physique de Page</div>
                    <div className={`text-[10px] ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Moteur réaliste, rigide ou fluide</div>
                  </div>
                </button>
              )}

              {onOpenPrintSelection && (
                <button
                  onClick={() => {
                    onOpenPrintSelection();
                    setShowToolsMenu(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs flex items-center gap-2.5 cursor-pointer ${
                    isLight ? 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Printer className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="font-medium">Impression Sélective</div>
                    <div className={`text-[10px] ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Imprimer par page, planche ou livret</div>
                  </div>
                </button>
              )}

              {onOpen3DViewer && (
                <button
                  onClick={() => {
                    onOpen3DViewer();
                    setShowToolsMenu(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs flex items-center gap-2.5 cursor-pointer ${
                    isLight ? 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Box className="w-4 h-4 text-indigo-500" />
                  <div>
                    <div className="font-medium">Inspecteur 3D / AR</div>
                    <div className={`text-[10px] ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Modèle 3D interactif et réalité augmentée</div>
                  </div>
                </button>
              )}

              {onOpenInPageForm && (
                <button
                  onClick={() => {
                    onOpenInPageForm();
                    setShowToolsMenu(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs flex items-center gap-2.5 cursor-pointer ${
                    isLight ? 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="font-medium">Formulaire Interactif</div>
                    <div className={`text-[10px] ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Saisie et devis intégrés à la page</div>
                  </div>
                </button>
              )}

              {onToggleChromaAvatar && (
                <button
                  onClick={() => {
                    onToggleChromaAvatar();
                    setShowToolsMenu(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs flex items-center gap-2.5 cursor-pointer ${
                    isChromaAvatarActive
                      ? 'bg-rose-500/20 text-rose-500 font-medium'
                      : isLight
                      ? 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Video className="w-4 h-4 text-rose-500" />
                  <div>
                    <div className="font-medium">Hôte Vidéo Virtuel</div>
                    <div className={`text-[10px] ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>{isChromaAvatarActive ? 'Désactiver l\'avatar' : 'Avatar transparent incrusté'}</div>
                  </div>
                </button>
              )}

              {onToggleDeveloperMode && (
                <button
                  id="toggle-dev-mode-btn"
                  onClick={() => {
                    onToggleDeveloperMode();
                    setShowToolsMenu(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs flex items-center gap-2.5 cursor-pointer ${
                    isDeveloperMode
                      ? 'bg-emerald-500/20 text-emerald-600 font-medium'
                      : isLight
                      ? 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div className="font-medium">Mode Développeur</div>
                    <div className={`text-[10px] ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>{isDeveloperMode ? 'Actif (Indicateur FPS & 3D)' : 'Afficher l\'indicateur FPS'}</div>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Visual Editor (Hotspots & Interactivity) */}
        {onOpenVisualEditor && (
          <button
            id="header-visual-editor-btn"
            onClick={onOpenVisualEditor}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              isLight
                ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700 hover:text-indigo-900 shadow-xs'
                : 'bg-indigo-600/30 hover:bg-indigo-600/50 border-indigo-500/50 text-indigo-200 hover:text-white'
            }`}
            title="Éditeur visuel de zones et hotspots interactifs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Éditeur Visuel</span>
          </button>
        )}

        {/* Share & Export */}
        <button
          id="header-share-btn"
          onClick={onOpenShare}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${iconBtnClass}`}
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
