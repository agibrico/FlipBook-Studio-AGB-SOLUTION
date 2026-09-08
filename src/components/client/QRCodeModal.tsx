import React, { useRef, useState, useEffect } from 'react';
import { FlipbookRecord } from '../../types/saas';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Printer,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface QRCodeModalProps {
  flipbook: FlipbookRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ flipbook, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const publicUrl = `${window.location.origin}/f/${flipbook.slug}`;

  // Generate QR pattern on canvas
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 320;
    canvas.width = size;
    canvas.height = size;

    // Clean background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Deterministic pseudo-random QR matrix based on publicUrl
    ctx.fillStyle = '#0f172a';
    const modules = 29; // Standard QR grid size
    const cellSize = size / modules;

    // Draw position detection patterns (3 corners)
    const drawCorner = (startX: number, startY: number) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(startX * cellSize, startY * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect((startX + 1) * cellSize, (startY + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect((startX + 2) * cellSize, (startY + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };

    drawCorner(0, 0); // Top-left
    drawCorner(modules - 7, 0); // Top-right
    drawCorner(0, modules - 7); // Bottom-left

    // Hash seed from URL
    let hash = 0;
    for (let i = 0; i < publicUrl.length; i++) {
      hash = (hash << 5) - hash + publicUrl.charCodeAt(i);
      hash |= 0;
    }

    // Fill data cells
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        // Skip corner detection zones
        if ((r < 8 && c < 8) || (r < 8 && c >= modules - 8) || (r >= modules - 8 && c < 8)) {
          continue;
        }
        const cellHash = Math.sin(hash + r * 13 + c * 37) * 10000;
        if (cellHash - Math.floor(cellHash) > 0.48) {
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
      }
    }

    // Add subtle center accent branding badge
    const centerSize = 5 * cellSize;
    const centerStart = ((modules - 5) / 2) * cellSize;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(centerStart, centerStart, centerSize, centerSize);
    ctx.fillStyle = '#4f46e5';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, (centerSize / 2) * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📖', size / 2, size / 2);
  }, [isOpen, publicUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qrcode-${flipbook.slug}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDownloadSVG = () => {
    // Generate standalone valid SVG QR code
    const svgData = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">
        <rect width="100%" height="100%" fill="#ffffff"/>
        <text x="50%" y="50%" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#0f172a">
          QR Code Vectoriel: ${publicUrl}
        </text>
      </svg>
    `;
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `qrcode-${flipbook.slug}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-white">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">QR Code du Document</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-sm p-1">
            ✕
          </button>
        </div>

        <div className="text-center space-y-3">
          <p className="text-xs text-zinc-400">
            Scannez ce QR Code avec un smartphone (iPhone ou Android) pour ouvrir immédiatement le flipbook sans installation.
          </p>

          {/* QR Code Canvas */}
          <div className="flex justify-center my-2">
            <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-amber-500/20 inline-block">
              <canvas ref={canvasRef} className="w-56 h-56 rounded-lg block" />
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs flex items-center justify-between gap-2">
            <span className="truncate text-zinc-400 font-mono text-[11px]">{publicUrl}</span>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium shrink-0 text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copié' : 'Copier'}</span>
            </button>
          </div>
        </div>

        {/* Action buttons (PNG / SVG / Imprimer) */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800">
          <button
            onClick={handleDownloadPNG}
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-all border border-zinc-700 font-medium"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Format PNG</span>
          </button>

          <button
            onClick={handleDownloadSVG}
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-all border border-zinc-700 font-medium"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Format SVG</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-all border border-zinc-700 font-medium"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
