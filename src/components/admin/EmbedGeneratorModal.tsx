import React, { useState } from 'react';
import { EmbedSettings } from '../../types/saas';
import { Code2, Copy, Check, ExternalLink, X, Eye, Laptop, Smartphone } from 'lucide-react';

interface EmbedGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  flipbookId: string;
  flipbookTitle: string;
}

export const EmbedGeneratorModal: React.FC<EmbedGeneratorModalProps> = ({
  isOpen,
  onClose,
  flipbookId,
  flipbookTitle,
}) => {
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | 'A4' | 'RESPONSIVE'>('16:9');
  const [theme, setTheme] = useState<'dark' | 'light' | 'transparent'>('dark');
  const [autoplay, setAutoplay] = useState(false);
  const [hideControls, setHideControls] = useState(false);
  const [allowFullscreen, setAllowFullscreen] = useState(true);
  const [startPage, setStartPage] = useState(1);
  const [embedType, setEmbedType] = useState<'iframe' | 'wordpress' | 'webflow'>('iframe');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://flipbookstudio.app';
  const embedUrl = `${currentHost}/?flipbook=${flipbookId}&embed=true&page=${startPage}&theme=${theme}${
    autoplay ? '&autoplay=1' : ''
  }${hideControls ? '&controls=0' : ''}`;

  const getEmbedCode = () => {
    if (embedType === 'wordpress') {
      return `[flipbook id="${flipbookId}" aspect="${aspectRatio}" start="${startPage}" theme="${theme}"]`;
    }

    if (embedType === 'webflow') {
      return `<div style="position: relative; width: 100%; padding-bottom: ${
        aspectRatio === '16:9' ? '56.25%' : aspectRatio === '4:3' ? '75%' : '141.4%'
      }; height: 0; overflow: hidden; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
  <iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allow="clipboard-write; fullscreen" allowfullscreen></iframe>
</div>`;
    }

    // Default HTML Iframe
    return `<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="${aspectRatio === '16:9' ? '520px' : aspectRatio === '4:3' ? '600px' : '750px'}" 
  frameborder="0" 
  allow="clipboard-write; fullscreen" 
  allowfullscreen="${allowFullscreen}"
  style="border: none; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);"
></iframe>`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl p-6 space-y-5 text-zinc-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">Intégration Web & Iframe Embed</h3>
              <p className="text-xs text-zinc-400 truncate max-w-md">{flipbookTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-1">
          {/* Options Column */}
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300">Format & Ratio d'Affichage</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['16:9', '4:3', 'A4', 'RESPONSIVE'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setAspectRatio(r)}
                    className={`py-1.5 rounded-lg border font-mono text-[11px] transition-all ${
                      aspectRatio === r
                        ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Thème du lecteur</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="dark">Sombre (Studio Dark)</option>
                  <option value="light">Clair (Paper Light)</option>
                  <option value="transparent">Transparent</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Page de démarrage</label>
                <input
                  type="number"
                  min={1}
                  value={startPage}
                  onChange={(e) => setStartPage(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <label className="font-semibold text-zinc-300 block">Comportements & Contrôles</label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={allowFullscreen}
                    onChange={(e) => setAllowFullscreen(e.target.checked)}
                    className="rounded bg-zinc-900 border-zinc-700 text-indigo-600"
                  />
                  <span>Autoriser le mode plein écran</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={autoplay}
                    onChange={(e) => setAutoplay(e.target.checked)}
                    className="rounded bg-zinc-900 border-zinc-700 text-indigo-600"
                  />
                  <span>Tourner les pages automatiquement (Diaporama)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={hideControls}
                    onChange={(e) => setHideControls(e.target.checked)}
                    className="rounded bg-zinc-900 border-zinc-700 text-indigo-600"
                  />
                  <span>Masquer la barre d’outils inférieure</span>
                </label>
              </div>
            </div>
          </div>

          {/* Code & Live Preview Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-[11px]">
                <button
                  onClick={() => setEmbedType('iframe')}
                  className={`px-2.5 py-1 rounded font-medium ${
                    embedType === 'iframe' ? 'bg-indigo-600 text-white' : 'text-zinc-400'
                  }`}
                >
                  HTML Iframe
                </button>
                <button
                  onClick={() => setEmbedType('webflow')}
                  className={`px-2.5 py-1 rounded font-medium ${
                    embedType === 'webflow' ? 'bg-indigo-600 text-white' : 'text-zinc-400'
                  }`}
                >
                  Shopify / Webflow
                </button>
                <button
                  onClick={() => setEmbedType('wordpress')}
                  className={`px-2.5 py-1 rounded font-medium ${
                    embedType === 'wordpress' ? 'bg-indigo-600 text-white' : 'text-zinc-400'
                  }`}
                >
                  WordPress
                </button>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>

            <div className="relative">
              <pre className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
                {getEmbedCode()}
              </pre>
            </div>

            {/* Embed preview container */}
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  Aperçu de l'intégration dans votre site
                </span>
                <span className="font-mono text-[10px] text-zinc-500">iframe sandbox</span>
              </div>
              <div className="h-32 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-center p-4">
                <div>
                  <p className="text-xs font-semibold text-white">{flipbookTitle}</p>
                  <p className="text-[10px] text-indigo-400 font-mono mt-0.5">{embedUrl}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
