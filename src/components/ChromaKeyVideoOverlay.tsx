import React, { useState, useEffect } from 'react';
import { Video, Volume2, VolumeX, Sparkles, X, MessageSquare, ExternalLink } from 'lucide-react';
import { ChromaKeyAvatarConfig } from '../types/saas';

interface ChromaKeyVideoOverlayProps {
  currentPage: number;
  isOpen: boolean;
  onClose: () => void;
  config?: Partial<ChromaKeyAvatarConfig>;
}

export const ChromaKeyVideoOverlay: React.FC<ChromaKeyVideoOverlayProps> = ({
  currentPage,
  isOpen,
  onClose,
  config,
}) => {
  const avatar: ChromaKeyAvatarConfig = {
    id: 'avatar-elena',
    flipbookId: 'fbk-hotel-palace-nice',
    enabled: true,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    avatarName: 'Elena (Concierge Privée Virtuelle)',
    position: 'BOTTOM_RIGHT',
    chromaKeyColor: '#00FF00',
    similarityThreshold: 0.15,
    autoPlayOnPageArrival: true,
    speechBubbleText: `Bienvenue sur la page ${currentPage} de notre brochure ! Souhaitez-vous que je vous détaille les prestations exclusives de cette suite ?`,
    ctaText: 'Poser une question',
    ...config,
  };

  const [isMuted, setIsMuted] = useState(true);
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);

  useEffect(() => {
    // Actualise la bulle de parole lors des changements de page
    setShowSpeechBubble(true);
  }, [currentPage]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Bulle de texte / Réplique de l'avatar */}
      {showSpeechBubble && (
        <div className="pointer-events-auto mb-2 max-w-xs bg-zinc-950/90 border border-teal-500/40 backdrop-blur-md p-3.5 rounded-2xl shadow-xl shadow-teal-950/30 text-xs text-zinc-200 relative">
          <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-zinc-800 pb-1">
            <span className="font-bold text-teal-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {avatar.avatarName}
            </span>
            <button
              onClick={() => setShowSpeechBubble(false)}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="leading-relaxed text-zinc-300 text-[11px]">{avatar.speechBubbleText}</p>

          {avatar.ctaText && (
            <button className="mt-2 w-full py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg text-[11px] transition shadow-md flex items-center justify-center gap-1.5">
              <MessageSquare className="w-3 h-3" />
              {avatar.ctaText}
            </button>
          )}

          {/* Pointe de la bulle vers l'avatar */}
          <div className="absolute -bottom-2 right-8 w-3 h-3 bg-zinc-950 border-r border-b border-teal-500/40 rotate-45" />
        </div>
      )}

      {/* Cadre de l'avatar Chroma-Key détouré */}
      <div className="pointer-events-auto relative w-44 h-56 rounded-2xl overflow-hidden border-2 border-teal-500/50 shadow-2xl bg-zinc-950 flex flex-col">
        {/* Barre supérieure rapide */}
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition"
            title={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-teal-400" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition"
            title="Fermer l'avatar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Vidéo Avatar / Image découpée simulant le Chroma Key */}
        <div className="flex-1 relative bg-gradient-to-t from-zinc-950 via-teal-950/20 to-transparent flex items-end justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80"
            alt="Virtual Presenter"
            className="w-full h-full object-cover object-top filter contrast-105"
            style={{
              maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)',
            }}
          />

          {/* Badge Phase 37 */}
          <div className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded-md bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/60 text-[9px] text-teal-300 font-medium">
            Chroma Key HD
          </div>
        </div>
      </div>
    </div>
  );
};
