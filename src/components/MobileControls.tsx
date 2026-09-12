import React, { useState, useRef, useEffect } from 'react';
import { useUiTheme } from '../contexts/UiThemeContext';
import {
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Sliders,
  Headphones,
  CornerDownLeft,
  Compass,
} from 'lucide-react';
import { soundEngine } from '../services/sound';

interface MobileControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onOpenToc: () => void;
  onOpenThumbnails: () => void;
  isAutoPlaying: boolean;
  onToggleAutoPlay: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isAudioReaderOpen?: boolean;
  isSpeaking?: boolean;
  onToggleAudioReader?: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onOpenToc,
  onOpenThumbnails,
  isAutoPlaying,
  onToggleAutoPlay,
  isFullscreen,
  onToggleFullscreen,
  isAudioReaderOpen = false,
  isSpeaking = false,
  onToggleAudioReader,
}) => {
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [showSlider, setShowSlider] = useState(false);
  const [quickJumpPage, setQuickJumpPage] = useState<string>(currentPage.toString());
  const quickJumpInputRef = useRef<HTMLInputElement>(null);
  const { isDark } = useUiTheme();

  // Synchronize and focus input when slider/jump panel is toggled
  useEffect(() => {
    if (showSlider) {
      setQuickJumpPage(currentPage.toString());
      const timer = setTimeout(() => {
        quickJumpInputRef.current?.focus();
        quickJumpInputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showSlider, currentPage]);

  const toggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onPageChange(val);
    setQuickJumpPage(val.toString());
  };

  const handleQuickJumpSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pageNum = parseInt(quickJumpPage, 10);
    if (!isNaN(pageNum)) {
      const clampedPage = Math.max(1, Math.min(totalPages, pageNum));
      onPageChange(clampedPage);
      setShowSlider(false);
    }
  };

  const handleQuickJumpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuickJumpSubmit();
    }
  };

  const btnClass = isDark
    ? 'text-zinc-300 hover:text-white hover:bg-white/10 active:bg-white/20'
    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 active:bg-zinc-200';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pt-2 pointer-events-none flex flex-col items-center">
      {/* Quick Page Scrub Slider & Quick Jump Input Panel */}
      {showSlider && (
        <div className={`w-full max-w-sm mb-2 p-3 backdrop-blur-xl border rounded-2xl shadow-2xl pointer-events-auto flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150 ${
          isDark
            ? 'bg-zinc-900/95 border-white/10 text-white'
            : 'bg-white/95 border-zinc-200 text-zinc-900'
        }`}>
          {/* Quick Scrub Slider */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono min-w-[24px] text-right ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>1</span>
            <input
              id="mobile-page-slider"
              type="range"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={handleSliderChange}
              className={`flex-1 accent-indigo-500 cursor-pointer h-2 rounded-lg ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'}`}
              aria-label="Curseur de défilement rapide"
            />
            <span className={`text-xs font-mono min-w-[24px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{totalPages}</span>
          </div>

          {/* Quick Jump Input Field: Type page number and hit Enter */}
          <form
            id="mobile-quick-jump-form"
            onSubmit={handleQuickJumpSubmit}
            className={`flex items-center justify-between gap-2 pt-2 border-t ${
              isDark ? 'border-zinc-800' : 'border-zinc-100'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Saut rapide :</span>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                ref={quickJumpInputRef}
                id="mobile-quick-jump-input"
                type="number"
                min={1}
                max={totalPages}
                value={quickJumpPage}
                onChange={(e) => setQuickJumpPage(e.target.value)}
                onKeyDown={handleQuickJumpKeyDown}
                placeholder={currentPage.toString()}
                className={`w-14 px-2 py-1 text-center font-mono text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  isDark
                    ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500'
                    : 'bg-zinc-100 border-zinc-300 text-zinc-900 placeholder:text-zinc-400'
                }`}
                title="Tapez un numéro de page et appuyez sur Entrée"
                aria-label="Numéro de page pour saut rapide"
              />
              <span className={`text-xs font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                / {totalPages}
              </span>
              <button
                type="submit"
                id="mobile-quick-jump-submit-btn"
                className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-medium flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                title="Valider et naviguer directement vers cette page (Entrée)"
              >
                <span>Aller</span>
                <CornerDownLeft className="w-3 h-3" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Bottom Navigation Bar */}
      <nav
        id="mobile-bottom-bar"
        aria-label="Contrôles de lecture mobile"
        className={`w-full max-w-lg backdrop-blur-xl border rounded-2xl shadow-2xl px-3 py-2 pointer-events-auto flex items-center justify-between gap-1 select-none transition-colors duration-300 ${
          isDark
            ? 'bg-zinc-900/90 border-white/10 text-white'
            : 'bg-white/95 border-zinc-200 text-zinc-900 shadow-xl'
        }`}
      >
        {/* Table of contents button */}
        <button
          id="mobile-toc-btn"
          onClick={onOpenToc}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${btnClass}`}
          title="Sommaire & Chapitres"
          aria-label="Sommaire"
        >
          <List className="w-5 h-5" />
        </button>

        {/* Thumbnails grid button */}
        <button
          id="mobile-thumbnails-btn"
          onClick={onOpenThumbnails}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${btnClass}`}
          title="Vignettes de toutes les pages"
          aria-label="Vignettes"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>

        {/* Divider */}
        <div className={`w-px h-5 ${isDark ? 'bg-white/10' : 'bg-zinc-200'}`} />

        {/* Previous page arrow */}
        <button
          id="mobile-prev-btn"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className={`w-10 h-10 rounded-xl disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer ${
            isDark ? 'hover:bg-white/10 active:bg-white/20 text-white' : 'hover:bg-zinc-100 active:bg-zinc-200 text-zinc-800'
          }`}
          title="Page précédente"
          aria-label="Page précédente"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page Counter & Slider trigger */}
        <button
          id="mobile-page-counter-btn"
          onClick={() => setShowSlider(!showSlider)}
          className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-xs font-mono transition-colors cursor-pointer ${
            isDark ? 'hover:bg-white/10 active:bg-white/20 text-zinc-200' : 'hover:bg-zinc-100 active:bg-zinc-200 text-zinc-700'
          }`}
          title="Saut rapide & défilement (Cliquer pour saisir un numéro de page)"
          aria-label="Saut rapide de page"
        >
          <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{currentPage}</span>
          <span className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>/</span>
          <span>{totalPages}</span>
          <Sliders className={`w-3 h-3 ml-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
        </button>

        {/* Next page arrow */}
        <button
          id="mobile-next-btn"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className={`w-10 h-10 rounded-xl disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer ${
            isDark ? 'hover:bg-white/10 active:bg-white/20 text-white' : 'hover:bg-zinc-100 active:bg-zinc-200 text-zinc-800'
          }`}
          title="Page suivante"
          aria-label="Page suivante"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Divider */}
        <div className={`w-px h-5 ${isDark ? 'bg-white/10' : 'bg-zinc-200'}`} />

        {/* Paper flip sound toggle */}
        <button
          id="mobile-audio-btn"
          onClick={toggleSound}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
            isMuted
              ? isDark ? 'text-zinc-500 hover:bg-white/10' : 'text-zinc-400 hover:bg-zinc-100'
              : 'text-amber-500 hover:bg-amber-500/10'
          }`}
          title={isMuted ? 'Activer le son du papier' : 'Couper le son'}
          aria-label="Son du papier"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* Speech Synthesis TTS Text Reader */}
        {onToggleAudioReader && (
          <button
            id="mobile-speech-reader-btn"
            onClick={onToggleAudioReader}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              isSpeaking
                ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/40 animate-pulse'
                : isAudioReaderOpen
                ? isDark ? 'text-indigo-400 bg-indigo-950/60' : 'text-indigo-700 bg-indigo-100'
                : btnClass
            }`}
            title="Écouter le texte de la page (Synthèse vocale)"
            aria-label="Écouter la page"
          >
            <Headphones className="w-5 h-5" />
          </button>
        )}

        {/* Auto play toggle */}
        <button
          id="mobile-autoplay-btn"
          onClick={onToggleAutoPlay}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
            isAutoPlaying
              ? 'text-emerald-500 bg-emerald-500/20'
              : btnClass
          }`}
          title={isAutoPlaying ? 'Pause le défilement auto' : 'Lecture automatique'}
          aria-label="Lecture auto"
        >
          {isAutoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        {/* Fullscreen toggle */}
        <button
          id="mobile-fullscreen-btn"
          onClick={onToggleFullscreen}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${btnClass}`}
          title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
          aria-label="Plein écran"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </nav>
    </div>
  );
};
