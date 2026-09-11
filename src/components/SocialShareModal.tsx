import React, { useState } from 'react';
import { FlipBookDocument } from '../types';
import {
  Share2,
  Copy,
  Check,
  MessageCircle,
  Twitter,
  Linkedin,
  Facebook,
  ExternalLink,
  Link2,
} from 'lucide-react';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: FlipBookDocument;
  currentPageNumber: number;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  document,
  currentPageNumber,
}) => {
  const [includePage, setIncludePage] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const baseUrl = window.location.origin;
  const shareUrl = includePage
    ? `${baseUrl}?page=${currentPageNumber}`
    : `${baseUrl}`;

  const shareTitle = `${document.title} (Page ${currentPageNumber})`;
  const shareText = `Découvrez ce document interactif immersif : "${document.title}".`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleLinkedIn = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Partager ce Document</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        {/* Deep Link Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
          <div>
            <p className="font-semibold text-white">Lien direct vers la Page {currentPageNumber}</p>
            <p className="text-[11px] text-zinc-400">Le lecteur s'ouvrira directement sur cette page</p>
          </div>
          <input
            type="checkbox"
            checked={includePage}
            onChange={(e) => setIncludePage(e.target.checked)}
            className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
          />
        </div>

        {/* Copy Link Input */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-300 truncate">
            {shareUrl}
          </div>
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copié' : 'Copier'}
          </button>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <button
            onClick={handleWhatsApp}
            className="p-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            WhatsApp
          </button>

          <button
            onClick={handleLinkedIn}
            className="p-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors"
          >
            <Linkedin className="w-5 h-5 text-blue-400" />
            LinkedIn
          </button>

          <button
            onClick={handleTwitter}
            className="p-3 rounded-xl bg-sky-600/10 hover:bg-sky-600/20 border border-sky-500/30 text-sky-300 text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors"
          >
            <Twitter className="w-5 h-5 text-sky-400" />
            X (Twitter)
          </button>
        </div>

        {/* OpenGraph Live Card Preview */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-800">
          <p className="text-[11px] text-zinc-400 font-medium">Aperçu Réseaux Sociaux (Open Graph) :</p>
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-3 flex gap-3 items-center">
            <img
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=120&q=80"
              alt=""
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-white line-clamp-1">{document.title}</p>
              <p className="text-[11px] text-zinc-400 line-clamp-2">
                Consultez ce document interactif en 3D avec zoom tactile et navigation fluide.
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">flipbookstudio.app</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
