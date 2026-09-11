import React, { useState, useMemo, useEffect } from 'react';
import { FlipBookDocument } from '../types';
import { Search, X, ChevronRight, MessageSquare, Filter, Tag } from 'lucide-react';
import { commentService } from '../services/commentService';
import { PageComment } from '../types/saas';

interface SearchModalProps {
  document: FlipBookDocument;
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (page: number) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  document: doc,
  isOpen,
  onClose,
  onSelectPage,
}) => {
  const [query, setQuery] = useState('');
  const [filterCommentsOnly, setFilterCommentsOnly] = useState(false);
  const [comments, setComments] = useState<PageComment[]>(() => commentService.getComments(doc.id));

  useEffect(() => {
    const update = () => {
      setComments(commentService.getComments(doc.id));
    };
    update();
    const unsub = commentService.subscribe(update);
    return () => unsub();
  }, [doc.id]);

  // Group comments by page number
  const commentsByPage = useMemo(() => {
    const map = new Map<number, PageComment[]>();
    comments.forEach((c) => {
      const list = map.get(c.pageNumber) || [];
      list.push(c);
      map.set(c.pageNumber, list);
    });
    return map;
  }, [comments]);

  const commentedPagesCount = commentsByPage.size;

  const rawSearchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const results: { pageNumber: number; snippet: string; count: number }[] = [];

    doc.pages.forEach((page) => {
      const text = (page.text || '').toLowerCase();
      if (text.includes(q)) {
        const index = text.indexOf(q);
        const start = Math.max(0, index - 40);
        const end = Math.min(text.length, index + q.length + 50);
        const snippet = (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');

        // Count occurrences
        const count = text.split(q).length - 1;
        results.push({
          pageNumber: page.pageNumber,
          snippet,
          count,
        });
      }
    });

    return results;
  }, [doc.pages, query]);

  // Apply comment filtering if active
  const searchResults = useMemo(() => {
    if (!filterCommentsOnly) return rawSearchResults;
    return rawSearchResults.filter((res) => commentsByPage.has(res.pageNumber));
  }, [rawSearchResults, filterCommentsOnly, commentsByPage]);

  // List of commented pages for zero-query or quick browse mode
  const commentedPageList = useMemo(() => {
    return Array.from(commentsByPage.entries())
      .sort(([a], [b]) => a - b)
      .map(([pageNumber, pageComments]) => ({
        pageNumber,
        comments: pageComments,
        unresolvedCount: pageComments.filter((c) => !c.resolved).length,
      }));
  }, [commentsByPage]);

  if (!isOpen) return null;

  return (
    <div
      id="search-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 p-4"
    >
      <div
        id="search-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 text-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search input bar */}
        <div className="p-3 border-b border-zinc-800 flex items-center gap-2">
          <Search className="w-5 h-5 text-zinc-400 ml-2 shrink-0" />
          <input
            id="doc-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans le document..."
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-zinc-500 py-1.5 px-2"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-zinc-400 hover:text-white rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            id="close-search-btn"
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar with Comment Toggle */}
        <div className="px-4 py-2 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="search-toggle-comments-only"
              onClick={() => setFilterCommentsOnly((prev) => !prev)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                filterCommentsOnly
                  ? 'bg-indigo-600 text-white border border-indigo-400 shadow-md ring-1 ring-indigo-400/40'
                  : 'bg-zinc-800/90 text-zinc-400 hover:text-white border border-zinc-700 hover:bg-zinc-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-300" />
              <span>Pages avec notes</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  filterCommentsOnly ? 'bg-indigo-950 text-indigo-200' : 'bg-zinc-900 text-zinc-400'
                }`}
              >
                {commentedPagesCount}
              </span>
            </button>
          </div>

          <span className="text-[11px] text-zinc-500 font-mono">
            {filterCommentsOnly
              ? `${commentedPagesCount} page(s) annotée(s)`
              : `${doc.totalPages} pages`}
          </span>
        </div>

        {/* Search / Filter Results Content */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-zinc-800/50">
          {query.trim().length >= 2 ? (
            searchResults.length > 0 ? (
              searchResults.map((res) => {
                const pageComments = commentsByPage.get(res.pageNumber) || [];
                const hasComments = pageComments.length > 0;
                const hasUnresolved = pageComments.some((c) => !c.resolved);

                return (
                  <button
                    key={res.pageNumber}
                    onClick={() => {
                      onSelectPage(res.pageNumber);
                      onClose();
                    }}
                    className="w-full p-3 text-left hover:bg-zinc-800/60 rounded-xl transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="space-y-1.5 pr-3 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-semibold">
                          Page {res.pageNumber}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {res.count} occurrence{res.count > 1 ? 's' : ''}
                        </span>

                        {/* Page comment bubble indicator */}
                        {hasComments && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            title={`${pageComments.length} note(s) sur cette page`}
                          >
                            <MessageSquare className="w-3 h-3 text-indigo-400" />
                            <span>{pageComments.length} note{pageComments.length > 1 ? 's' : ''}</span>
                            {hasUnresolved && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            )}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed italic">
                        « {res.snippet} »
                      </p>

                      {/* Display top comment preview if filtered by comments */}
                      {hasComments && filterCommentsOnly && (
                        <div className="bg-zinc-950/60 border border-zinc-800 rounded-lg p-2 mt-1 text-[11px] text-zinc-400">
                          <span className="font-semibold text-indigo-300">{pageComments[0].authorName} : </span>
                          <span className="text-zinc-300 italic">"{pageComments[0].content}"</span>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors flex-shrink-0" />
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-zinc-500 text-sm space-y-2">
                <p>
                  {filterCommentsOnly
                    ? `Aucune occurrence pour « ${query} » sur les pages contenant des commentaires.`
                    : `Aucun résultat pour « ${query} »`}
                </p>
                {filterCommentsOnly && (
                  <button
                    onClick={() => setFilterCommentsOnly(false)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Chercher dans tout le document
                  </button>
                )}
              </div>
            )
          ) : filterCommentsOnly ? (
            /* When comment filter is toggled ON without a text query, show all pages with feedback */
            commentedPageList.length > 0 ? (
              <div className="space-y-2 p-1">
                <div className="px-2 py-1 text-[11px] text-zinc-400 font-medium">
                  Pages contenant des retours clients & notes :
                </div>
                {commentedPageList.map(({ pageNumber, comments: pageComms, unresolvedCount }) => (
                  <button
                    key={pageNumber}
                    onClick={() => {
                      onSelectPage(pageNumber);
                      onClose();
                    }}
                    className="w-full p-3 text-left bg-zinc-950/50 hover:bg-zinc-800/80 border border-zinc-800 rounded-xl transition-all flex items-start justify-between group cursor-pointer"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-semibold">
                          Page {pageNumber}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-indigo-400 font-medium">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {pageComms.length} note{pageComms.length > 1 ? 's' : ''}
                        </span>
                        {unresolvedCount > 0 ? (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {unresolvedCount} en attente
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Résolues
                          </span>
                        )}
                      </div>

                      {/* Display snippet of latest comment on this page */}
                      <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                        <span className="font-semibold text-zinc-100">{pageComms[0].authorName} : </span>
                        {pageComms[0].content}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                Aucune page ne contient de commentaire pour le moment.
              </div>
            )
          ) : (
            <div className="p-6 text-center text-zinc-500 text-xs font-mono">
              Tapez au moins 2 caractères pour chercher dans les {doc.totalPages} pages, ou activez le filtre "Pages avec notes".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

