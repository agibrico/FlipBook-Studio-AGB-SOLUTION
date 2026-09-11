import React, { useState, useEffect, useMemo } from 'react';
import { FlipBookDocument } from '../types';
import { commentService } from '../services/commentService';
import { PageComment } from '../types/saas';
import { X, MessageSquare } from 'lucide-react';

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
    const map = new Map<number, { count: number; unresolved: number }>();
    comments.forEach((c) => {
      const prev = map.get(c.pageNumber) || { count: 0, unresolved: 0 };
      prev.count += 1;
      if (!c.resolved) prev.unresolved += 1;
      map.set(c.pageNumber, prev);
    });
    return map;
  }, [comments]);

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

                  {/* Comment bubble indicator */}
                  {(() => {
                    const info = commentsByPage.get(p.pageNumber);
                    if (!info || info.count === 0) return null;
                    return (
                      <div
                        className="absolute top-1 right-1 z-10 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-zinc-900/90 text-white border border-indigo-400/50 shadow-md backdrop-blur-xs"
                        title={`${info.count} note(s) sur cette page`}
                      >
                        <MessageSquare className="w-2.5 h-2.5 text-indigo-400" />
                        <span className="text-[9px] font-mono font-bold leading-none">{info.count}</span>
                        {info.unresolved > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-0.5" />
                        )}
                      </div>
                    );
                  })()}
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
