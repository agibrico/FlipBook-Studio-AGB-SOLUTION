import React, { useState } from 'react';
import { Bookmark } from '../types';
import { Bookmark as BookmarkIcon, X, Trash2, Plus, ArrowRight } from 'lucide-react';

interface BookmarksModalProps {
  currentPage: number;
  bookmarks: Bookmark[];
  isOpen: boolean;
  onClose: () => void;
  onAddBookmark: (page: number, note?: string) => void;
  onRemoveBookmark: (id: string) => void;
  onSelectPage: (page: number) => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  currentPage,
  bookmarks,
  isOpen,
  onClose,
  onAddBookmark,
  onRemoveBookmark,
  onSelectPage,
}) => {
  const [note, setNote] = useState('');
  const isCurrentPageBookmarked = bookmarks.some((b) => b.pageNumber === currentPage);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBookmark(currentPage, note.trim() || undefined);
    setNote('');
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
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 text-white rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-150"
      >
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <BookmarkIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-100">Signets & Notes</h3>
              <p className="text-xs text-zinc-400 font-mono">{bookmarks.length} enregistrés</p>
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
      </div>
    </div>
  );
};
