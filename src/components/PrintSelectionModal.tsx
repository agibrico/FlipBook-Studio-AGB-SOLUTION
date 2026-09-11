import React, { useState } from 'react';
import { Printer, Download, Check, Sparkles, X, FileText, Crop } from 'lucide-react';
import { FlipBookDocument } from '../types';
import { SelectivePrintOptions } from '../types/saas';

interface PrintSelectionModalProps {
  document: FlipBookDocument;
  currentPage: number;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintSelectionModal: React.FC<PrintSelectionModalProps> = ({
  document,
  currentPage,
  isOpen,
  onClose,
}) => {
  const [options, setOptions] = useState<SelectivePrintOptions>({
    mode: 'ALL',
    customPages: [1, currentPage],
    qualityDpi: 300,
    format: 'A4',
    includeAnnotations: true,
    includeWatermark: false,
  });

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const togglePageSelection = (pageNum: number) => {
    setOptions((prev) => {
      const exists = prev.customPages.includes(pageNum);
      const newPages = exists
        ? prev.customPages.filter((p) => p !== pageNum)
        : [...prev.customPages, pageNum].sort((a, b) => a - b);
      return { ...prev, customPages: newPages, mode: 'CUSTOM_RANGE' };
    });
  };

  const handlePrint = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setDownloadSuccess(true);
      window.print();
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 900);
  };

  const handleDownloadPdf = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setDownloadSuccess(true);
      // Déclenche le téléchargement simulé d'un PDF haute fidélité
      const blob = new Blob(
        [
          `%PDF-1.7\n% FLIPBOOK STUDIO HD VECTOR PRINT EXPORT\nTitle: ${document.title}\nPages: ${
            options.mode === 'ALL' ? 'Toutes' : options.customPages.join(', ')
          }\nDPI: ${options.qualityDpi}\nFormat: ${options.format}`,
        ],
        { type: 'application/pdf' }
      );
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document.title.toLowerCase().replace(/\s+/g, '-')}-selection.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Impression & Export PDF Haute Résolution</h3>
              <p className="text-xs text-zinc-400">Phase 31 • Sélection de pages, vectoriel 300 DPI & format brochure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Mode de sélection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5">
              Étendue de l'export
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ALL', label: 'Toutes les pages', sub: `${document.totalPages} pages` },
                { id: 'CURRENT', label: 'Page actuelle', sub: `Page ${currentPage}` },
                { id: 'CUSTOM_RANGE', label: 'Sélection personnalisée', sub: `${options.customPages.length} sélectionnée(s)` },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() =>
                    setOptions({
                      ...options,
                      mode: m.id as any,
                      customPages: m.id === 'CURRENT' ? [currentPage] : options.customPages,
                    })
                  }
                  className={`p-3 rounded-xl border text-left transition ${
                    options.mode === m.id
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : 'border-zinc-800 bg-zinc-800/40 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-medium text-xs sm:text-sm">{m.label}</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">{m.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Grille de sélection des pages si personnalisé */}
          {options.mode === 'CUSTOM_RANGE' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Choisir les pages à inclure :
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-3 bg-zinc-950/50 rounded-xl border border-zinc-800 max-h-36 overflow-y-auto">
                {document.pages.map((p) => {
                  const selected = options.customPages.includes(p.pageNumber);
                  return (
                    <button
                      key={p.pageNumber}
                      onClick={() => togglePageSelection(p.pageNumber)}
                      className={`h-10 rounded-lg flex items-center justify-center font-semibold text-xs transition border ${
                        selected
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:border-zinc-500'
                      }`}
                    >
                      {p.pageNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Paramètres d'impression */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Format de sortie
              </label>
              <select
                value={options.format}
                onChange={(e) => setOptions({ ...options, format: e.target.value as any })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="A4">Standard A4 (Portrait / Paysage)</option>
                <option value="LETTER">Format US Letter</option>
                <option value="BOOKLET_2UP">Livret Plié 2-Up (Impression Recto-Verso)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Résolution & Précision
              </label>
              <select
                value={options.qualityDpi}
                onChange={(e) => setOptions({ ...options, qualityDpi: Number(e.target.value) as any })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value={150}>Standard 150 DPI (Écran & Partage Web)</option>
                <option value={300}>Haute Définition 300 DPI (Offset & Tirage Pro)</option>
                <option value={600}>Ultra HD 600 DPI (Galerie & Art Book)</option>
              </select>
            </div>
          </div>

          {/* Options secondaires */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <label className="flex items-center gap-3 cursor-pointer text-zinc-300 hover:text-white">
              <input
                type="checkbox"
                checked={options.includeAnnotations}
                onChange={(e) => setOptions({ ...options, includeAnnotations: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-0"
              />
              <span>Imprimer avec les annotations visuelles & post-it validés</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer text-zinc-300 hover:text-white">
              <input
                type="checkbox"
                checked={options.includeWatermark}
                onChange={(e) => setOptions({ ...options, includeWatermark: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-0"
              />
              <span>Apposer le filigrane de sécurité "CONFIDENTIEL"</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/60">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Rendu vectoriel fidèle sans perte de qualité
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-200 text-sm font-medium transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimer
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-indigo-600/25"
            >
              {isGenerating ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : downloadSuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isGenerating ? 'Génération...' : downloadSuccess ? 'Exporté !' : 'Télécharger PDF HD'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
