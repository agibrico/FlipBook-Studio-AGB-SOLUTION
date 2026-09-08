import React, { useState, useRef, useEffect } from 'react';
import { FlipBookDocument, BookPage } from '../../types';
import { HotspotRecord, HotspotType, RelativeRegion } from '../../types/saas';
import { FlipPageRenderer } from '../FlipPageRenderer';
import { HotspotActionModal } from '../common/HotspotActionModal';
import { tenantService } from '../../services/tenantService';
import {
  X,
  Plus,
  Trash2,
  Save,
  Check,
  Eye,
  Edit3,
  Link as LinkIcon,
  Play,
  ShoppingBag,
  Info,
  Phone,
  Mail,
  MessageSquare,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
} from 'lucide-react';

interface FlipbookVisualEditorProps {
  document: FlipBookDocument;
  onClose: () => void;
  onSave: (updatedDoc: FlipBookDocument) => void;
}

export const FlipbookVisualEditor: React.FC<FlipbookVisualEditorProps> = ({
  document: initialDoc,
  onClose,
  onSave,
}) => {
  const [doc, setDoc] = useState<FlipBookDocument>(() => JSON.parse(JSON.stringify(initialDoc)));
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);
  const [editorMode, setEditorMode] = useState<'edit' | 'test'>('edit');
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState<boolean>(false);

  // Drawing state on page canvas
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDragBox, setCurrentDragBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Test action modal
  const [testHotspot, setTestHotspot] = useState<HotspotRecord | null>(null);

  const currentPage: BookPage = doc.pages.find((p) => p.pageNumber === currentPageNum) || doc.pages[0];
  const pageHotspots: HotspotRecord[] = currentPage.hotspots || [];
  const selectedHotspot = pageHotspots.find((h) => h.id === selectedHotspotId) || null;

  // Ensure document changes are reflected
  const updatePageHotspots = (pageNumber: number, newHotspots: HotspotRecord[]) => {
    setDoc((prev) => {
      const updatedPages = prev.pages.map((page) => {
        if (page.pageNumber === pageNumber) {
          return { ...page, hotspots: newHotspots };
        }
        return page;
      });
      return { ...prev, pages: updatedPages };
    });
  };

  // Mouse down on canvas to begin drawing hotspot
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (editorMode !== 'edit') return;
    if (!canvasContainerRef.current) return;

    // Ignore clicks directly on existing hotspot elements
    const target = e.target as HTMLElement;
    if (target.closest('.existing-hotspot-item')) return;

    const rect = canvasContainerRef.current.getBoundingClientRect();
    const startX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const startY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    setIsDrawing(true);
    setDrawStart({ x: startX, y: startY });
    setCurrentDragBox({ x: startX, y: startY, width: 0, height: 0 });
    setSelectedHotspotId(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawStart || !canvasContainerRef.current) return;

    const rect = canvasContainerRef.current.getBoundingClientRect();
    const curX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const curY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const x = Math.min(drawStart.x, curX);
    const y = Math.min(drawStart.y, curY);
    const width = Math.abs(curX - drawStart.x);
    const height = Math.abs(curY - drawStart.y);

    setCurrentDragBox({ x, y, width, height });
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing || !currentDragBox || !canvasContainerRef.current) {
      setIsDrawing(false);
      setDrawStart(null);
      setCurrentDragBox(null);
      return;
    }

    const rect = canvasContainerRef.current.getBoundingClientRect();
    // Only register if drawn box is at least 15px in width/height
    if (currentDragBox.width >= 20 && currentDragBox.height >= 20) {
      const relativeRegion: RelativeRegion = {
        x: Math.round((currentDragBox.x / rect.width) * 1000) / 1000,
        y: Math.round((currentDragBox.y / rect.height) * 1000) / 1000,
        width: Math.round((currentDragBox.width / rect.width) * 1000) / 1000,
        height: Math.round((currentDragBox.height / rect.height) * 1000) / 1000,
      };

      const newId = `hs-${Date.now()}`;
      const newHotspot: HotspotRecord = {
        id: newId,
        flipbookId: doc.id,
        pageNumber: currentPageNum,
        type: 'URL',
        label: `Zone #${pageHotspots.length + 1}`,
        region: relativeRegion,
        targetUrl: 'https://',
      };

      const updated = [...pageHotspots, newHotspot];
      updatePageHotspots(currentPageNum, updated);
      setSelectedHotspotId(newId);
    }

    setIsDrawing(false);
    setDrawStart(null);
    setCurrentDragBox(null);
  };

  // Add default hotspot at center of page
  const handleAddDefaultHotspot = () => {
    const newId = `hs-${Date.now()}`;
    const newHotspot: HotspotRecord = {
      id: newId,
      flipbookId: doc.id,
      pageNumber: currentPageNum,
      type: 'VIDEO',
      label: 'Visite Vidéo 360°',
      region: {
        x: 0.3,
        y: 0.35,
        width: 0.4,
        height: 0.25,
      },
      targetUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hotel-resort-pool-at-dusk-4217-large.mp4',
    };
    const updated = [...pageHotspots, newHotspot];
    updatePageHotspots(currentPageNum, updated);
    setSelectedHotspotId(newId);
  };

  // Delete a hotspot
  const handleDeleteHotspot = (id: string) => {
    const updated = pageHotspots.filter((h) => h.id !== id);
    updatePageHotspots(currentPageNum, updated);
    if (selectedHotspotId === id) {
      setSelectedHotspotId(null);
    }
  };

  // Update properties of selected hotspot
  const handleUpdateSelectedHotspot = (patch: Partial<HotspotRecord>) => {
    if (!selectedHotspotId) return;
    const updated = pageHotspots.map((h) => {
      if (h.id === selectedHotspotId) {
        return { ...h, ...patch };
      }
      return h;
    });
    updatePageHotspots(currentPageNum, updated);
  };

  // Save all changes
  const handleSaveAll = () => {
    onSave(doc);
    tenantService.updateFlipbook(doc.id, {
      updatedAt: Date.now(),
    });
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 text-white flex flex-col overflow-hidden select-none">
      {/* 1. TOP HEADER TOOLBAR */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900/90 px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Quitter l'éditeur"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Éditeur de Zones & Médias Interactifs
            </h1>
            <p className="text-[11px] text-zinc-400 font-mono truncate max-w-xs">
              {doc.title} • Page {currentPageNum} / {doc.totalPages}
            </p>
          </div>
        </div>

        {/* Mode Selector (Edit vs Test) */}
        <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => {
              setEditorMode('edit');
              setSelectedHotspotId(null);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              editorMode === 'edit'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Mode Tracé & Édition
          </button>
          <button
            onClick={() => {
              setEditorMode('test');
              setSelectedHotspotId(null);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              editorMode === 'test'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Aperçu & Clics en Direct
          </button>
        </div>

        {/* Zoom & Save actions */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800 text-xs font-mono text-zinc-300">
            <button
              onClick={() => setZoomScale((s) => Math.max(0.6, +(s - 0.15).toFixed(2)))}
              disabled={zoomScale <= 0.6}
              className="p-1 hover:text-white disabled:opacity-30"
              title="Dézoomer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-12 text-center">{Math.round(zoomScale * 100)}%</span>
            <button
              onClick={() => setZoomScale((s) => Math.min(1.5, +(s + 0.15).toFixed(2)))}
              disabled={zoomScale >= 1.5}
              className="p-1 hover:text-white disabled:opacity-30"
              title="Zoomer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleAddDefaultHotspot}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-100 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            Ajouter une zone
          </button>

          <button
            onClick={handleSaveAll}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md shadow-indigo-900/30 transition-all"
          >
            {hasSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                Enregistré !
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE (FILMSTRIP + CANVAS + INSPECTOR) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT FILMSTRIP: All Page Thumbnails */}
        <aside className="w-56 border-r border-zinc-800 bg-zinc-950/90 flex flex-col p-3 overflow-y-auto space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              PAGES ({doc.totalPages})
            </span>
          </div>

          {doc.pages.map((p) => {
            const count = (p.hotspots || []).length;
            const isSelected = p.pageNumber === currentPageNum;

            return (
              <button
                key={p.pageNumber}
                onClick={() => {
                  setCurrentPageNum(p.pageNumber);
                  setSelectedHotspotId(null);
                }}
                className={`p-2 rounded-xl text-left border transition-all flex items-center gap-3 cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/40 shadow-sm'
                    : 'border-zinc-800/80 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900'
                }`}
              >
                {/* Page number badge */}
                <div
                  className={`w-7 h-9 rounded flex items-center justify-center font-mono text-xs font-bold ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {p.pageNumber}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-200 truncate">
                    {p.title || `Page ${p.pageNumber}`}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-500">
                    {count > 0 ? (
                      <span className="text-indigo-400 font-bold">{count} zone(s) active(s)</span>
                    ) : (
                      'Aucune zone'
                    )}
                  </p>
                </div>
              </button>
            );
          })}
        </aside>

        {/* CENTER VIEWPORT: Canvas with drag-and-drop bounding box */}
        <main className="flex-1 relative bg-zinc-950/60 overflow-auto flex items-center justify-center p-8">
          <div
            style={{
              transform: `scale(${zoomScale})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
            }}
            className="relative shadow-2xl rounded-md overflow-hidden bg-white"
          >
            {/* Base Page Visual Container */}
            <div
              ref={canvasContainerRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              style={{
                width: `${560 * (doc.aspectRatio || 0.707)}px`,
                height: '760px',
              }}
              className={`relative select-none ${
                editorMode === 'edit' ? 'cursor-crosshair' : 'cursor-default'
              }`}
            >
              {/* Actual Page renderer */}
              <div className="w-full h-full pointer-events-none">
                <FlipPageRenderer
                  page={currentPage}
                  pageNumber={currentPageNum}
                  totalPages={doc.totalPages}
                  side="single"
                />
              </div>

              {/* RENDER EXISTING HOTSPOTS OVER CANVAS */}
              {pageHotspots.map((hotspot) => {
                const isSelected = hotspot.id === selectedHotspotId;

                return (
                  <div
                    key={hotspot.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (editorMode === 'test') {
                        setTestHotspot(hotspot);
                      } else {
                        setSelectedHotspotId(hotspot.id);
                      }
                    }}
                    style={{
                      left: `${hotspot.region.x * 100}%`,
                      top: `${hotspot.region.y * 100}%`,
                      width: `${Math.max(hotspot.region.width * 100, 3)}%`,
                      height: `${Math.max(hotspot.region.height * 100, 3)}%`,
                    }}
                    className={`existing-hotspot-item absolute cursor-pointer transition-all ${
                      isSelected
                        ? 'border-2 border-indigo-500 bg-indigo-500/30 z-30 ring-2 ring-indigo-400/50'
                        : 'border border-dashed border-indigo-500/80 bg-indigo-500/15 hover:bg-indigo-500/25 z-20'
                    }`}
                  >
                    {/* Hotspot Type Icon Badge */}
                    <div className="absolute -top-3 -left-3 flex items-center justify-center">
                      <span className="inline-flex items-center justify-center rounded-full h-6 w-6 bg-indigo-600 text-white shadow-md border border-white text-[10px]">
                        {hotspot.type === 'VIDEO' ? (
                          <Play className="w-3 h-3 fill-current" />
                        ) : hotspot.type === 'PRODUCT' ? (
                          <ShoppingBag className="w-3 h-3" />
                        ) : hotspot.type === 'PHONE' ? (
                          <Phone className="w-3 h-3" />
                        ) : hotspot.type === 'WHATSAPP' ? (
                          <MessageSquare className="w-3 h-3" />
                        ) : hotspot.type === 'EMAIL' ? (
                          <Mail className="w-3 h-3" />
                        ) : hotspot.type === 'URL' && hotspot.targetUrl?.startsWith('page:') ? (
                          <ArrowRight className="w-3 h-3" />
                        ) : hotspot.type === 'TOOLTIP' ? (
                          <Info className="w-3 h-3" />
                        ) : (
                          <LinkIcon className="w-3 h-3" />
                        )}
                      </span>
                    </div>

                    {/* Hotspot Label Pill */}
                    <div className="absolute top-1 left-4 px-1.5 py-0.5 bg-zinc-900/90 text-white font-mono text-[10px] rounded truncate max-w-[120px] pointer-events-none shadow">
                      {hotspot.label}
                    </div>
                  </div>
                );
              })}

              {/* LIVE DRAGGING SELECTION BOX */}
              {isDrawing && currentDragBox && (
                <div
                  style={{
                    left: `${currentDragBox.x}px`,
                    top: `${currentDragBox.y}px`,
                    width: `${currentDragBox.width}px`,
                    height: `${currentDragBox.height}px`,
                  }}
                  className="absolute border-2 border-dashed border-indigo-500 bg-indigo-500/25 pointer-events-none z-40 rounded"
                >
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-indigo-600 text-white font-mono text-[10px] rounded shadow-lg whitespace-nowrap">
                    Tracé zone relative
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick instructions floating badge */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur border border-zinc-700/80 px-4 py-2 rounded-full text-xs text-zinc-300 font-medium shadow-xl pointer-events-none flex items-center gap-2">
            {editorMode === 'edit' ? (
              <>
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                Cliquez et glissez sur la page pour tracer une nouvelle zone interactive.
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                Mode Aperçu actif : cliquez sur une zone pour tester l'action en conditions réelles.
              </>
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR: HOTSPOT PROPERTY INSPECTOR */}
        <aside className="w-80 border-l border-zinc-800 bg-zinc-900/95 flex flex-col overflow-y-auto">
          {selectedHotspot ? (
            <div className="p-5 space-y-5">
              {/* Header with delete */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="text-sm font-bold text-white">Inspecteur de Zone</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    ID: {selectedHotspot.id.slice(-6)}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteHotspot(selectedHotspot.id)}
                  className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                  title="Supprimer cette zone"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Type Selection */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 mb-2 block">
                  Type d’action interactive
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { type: 'URL', label: 'Lien Web', icon: LinkIcon },
                    { type: 'PAGE', label: 'Saut Page', icon: ArrowRight },
                    { type: 'VIDEO', label: 'Vidéo HD', icon: Play },
                    { type: 'PRODUCT', label: 'Produit E-Com', icon: ShoppingBag },
                    { type: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare },
                    { type: 'PHONE', label: 'Téléphone', icon: Phone },
                    { type: 'EMAIL', label: 'Email', icon: Mail },
                    { type: 'TOOLTIP', label: 'Infobulle', icon: Info },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.type === 'PAGE'
                        ? selectedHotspot.type === 'URL' && selectedHotspot.targetUrl?.startsWith('page:')
                        : selectedHotspot.type === item.type && !selectedHotspot.targetUrl?.startsWith('page:');

                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          if (item.type === 'PAGE') {
                            handleUpdateSelectedHotspot({
                              type: 'URL',
                              targetUrl: 'page:1',
                            });
                          } else {
                            handleUpdateSelectedHotspot({
                              type: item.type as HotspotType,
                              targetUrl:
                                item.type === 'VIDEO'
                                  ? 'https://assets.mixkit.co/videos/preview/mixkit-hotel-resort-pool-at-dusk-4217-large.mp4'
                                  : item.type === 'URL'
                                  ? 'https://'
                                  : undefined,
                            });
                          }
                        }}
                        className={`p-2 rounded-lg text-xs font-medium border text-left flex items-center gap-2 transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                            : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title / Label */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                  Libellé / Titre de la zone
                </label>
                <input
                  type="text"
                  value={selectedHotspot.label}
                  onChange={(e) => handleUpdateSelectedHotspot({ label: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Ex: Visite Virtuelle 360°"
                />
              </div>

              {/* DYNAMIC FIELDS PER TYPE */}
              {/* URL */}
              {selectedHotspot.type === 'URL' && !selectedHotspot.targetUrl?.startsWith('page:') && (
                <div>
                  <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                    URL de destination
                  </label>
                  <input
                    type="url"
                    value={selectedHotspot.targetUrl || ''}
                    onChange={(e) => handleUpdateSelectedHotspot({ targetUrl: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="https://votre-site.fr"
                  />
                </div>
              )}

              {/* PAGE JUMP */}
              {selectedHotspot.targetUrl?.startsWith('page:') && (
                <div>
                  <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                    Page de destination
                  </label>
                  <select
                    value={selectedHotspot.targetUrl.replace('page:', '')}
                    onChange={(e) => handleUpdateSelectedHotspot({ targetUrl: `page:${e.target.value}` })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {doc.pages.map((p) => (
                      <option key={p.pageNumber} value={p.pageNumber}>
                        Page {p.pageNumber} — {p.title || `Page ${p.pageNumber}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* VIDEO */}
              {selectedHotspot.type === 'VIDEO' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                      Source Vidéo (Cloudflare, YouTube, MP4)
                    </label>
                    <input
                      type="text"
                      value={selectedHotspot.targetUrl || ''}
                      onChange={(e) => handleUpdateSelectedHotspot({ targetUrl: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      placeholder="https://...mp4 ou YouTube"
                    />
                  </div>
                </div>
              )}

              {/* PRODUCT */}
              {selectedHotspot.type === 'PRODUCT' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                      Prix du Produit
                    </label>
                    <input
                      type="text"
                      value={selectedHotspot.productPrice || ''}
                      onChange={(e) => handleUpdateSelectedHotspot({ productPrice: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      placeholder="Ex: 145 €"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                      Image URL du Produit
                    </label>
                    <input
                      type="text"
                      value={selectedHotspot.targetUrl || ''}
                      onChange={(e) => handleUpdateSelectedHotspot({ targetUrl: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                      Description du Produit
                    </label>
                    <textarea
                      rows={2}
                      value={selectedHotspot.tooltipText || ''}
                      onChange={(e) => handleUpdateSelectedHotspot({ tooltipText: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      placeholder="Description détaillée de l'article"
                    />
                  </div>
                </div>
              )}

              {/* WHATSAPP & PHONE */}
              {(selectedHotspot.type === 'WHATSAPP' || selectedHotspot.type === 'PHONE') && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      value={selectedHotspot.phoneNumber || ''}
                      onChange={(e) => handleUpdateSelectedHotspot({ phoneNumber: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                  {selectedHotspot.type === 'WHATSAPP' && (
                    <div>
                      <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                        Message WhatsApp pré-rempli
                      </label>
                      <input
                        type="text"
                        value={selectedHotspot.whatsappMessage || ''}
                        onChange={(e) => handleUpdateSelectedHotspot({ whatsappMessage: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        placeholder="Bonjour, je vous contacte depuis le catalogue..."
                      />
                    </div>
                  )}
                </div>
              )}

              {/* EMAIL */}
              {selectedHotspot.type === 'EMAIL' && (
                <div>
                  <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    value={selectedHotspot.emailAddress || ''}
                    onChange={(e) => handleUpdateSelectedHotspot({ emailAddress: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="contact@hotel.com"
                  />
                </div>
              )}

              {/* TOOLTIP */}
              {selectedHotspot.type === 'TOOLTIP' && (
                <div>
                  <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                    Texte de l’infobulle
                  </label>
                  <textarea
                    rows={3}
                    value={selectedHotspot.tooltipText || ''}
                    onChange={(e) => handleUpdateSelectedHotspot({ tooltipText: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Note informative..."
                  />
                </div>
              )}

              {/* Relative Coordinates Inspector */}
              <div className="pt-2 border-t border-zinc-800">
                <p className="text-[11px] text-zinc-400 font-mono mb-2">
                  Coordonnées relatives (0.0 - 1.0) :
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400 bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                  <span>X : {Math.round(selectedHotspot.region.x * 100)}%</span>
                  <span>Y : {Math.round(selectedHotspot.region.y * 100)}%</span>
                  <span>W : {Math.round(selectedHotspot.region.width * 100)}%</span>
                  <span>H : {Math.round(selectedHotspot.region.height * 100)}%</span>
                </div>
              </div>
            </div>
          ) : (
            /* Empty state when no hotspot is selected */
            <div className="p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Zones sur cette page</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tracez un rectangle avec la souris sur la page ou sélectionnez une zone ci-dessous pour modifier ses actions.
              </p>

              {pageHotspots.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-zinc-800 text-center text-zinc-500 text-xs">
                  Aucune zone configurée sur la page {currentPageNum}.
                </div>
              ) : (
                <div className="space-y-2">
                  {pageHotspots.map((h, idx) => (
                    <div
                      key={h.id}
                      onClick={() => setSelectedHotspotId(h.id)}
                      className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-indigo-500/60 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-indigo-950 text-indigo-400 flex items-center justify-center text-[10px] font-mono font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-zinc-200 truncate max-w-[150px]">
                            {h.label}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-mono">{h.type}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHotspot(h.id);
                        }}
                        className="text-zinc-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Test Hotspot Action Modal */}
      {testHotspot && (
        <HotspotActionModal
          hotspot={testHotspot}
          onClose={() => setTestHotspot(null)}
          onNavigateToPage={(targetPage) => {
            setCurrentPageNum(targetPage);
            setTestHotspot(null);
          }}
        />
      )}
    </div>
  );
};
