import React, { useState } from 'react';
import { BookOpen, Sparkles, X, Check, Volume2, Sliders, Layers } from 'lucide-react';
import { PageFlipEngineMode, FlipPhysicsSettings } from '../types/saas';

interface FlipPhysicsSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: FlipPhysicsSettings;
  onApplySettings: (settings: FlipPhysicsSettings) => void;
}

export const FlipPhysicsSelectorModal: React.FC<FlipPhysicsSelectorModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onApplySettings,
}) => {
  const [settings, setSettings] = useState<FlipPhysicsSettings>(currentSettings);

  if (!isOpen) return null;

  const engines: { id: PageFlipEngineMode; title: string; desc: string; icon: string }[] = [
    {
      id: 'CLASSIC_3D_PAGE_CURL',
      title: 'Papier Glacé & Page Curl 3D',
      desc: 'Courbure réaliste du papier avec reflets spéculaires et courbure interactive au survol.',
      icon: '📖',
    },
    {
      id: 'HARDCOVER_BOUND_BOOK',
      title: 'Livre Relié Rigide (Hardcover)',
      desc: 'Couverture cartonnée épaisse, reliure cousue et ombres de pliure profondes.',
      icon: '📕',
    },
    {
      id: 'SPIRAL_WIRE_NOTEBOOK',
      title: 'Carnet à Anneaux & Spirale Métallique',
      desc: 'Rotation à plat à 360° avec perforation régulière façon catalogue technique.',
      icon: '📓',
    },
    {
      id: 'CONTINUOUS_INFINITE_SCROLL',
      title: 'Défilement Continu Fluide (Sans Rupture)',
      desc: 'Lecture façon Webzine moderne avec transition verticale douce optimisée mobile.',
      icon: '📜',
    },
    {
      id: 'ACCORDION_PANORAMIC',
      title: 'Dépliant Accordéon Panoramique',
      desc: 'Dépliage en triptyque continu 3 volets idéal pour l\'immobilier et les plans.',
      icon: '🗺️',
    },
  ];

  const handleSave = () => {
    onApplySettings(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Moteur de Rendu Physique & Reliure</h3>
              <p className="text-xs text-zinc-400">Phase 40 • Physique 3D du papier, rigidité & styles de reliure</p>
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Sélection du style de moteur */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Style de Reliure & Animation de Tourne-Page
            </label>
            <div className="space-y-2">
              {engines.map((eng) => {
                const isSelected = settings.engineMode === eng.id;
                return (
                  <button
                    key={eng.id}
                    onClick={() => setSettings({ ...settings, engineMode: eng.id })}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/10 text-white'
                        : 'border-zinc-800 bg-zinc-800/40 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{eng.icon}</span>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-white">{eng.title}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{eng.desc}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliders de rigidité et courbure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-zinc-950/60 rounded-xl border border-zinc-800">
            <div className="space-y-1.5">
              <div className="flex justify-between text-zinc-300 font-medium">
                <span>Rigidité du papier :</span>
                <span className="text-cyan-400 font-bold">{Math.round(settings.paperStiffness * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={settings.paperStiffness}
                onChange={(e) => setSettings({ ...settings, paperStiffness: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>Soie / Bible</span>
                <span>Carton 350g</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-zinc-300 font-medium">
                <span>Bruitage de feuilletage :</span>
                <span className="text-cyan-400 font-bold">{settings.soundEffect}</span>
              </div>
              <select
                value={settings.soundEffect}
                onChange={(e) => setSettings({ ...settings, soundEffect: e.target.value as any })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="CRISP_MAGAZINE">Feuilletage Papier Glacé (Standard)</option>
                <option value="SOFT_PAPER">Papier Vélin Doux</option>
                <option value="HEAVY_HARDBACK">Claquement Livre Relié Lourd</option>
                <option value="NONE">Désactivé (Silencieux)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/60">
          <span className="text-[11px] text-zinc-400">
            Modifications appliquées instantanément sur le lecteur
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white text-xs font-medium transition"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-cyan-600/25"
            >
              Appliquer la physique
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
