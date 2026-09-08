import React from 'react';
import { FlipBookDocument } from '../types';
import { X, BookOpen, ChevronRight } from 'lucide-react';

interface TableOfContentsModalProps {
  document: FlipBookDocument;
  currentPage: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (page: number) => void;
}

export const TableOfContentsModal: React.FC<TableOfContentsModalProps> = ({
  document: doc,
  currentPage,
  isOpen,
  onClose,
  onSelectPage,
}) => {
  if (!isOpen) return null;

  const toc = doc.tableOfContents && doc.tableOfContents.length > 0
    ? doc.tableOfContents
    : doc.pages.map((p) => ({
        id: `page-${p.pageNumber}`,
        title: p.title || `Page ${p.pageNumber}`,
        pageNumber: p.pageNumber,
      }));

  return (
    <div
      id="toc-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        id="toc-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 text-white rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-150"
      >
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-100">Sommaire</h3>
              <p className="text-xs text-zinc-400 font-mono truncate max-w-[220px]">{doc.title}</p>
            </div>
          </div>
          <button
            id="close-toc-btn"
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 divide-y divide-zinc-800/60">
          {toc.map((item) => {
            const isActive = item.pageNumber === currentPage;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectPage(item.pageNumber);
                  onClose();
                }}
                className={`w-full px-3 py-3 rounded-xl text-left flex items-center justify-between transition-colors group cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                    : 'hover:bg-zinc-800/60 text-zinc-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 pr-2 min-w-0">
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded ${
                      isActive ? 'bg-indigo-500/40 text-indigo-200' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    P. {item.pageNumber}
                  </span>
                  <span className="text-sm truncate">{item.title}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
