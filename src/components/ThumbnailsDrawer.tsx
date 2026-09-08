import React from 'react';
import { FlipBookDocument } from '../types';
import { X } from 'lucide-react';

interface ThumbnailsDrawerProps {
  document: FlipBookDocument;
  currentPage: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (page: number) => void;
}

export const ThumbnailsDrawer: React.FC<ThumbnailsDrawerProps> = ({
  document: doc,
  currentPage,
  isOpen,
  onClose,
  onSelectPage,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="thumbnails-drawer-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end transition-opacity duration-200"
    >
      <div
        id="thumbnails-drawer-content"
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-zinc-900 border-t border-zinc-800 text-white p-4 max-h-[60vh] flex flex-col rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-200"
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="font-semibold text-sm text-zinc-100">Vignettes des pages</h3>
            <p className="text-xs text-zinc-400 font-mono">{doc.totalPages} pages au total</p>
          </div>
          <button
            id="close-thumbnails-btn"
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thumbnails grid */}
        <div className="flex-1 overflow-y-auto py-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {doc.pages.map((p) => {
            const isSelected = p.pageNumber === currentPage;
            return (
              <button
                key={p.pageNumber}
                onClick={() => {
                  onSelectPage(p.pageNumber);
                  onClose();
                }}
                className={`group flex flex-col items-center p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/40'
                    : 'border-zinc-800 hover:border-zinc-600 bg-zinc-950/60'
                }`}
              >
                <div
                  className="w-full aspect-[1/1.414] bg-white rounded overflow-hidden shadow relative flex items-center justify-center text-zinc-800"
                >
                  {p.type === 'image' && p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={`Page ${p.pageNumber}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="p-2 text-[8px] font-serif leading-tight overflow-hidden text-zinc-600 h-full w-full select-none">
                      <div className="font-bold text-[9px] mb-1 truncate text-zinc-900">{p.title || `P. ${p.pageNumber}`}</div>
                      <div className="line-clamp-4">{p.text || 'Document text'}</div>
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-indigo-500 pointer-events-none" />
                  )}
                </div>

                <span
                  className={`mt-1.5 text-xs font-mono font-medium ${
                    isSelected ? 'text-indigo-400' : 'text-zinc-400 group-hover:text-zinc-200'
                  }`}
                >
                  Page {p.pageNumber}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
