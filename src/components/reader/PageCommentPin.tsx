import React, { useState, useRef, useEffect } from 'react';
import { PageComment, CommentCategory } from '../../types/saas';
import { commentService } from '../../services/commentService';
import {
  MessageSquare,
  Check,
  Trash2,
  X,
  Send,
  CornerDownRight,
  Clock,
  User,
  Tag,
} from 'lucide-react';

interface PageCommentPinProps {
  comment: PageComment;
  index: number;
  isSelected?: boolean;
  onSelect?: () => void;
  currentUser?: { name: string; role?: string };
}

export const PageCommentPin: React.FC<PageCommentPinProps> = ({
  comment,
  index,
  isSelected = false,
  onSelect,
  currentUser = { name: 'Client Relecteur', role: 'CLIENT' },
}) => {
  const [isOpen, setIsOpen] = useState(isSelected);
  const [replyText, setReplyText] = useState('');
  const [replyAuthor, setReplyAuthor] = useState(currentUser.name);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected) {
      setIsOpen(true);
    }
  }, [isSelected]);

  const x = comment.coordinates?.x ?? 50;
  const y = comment.coordinates?.y ?? 50;

  // Determine card placement to avoid overflowing edges
  const placeLeft = x > 65;
  const placeTop = y > 70;

  const handleToggleResolve = (e: React.MouseEvent) => {
    e.stopPropagation();
    commentService.toggleResolve(comment.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Voulez-vous supprimer cette note ?')) {
      commentService.deleteComment(comment.id);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    commentService.addReply({
      commentId: comment.id,
      authorName: replyAuthor.trim() || 'Relecteur',
      authorRole: currentUser.role || 'CLIENT',
      content: replyText.trim(),
    });

    setReplyText('');
    setShowReplyForm(false);
  };

  const categoryLabel = commentService.getCategoryLabel(comment.category);
  const pinColor = comment.color || commentService.getColorForCategory(comment.category);

  return (
    <div
      className="absolute pointer-events-auto z-30 transform -translate-x-1/2 -translate-y-1/2 select-none"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {/* Visual Marker Pin */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          onSelect?.();
        }}
        className={`group relative flex items-center justify-center transition-all duration-200 cursor-pointer ${
          isSelected ? 'scale-125 z-40' : 'hover:scale-115'
        }`}
        title={`Note #${index + 1} de ${comment.authorName}: ${comment.content.slice(0, 40)}...`}
      >
        {/* Outer Glow Ring if selected or unresolved */}
        {isSelected && (
          <span
            className="absolute -inset-1 rounded-full animate-ping opacity-75"
            style={{ backgroundColor: pinColor }}
          />
        )}

        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg border-2 border-white transition-transform ${
            comment.resolved ? 'opacity-80 ring-2 ring-emerald-500' : 'ring-2 ring-black/20 shadow-xl'
          }`}
          style={{ backgroundColor: pinColor }}
        >
          {comment.resolved ? (
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          ) : (
            <span>{index + 1}</span>
          )}
        </div>

        {/* Small tooltip indicator on hover when not open */}
        {!isOpen && (
          <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-zinc-950/90 text-white text-[10px] font-sans px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-50 border border-zinc-700">
            {comment.authorName}: {comment.content.slice(0, 24)}...
          </div>
        )}
      </button>

      {/* Expanded Popover Comment Card */}
      {isOpen && (
        <div
          ref={cardRef}
          onClick={(e) => e.stopPropagation()}
          className={`absolute w-72 sm:w-80 bg-zinc-950/95 backdrop-blur-md border border-zinc-700 rounded-2xl p-3.5 shadow-2xl text-xs text-white z-50 animate-in fade-in zoom-in-95 duration-150 ${
            placeLeft ? 'right-4' : 'left-4'
          } ${placeTop ? 'bottom-2' : 'top-2'}`}
        >
          {/* Card Header */}
          <div className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: pinColor }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white truncate text-xs">{comment.authorName}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-zinc-800 text-zinc-300">
                    {comment.authorRole}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(comment.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span>•</span>
                  <span className="text-zinc-300 font-medium">{categoryLabel}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleToggleResolve}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                  comment.resolved
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title={comment.resolved ? 'Marquer comme non résolu' : 'Marquer comme résolu'}
              >
                <Check className="w-3.5 h-3.5" />
                <span className="text-[10px]">{comment.resolved ? 'Résolu' : 'Résoudre'}</span>
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                title="Supprimer la note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Fermer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Comment Body */}
          <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800/80 mb-2.5">
            <p className="text-zinc-100 text-xs leading-relaxed whitespace-pre-wrap select-text">
              {comment.content}
            </p>
          </div>

          {/* Discussion / Thread Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-2 border-t border-zinc-800/60 pt-2 mb-2">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Discussion ({comment.replies.length})
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {comment.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/50 text-[11px]"
                  >
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                      <span className="font-semibold text-indigo-300">{reply.authorName}</span>
                      <span>
                        {new Date(reply.createdAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-zinc-200 leading-snug select-text">{reply.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reply Form Trigger or Input */}
          {!showReplyForm ? (
            <button
              type="button"
              onClick={() => setShowReplyForm(true)}
              className="w-full py-1.5 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white text-[11px] flex items-center justify-center gap-1.5 transition-colors"
            >
              <CornerDownRight className="w-3 h-3 text-indigo-400" />
              <span>Répondre à cette note...</span>
            </button>
          ) : (
            <form onSubmit={handleSendReply} className="space-y-2 border-t border-zinc-800/80 pt-2">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={replyAuthor}
                  onChange={(e) => setReplyAuthor(e.target.value)}
                  placeholder="Votre nom"
                  className="w-1/2 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-zinc-500">répond :</span>
              </div>
              <textarea
                autoFocus
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Écrivez votre réponse..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowReplyForm(false)}
                  className="px-2.5 py-1 rounded-lg text-zinc-400 hover:text-white text-[11px]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>Envoyer</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
