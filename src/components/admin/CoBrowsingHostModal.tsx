import React, { useState } from 'react';
import { Users, Play, Copy, Check, Radio, X, Mic, ExternalLink } from 'lucide-react';
import { coBrowsingService } from '../../services/coBrowsingService';
import { CoBrowsingSession } from '../../types/saas';

interface CoBrowsingHostModalProps {
  flipbookId: string;
  isOpen: boolean;
  onClose: () => void;
  onSessionStarted?: (session: CoBrowsingSession) => void;
}

export const CoBrowsingHostModal: React.FC<CoBrowsingHostModalProps> = ({
  flipbookId,
  isOpen,
  onClose,
  onSessionStarted,
}) => {
  const [hostName, setHostName] = useState('Jean Dupont (Directeur Commercial)');
  const [createdSession, setCreatedSession] = useState<CoBrowsingSession | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleStart = () => {
    const sess = coBrowsingService.startHostSession(flipbookId, hostName);
    setCreatedSession(sess);
    if (onSessionStarted) onSessionStarted(sess);
  };

  const handleCopyLink = () => {
    if (!createdSession) return;
    const shareUrl = `${window.location.origin}?cobs=${createdSession.sessionCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Lancer une Visite Guidée (Co-Browsing)</h3>
              <p className="text-xs text-zinc-400">Phase 36 • Présentation en direct et contrôle synchronisé</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {!createdSession ? (
            <div className="space-y-4">
              <p className="text-zinc-300 leading-relaxed">
                Démarrez une session de navigation partagée temps réel. Lorsque vous tournerez les pages ou pointerez un
                élément avec le laser interactif, l'écran de votre client se synchronisera instantanément.
              </p>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Nom du conseiller / présentateur :
                </label>
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-200 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                onClick={handleStart}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25"
              >
                <Play className="w-4 h-4 fill-white" />
                Générer la session & Obtenir le PIN
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-2xl">
                <span className="text-zinc-400 text-xs block mb-1">Code PIN à transmettre au client :</span>
                <span className="text-3xl font-mono font-extrabold text-rose-400 tracking-widest">
                  {createdSession.sessionCode}
                </span>
              </div>

              <p className="text-[11px] text-zinc-400">
                Votre client peut entrer ce code dans la barre de lecture du catalogue pour rejoindre votre visite
                guidée en direct.
              </p>

              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 border border-zinc-700"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Lien d\'invitation copié !' : 'Copier le lien direct de co-browsing'}
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition"
              >
                Accéder au catalogue en tant que Guide
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
