import React, { useState, useEffect } from 'react';
import { PageComment, CommentCategory, UserRole } from '../../types/saas';
import { commentService } from '../../services/commentService';
import { PageCommentPin } from './PageCommentPin';
import { MessageSquare, X, Send, Tag, AlertCircle } from 'lucide-react';

interface PageCommentLayerProps {
  flipbookId: string;
  pageNumber: number;
  isPlacingPin: boolean;
  onPinPlaced?: () => void;
  selectedCommentId?: string | null;
  onSelectComment?: (commentId: string) => void;
  currentUser?: { name: string; role?: string };
}

export const PageCommentLayer: React.FC<PageCommentLayerProps> = ({
  flipbookId,
  pageNumber,
  isPlacingPin,
  onPinPlaced,
  selectedCommentId,
  onSelectComment,
  currentUser = { name: 'Client Relecteur', role: 'CLIENT' },
}) => {
  const [comments, setComments] = useState<PageComment[]>(() =>
    commentService.getComments(flipbookId, pageNumber)
  );
  const [newPinModal, setNewPinModal] = useState<{ x: number; y: number } | null>(null);
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState(currentUser.name);
  const [category, setCategory] = useState<CommentCategory>('GENERAL');

  // Subscribe to updates from commentService
  useEffect(() => {
    const update = () => {
      setComments(commentService.getComments(flipbookId, pageNumber));
    };
    update();
    const unsub = commentService.subscribe(update);
    return () => unsub();
  }, [flipbookId, pageNumber]);

  const handleLayerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacingPin) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    // Keep within reasonable boundaries
    const boundedX = Math.min(95, Math.max(5, x));
    const boundedY = Math.min(95, Math.max(5, y));

    setNewPinModal({ x: boundedX, y: boundedY });
  };

  const handleCreateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinModal || !content.trim()) return;

    const created = commentService.addComment({
      flipbookId,
      pageNumber,
      authorName: authorName.trim() || 'Visiteur',
      authorRole: currentUser.role || 'CLIENT',
      content: content.trim(),
      category,
      coordinates: { x: newPinModal.x, y: newPinModal.y },
    });

    setContent('');
    setNewPinModal(null);
    onPinPlaced?.();
    onSelectComment?.(created.id);
  };

  return (
    <div
      onClick={handleLayerClick}
      className={`absolute inset-0 z-20 ${
        isPlacingPin
          ? 'cursor-crosshair pointer-events-auto bg-indigo-500/5 ring-2 ring-indigo-500/40 ring-inset'
          : 'pointer-events-none'
      }`}
    >
      {/* Visual guidance banner when in pin placement mode */}
      {isPlacingPin && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-indigo-950/90 backdrop-blur-md border border-indigo-500/40 text-indigo-200 px-3 py-1 rounded-full text-[11px] font-medium shadow-xl flex items-center gap-1.5 pointer-events-none animate-bounce">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
          <span>Cliquez sur l’élément de la page à commenter</span>
        </div>
      )}

      {/* Render all pinned comments on this page */}
      {comments.map((comm, idx) => (
        <PageCommentPin
          key={comm.id}
          comment={comm}
          index={idx}
          isSelected={selectedCommentId === comm.id}
          onSelect={() => onSelectComment?.(comm.id)}
          currentUser={currentUser}
        />
      ))}

      {/* Modal for creating a new contextual note at (x%, y%) */}
      {newPinModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 pointer-events-auto bg-zinc-950 border border-indigo-500/50 rounded-2xl p-4 shadow-2xl w-72 sm:w-80 text-xs text-white animate-in zoom-in-95 duration-150"
          style={{
            left: `${Math.min(70, Math.max(15, newPinModal.x))}%`,
            top: `${Math.min(70, Math.max(15, newPinModal.y))}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Nouvelle note sur le contenu (Page {pageNumber})
            </span>
            <button
              type="button"
              onClick={() => setNewPinModal(null)}
              className="p-1 rounded text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleCreateComment} className="space-y-3">
            {/* Author Name */}
            <div>
              <label className="block text-[10px] text-zinc-400 mb-1 font-medium">Votre nom ou entité</label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Ex: Sophie Martin (Client)"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-[10px] text-zinc-400 mb-1 font-medium">Catégorie</label>
              <div className="grid grid-cols-3 gap-1">
                {(['GENERAL', 'TYPO', 'DESIGN', 'PRICE', 'QUESTION', 'APPROVAL'] as CommentCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-1.5 py-1 rounded text-[10px] font-medium border text-center transition-colors truncate ${
                      category === cat
                        ? 'bg-indigo-600/30 border-indigo-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {commentService.getCategoryLabel(cat)}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-[10px] text-zinc-400 mb-1 font-medium">Contenu de la note</label>
              <textarea
                autoFocus
                required
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Indiquez ici votre remarque, correction, question ou suggestion..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setNewPinModal(null)}
                className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white text-xs"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!content.trim()}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Épingler la note</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
