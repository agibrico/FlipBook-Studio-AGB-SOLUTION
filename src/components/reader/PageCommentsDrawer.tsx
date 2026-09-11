import React, { useState, useEffect } from 'react';
import { PageComment, CommentCategory } from '../../types/saas';
import { commentService } from '../../services/commentService';
import {
  MessageSquare,
  X,
  Plus,
  Crosshair,
  Check,
  Trash2,
  Send,
  CornerDownRight,
  Filter,
  Download,
  Copy,
  Clock,
  ChevronRight,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface PageCommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  flipbookId: string;
  flipbookTitle: string;
  currentPage: number;
  totalPages: number;
  onNavigateToPage: (page: number) => void;
  onStartPlacingPin: () => void;
  selectedCommentId: string | null;
  onSelectComment: (commentId: string | null) => void;
  currentUser?: { name: string; role?: string };
}

export const PageCommentsDrawer: React.FC<PageCommentsDrawerProps> = ({
  isOpen,
  onClose,
  flipbookId,
  flipbookTitle,
  currentPage,
  totalPages,
  onNavigateToPage,
  onStartPlacingPin,
  selectedCommentId,
  onSelectComment,
  currentUser = { name: 'Client Relecteur', role: 'CLIENT' },
}) => {
  const [scope, setScope] = useState<'current_page' | 'all_pages'>('current_page');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [comments, setComments] = useState<PageComment[]>(() =>
    commentService.getComments(flipbookId)
  );

  // New comment form state
  const [isAddingInDrawer, setIsAddingInDrawer] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState(currentUser.name);
  const [newCategory, setNewCategory] = useState<CommentCategory>('GENERAL');

  // Active reply input inside drawer
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setComments(commentService.getComments(flipbookId));
    };
    update();
    const unsub = commentService.subscribe(update);
    return () => unsub();
  }, [flipbookId]);

  if (!isOpen) return null;

  // Filtered comments
  const filteredComments = comments.filter((c) => {
    if (scope === 'current_page' && c.pageNumber !== currentPage) return false;
    if (statusFilter === 'unresolved' && c.resolved) return false;
    if (statusFilter === 'resolved' && !c.resolved) return false;
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    return true;
  });

  const currentPageCounts = commentService.getCommentCounts(flipbookId, currentPage);
  const totalCounts = commentService.getCommentCounts(flipbookId);

  const handleCreateDrawerComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const created = commentService.addComment({
      flipbookId,
      pageNumber: currentPage,
      authorName: newAuthor.trim() || 'Visiteur',
      authorRole: currentUser.role || 'CLIENT',
      content: newContent.trim(),
      category: newCategory,
      coordinates: { x: 50, y: 50 }, // centered pin by default when added from drawer
    });

    setNewContent('');
    setIsAddingInDrawer(false);
    onSelectComment(created.id);
    showToast('Note ajoutée sur la page actuelle.');
  };

  const handleSendReply = (commentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    commentService.addReply({
      commentId,
      authorName: newAuthor.trim() || 'Relecteur',
      authorRole: currentUser.role || 'CLIENT',
      content: replyContent.trim(),
    });

    setReplyContent('');
    setReplyingToId(null);
    showToast('Réponse envoyée.');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleExportMarkdown = () => {
    const md = commentService.exportCommentsAsMarkdown(flipbookId, flipbookTitle);
    navigator.clipboard.writeText(md).then(() => {
      showToast('Rapport des notes copié dans le presse-papier !');
    });
  };

  const handleToggleResolve = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    commentService.toggleResolve(id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Voulez-vous supprimer cette note ?')) {
      commentService.deleteComment(id);
      showToast('Note supprimée.');
    }
  };

  const handleJumpToComment = (c: PageComment) => {
    if (c.pageNumber !== currentPage) {
      onNavigateToPage(c.pageNumber);
    }
    onSelectComment(c.id);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-84 sm:w-96 bg-zinc-950/95 backdrop-blur-md border-l border-zinc-800 shadow-2xl flex flex-col text-zinc-100 animate-in slide-in-from-right duration-200">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-3 left-4 right-4 z-50 p-2.5 rounded-xl bg-indigo-600/90 text-white text-xs font-medium shadow-xl flex items-center justify-between border border-indigo-400/40">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Notes & Commentaires
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-600 text-white font-mono">
                {scope === 'current_page' ? currentPageCounts.total : totalCounts.total}
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              {scope === 'current_page' ? `Page ${currentPage} sur ${totalPages}` : `Tout le document (${totalPages} pages)`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleExportMarkdown}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Copier le rapport des notes"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Fermer le panneau"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Bar: Target Content Pin vs Quick Note */}
      <div className="p-3 border-b border-zinc-800/80 bg-zinc-900/50 flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            onClose();
            onStartPlacingPin();
          }}
          className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Pointer un élément</span>
        </button>

        <button
          type="button"
          onClick={() => setIsAddingInDrawer(!isAddingInDrawer)}
          className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            isAddingInDrawer
              ? 'bg-zinc-800 border-zinc-600 text-white'
              : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Note rapide</span>
        </button>
      </div>

      {/* Inline Quick Add Form in Drawer */}
      {isAddingInDrawer && (
        <form
          onSubmit={handleCreateDrawerComment}
          className="p-3 bg-zinc-900 border-b border-zinc-800 space-y-2 text-xs animate-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white text-[11px] flex items-center gap-1">
              <Plus className="w-3 h-3 text-indigo-400" />
              Ajouter une note (Page {currentPage})
            </span>
            <button
              type="button"
              onClick={() => setIsAddingInDrawer(false)}
              className="text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <input
            type="text"
            required
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            placeholder="Votre nom"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />

          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {(['GENERAL', 'TYPO', 'DESIGN', 'PRICE', 'QUESTION'] as CommentCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setNewCategory(cat)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 border transition-colors ${
                  newCategory === cat
                    ? 'bg-indigo-600/30 border-indigo-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {commentService.getCategoryLabel(cat)}
              </button>
            ))}
          </div>

          <textarea
            autoFocus
            rows={2}
            required
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Votre note pour cette page..."
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
          />

          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setIsAddingInDrawer(false)}
              className="px-2.5 py-1 rounded text-zinc-400 hover:text-white text-[11px]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>Publier</span>
            </button>
          </div>
        </form>
      )}

      {/* Scope Selector Tabs */}
      <div className="px-3 pt-3 flex border-b border-zinc-800/80 bg-zinc-950">
        <button
          type="button"
          onClick={() => setScope('current_page')}
          className={`flex-1 pb-2 text-xs font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            scope === 'current_page'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>Page actuelle</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-800 text-zinc-300">
            {currentPageCounts.total}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setScope('all_pages')}
          className={`flex-1 pb-2 text-xs font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            scope === 'all_pages'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>Tout le document</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-800 text-zinc-300">
            {totalCounts.total}
          </span>
        </button>
      </div>

      {/* Filter Filters (Status & Category) */}
      <div className="px-3 py-2 border-b border-zinc-800/60 bg-zinc-900/30 flex items-center justify-between gap-1 text-[11px]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-2 py-0.5 rounded-full font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Tous
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('unresolved')}
            className={`px-2 py-0.5 rounded-full font-medium transition-colors ${
              statusFilter === 'unresolved'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            En attente
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('resolved')}
            className={`px-2 py-0.5 rounded-full font-medium transition-colors ${
              statusFilter === 'resolved'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Résolus
          </button>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-0.5 text-[10px] text-zinc-300 focus:outline-none"
        >
          <option value="all">Toutes catégories</option>
          <option value="GENERAL">Général</option>
          <option value="TYPO">Correction texte</option>
          <option value="PRICE">Tarif / Devis</option>
          <option value="DESIGN">Design & Visuel</option>
          <option value="QUESTION">Question</option>
        </select>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredComments.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
            <MessageSquare className="w-8 h-8 stroke-1 text-zinc-600 mb-2" />
            <p className="text-xs font-medium text-zinc-400">Aucune note trouvée</p>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-[220px]">
              {scope === 'current_page'
                ? 'Aucune note sur cette page. Cliquez sur "Pointer un élément" pour cibler un détail du contenu.'
                : 'Le document ne comporte pas encore de commentaires.'}
            </p>
          </div>
        ) : (
          filteredComments.map((comm) => {
            const isSelected = selectedCommentId === comm.id;
            const categoryLabel = commentService.getCategoryLabel(comm.category);
            const pinColor = comm.color || commentService.getColorForCategory(comm.category);

            return (
              <div
                key={comm.id}
                onClick={() => handleJumpToComment(comm)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                    : 'bg-zinc-900/80 hover:bg-zinc-900 border-zinc-800'
                }`}
              >
                {/* Comment Header */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: pinColor }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white text-xs truncate">
                          {comm.authorName}
                        </span>
                        <span className="text-[9px] px-1 rounded bg-zinc-800 text-zinc-300 font-mono">
                          {comm.authorRole}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                        <span className="text-indigo-400 font-medium">Page {comm.pageNumber}</span>
                        <span>•</span>
                        <span>{categoryLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleToggleResolve(comm.id, e)}
                      className={`p-1 rounded-md text-[10px] flex items-center gap-1 transition-colors ${
                        comm.resolved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                      title={comm.resolved ? 'Marquer non résolu' : 'Marquer résolu'}
                    >
                      <Check className="w-3 h-3" />
                      {comm.resolved && <span>Résolu</span>}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(comm.id, e)}
                      className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Comment Content */}
                <p className="text-zinc-200 text-xs leading-relaxed whitespace-pre-wrap select-text mb-2">
                  {comm.content}
                </p>

                {/* Thread Replies */}
                {comm.replies && comm.replies.length > 0 && (
                  <div className="space-y-1.5 pl-2 border-l-2 border-zinc-800 my-2">
                    {comm.replies.map((reply) => (
                      <div key={reply.id} className="text-[11px] text-zinc-300">
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                          <span className="font-semibold text-indigo-300">{reply.authorName}</span>
                          <span>•</span>
                          <span>
                            {new Date(reply.createdAt).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="leading-snug select-text">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Reply Box Trigger or Input */}
                {replyingToId === comm.id ? (
                  <form
                    onSubmit={(e) => handleSendReply(comm.id, e)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 space-y-1.5 border-t border-zinc-800 pt-2"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Votre réponse..."
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setReplyingToId(null)}
                        className="px-2 py-0.5 rounded text-zinc-400 hover:text-white text-[10px]"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-2.5 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[10px] flex items-center gap-1"
                      >
                        <Send className="w-2.5 h-2.5" />
                        <span>Répondre</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-400 border-t border-zinc-800/40">
                    <span>
                      {new Date(comm.createdAt).toLocaleDateString('fr-FR')} •{' '}
                      {new Date(comm.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReplyingToId(comm.id);
                      }}
                      className="hover:text-white flex items-center gap-1"
                    >
                      <CornerDownRight className="w-3 h-3 text-indigo-400" />
                      <span>Répondre</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Export Summary & Actions */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-400">
        <span>
          {comments.filter((c) => !c.resolved).length} note(s) à traiter
        </span>
        <button
          type="button"
          onClick={handleExportMarkdown}
          className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium flex items-center gap-1.5 border border-zinc-800 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>Exporter les notes</span>
        </button>
      </div>
    </div>
  );
};
