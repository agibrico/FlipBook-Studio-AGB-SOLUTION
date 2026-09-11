import React, { useState, useEffect } from 'react';
import { ambientAudioService, AMBIENT_TRACKS } from '../services/ambientAudioService';
import { AmbientSoundTrack } from '../types/saas';
import {
  Music,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sliders,
  ChevronUp,
} from 'lucide-react';

export const AmbientSoundPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(() => ambientAudioService.getIsPlaying());
  const [currentTrack, setCurrentTrack] = useState(() => ambientAudioService.getCurrentTrack());
  const [volume, setVolume] = useState(() => ambientAudioService.getVolume());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    return ambientAudioService.subscribe(() => {
      setIsPlaying(ambientAudioService.getIsPlaying());
      setCurrentTrack(ambientAudioService.getCurrentTrack());
      setVolume(ambientAudioService.getVolume());
    });
  }, []);

  const handleTogglePlay = () => {
    ambientAudioService.toggle();
  };

  const handleTrackChange = (track: AmbientSoundTrack) => {
    ambientAudioService.selectTrack(track);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    ambientAudioService.setVolume(val);
  };

  return (
    <div className="relative inline-block">
      {/* Trigger Button */}
      <button
        onClick={handleTogglePlay}
        onContextMenu={(e) => {
          e.preventDefault();
          setIsMenuOpen((prev) => !prev);
        }}
        title={`Ambiance Sonore (${isPlaying ? 'Actif' : 'En pause'}) - Clic droit pour menu`}
        className={`p-2 rounded-full border transition-all flex items-center gap-1.5 ${
          isPlaying
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10 animate-pulse'
            : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-700/60'
        }`}
      >
        <Music className="w-4 h-4" />
        {isPlaying && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
      </button>

      {/* Mini Options Popup */}
      {isMenuOpen && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl z-50 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-amber-400" />
              Ambiance Sonore
            </span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-zinc-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          {/* Tracks List */}
          <div className="space-y-1">
            {AMBIENT_TRACKS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTrackChange(t)}
                className={`w-full p-2 rounded-lg text-left text-xs transition-all flex items-center justify-between ${
                  currentTrack.id === t.id
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <span>{t.title}</span>
                {currentTrack.id === t.id && isPlaying && (
                  <span className="text-[10px] font-mono text-amber-400">EN COURS</span>
                )}
              </button>
            ))}
          </div>

          {/* Volume Control */}
          <div className="space-y-1 pt-1 border-t border-zinc-800">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                {volume === 0 ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                Volume
              </span>
              <span className="font-mono">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-amber-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
