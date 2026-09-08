import React, { useState } from 'react';
import { FlipBookDocument } from '../types';
import { Share2, Copy, Check, QrCode, Download, Printer, X, Sparkles } from 'lucide-react';

interface ExportShareModalProps {
  document: FlipBookDocument;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportShareModal: React.FC<ExportShareModalProps> = ({
  document: doc,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate a standalone, self-contained HTML file of the flipbook
  const handleDownloadStandalone = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${doc.title} - FlipBook Interactif</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; background: #0f172a; color: #fff; font-family: system-ui, -apple-system, sans-serif; }
    .page-box { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
  </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-between p-4 bg-slate-950">
  <header class="w-full max-w-4xl py-4 flex justify-between items-center border-b border-slate-800">
    <h1 class="text-lg font-bold text-white">${doc.title}</h1>
    <span class="text-xs font-mono text-indigo-400 uppercase">${doc.totalPages} Pages</span>
  </header>

  <main class="flex-1 w-full max-w-3xl my-8 flex items-center justify-center">
    <div id="page-display" class="page-box w-full max-w-md aspect-[1/1.414] bg-white rounded-lg overflow-hidden text-slate-900 relative shadow-2xl">
      <!-- Active page injected here -->
    </div>
  </main>

  <footer class="w-full max-w-md py-4 flex justify-between items-center gap-4">
    <button id="prev-btn" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg font-medium transition-colors">Précédent</button>
    <span id="page-counter" class="text-xs font-mono text-slate-400">Page 1 / ${doc.totalPages}</span>
    <button id="next-btn" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg font-medium transition-colors">Suivant</button>
  </footer>

  <script>
    const pages = ${JSON.stringify(doc.pages)};
    let cur = 0;
    const display = document.getElementById('page-display');
    const counter = document.getElementById('page-counter');

    function render() {
      const p = pages[cur];
      counter.innerText = 'Page ' + (cur + 1) + ' / ' + pages.length;
      if (p.type === 'image' && p.imageUrl) {
        display.innerHTML = '<img src="' + p.imageUrl + '" class="w-full h-full object-contain" />';
      } else if (p.htmlContent) {
        display.innerHTML = p.htmlContent;
      } else {
        display.innerHTML = '<div class="p-8"><h2 class="text-xl font-bold mb-4">' + (p.title || '') + '</h2><p class="text-sm leading-relaxed">' + (p.text || '') + '</p></div>';
      }
    }

    document.getElementById('prev-btn').onclick = () => { if (cur > 0) { cur--; render(); } };
    document.getElementById('next-btn').onclick = () => { if (cur < pages.length - 1) { cur++; render(); } };
    render();
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.title.toLowerCase().replace(/\s+/g, '-')}-flipbook.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // QR Code URL via public Google chart api or quick QR svg generator
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=18181b&color=ffffff&margin=1`;

  return (
    <div
      id="export-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="export-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 text-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-6"
      >
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Partager & Exporter</h2>
              <p className="text-xs text-zinc-400">{doc.title}</p>
            </div>
          </div>
          <button
            id="close-export-btn"
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Mobile QR Code Scanner Section */}
          <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-28 h-28 bg-zinc-900 rounded-xl p-2 border border-zinc-700/60 flex items-center justify-center flex-shrink-0">
              <img
                src={qrCodeUrl}
                alt="QR Code Mobile"
                className="w-full h-full rounded"
                onError={(e) => {
                  // fallback icon if offline
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-indigo-400">
                <QrCode className="w-4 h-4" />
                <span>Ouvrir sur votre smartphone</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Scannez ce QR Code avec l’appareil photo de votre mobile pour tester immédiatement l’expérience tactile 3D et le feuilletage au pouce.
              </p>
            </div>
          </div>

          {/* Copy link */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Lien direct de consultation</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 font-mono focus:outline-none"
              />
              <button
                id="copy-link-btn"
                onClick={handleCopyLink}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>
          </div>

          {/* Export Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDownloadStandalone}
              className="p-4 bg-zinc-950/60 border border-zinc-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 rounded-2xl text-left transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">FlipBook Standalone .HTML</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                  Fichier unique autonome prêt à héberger ou envoyer à un client.
                </p>
              </div>
            </button>

            <button
              onClick={handlePrint}
              className="p-4 bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40 rounded-2xl text-left transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center">
                  <Printer className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Imprimer / Exporter PDF</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                  Imprimer ou enregistrer le document sous forme de PDF d’impression.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
