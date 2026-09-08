import React, { useState, useMemo } from 'react';
import { FlipBookDocument } from '../../types';
import { searchService } from '../../services/searchService';
import { SearchMatch } from '../../types/saas';
import { Search, X, BookOpen, ChevronRight, FileText } from 'lucide-react';

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

  const matches = useMemo(() => {
    return searchService.search(doc, query);
  }, [doc, query]);

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

      {/* Input */}
      <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/50">
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

        {query.trim().length >= 2 && (
          <p className="text-[11px] text-zinc-400 mt-2 font-mono">
            {matches.length} {matches.length <= 1 ? 'résultat trouvé' : 'résultats trouvés'} dans {doc.totalPages} pages
          </p>
        )}
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-zinc-900">
        {query.trim().length < 2 ? (
          <div className="py-16 text-center text-zinc-500 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-zinc-600" />
            <p className="text-xs">Saisissez au moins 2 caractères pour explorer le texte complet du catalogue.</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 space-y-2">
            <FileText className="w-8 h-8 mx-auto text-zinc-600" />
            <p className="text-xs font-semibold text-zinc-400">Aucune occurrence</p>
            <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
              Vérifiez l’orthographe ou tentez un terme plus générique (ex : "Suite", "Vin", "Menu").
            </p>
          </div>
        ) : (
          matches.map((match, idx) => {
            const isCurrent = match.pageNumber === currentPage;
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
                <span className="shrink-0 px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300 border border-zinc-700">
                  p. {match.pageNumber}
                </span>

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
