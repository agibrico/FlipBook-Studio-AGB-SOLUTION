import React, { useState } from 'react';
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

  const toggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPageChange(parseInt(e.target.value, 10));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pt-2 pointer-events-none flex flex-col items-center">
      {/* Quick Page Scrub Slider (revealed on tap) */}
      {showSlider && (
        <div className="w-full max-w-sm mb-2 p-3 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl pointer-events-auto flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="text-xs font-mono text-zinc-400 min-w-[24px] text-right">1</span>
          <input
            type="range"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={handleSliderChange}
            className="flex-1 accent-indigo-500 cursor-pointer h-2 bg-zinc-700 rounded-lg"
          />
          <span className="text-xs font-mono text-zinc-400 min-w-[24px]">{totalPages}</span>
        </div>
      )}

      {/* Floating Bottom Navigation Bar */}
      <nav
        id="mobile-bottom-bar"
        aria-label="Contrôles de lecture mobile"
        className="w-full max-w-lg bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl px-3 py-2 pointer-events-auto flex items-center justify-between gap-1 text-white select-none"
      >
        {/* Table of contents button */}
        <button
          id="mobile-toc-btn"
          onClick={onOpenToc}
          className="w-10 h-10 rounded-xl hover:bg-white/10 active:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title="Sommaire & Chapitres"
          aria-label="Sommaire"
        >
          <List className="w-5 h-5" />
        </button>

        {/* Thumbnails grid button */}
        <button
          id="mobile-thumbnails-btn"
          onClick={onOpenThumbnails}
          className="w-10 h-10 rounded-xl hover:bg-white/10 active:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title="Vignettes de toutes les pages"
          aria-label="Vignettes"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10" />

        {/* Previous page arrow */}
        <button
          id="mobile-prev-btn"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="w-10 h-10 rounded-xl hover:bg-white/10 active:bg-white/20 disabled:opacity-30 flex items-center justify-center text-white transition-colors cursor-pointer"
          title="Page précédente"
          aria-label="Page précédente"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page Counter & Slider trigger */}
        <button
          id="mobile-page-counter-btn"
          onClick={() => setShowSlider(!showSlider)}
          className="px-2.5 py-1.5 rounded-xl hover:bg-white/10 active:bg-white/20 flex items-center gap-1 text-xs font-mono text-zinc-200 transition-colors cursor-pointer"
          title="Sélectionner une page"
        >
          <span className="font-semibold text-white">{currentPage}</span>
          <span className="text-zinc-500">/</span>
          <span>{totalPages}</span>
          <Sliders className="w-3 h-3 ml-1 text-zinc-400" />
        </button>

        {/* Next page arrow */}
        <button
          id="mobile-next-btn"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="w-10 h-10 rounded-xl hover:bg-white/10 active:bg-white/20 disabled:opacity-30 flex items-center justify-center text-white transition-colors cursor-pointer"
          title="Page suivante"
          aria-label="Page suivante"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10" />

        {/* Paper flip sound toggle */}
        <button
          id="mobile-audio-btn"
          onClick={toggleSound}
          className={`w-10 h-10 rounded-xl hover:bg-white/10 active:bg-white/20 flex items-center justify-center transition-colors cursor-pointer ${
            isMuted ? 'text-zinc-500' : 'text-amber-400'
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
            className={`w-10 h-10 rounded-xl hover:bg-white/10 active:bg-white/20 flex items-center justify-center transition-colors cursor-pointer ${
              isSpeaking
                ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/40 animate-pulse'
                : isAudioReaderOpen
                ? 'text-indigo-400 bg-indigo-950/60'
                : 'text-zinc-300'
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
          className={`w-10 h-10 rounded-xl hover:bg-white/10 active:bg-white/20 flex items-center justify-center transition-colors cursor-pointer ${
            isAutoPlaying ? 'text-emerald-400 bg-emerald-500/20' : 'text-zinc-300'
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
          className="w-10 h-10 rounded-xl hover:bg-white/10 active:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
          aria-label="Plein écran"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </nav>
    </div>
  );
};
