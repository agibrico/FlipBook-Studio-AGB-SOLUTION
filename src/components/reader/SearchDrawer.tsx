import React, { useState, useMemo, useEffect } from 'react';
import { FlipBookDocument } from '../../types';
import { searchService } from '../../services/searchService';
import { commentService } from '../../services/commentService';
import { PageComment } from '../../types/saas';
import { Search, X, BookOpen, ChevronRight, FileText, MessageSquare } from 'lucide-react';

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  doc: FlipBookDocument;
  onNavigateToPage: (page: number) => void;
  currentPage: number;
}

export const SearchDrawer: React.FC<SearchDrawerProps> = ({
  isOpen,
  onClose,
  doc,
  onNavigateToPage,
  currentPage,
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

  const rawMatches = useMemo(() => {
    return searchService.search(doc, query);
  }, [doc, query]);

  const matches = useMemo(() => {
    if (!filterCommentsOnly) return rawMatches;
    return rawMatches.filter((m) => commentsByPage.has(m.pageNumber));
  }, [rawMatches, filterCommentsOnly, commentsByPage]);

  // List of commented pages for zero-query browse
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
    <div className="fixed inset-y-0 right-0 z-50 w-80 sm:w-96 bg-zinc-950/95 backdrop-blur-md border-l border-zinc-800 shadow-2xl flex flex-col text-zinc-100 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Recherche Plein Texte</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Input & Filter Bar */}
      <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/50 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un mot, un plat, un tarif..."
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setFilterCommentsOnly((prev) => !prev)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              filterCommentsOnly
                ? 'bg-indigo-600 text-white border border-indigo-400 shadow-sm'
                : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <MessageSquare className="w-3 h-3 text-indigo-300" />
            <span>Pages avec notes</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                filterCommentsOnly ? 'bg-indigo-950 text-indigo-200' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {commentedPagesCount}
            </span>
          </button>

          {query.trim().length >= 2 && (
            <p className="text-[11px] text-zinc-400 font-mono">
              {matches.length} {matches.length <= 1 ? 'résultat' : 'résultats'}
            </p>
          )}
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-zinc-900">
        {query.trim().length < 2 ? (
          filterCommentsOnly ? (
            commentedPageList.length > 0 ? (
              <div className="space-y-2 pt-1">
                <div className="px-1 text-[11px] text-zinc-400 font-medium">
                  Pages avec notes & retours :
                </div>
                {commentedPageList.map(({ pageNumber, comments: pageComms, unresolvedCount }) => (
                  <button
                    key={pageNumber}
                    onClick={() => onNavigateToPage(pageNumber)}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-2.5 ${
                      pageNumber === currentPage
                        ? 'bg-indigo-950/40 border-indigo-500/40'
                        : 'bg-zinc-900/40 hover:bg-zinc-900 border-zinc-800/80'
                    }`}
                  >
                    <span className="shrink-0 px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300 border border-zinc-700">
                      p. {pageNumber}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {pageComms.length} note{pageComms.length > 1 ? 's' : ''}
                        </span>
                        {unresolvedCount > 0 ? (
                          <span className="px-1 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300">
                            {unresolvedCount} en attente
                          </span>
                        ) : (
                          <span className="px-1 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300">
                            Résolu
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                        <span className="text-zinc-400">{pageComms[0].authorName} : </span>
                        {pageComms[0].content}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-zinc-500 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-zinc-600" />
                <p className="text-xs font-semibold text-zinc-400">Aucune note sur ce document</p>
                <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                  Utilisez le bouton Note dans la barre d'outils pour épingler un premier commentaire.
                </p>
              </div>
            )
          ) : (
            <div className="py-16 text-center text-zinc-500 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-zinc-600" />
              <p className="text-xs">Saisissez au moins 2 caractères pour explorer le texte complet du catalogue.</p>
            </div>
          )
        ) : matches.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 space-y-2">
            <FileText className="w-8 h-8 mx-auto text-zinc-600" />
            <p className="text-xs font-semibold text-zinc-400">Aucune occurrence</p>
            <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
              {filterCommentsOnly
                ? 'Aucun mot correspondant sur les pages contenant des notes.'
                : 'Vérifiez l’orthographe ou tentez un terme plus générique (ex : "Suite", "Vin", "Menu").'}
            </p>
          </div>
        ) : (
          matches.map((match, idx) => {
            const isCurrent = match.pageNumber === currentPage;
            const pageComments = commentsByPage.get(match.pageNumber) || [];
            const hasComments = pageComments.length > 0;

            return (
              <button
                key={`${match.pageNumber}-${idx}`}
                onClick={() => {
                  onNavigateToPage(match.pageNumber);
                }}
                className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start gap-3 pt-3 ${
                  isCurrent
                    ? 'bg-indigo-950/40 border border-indigo-500/40'
                    : 'hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300 border border-zinc-700">
                    p. {match.pageNumber}
                  </span>
                  {hasComments && (
                    <span
                      className="px-1.5 py-0.2 rounded-full text-[9px] font-medium bg-indigo-500/20 text-indigo-300 flex items-center gap-0.5"
                      title={`${pageComments.length} note(s)`}
                    >
                      <MessageSquare className="w-2.5 h-2.5" />
                      {pageComments.length}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    <span className="text-zinc-500">{match.snippetBefore}</span>
                    <mark className="bg-amber-400/30 text-amber-200 font-semibold px-0.5 rounded">
                      {match.matchText}
                    </mark>
                    <span className="text-zinc-500">{match.snippetAfter}</span>
                  </p>
                </div>

                <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
              </button>
            );
          })
        )}
      </div>

      {/* Footer shortcut tip */}
      <div className="p-3 border-t border-zinc-800 text-[10px] text-zinc-500 font-mono text-center">
        Cliquez sur un extrait pour tourner directement la page.
      </div>
    </div>
  );
};

