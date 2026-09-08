import React, { useState } from 'react';
import { FlipbookRecord } from '../../types/saas';
import { tenantService } from '../../services/tenantService';
import {
  Lock,
  Globe,
  Calendar,
  Download,
  Printer,
  Share2,
  Search,
  Power,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface DocumentSettingsModalProps {
  flipbook: FlipbookRecord;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const DocumentSettingsModal: React.FC<DocumentSettingsModalProps> = ({
  flipbook,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [visibility, setVisibility] = useState(flipbook.visibility);
  const [password, setPassword] = useState(flipbook.permissions.passwordHash || '');
  const [allowDownload, setAllowDownload] = useState(flipbook.permissions.allowDownload);
  const [allowPrint, setAllowPrint] = useState(flipbook.permissions.allowPrint);
  const [allowShare, setAllowShare] = useState(flipbook.permissions.allowShare);
  const [allowIndexing, setAllowIndexing] = useState(flipbook.permissions.allowIndexing);
  const [isActive, setIsActive] = useState(flipbook.permissions.isActive);
  const [hasExpiration, setHasExpiration] = useState(!!flipbook.permissions.expiresAt);
  const [expirationDate, setExpirationDate] = useState(() => {
    if (flipbook.permissions.expiresAt) {
      return new Date(flipbook.permissions.expiresAt).toISOString().split('T')[0];
    }
    return '';
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const expiresTimestamp = hasExpiration && expirationDate ? new Date(expirationDate).getTime() : null;

    await tenantService.updateFlipbookPermissions(flipbook.id, {
      allowDownload,
      allowPrint,
      allowShare,
      allowIndexing,
      passwordProtected: visibility === 'PASSWORD_PROTECTED',
      passwordHash: password ? password : '',
      expiresAt: expiresTimestamp,
      isActive,
    });

    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onSaved();
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-amber-400">
              Paramètres d'Accès & Sécurité
            </span>
            <h3 className="text-lg font-bold text-white truncate max-w-sm">{flipbook.title}</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-sm p-1">
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Section 1: Accès / Visibilité */}
          <div className="space-y-2">
            <label className="block text-zinc-300 font-bold uppercase tracking-wider text-[11px]">
              Type d'Accès au Document
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`p-3 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                  visibility === 'PUBLIC'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === 'PUBLIC'}
                    onChange={() => setVisibility('PUBLIC')}
                    className="hidden"
                  />
                  <Globe className="w-4 h-4" />
                  <span>Public</span>
                </div>
                <span className="text-[10px] text-zinc-400">Accessible librement par QR Code et lien direct</span>
              </label>

              <label
                className={`p-3 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                  visibility === 'PASSWORD_PROTECTED'
                    ? 'bg-amber-500/15 border-amber-500/50 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === 'PASSWORD_PROTECTED'}
                    onChange={() => setVisibility('PASSWORD_PROTECTED')}
                    className="hidden"
                  />
                  <Lock className="w-4 h-4" />
                  <span>Mot de passe</span>
                </div>
                <span className="text-[10px] text-zinc-400">Le lecteur doit entrer un code pour afficher les pages</span>
              </label>
            </div>

            {visibility === 'PASSWORD_PROTECTED' && (
              <div className="p-3 bg-zinc-950 border border-amber-500/30 rounded-xl space-y-1 mt-2">
                <label className="block text-amber-300 font-medium text-[11px]">
                  Définir le mot de passe secret :
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: azur2026"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500 font-mono text-sm"
                />
                <p className="text-[10px] text-zinc-500">
                  Transmettez ce mot de passe uniquement aux destinataires autorisés.
                </p>
              </div>
            )}
          </div>

          {/* Section 2: Autorisations Fonctionnelles */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <label className="block text-zinc-300 font-bold uppercase tracking-wider text-[11px]">
              Autorisations des Visiteurs
            </label>
            <div className="space-y-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2 text-zinc-300">
                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Autoriser le téléchargement du document</span>
                </span>
                <input
                  type="checkbox"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-0 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2 text-zinc-300">
                  <Printer className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Autoriser l'impression</span>
                </span>
                <input
                  type="checkbox"
                  checked={allowPrint}
                  onChange={(e) => setAllowPrint(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-0 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2 text-zinc-300">
                  <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Autoriser le bouton de partage</span>
                </span>
                <input
                  type="checkbox"
                  checked={allowShare}
                  onChange={(e) => setAllowShare(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-0 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2 text-zinc-300">
                  <Search className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Autoriser l'indexation par les moteurs (Google SEO)</span>
                </span>
                <input
                  type="checkbox"
                  checked={allowIndexing}
                  onChange={(e) => setAllowIndexing(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-0 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Section 3: Date d'expiration */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-zinc-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>Date d'Expiration Automatique</span>
              </span>
              <input
                type="checkbox"
                checked={hasExpiration}
                onChange={(e) => setHasExpiration(e.target.checked)}
                className="rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-0 w-4 h-4"
              />
            </label>

            {hasExpiration && (
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                <label className="block text-zinc-400 text-[11px] mb-1">
                  Le document deviendra inaccessible après le :
                </label>
                <input
                  type="date"
                  required={hasExpiration}
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>

          {/* Section 4: Statut Actif / Inactif Toggle */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <div>
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Power className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-rose-400'}`} />
                <span>État du Document : {isActive ? 'Actif' : 'Désactivé'}</span>
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {isActive
                  ? 'Le document est accessible en ligne par QR code et lien.'
                  : 'Le document est temporairement suspendu (page 404/verrouillée).'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {isActive ? 'Désactiver' : 'Réactiver'}
            </button>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Enregistré !</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enregistrer les Permissions</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
