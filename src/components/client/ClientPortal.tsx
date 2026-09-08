import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { tenantService } from '../../services/tenantService';
import { FlipbookRecord } from '../../types/saas';
import { DocumentSettingsModal } from './DocumentSettingsModal';
import { QRCodeModal } from './QRCodeModal';
import {
  BookOpen,
  Share2,
  QrCode,
  Lock,
  Globe,
  Copy,
  Check,
  Calendar,
  Eye,
  ShieldCheck,
  MessageCircle,
  Mail,
  SlidersHorizontal,
  ArrowUpRight,
  Power,
  Info,
} from 'lucide-react';

interface ClientPortalProps {
  onOpenFlipbook: (flipbookId: string) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({ onOpenFlipbook }) => {
  const { activeClient, activeOrg } = useAuth();

  const [selectedSettingsFb, setSelectedSettingsFb] = useState<FlipbookRecord | null>(null);
  const [selectedQRCodeFb, setSelectedQRCodeFb] = useState<FlipbookRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // If no client is active (fallback to first client in org)
  const client = activeClient || tenantService.getClients(activeOrg.id)[0];
  const clientFlipbooks = client
    ? tenantService.getFlipbooksForClient(activeOrg.id, client.id)
    : [];

  const handleCopyLink = (fb: FlipbookRecord) => {
    const url = `${window.location.origin}/f/${fb.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(fb.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleWhatsAppShare = (fb: FlipbookRecord) => {
    const url = `${window.location.origin}/f/${fb.slug}`;
    const text = encodeURIComponent(`Découvrez ce document interactif :\n${fb.title}\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleEmailShare = (fb: FlipbookRecord) => {
    const url = `${window.location.origin}/f/${fb.slug}`;
    const subject = encodeURIComponent(fb.title);
    const body = encodeURIComponent(
      `Bonjour,\n\nJe vous invite à consulter ce document interactif : ${fb.title}\n\nLien de consultation : ${url}\n\nBonne lecture !`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div id="client-portal-container" className="flex-1 w-full overflow-y-auto bg-zinc-950 text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Client Portal Header */}
        <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Espace Client Restreint
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  {activeOrg.name}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {client ? client.companyName || client.name : 'Mon Espace'}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                Gérez la diffusion, le QR Code, les autorisations d'accès et le partage WhatsApp de vos documents interactifs.
              </p>
            </div>

            {/* Strict Role Guard Banner */}
            <div className="bg-zinc-950/70 border border-amber-500/30 rounded-xl p-3 text-xs max-w-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Permissions Client Strictes</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Vous n'avez pas accès aux documents des autres clients. La conception et les pages restent protégées.
              </p>
            </div>
          </div>
        </div>

        {/* Section: Mes Documents */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Mes Documents Interactifs ({clientFlipbooks.length})</span>
            </h2>
          </div>

          {clientFlipbooks.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-3">
              <Info className="w-8 h-8 text-zinc-500 mx-auto" />
              <h3 className="text-base font-semibold text-white">Aucun document assigné</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Votre administrateur n'a pas encore attribué de flipbook à votre compte.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientFlipbooks.map((fb) => {
                const publicUrl = `${window.location.origin}/f/${fb.slug}`;

                return (
                  <div
                    key={fb.id}
                    id={`client-doc-card-${fb.id}`}
                    className="bg-zinc-900 border border-zinc-800/90 rounded-2xl p-5 hover:border-amber-500/30 transition-all flex flex-col justify-between shadow-lg space-y-4"
                  >
                    <div>
                      {/* Status Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                              fb.permissions.isActive
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            <Power className="w-3 h-3" />
                            <span>{fb.permissions.isActive ? 'En ligne' : 'Désactivé'}</span>
                          </span>

                          <span className="text-[11px] text-zinc-400 font-mono">
                            {fb.totalPages} pages
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                          {fb.visibility === 'PASSWORD_PROTECTED' ? (
                            <span className="flex items-center gap-1 text-amber-400 font-semibold">
                              <Lock className="w-3 h-3" /> Protégé
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <Globe className="w-3 h-3" /> Public
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-base font-bold text-white leading-snug">{fb.title}</h3>
                      {fb.description && (
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{fb.description}</p>
                      )}

                      {/* Link Info Box */}
                      <div className="mt-3 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs">
                        <span className="truncate text-zinc-400 font-mono text-[11px] max-w-[240px]">
                          {publicUrl}
                        </span>
                        <button
                          onClick={() => handleCopyLink(fb)}
                          className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium text-[11px]"
                        >
                          {copiedId === fb.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedId === fb.id ? 'Copié' : 'Copier'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Action Bar (Preview, QR, WhatsApp, Access Settings) */}
                    <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onOpenFlipbook(fb.id)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ouvrir le Flipbook</span>
                        </button>

                        <button
                          onClick={() => setSelectedQRCodeFb(fb)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all border border-zinc-700"
                        >
                          <QrCode className="w-3.5 h-3.5 text-amber-400" />
                          <span>QR Code</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleWhatsAppShare(fb)}
                          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-800/50 text-[11px] font-medium transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          onClick={() => handleEmailShare(fb)}
                          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[11px] font-medium transition-all"
                        >
                          <Mail className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Email</span>
                        </button>

                        <button
                          onClick={() => setSelectedSettingsFb(fb)}
                          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[11px] font-medium transition-all"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                          <span>Accès</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {selectedSettingsFb && (
        <DocumentSettingsModal
          flipbook={selectedSettingsFb}
          isOpen={true}
          onClose={() => setSelectedSettingsFb(null)}
          onSaved={() => setRefreshKey((k) => k + 1)}
        />
      )}

      {/* QR Code Modal */}
      {selectedQRCodeFb && (
        <QRCodeModal
          flipbook={selectedQRCodeFb}
          isOpen={true}
          onClose={() => setSelectedQRCodeFb(null)}
        />
      )}
    </div>
  );
};
