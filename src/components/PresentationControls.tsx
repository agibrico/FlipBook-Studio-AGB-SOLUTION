import React, { useState, useEffect } from 'react';
import {
  Presentation,
  Play,
  Pause,
  Maximize,
  Sparkles,
  MousePointer2,
  Clock,
  X,
} from 'lucide-react';

interface PresentationControlsProps {
  totalPages: number;
  currentPage: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  onGoToPage: (p: number) => void;
  isLaserActive: boolean;
  onToggleLaser: () => void;
}

export const PresentationControls: React.FC<PresentationControlsProps> = ({
  totalPages,
  currentPage,
  onNextPage,
  onPrevPage,
  onGoToPage,
  isLaserActive,
  onToggleLaser,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAutoFlipping, setIsAutoFlipping] = useState(false);
  const [flipInterval, setFlipInterval] = useState(5); // seconds
  const [isKioskActive, setIsKioskActive] = useState(false);

  // Auto-flip slideshow effect
  useEffect(() => {
    let timer: any = null;
    if (isAutoFlipping) {
      timer = setInterval(() => {
        if (currentPage >= totalPages) {
          onGoToPage(1); // loop to start
        } else {
          onNextPage();
        }
      }, flipInterval * 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoFlipping, flipInterval, currentPage, totalPages, onNextPage, onGoToPage]);

  // Kiosk Inactivity Return to Page 1
  useEffect(() => {
    if (!isKioskActive) return;

    let idleTimer: any = null;
    const resetIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        onGoToPage(1);
      }, 60000); // 60 seconds of inactivity
    };

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('touchstart', resetIdle);
    resetIdle();

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('touchstart', resetIdle);
    };
  }, [isKioskActive, onGoToPage]);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Mode Présentation, Kiosque & Pointeur Laser"
        className={`p-2 rounded-full border transition-all flex items-center justify-center ${
          isAutoFlipping || isLaserActive || isKioskActive
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-lg shadow-rose-500/10'
            : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-700/60'
        }`}
      >
        <Presentation className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl z-50 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Presentation className="w-3.5 h-3.5 text-rose-400" />
              Mode Présentation
            </span>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">
              ✕
            </button>
          </div>

          {/* Laser Pointer Toggle */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-300 flex items-center gap-1.5">
              <MousePointer2 className="w-3.5 h-3.5 text-rose-400" />
              Pointeur Laser
            </span>
            <button
              onClick={onToggleLaser}
              className={`px-2.5 py-1 rounded-full font-bold text-[10px] transition-all ${
                isLaserActive
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {isLaserActive ? 'ACTIF' : 'OFF'}
            </button>
          </div>

          {/* Auto-flip Slideshow */}
          <div className="space-y-1.5 p-2 rounded-lg bg-zinc-950 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-indigo-400" />
                Diaporama Auto
              </span>
              <button
                onClick={() => setIsAutoFlipping(!isAutoFlipping)}
                className={`px-2.5 py-1 rounded-full font-bold text-[10px] transition-all ${
                  isAutoFlipping
                    ? 'bg-emerald-500 text-white'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {isAutoFlipping ? 'EN COURS' : 'DÉMARRER'}
              </button>
            </div>

            {/* Speed selection */}
            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
              <span>Intervalle</span>
              <div className="flex items-center gap-1">
                {[3, 5, 10].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setFlipInterval(sec)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      flipInterval === sec
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Kiosk Mode Toggle */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800">
            <div>
              <p className="text-zinc-300 font-medium">Mode Kiosque Salon</p>
              <p className="text-[10px] text-zinc-500">Retour auto page 1 après 60s</p>
            </div>
            <button
              onClick={() => setIsKioskActive(!isKioskActive)}
              className={`px-2.5 py-1 rounded-full font-bold text-[10px] transition-all ${
                isKioskActive
                  ? 'bg-amber-500 text-white'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {isKioskActive ? 'ACTIF' : 'OFF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
