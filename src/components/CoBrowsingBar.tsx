import React, { useEffect, useState } from 'react';
import { Users, Mic, MicOff, Radio, Navigation, X, Check, Share2, HelpCircle } from 'lucide-react';
import { CoBrowsingSession } from '../types/saas';
import { coBrowsingService } from '../services/coBrowsingService';

interface CoBrowsingBarProps {
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const CoBrowsingBar: React.FC<CoBrowsingBarProps> = ({
  currentPage,
  onPageChange,
}) => {
  const [session, setSession] = useState<CoBrowsingSession | null>(coBrowsingService.getSession());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return coBrowsingService.subscribe((s) => {
      setSession(s);
      if (s && s.activePage !== currentPage) {
        onPageChange(s.activePage);
      }
    });
  }, [currentPage, onPageChange]);

  if (!session || !session.isLive) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(session.sessionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 w-auto max-w-[95vw] animate-in slide-in-from-top-4 duration-300">
      <div className="bg-zinc-950/95 border border-rose-500/40 backdrop-blur-xl shadow-2xl shadow-rose-950/40 rounded-2xl px-4 py-2 flex items-center gap-3 text-xs text-white">
        {/* Live Pulse Indicator */}
        <div className="flex items-center gap-2 pr-2 border-r border-zinc-800">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
          </span>
          <span className="font-bold text-rose-400 uppercase tracking-wider text-[11px]">EN DIRECT</span>
        </div>

        {/* Info Session */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Guide :</span>
          <span className="font-semibold text-white truncate max-w-[140px]">{session.hostName}</span>
        </div>

        {/* PIN Code badge */}
        <button
          onClick={handleCopyCode}
          className="px-2.5 py-1 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 rounded-lg flex items-center gap-1.5 transition text-zinc-300 hover:text-white"
          title="Cliquez pour copier le code PIN de la session"
        >
          <span className="text-[10px] text-zinc-400">PIN:</span>
          <span className="font-mono font-bold text-rose-400">{session.sessionCode}</span>
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3 text-zinc-400" />}
        </button>

        {/* Guests count */}
        <div className="flex items-center gap-1 text-zinc-300 px-2 py-0.5 bg-zinc-900 rounded-lg border border-zinc-800">
          <Users className="w-3.5 h-3.5 text-zinc-400" />
          <span>{session.guestCount}</span>
        </div>

        {/* Audio Mic Button */}
        <button
          onClick={() => coBrowsingService.toggleAudio()}
          className={`p-1.5 rounded-lg border transition ${
            session.audioVoiceStatus === 'SPEAKING'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400'
          }`}
          title={session.audioVoiceStatus === 'SPEAKING' ? 'Microphone actif' : 'Microphone coupé'}
        >
          {session.audioVoiceStatus === 'SPEAKING' ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
        </button>

        {/* End Session Button */}
        <button
          onClick={() => coBrowsingService.endSession()}
          className="p-1.5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 rounded-lg transition ml-1"
          title="Quitter la session co-browsing"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
