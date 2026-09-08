import React, { useState, useMemo } from 'react';
import { FlipBookDocument } from '../types';
import { Search, X, ChevronRight } from 'lucide-react';

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

  const searchResults = useMemo(() => {
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
        <div className="p-3 border-b border-zinc-800 flex items-center gap-2">
          <Search className="w-5 h-5 text-zinc-400 ml-2" />
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

        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-zinc-800/50">
          {query.trim().length >= 2 ? (
            searchResults.length > 0 ? (
              searchResults.map((res) => (
                <button
                  key={res.pageNumber}
                  onClick={() => {
                    onSelectPage(res.pageNumber);
                    onClose();
                  }}
                  className="w-full p-3 text-left hover:bg-zinc-800/60 rounded-xl transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="space-y-1 pr-3 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                        Page {res.pageNumber}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {res.count} occurrence{res.count > 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed italic">
                      « {res.snippet} »
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors flex-shrink-0" />
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-500 text-sm">
                Aucun résultat pour &ldquo;{query}&rdquo;
              </div>
            )
          ) : (
            <div className="p-6 text-center text-zinc-500 text-xs font-mono">
              Tapez au moins 2 caractères pour chercher dans les {doc.totalPages} pages
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
