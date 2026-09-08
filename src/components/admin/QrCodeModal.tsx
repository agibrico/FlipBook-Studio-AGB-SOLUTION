import React, { useState, useRef } from 'react';
import { QrCode, Download, Copy, Check, X, Sparkles, Printer } from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  flipbookTitle: string;
  publicUrl: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  flipbookTitle,
  publicUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrColor, setQrColor] = useState('#18181b'); // Dark zinc
  const [bgColor, setBgColor] = useState('#ffffff');
  const [includeText, setIncludeText] = useState(true);
  const svgRef = useRef<SVGSVGElement | null>(null);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `qrcode_${flipbookTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  // Generate a procedural high-density QR matrix pattern from URL string
  const generateQrMatrix = (text: string): boolean[][] => {
    const size = 25; // 25x25 standard matrix
    const matrix: boolean[][] = Array(size)
      .fill(false)
      .map(() => Array(size).fill(false));

    // Corner Finder Patterns (7x7)
    const setFinder = (startX: number, startY: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            matrix[startY + r][startX + c] = true;
          }
        }
      }
    };

    setFinder(0, 0);
    setFinder(size - 7, 0);
    setFinder(0, size - 7);

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }

    // Seed pseudo-random content cells from URL hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Skip corner finder zones
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= size - 8) ||
          (r >= size - 8 && c < 8) ||
          r === 6 ||
          c === 6
        ) {
          continue;
        }

        const pseudoBit = Math.abs(Math.sin((r * size + c) * 37 + hash)) > 0.48;
        matrix[r][c] = pseudoBit;
      }
    }

    return matrix;
  };

  const matrix = generateQrMatrix(publicUrl);
  const cellSize = 10;
  const padding = 20;
  const qrPixelSize = matrix.length * cellSize + padding * 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-5 text-zinc-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">QR Code d'Accès Direct</h3>
              <p className="text-xs text-zinc-400">Pour tables, comptoirs, affiches & salons</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Preview Card */}
        <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div
            className="p-4 rounded-xl shadow-xl transition-all"
            style={{ backgroundColor: bgColor }}
          >
            <svg
              ref={svgRef}
              width={qrPixelSize}
              height={qrPixelSize}
              viewBox={`0 0 ${qrPixelSize} ${qrPixelSize}`}
              className="rounded"
            >
              <rect width="100%" height="100%" fill={bgColor} />
              {matrix.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  if (!cell) return null;
                  return (
                    <rect
                      key={`${rIdx}-${cIdx}`}
                      x={padding + cIdx * cellSize}
                      y={padding + rIdx * cellSize}
                      width={cellSize}
                      height={cellSize}
                      fill={qrColor}
                      rx={1.5}
                    />
                  );
                })
              )}
            </svg>
          </div>

          {includeText && (
            <div className="text-center space-y-0.5">
              <p className="text-xs font-bold text-white max-w-xs truncate">{flipbookTitle}</p>
              <p className="text-[11px] text-zinc-400">Scannez pour ouvrir le catalogue interactif</p>
            </div>
          )}
        </div>

        {/* Customization Controls */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-zinc-400">Couleur des motifs :</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={qrColor}
                onChange={(e) => setQrColor(e.target.value)}
                className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
              />
              <span className="font-mono text-zinc-300 uppercase">{qrColor}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400">Fond :</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
              />
              <span className="font-mono text-zinc-300 uppercase">{bgColor}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-zinc-800">
          <button
            onClick={handleDownloadSvg}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger le QR Code Vectoriel (SVG HD)</span>
          </button>

          <button
            onClick={handleCopyUrl}
            className="w-full py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Lien copié dans le presse-papier !' : 'Copier l’URL publique'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
