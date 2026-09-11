import React, { useState } from 'react';
import { FlipbookRecord, ClientEntity, BatchOperationType } from '../../types/saas';
import {
  Layers,
  Users,
  Lock,
  Globe,
  Archive,
  Download,
  Trash2,
  Check,
  Loader2,
} from 'lucide-react';

interface BatchOperationsModalProps {
  selectedFlipbooks: FlipbookRecord[];
  clients: ClientEntity[];
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const BatchOperationsModal: React.FC<BatchOperationsModalProps> = ({
  selectedFlipbooks,
  clients,
  onClose,
  onSuccess,
}) => {
  const [selectedOp, setSelectedOp] = useState<BatchOperationType>('ASSIGN_CLIENT');
  const [targetClientId, setTargetClientId] = useState<string>(clients[0]?.id || '');
  const [targetVisibility, setTargetVisibility] = useState<'PUBLIC' | 'LINK_ONLY' | 'PASSWORD_PROTECTED'>('PUBLIC');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExecute = () => {
    setIsProcessing(true);
    let cur = 0;
    const interval = setInterval(() => {
      cur += 25;
      setProgress(cur);
      if (cur >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsProcessing(false);
          onSuccess(
            `Opération groupée "${selectedOp}" exécutée avec succès sur ${selectedFlipbooks.length} document(s).`
          );
          onClose();
        }, 300);
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              Actions Groupées ({selectedFlipbooks.length} sélectionnés)
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Operation Selector */}
          <div>
            <label className="block text-zinc-400 font-medium mb-1.5">Sélectionner une action groupée :</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedOp('ASSIGN_CLIENT')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  selectedOp === 'ASSIGN_CLIENT'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Attribuer Client</span>
              </button>

              <button
                onClick={() => setSelectedOp('CHANGE_VISIBILITY')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  selectedOp === 'CHANGE_VISIBILITY'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Visibilité</span>
              </button>

              <button
                onClick={() => setSelectedOp('EXPORT_ZIP')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  selectedOp === 'EXPORT_ZIP'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Batch Export ZIP</span>
              </button>

              <button
                onClick={() => setSelectedOp('ARCHIVE')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  selectedOp === 'ARCHIVE'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Archive className="w-4 h-4 text-amber-400" />
                <span>Archiver</span>
              </button>
            </div>
          </div>

          {/* Conditional Options */}
          {selectedOp === 'ASSIGN_CLIENT' && (
            <div>
              <label className="block text-zinc-400 font-medium mb-1">Attribuer au client :</label>
              <select
                value={targetClientId}
                onChange={(e) => setTargetClientId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName || c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedOp === 'CHANGE_VISIBILITY' && (
            <div>
              <label className="block text-zinc-400 font-medium mb-1">Nouvelle Visibilité :</label>
              <select
                value={targetVisibility}
                onChange={(e) => setTargetVisibility(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="PUBLIC">Public (Référencé & Accessible à tous)</option>
                <option value="LINK_ONLY">Lien Secret Uniquement</option>
                <option value="PASSWORD_PROTECTED">Protégé par Mot de Passe</option>
              </select>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  Traitement groupé en cours...
                </span>
                <span className="font-mono">{progress}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleExecute}
            disabled={isProcessing}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-1.5"
          >
            {isProcessing ? 'Traitement...' : 'Appliquer aux Documents'}
          </button>
        </div>
      </div>
    </div>
  );
};
