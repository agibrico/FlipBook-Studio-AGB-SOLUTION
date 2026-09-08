import React, { useState } from 'react';
import { VisualAnnotation, AnnotationType, UserRole } from '../../types/saas';
import { annotationService } from '../../services/annotationService';
import { MessageSquare, Highlighter, Check, Trash2, X, Plus } from 'lucide-react';

interface AnnotationLayerProps {
  flipbookId: string;
  pageNumber: number;
  isAnnotationMode: boolean;
  activeTool: AnnotationType;
  currentColor: string;
  currentUser: { name: string; role: UserRole };
}

export const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
  flipbookId,
  pageNumber,
  isAnnotationMode,
  activeTool,
  currentColor,
  currentUser,
}) => {
  const [annotations, setAnnotations] = useState<VisualAnnotation[]>(() =>
    annotationService.getAnnotations(flipbookId, pageNumber)
  );
  const [activeNoteModal, setActiveNoteModal] = useState<{ x: number; y: number } | null>(null);
  const [noteContent, setNoteContent] = useState('');

  const refreshAnnotations = () => {
    setAnnotations(annotationService.getAnnotations(flipbookId, pageNumber));
  };

  const handleLayerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnnotationMode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    if (activeTool === 'STICKY_NOTE') {
      setActiveNoteModal({ x, y });
    } else if (activeTool === 'HIGHLIGHT') {
      annotationService.addAnnotation({
        flipbookId,
        pageNumber,
        type: 'HIGHLIGHT',
        authorName: currentUser.name,
        authorRole: currentUser.role,
        color: currentColor || '#fde047',
        coordinates: { x: Math.max(5, x - 10), y: Math.max(5, y - 4), width: 20, height: 8 },
      });
      refreshAnnotations();
    }
  };

  const handleSaveStickyNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNoteModal || !noteContent.trim()) return;

    annotationService.addAnnotation({
      flipbookId,
      pageNumber,
      type: 'STICKY_NOTE',
      authorName: currentUser.name,
      authorRole: currentUser.role,
      color: currentColor || '#fde047',
      coordinates: { x: activeNoteModal.x, y: activeNoteModal.y },
      content: noteContent.trim(),
    });

    setNoteContent('');
    setActiveNoteModal(null);
    refreshAnnotations();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    annotationService.deleteAnnotation(id);
    refreshAnnotations();
  };

  const handleToggleResolve = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    annotationService.toggleResolve(id);
    refreshAnnotations();
  };

  return (
    <div
      onClick={handleLayerClick}
      className={`absolute inset-0 z-20 ${
        isAnnotationMode ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Existing Annotations on this page */}
      {annotations.map((ann) => {
        if (ann.type === 'HIGHLIGHT') {
          return (
            <div
              key={ann.id}
              className="absolute pointer-events-auto transition-opacity hover:opacity-100 group"
              style={{
                left: `${ann.coordinates.x}%`,
                top: `${ann.coordinates.y}%`,
                width: `${ann.coordinates.width || 15}%`,
                height: `${ann.coordinates.height || 6}%`,
                backgroundColor: ann.color,
                opacity: 0.45,
                borderRadius: '3px',
                border: '1px dashed rgba(0,0,0,0.3)',
              }}
            >
              {isAnnotationMode && (
                <button
                  onClick={(e) => handleDelete(ann.id, e)}
                  className="opacity-0 group-hover:opacity-100 absolute -top-3 -right-3 p-1 bg-zinc-900 text-white rounded-full shadow text-[10px]"
                >
                  ✕
                </button>
              )}
            </div>
          );
        }

        if (ann.type === 'STICKY_NOTE') {
          return (
            <div
              key={ann.id}
              className={`absolute pointer-events-auto transform -translate-x-3 -translate-y-3 transition-all z-30 group ${
                ann.resolved ? 'opacity-50' : 'opacity-100'
              }`}
              style={{ left: `${ann.coordinates.x}%`, top: `${ann.coordinates.y}%` }}
            >
              {/* Sticky Pin Icon */}
              <div
                className="w-7 h-7 rounded-full shadow-lg flex items-center justify-center cursor-pointer border border-black/20 hover:scale-110 transition-transform"
                style={{ backgroundColor: ann.color }}
              >
                <MessageSquare className="w-3.5 h-3.5 text-zinc-900" />
              </div>

              {/* Hover / Active Note Card */}
              <div className="hidden group-hover:block absolute left-8 top-0 w-56 bg-zinc-950 border border-zinc-700 rounded-xl p-3 shadow-2xl text-xs text-white z-40">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-1.5">
                  <span className="font-semibold text-amber-400 truncate">{ann.authorName}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleToggleResolve(ann.id, e)}
                      title={ann.resolved ? 'Marquer comme non résolu' : 'Marquer comme résolu'}
                      className={`p-1 rounded text-[10px] ${
                        ann.resolved ? 'text-emerald-400 bg-emerald-950' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    {isAnnotationMode && (
                      <button
                        onClick={(e) => handleDelete(ann.id, e)}
                        title="Supprimer"
                        className="p-1 rounded text-zinc-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-zinc-200 text-[11px] leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                <div className="mt-2 flex justify-between items-center text-[9px] text-zinc-500 font-mono">
                  <span>{new Date(ann.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  {ann.resolved && <span className="text-emerald-400 font-bold">RÉSOLU</span>}
                </div>
              </div>
            </div>
          );
        }

        return null;
      })}

      {/* Note Creation Modal */}
      {activeNoteModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 pointer-events-auto bg-zinc-950 border border-zinc-700 rounded-xl p-3 shadow-2xl w-60 text-xs"
          style={{
            left: `${Math.min(70, activeNoteModal.x)}%`,
            top: `${Math.min(70, activeNoteModal.y)}%`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              Ajouter une note
            </span>
            <button
              onClick={() => setActiveNoteModal(null)}
              className="text-zinc-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSaveStickyNote} className="space-y-2">
            <textarea
              autoFocus
              rows={3}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Votre commentaire ou suggestion de retouche..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setActiveNoteModal(null)}
                className="px-2 py-1 rounded text-zinc-400 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
              >
                Épingler
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
