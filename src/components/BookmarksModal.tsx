import React, { useState, useEffect, useMemo } from 'react';
import { Bookmark } from '../types';
import { commentService } from '../services/commentService';
import { PageComment } from '../types/saas';
import {
  Bookmark as BookmarkIcon,
  X,
  Trash2,
  Plus,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

interface BookmarksModalProps {
  documentId?: string;
  currentPage: number;
  bookmarks: Bookmark[];
  isOpen: boolean;
  onClose: () => void;
  onAddBookmark: (page: number, note?: string) => void;
  onRemoveBookmark: (id: string) => void;
  onSelectPage: (page: number) => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  documentId = 'doc-hotel-azur',
  currentPage,
  bookmarks,
  isOpen,
  onClose,
  onAddBookmark,
  onRemoveBookmark,
  onSelectPage,
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'comments'>('bookmarks');
  const [note, setNote] = useState('');
  const [commentsSort, setCommentsSort] = useState<'timestamp' | 'page'>('timestamp');
  const [filterUnresolvedOnly, setFilterUnresolvedOnly] = useState(false);
  const [comments, setComments] = useState<PageComment[]>(() => commentService.getComments(documentId));

  useEffect(() => {
    const update = () => {
      setComments(commentService.getComments(documentId));
    };
    update();
    const unsub = commentService.subscribe(update);
    return () => unsub();
  }, [documentId]);

  const isCurrentPageBookmarked = bookmarks.some((b) => b.pageNumber === currentPage);

  const unresolvedCommentsCount = useMemo(() => {
    return comments.filter((c) => !c.resolved).length;
  }, [comments]);

  const processedComments = useMemo(() => {
    let list = [...comments];
    if (filterUnresolvedOnly) {
      list = list.filter((c) => !c.resolved);
    }
    if (commentsSort === 'timestamp') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      list.sort((a, b) => a.pageNumber - b.pageNumber || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [comments, commentsSort, filterUnresolvedOnly]);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBookmark(currentPage, note.trim() || undefined);
    setNote('');
  };

  const formatCommentDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      id="bookmarks-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        id="bookmarks-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 text-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header with Title and Close */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                activeTab === 'bookmarks'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-indigo-500/20 text-indigo-400'
              }`}
            >
              {activeTab === 'bookmarks' ? (
                <BookmarkIcon className="w-4 h-4" />
              ) : (
                <MessageSquare className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-100">
                {activeTab === 'bookmarks' ? 'Signets & Marque-pages' : 'Commentaires Récents du Livre'}
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                {activeTab === 'bookmarks'
                  ? `${bookmarks.length} signet${bookmarks.length > 1 ? 's' : ''} enregistré${bookmarks.length > 1 ? 's' : ''}`
                  : `${comments.length} note${comments.length > 1 ? 's' : ''} au total (${unresolvedCommentsCount} en attente)`}
              </p>
            </div>
          </div>
          <button
            id="close-bookmarks-btn"
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation: Signets vs Commentaires Récents */}
        <div className="grid grid-cols-2 p-1.5 bg-zinc-950/80 border-b border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('bookmarks')}
            className={`py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'bookmarks'
                ? 'bg-zinc-800 text-amber-300 shadow-sm border border-zinc-700/80'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <BookmarkIcon className="w-3.5 h-3.5" />
            <span>Signets</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'bookmarks' ? 'bg-amber-500/20 text-amber-300' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {bookmarks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('comments')}
            className={`py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'comments'
                ? 'bg-zinc-800 text-indigo-300 shadow-sm border border-zinc-700/80'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Commentaires récents</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'comments' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {comments.length}
            </span>
            {unresolvedCommentsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title={`${unresolvedCommentsCount} note(s) en attente`} />
            )}
          </button>
        </div>

        {/* Tab 1: Bookmarks Content */}
        {activeTab === 'bookmarks' && (
          <>
            {/* Add current page form */}
            <div className="p-4 bg-zinc-950/60 border-b border-zinc-800">
              <form onSubmit={handleAdd} className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Marquer la page courante</span>
                  <span className="font-mono text-amber-400 font-semibold">Page {currentPage}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Note facultative (ex: Passage clé)..."
                    className="flex-1 bg-zinc-800/80 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={isCurrentPageBookmarked}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isCurrentPageBookmarked ? 'Déjà marqué' : 'Ajouter'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Bookmarks List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {bookmarks.length > 0 ? (
                bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="p-3 bg-zinc-950/40 border border-zinc-800/80 rounded-xl flex items-center justify-between group hover:border-zinc-700 transition-colors"
                  >
                    <button
                      onClick={() => {
                        onSelectPage(bm.pageNumber);
                        onClose();
                      }}
                      className="flex-1 text-left flex items-start gap-3 min-w-0 cursor-pointer"
                    >
                      <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold flex-shrink-0">
                        P. {bm.pageNumber}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-zinc-200 truncate">{bm.label}</p>
                        {bm.note && <p className="text-[11px] text-zinc-400 truncate mt-0.5">{bm.note}</p>}
                      </div>
                    </button>

                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => {
                          onSelectPage(bm.pageNumber);
                          onClose();
                        }}
                        className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Aller à la page"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemoveBookmark(bm.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Supprimer le signet"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                  Aucun signet sauvegardé. Marquez la page {currentPage} pour la retrouver plus tard.
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab 2: Recent Comments Section */}
        {activeTab === 'comments' && (
          <>
            {/* Sorting & Filter Controls */}
            <div className="p-3 bg-zinc-950/60 border-b border-zinc-800 flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-400 text-[11px] flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  Tri :
                </span>
                <div className="inline-flex rounded-lg bg-zinc-900 border border-zinc-800 p-0.5">
                  <button
                    type="button"
                    onClick={() => setCommentsSort('timestamp')}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      commentsSort === 'timestamp'
                        ? 'bg-zinc-800 text-white shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Plus récents
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommentsSort('page')}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      commentsSort === 'page'
                        ? 'bg-zinc-800 text-white shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Par page
                  </button>
                </div>
              </div>

              {/* Filter: All vs Unresolved */}
              <button
                type="button"
                onClick={() => setFilterUnresolvedOnly((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  filterUnresolvedOnly
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                }`}
              >
                <Filter className="w-3 h-3" />
                <span>Non résolus uniquement</span>
                {unresolvedCommentsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500/30 text-amber-200 font-mono">
                    {unresolvedCommentsCount}
                  </span>
                )}
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {processedComments.length > 0 ? (
                processedComments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-xl border transition-all ${
                      comment.resolved
                        ? 'bg-zinc-950/40 border-zinc-800/60 opacity-80'
                        : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {/* Comment card top metadata */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPage(comment.pageNumber);
                            onClose();
                          }}
                          className="px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-mono text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                          title="Naviguer vers cette page"
                        >
                          <span>Page {comment.pageNumber}</span>
                          <ArrowRight className="w-3 h-3 opacity-70" />
                        </button>
                        <span className="text-xs font-semibold text-zinc-200 truncate">
                          {comment.authorName}
                        </span>
                        {comment.authorRole && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-mono bg-zinc-800 text-zinc-400 shrink-0">
                            {comment.authorRole}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          {formatCommentDate(comment.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Comment text body */}
                    <div className="pl-1 text-xs text-zinc-300 leading-relaxed break-words whitespace-pre-wrap">
                      {comment.content}
                    </div>

                    {/* Replies count indicator if present */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-2 pl-2 border-l-2 border-indigo-500/40 text-[11px] text-zinc-400">
                        <span className="font-semibold text-indigo-300">
                          {comment.replies.length} réponse{comment.replies.length > 1 ? 's' : ''}
                        </span>{' '}
                        — Dernière par {comment.replies[comment.replies.length - 1].authorName}
                      </div>
                    )}

                    {/* Card Actions Footer */}
                    <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                      {/* Status toggle button */}
                      <button
                        type="button"
                        onClick={() => commentService.toggleResolve(comment.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                          comment.resolved
                            ? 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30'
                        }`}
                        title={comment.resolved ? 'Marquer comme non résolu' : 'Marquer comme résolu'}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{comment.resolved ? 'Résolu' : 'En attente'}</span>
                      </button>

                      {/* Right actions: Go to page & Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPage(comment.pageNumber);
                            onClose();
                          }}
                          className="px-2 py-1 rounded text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Naviguer vers cette page"
                        >
                          <span>Voir sur la page</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => commentService.deleteComment(comment.id)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Supprimer la note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-zinc-500 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-zinc-600" />
                  <p className="text-xs font-semibold text-zinc-400">
                    {filterUnresolvedOnly ? 'Aucune note en attente' : 'Aucun commentaire enregistré'}
                  </p>
                  <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                    {filterUnresolvedOnly
                      ? 'Toutes les notes de ce livre ont été résolues !'
                      : 'Ouvrez n’importe quelle page et utilisez l’outil de note pour poser un commentaire ou un retour révision.'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
