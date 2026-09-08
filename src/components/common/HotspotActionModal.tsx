import React from 'react';
import { HotspotRecord } from '../../types/saas';
import {
  X,
  ExternalLink,
  Play,
  ShoppingBag,
  Info,
  Phone,
  Mail,
  MessageSquare,
  Check,
} from 'lucide-react';

interface HotspotActionModalProps {
  hotspot: HotspotRecord | null;
  onClose: () => void;
  onNavigateToPage?: (page: number) => void;
}

export const HotspotActionModal: React.FC<HotspotActionModalProps> = ({
  hotspot,
  onClose,
  onNavigateToPage,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!hotspot) return null;

  return (
    <div
      id="hotspot-action-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
    >
      <div
        id="hotspot-action-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 transition-all"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-2.5">
            {hotspot.type === 'VIDEO' && (
              <span className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                <Play className="w-4 h-4 fill-current" />
              </span>
            )}
            {hotspot.type === 'PRODUCT' && (
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <ShoppingBag className="w-4 h-4" />
              </span>
            )}
            {hotspot.type === 'TOOLTIP' && (
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Info className="w-4 h-4" />
              </span>
            )}
            {hotspot.type === 'PHONE' && (
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <Phone className="w-4 h-4" />
              </span>
            )}
            {hotspot.type === 'WHATSAPP' && (
              <span className="p-1.5 rounded-lg bg-green-500/20 text-green-400">
                <MessageSquare className="w-4 h-4" />
              </span>
            )}
            {hotspot.type === 'EMAIL' && (
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Mail className="w-4 h-4" />
              </span>
            )}
            <div>
              <h3 className="text-sm font-semibold text-white">
                {hotspot.label || 'Zone Interactive'}
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Page {hotspot.pageNumber} • {hotspot.type}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body depending on Hotspot Type */}
        <div className="p-6">
          {/* VIDEO HOTSPOT */}
          {hotspot.type === 'VIDEO' && (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-inner">
                {hotspot.targetUrl?.includes('youtube.com') || hotspot.targetUrl?.includes('youtu.be') ? (
                  <iframe
                    src={hotspot.targetUrl.replace('watch?v=', 'embed/')}
                    title={hotspot.label}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={hotspot.targetUrl || 'https://assets.mixkit.co/videos/preview/mixkit-hotel-resort-pool-at-dusk-4217-large.mp4'}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  >
                    Votre navigateur ne supporte pas la lecture de vidéo.
                  </video>
                )}
              </div>
              <p className="text-xs text-zinc-400 text-center">
                Vidéo interactive intégrée au flipbook (Cloudflare Stream / HD Video Player)
              </p>
            </div>
          )}

          {/* PRODUCT HOTSPOT */}
          {hotspot.type === 'PRODUCT' && (
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 border border-zinc-700">
                  <img
                    src={hotspot.targetUrl || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&auto=format&fit=crop&q=80'}
                    alt={hotspot.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 mb-1 border border-emerald-500/30">
                    DISPONIBLE IMMÉDIATEMENT
                  </span>
                  <h4 className="text-base font-bold text-white leading-tight">
                    {hotspot.label}
                  </h4>
                  {hotspot.productPrice && (
                    <p className="text-xl font-extrabold text-emerald-400 mt-1 font-mono">
                      {hotspot.productPrice}
                    </p>
                  )}
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                    {hotspot.tooltipText || 'Article disponible à la commande directement depuis ce catalogue interactif.'}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  onClick={() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Demande enregistrée !
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Commander / Réserver
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TOOLTIP / INFO HOTSPOT */}
          {hotspot.type === 'TOOLTIP' && (
            <div className="space-y-3">
              <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800">
                <h4 className="text-sm font-semibold text-white mb-1.5">
                  {hotspot.label}
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {hotspot.tooltipText || 'Note informative annotée par l’équipe de publication.'}
                </p>
              </div>
            </div>
          )}

          {/* PHONE HOTSPOT */}
          {hotspot.type === 'PHONE' && (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Appel Direct</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Composer le numéro lié à cette page
                </p>
              </div>
              <a
                href={`tel:${hotspot.phoneNumber || '+33142689000'}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                <Phone className="w-4 h-4" />
                Appeler : {hotspot.phoneNumber || '+33 1 42 68 90 00'}
              </a>
            </div>
          )}

          {/* WHATSAPP HOTSPOT */}
          {hotspot.type === 'WHATSAPP' && (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 mx-auto flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Discussion WhatsApp</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Discuter directement avec le conseiller
                </p>
              </div>
              <a
                href={`https://wa.me/${(hotspot.phoneNumber || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(hotspot.whatsappMessage || 'Bonjour, je vous contacte depuis votre flipbook.')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Ouvrir la conversation WhatsApp
              </a>
            </div>
          )}

          {/* EMAIL HOTSPOT */}
          {hotspot.type === 'EMAIL' && (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Contact par Email</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Envoyer un message à l’adresse spécifiée
                </p>
              </div>
              <a
                href={`mailto:${hotspot.emailAddress || 'contact@example.com'}?subject=${encodeURIComponent(hotspot.label || 'Contact Flipbook')}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                <Mail className="w-4 h-4" />
                Envoyer un email à : {hotspot.emailAddress || 'contact@example.com'}
              </a>
            </div>
          )}

          {/* PAGE JUMP HOTSPOT */}
          {hotspot.type === 'URL' && hotspot.targetUrl?.startsWith('page:') && (
            <div className="space-y-4 text-center">
              <div>
                <h4 className="text-sm font-semibold text-white">Aller à la page</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Sauter directement à la section correspondante
                </p>
              </div>
              <button
                onClick={() => {
                  const targetPageNum = parseInt(hotspot.targetUrl?.replace('page:', '') || '1', 10);
                  onNavigateToPage?.(targetPageNum);
                  onClose();
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Accéder à la Page {hotspot.targetUrl?.replace('page:', '')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
