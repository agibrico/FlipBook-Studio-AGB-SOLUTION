import React, { useState } from 'react';
import { FlipBookDocument } from '../../types';
import { searchService } from '../../services/searchService';
import { BookmarkRecord, TocItem } from '../../types/saas';
import { Bookmark, List, X, Plus, Trash2, ChevronRight, BookmarkCheck } from 'lucide-react';

interface TocDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  doc: FlipBookDocument;
  currentPage: number;
  onNavigateToPage: (page: number) => void;
}

export const TocDrawer: React.FC<TocDrawerProps> = ({
  isOpen,
  onClose,
  doc,
  currentPage,
  onNavigateToPage,
}) => {
  const [activeTab, setActiveTab] = useState<'toc' | 'bookmarks'>('toc');
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>(() => searchService.getBookmarks(doc.id));
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('');
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);

  const tocItems: TocItem[] = searchService.getTableOfContents(doc);

  if (!isOpen) return null;

  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    const created = searchService.saveBookmark(
      doc.id,
      currentPage,
      newBookmarkTitle.trim() || `Signet Page ${currentPage}`
    );
    setBookmarks(searchService.getBookmarks(doc.id));
    setNewBookmarkTitle('');
    setIsAddingBookmark(false);
  };

  const handleRemoveBookmark = (pageNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();
    searchService.removeBookmark(doc.id, pageNumber);
    setBookmarks(searchService.getBookmarks(doc.id));
  };

  const isCurrentPageBookmarked = bookmarks.some((b) => b.pageNumber === currentPage);

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-80 sm:w-96 bg-zinc-950/95 backdrop-blur-md border-r border-zinc-800 shadow-2xl flex flex-col text-zinc-100 animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeTab === 'toc' ? (
            <List className="w-4 h-4 text-indigo-400" />
          ) : (
            <Bookmark className="w-4 h-4 text-indigo-400" />
          )}
          <h3 className="text-sm font-bold text-white">Sommaire & Signets</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-1.5 m-3 bg-zinc-900 rounded-lg border border-zinc-800 text-xs">
        <button
          onClick={() => setActiveTab('toc')}
          className={`py-1.5 rounded-md font-medium transition-all ${
            activeTab === 'toc'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Sommaire ({tocItems.length})
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`py-1.5 rounded-md font-medium transition-all ${
            activeTab === 'bookmarks'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Signets ({bookmarks.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {activeTab === 'toc' ? (
          tocItems.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 space-y-2">
              <List className="w-8 h-8 mx-auto text-zinc-600" />
              <p className="text-xs">Aucun chapitre explicite défini dans ce document.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {tocItems.map((item) => {
                const isCurrent = item.pageNumber === currentPage;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigateToPage(item.pageNumber);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center justify-between group ${
                      isCurrent
                        ? 'bg-indigo-950/50 text-indigo-300 font-semibold border border-indigo-500/40'
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                    }`}
                    style={{ paddingLeft: `${(item.level - 1) * 16 + 12}px` }}
                  >
                    <span className="text-xs truncate mr-2">{item.title}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                        p. {item.pageNumber}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
                    </div>
                  </button>
                );
              })}
            </div>
          )
        ) : (
          <div className="space-y-3">
            {/* Add Bookmark Action */}
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Page courante : {currentPage}</span>
                {isCurrentPageBookmarked ? (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <BookmarkCheck className="w-3 h-3" /> Épinglée
                  </span>
                ) : (
                  <button
                    onClick={() => setIsAddingBookmark(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[11px] font-medium text-white transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Ajouter un signet</span>
                  </button>
                )}
              </div>

              {isAddingBookmark && (
                <form onSubmit={handleAddBookmark} className="pt-2 space-y-2">
                  <input
                    type="text"
                    autoFocus
                    value={newBookmarkTitle}
                    onChange={(e) => setNewBookmarkTitle(e.target.value)}
                    placeholder={`Libellé (ex : Suite Océan, Carte des Desserts)`}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsAddingBookmark(false)}
                      className="px-2 py-1 rounded text-xs text-zinc-400 hover:text-white"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Bookmark List */}
            {bookmarks.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 space-y-2">
                <Bookmark className="w-8 h-8 mx-auto text-zinc-600" />
                <p className="text-xs">Aucun signet enregistré.</p>
                <p className="text-[11px] text-zinc-500">
                  Marquez vos pages préférées pour les retrouver instantanément lors de vos lectures.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    onClick={() => onNavigateToPage(bm.pageNumber)}
                    className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                      bm.pageNumber === currentPage
                        ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200'
                        : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Bookmark className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-medium truncate">{bm.title}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">Page {bm.pageNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleRemoveBookmark(bm.pageNumber, e)}
                        className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Supprimer ce signet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
