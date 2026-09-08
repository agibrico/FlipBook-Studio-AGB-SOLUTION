import React, { useState } from 'react';
import { annotationService } from '../../services/annotationService';
import { ReviewWorkflowStatus, UserRole, ReviewFeedback } from '../../types/saas';
import { CheckCircle2, AlertCircle, Clock, Send, MessageSquare, ShieldCheck, X } from 'lucide-react';

interface ReviewWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  flipbookId: string;
  flipbookTitle: string;
  currentUser: { name: string; role: UserRole };
  onStatusChanged?: (newStatus: ReviewWorkflowStatus) => void;
}

export const ReviewWorkflowModal: React.FC<ReviewWorkflowModalProps> = ({
  isOpen,
  onClose,
  flipbookId,
  flipbookTitle,
  currentUser,
  onStatusChanged,
}) => {
  const [workflow, setWorkflow] = useState(() => annotationService.getReviewWorkflow(flipbookId));
  const [message, setMessage] = useState('');
  const [targetStatus, setTargetStatus] = useState<ReviewWorkflowStatus>(workflow.status);
  const [toast, setToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    annotationService.submitReviewFeedback(
      flipbookId,
      currentUser.name,
      currentUser.role,
      message.trim(),
      targetStatus
    );

    const updated = annotationService.getReviewWorkflow(flipbookId);
    setWorkflow(updated);
    setMessage('');
    setToast(`Validation enregistrée : ${targetStatus}`);
    if (onStatusChanged) onStatusChanged(targetStatus);
    setTimeout(() => setToast(null), 3000);
  };

  const getStatusInfo = (status: ReviewWorkflowStatus) => {
    switch (status) {
      case 'DRAFT':
        return { label: 'Brouillon en cours', color: 'bg-zinc-700 text-zinc-300' };
      case 'IN_REVIEW':
        return { label: 'En attente de validation client', color: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' };
      case 'CHANGES_REQUESTED':
        return { label: 'Modifications demandées', color: 'bg-rose-500/20 text-rose-300 border border-rose-500/30' };
      case 'APPROVED':
        return { label: 'Bon pour Accord (Validé)', color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' };
      case 'PUBLISHED':
        return { label: 'Publié en Ligne', color: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' };
    }
  };

  const currentInfo = getStatusInfo(workflow.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 space-y-5 text-zinc-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">Validation Client & Sign-Off</h3>
              <p className="text-xs text-zinc-400 truncate max-w-sm">{flipbookTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {toast && (
          <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs">
            {toast}
          </div>
        )}

        {/* Current status pill */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-mono">Statut du Workflow</p>
            <p className="text-sm font-semibold text-white mt-0.5">{currentInfo.label}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentInfo.color}`}>
            {workflow.status}
          </span>
        </div>

        {/* History timeline */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
            Historique des échanges et approbations
          </p>
          <div className="max-h-48 overflow-y-auto space-y-2 p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            {workflow.feedbacks.map((fb) => (
              <div key={fb.id} className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{fb.authorName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                      {fb.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {new Date(fb.createdAt).toLocaleDateString('fr-FR')} {new Date(fb.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">{fb.message}</p>
                <div className="text-[10px] text-indigo-400 font-mono">
                  → Passage au statut : {fb.requestedStatus}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-zinc-800">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">Votre décision / Action :</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetStatus('APPROVED')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                  targetStatus === 'APPROVED'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Bon pour Accord (Valider)</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetStatus('CHANGES_REQUESTED')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                  targetStatus === 'CHANGES_REQUESTED'
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Demander des retouches</span>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">Commentaire justificatif :</label>
            <textarea
              rows={2}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex : Tarifs vérifiés et validés par la direction, publication approuvée."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300"
            >
              Fermer
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Transmettre la décision</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
