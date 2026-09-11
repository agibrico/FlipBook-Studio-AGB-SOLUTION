import React, { useState } from 'react';
import { Box, Sparkles, X, Rotate3d, Smartphone, Eye, Layers, Palette } from 'lucide-react';
import { Model3DHotspot } from '../types/saas';

interface Model3DViewerModalProps {
  hotspot?: Model3DHotspot;
  isOpen: boolean;
  onClose: () => void;
}

export const Model3DViewerModal: React.FC<Model3DViewerModalProps> = ({
  hotspot,
  isOpen,
  onClose,
}) => {
  // Preset 3D par défaut si non spécifié
  const modelData: Model3DHotspot = hotspot || {
    id: 'mod-watch-1',
    flipbookId: 'fbk-hotel-palace-nice',
    pageNumber: 3,
    title: 'Montre Chronographe Automatique Or Rose 18K',
    category: 'WATCH',
    modelType: 'PROCEDURAL_PRESET',
    modelUrl: '',
    presetKey: 'LUXURY_WATCH',
    autoRotate: true,
    roughness: 0.2,
    metalness: 0.95,
    baseColor: '#d4af37',
    arEnabled: true,
    dimensionsText: 'Diamètre 42mm • Épaisseur 11.8mm • Verre Saphir',
    price: 18500,
  };

  const [rotation, setRotation] = useState<{ x: number; y: number }>({ x: 15, y: 35 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeColor, setActiveColor] = useState(modelData.baseColor);
  const [showWireframe, setShowWireframe] = useState(false);
  const [showArQr, setShowArQr] = useState(false);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setRotation((prev) => ({
      x: Math.max(-60, Math.min(60, prev.x - deltaY * 0.5)),
      y: (prev.y + deltaX * 0.5) % 360,
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{modelData.title}</h3>
              <p className="text-xs text-zinc-400">Phase 34 • Visualiseur 3D temps réel 360° & Web-AR immersif</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Canvas Area */}
        <div
          className="relative h-[340px] bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grille de perspective de sol */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
            }}
          />

          {/* Rendu 3D CSS interactif (Simulation de modèle luxueux avec ombrages et reflets) */}
          <div
            className="relative transition-transform duration-75"
            style={{
              transform: `perspective(800px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Boîtier / Cadran 3D */}
            <div
              className={`w-40 h-40 rounded-full border-4 shadow-2xl flex items-center justify-center relative ${
                showWireframe ? 'border-dashed border-violet-400 bg-transparent' : ''
              }`}
              style={{
                borderColor: activeColor,
                backgroundColor: showWireframe ? 'transparent' : '#18181b',
                boxShadow: `0 25px 50px -12px ${activeColor}40, inset 0 0 25px rgba(0,0,0,0.8)`,
              }}
            >
              {/* Reflet verre saphir */}
              <div className="absolute inset-2 rounded-full border border-white/20 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />

              {/* Aiguilles et détails */}
              <div className="w-1.5 h-12 bg-white/90 rounded-full absolute -top-1 origin-bottom rotate-45" />
              <div className="w-1 h-14 bg-amber-400 rounded-full absolute -top-3 origin-bottom -rotate-45" />
              <div className="w-4 h-4 rounded-full bg-white shadow-md z-10" />

              {/* Bracelet / Piliers */}
              <div
                className="absolute -top-10 w-24 h-10 rounded-t-xl opacity-80"
                style={{ backgroundColor: activeColor }}
              />
              <div
                className="absolute -bottom-10 w-24 h-10 rounded-b-xl opacity-80"
                style={{ backgroundColor: activeColor }}
              />
            </div>
          </div>

          {/* Hint de drag */}
          <div className="absolute bottom-3 left-4 text-[11px] text-zinc-500 flex items-center gap-1.5 pointer-events-none">
            <Rotate3d className="w-3.5 h-3.5 text-violet-400 animate-spin" style={{ animationDuration: '4s' }} />
            Glissez avec la souris pour pivoter à 360°
          </div>

          {/* Badge de prix */}
          {modelData.price && (
            <div className="absolute top-3 right-4 px-3 py-1.5 bg-zinc-900/80 border border-zinc-700/60 rounded-xl text-white font-bold text-sm backdrop-blur-md">
              {modelData.price.toLocaleString('fr-FR')} €
            </div>
          )}
        </div>

        {/* Contrôles & Options AR */}
        <div className="p-6 bg-zinc-900 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Sélecteur de matière / couleur */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                <Palette className="w-3.5 h-3.5" /> Matériau :
              </span>
              <div className="flex items-center gap-2">
                {[
                  { color: '#d4af37', label: 'Or Jaune 18K' },
                  { color: '#b76e79', label: 'Or Rose' },
                  { color: '#e5e7eb', label: 'Platine Pur' },
                  { color: '#27272a', label: 'Titane Brossé' },
                ].map((mat) => (
                  <button
                    key={mat.color}
                    onClick={() => setActiveColor(mat.color)}
                    title={mat.label}
                    className={`w-6 h-6 rounded-full border-2 transition ${
                      activeColor === mat.color ? 'border-white scale-110' : 'border-transparent opacity-80'
                    }`}
                    style={{ backgroundColor: mat.color }}
                  />
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowWireframe(!showWireframe)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 ${
                  showWireframe
                    ? 'border-violet-500 bg-violet-500/10 text-violet-300'
                    : 'border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Filaire
              </button>

              <button
                onClick={() => setShowArQr(!showArQr)}
                className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-violet-600/25"
              >
                <Smartphone className="w-3.5 h-3.5" />
                Voir en Réalité Augmentée (AR)
              </button>
            </div>
          </div>

          {/* Modal / Overlay QR Code AR */}
          {showArQr && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-violet-500/30 flex items-center gap-4 animate-in fade-in">
              <div className="w-20 h-20 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center">
                {/* QR Code SVG simulé */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                    'https://flipbookstudio.pro/ar/watch-luxury-palace'
                  )}`}
                  alt="Scan AR QR"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white mb-1">Projeter dans votre espace (iOS / Android)</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Scannez ce QR code avec l'appareil photo de votre smartphone pour projeter ce modèle 3D à l'échelle 1:1
                  sur votre table ou votre poignet (compatible WebXR & QuickLook Apple).
                </p>
              </div>
            </div>
          )}

          <div className="text-xs text-zinc-400 border-t border-zinc-800 pt-3 flex items-center justify-between">
            <span>{modelData.dimensionsText}</span>
            <span className="text-violet-400 font-medium">Compatible WebGL 2.0 & USDZ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
