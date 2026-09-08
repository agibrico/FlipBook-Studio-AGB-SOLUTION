import React, { useState, useEffect } from 'react';
import { FlipBookDocument, BookPage } from '../types';
import { speechService, SpeechState, extractPageText } from '../services/speech';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Gauge,
  Languages,
  X,
  Sparkles,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

interface AudioReaderBarProps {
  document: FlipBookDocument;
  currentPage: number;
  isOpen: boolean;
  onClose: () => void;
  onPageChange: (page: number) => void;
  isDualView: boolean;
}

export const AudioReaderBar: React.FC<AudioReaderBarProps> = ({
  document: doc,
  currentPage,
  isOpen,
  onClose,
  onPageChange,
  isDualView,
}) => {
  const [speechState, setSpeechState] = useState<SpeechState>(speechService.getState());
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [showRateMenu, setShowRateMenu] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Subscribe to speech service changes
  useEffect(() => {
    const unsubscribe = speechService.subscribe((state) => {
      setSpeechState(state);
    });
    setVoices(speechService.getVoices());
    return () => {
      unsubscribe();
    };
  }, []);

  // Update voices when loaded
  useEffect(() => {
    const handleVoicesChanged = () => {
      setVoices(speechService.getVoices());
    };
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    }
  }, []);

  // Determine current active page(s)
  const leftPageNum = isDualView
    ? currentPage === 1
      ? 1
      : currentPage % 2 === 0
      ? currentPage
      : currentPage - 1
    : currentPage;

  const rightPageNum = isDualView && leftPageNum > 1 && leftPageNum < doc.totalPages ? leftPageNum + 1 : null;

  // Selected page to read (if dual page, allow switching between left & right)
  const [selectedReadingPageNum, setSelectedReadingPageNum] = useState<number>(leftPageNum);

  // Keep selected reading page in sync when currentPage changes
  useEffect(() => {
    if (isDualView && rightPageNum && speechState.currentPageNumber === rightPageNum) {
      setSelectedReadingPageNum(rightPageNum);
    } else {
      setSelectedReadingPageNum(leftPageNum);
    }
  }, [currentPage, isDualView, leftPageNum, rightPageNum, speechState.currentPageNumber]);

  const activePageObj: BookPage | undefined = doc.pages.find(
    (p) => p.pageNumber === selectedReadingPageNum
  );

  const rawText = extractPageText(activePageObj);
  const hasContentToRead = rawText.trim().length > 0;

  const handleTogglePlay = () => {
    if (speechState.isSpeaking) {
      speechService.pause();
    } else if (speechState.isPaused) {
      speechService.resume();
    } else {
      if (activePageObj) {
        speechService.speakPage(activePageObj, true);
      }
    }
  };

  const handleStop = () => {
    speechService.stop();
  };

  const handleSelectPageToRead = (pageNum: number) => {
    setSelectedReadingPageNum(pageNum);
    const targetPage = doc.pages.find((p) => p.pageNumber === pageNum);
    if (targetPage) {
      speechService.speakPage(targetPage, true);
    }
  };

  const handleRateChange = (rate: number) => {
    speechService.setRate(rate);
    setShowRateMenu(false);
  };

  const handleVoiceChange = (voiceURI: string) => {
    speechService.setVoice(voiceURI);
    setShowVoiceMenu(false);
  };

  if (!isOpen) return null;

  const rates = [0.8, 1.0, 1.25, 1.5, 1.75];

  return (
    <div
      id="audio-reader-bar"
      className="fixed top-14 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl animate-in fade-in slide-in-from-top-3 duration-200"
    >
      <div className="bg-zinc-900/95 backdrop-blur-2xl border border-indigo-500/30 rounded-2xl shadow-2xl p-3 text-white ring-1 ring-white/10">
        {/* Main Controls Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Status & Animated Soundwave indicator */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex-shrink-0">
              {speechState.isSpeaking ? (
                // Live Soundwave equalizer animation
                <div className="flex items-end justify-center gap-0.5 h-4 w-4">
                  <span className="w-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                  <span className="w-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
                  <span className="w-1 bg-indigo-400 rounded-full animate-bounce h-2.5" />
                </div>
              ) : (
                <BookOpen className="w-4 h-4 text-zinc-400" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white truncate">
                  {speechState.isSpeaking
                    ? 'Lecture en cours...'
                    : speechState.isPaused
                    ? 'Lecture en pause'
                    : 'Lecture Audio (Text-to-Speech)'}
                </span>

                {/* Dual page switch pills if applicable */}
                {isDualView && rightPageNum && (
                  <div className="hidden sm:flex items-center bg-zinc-800/80 p-0.5 rounded-lg border border-white/5 text-[11px] font-mono">
                    <button
                      onClick={() => handleSelectPageToRead(leftPageNum)}
                      className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        selectedReadingPageNum === leftPageNum
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      P. {leftPageNum}
                    </button>
                    <button
                      onClick={() => handleSelectPageToRead(rightPageNum)}
                      className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        selectedReadingPageNum === rightPageNum
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      P. {rightPageNum}
                    </button>
                  </div>
                )}

                {/* Single page indicator */}
                {(!isDualView || !rightPageNum) && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                    Page {selectedReadingPageNum}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-zinc-400 truncate">
                {activePageObj?.title || `Page ${selectedReadingPageNum}`}
                {speechState.totalSentences > 0 && (
                  <span className="ml-1 text-zinc-500 font-mono">
                    ({speechState.currentSentenceIndex + 1}/{speechState.totalSentences})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Center Play / Pause / Skip buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => speechService.prevSentence()}
              disabled={!speechState.isSpeaking && !speechState.isPaused}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
              title="Phrase précédente"
              aria-label="Phrase précédente"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              id="audio-play-pause-btn"
              onClick={handleTogglePlay}
              disabled={!hasContentToRead}
              className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              title={speechState.isSpeaking ? 'Pause' : 'Écouter cette page'}
              aria-label={speechState.isSpeaking ? 'Pause' : 'Lire à voix haute'}
            >
              {speechState.isSpeaking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <button
              id="audio-stop-btn"
              onClick={handleStop}
              disabled={!speechState.isSpeaking && !speechState.isPaused}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
              title="Arrêter la lecture"
              aria-label="Arrêter"
            >
              <Square className="w-4 h-4" />
            </button>

            <button
              onClick={() => speechService.nextSentence()}
              disabled={!speechState.isSpeaking && !speechState.isPaused}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
              title="Phrase suivante"
              aria-label="Phrase suivante"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Right Speed, Voice & Close buttons */}
          <div className="flex items-center gap-1 relative">
            {/* Speed Rate Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowRateMenu(!showRateMenu);
                  setShowVoiceMenu(false);
                }}
                className="px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
                title="Vitesse de lecture"
              >
                <Gauge className="w-3 h-3 text-indigo-400" />
                <span>{speechState.rate}x</span>
              </button>

              {showRateMenu && (
                <div className="absolute right-0 top-full mt-2 w-28 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in duration-100">
                  <div className="text-[10px] font-mono text-zinc-400 px-2 py-1 uppercase">Vitesse</div>
                  {rates.map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRateChange(r)}
                      className={`w-full text-left px-2 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
                        speechState.rate === r ? 'bg-indigo-600 text-white font-bold' : 'text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      {r}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Voices Menu */}
            {voices.length > 0 && (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => {
                    setShowVoiceMenu(!showVoiceMenu);
                    setShowRateMenu(false);
                  }}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="Choisir la voix de synthèse"
                  aria-label="Voix"
                >
                  <Languages className="w-3.5 h-3.5" />
                </button>

                {showVoiceMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 max-h-56 overflow-y-auto bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl p-1 z-50 text-xs">
                    <div className="text-[10px] font-mono text-zinc-400 px-2 py-1 uppercase border-b border-zinc-800 mb-1">
                      Voix disponibles ({voices.length})
                    </div>
                    {voices.map((v) => (
                      <button
                        key={v.voiceURI}
                        onClick={() => handleVoiceChange(v.voiceURI)}
                        className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors truncate cursor-pointer flex items-center justify-between ${
                          speechState.selectedVoiceURI === v.voiceURI
                            ? 'bg-indigo-600 text-white font-medium'
                            : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <span className="truncate">{v.name}</span>
                        <span className="text-[10px] font-mono opacity-60 ml-1">{v.lang}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Close Bar button */}
            <button
              onClick={() => {
                speechService.stop();
                onClose();
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors ml-1 cursor-pointer"
              title="Fermer le lecteur audio"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Subtitle / Text Preview snippet */}
        {hasContentToRead ? (
          <div className="mt-2.5 pt-2 border-t border-white/10 px-1 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-zinc-300 italic line-clamp-2 leading-relaxed">
              {speechState.currentTextSnippet || rawText.slice(0, 140) + '...'}
            </p>
          </div>
        ) : (
          <div className="mt-2.5 pt-2 border-t border-white/10 px-1 flex items-center gap-2 text-amber-300 text-xs">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Aucun texte détecté sur cette page (image seule).</span>
          </div>
        )}
      </div>
    </div>
  );
};
