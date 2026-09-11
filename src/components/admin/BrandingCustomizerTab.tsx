import React, { useState } from 'react';
import { ThemeSkinConfig } from '../../types/saas';
import {
  Palette,
  Sparkles,
  Sliders,
  Check,
  Globe,
  Upload,
  Eye,
  ShieldAlert,
} from 'lucide-react';

interface BrandingCustomizerTabProps {
  organizationId: string;
}

export const BrandingCustomizerTab: React.FC<BrandingCustomizerTabProps> = ({ organizationId }) => {
  const [config, setConfig] = useState<ThemeSkinConfig>({
    id: 'skin-custom',
    name: 'Thème Sur Mesure',
    primaryColor: '#D4AF37',
    accentColor: '#F7E7CE',
    backgroundColor: '#0F0E0C',
    surfaceColor: '#1A1815',
    textColor: '#FFFFFF',
    dockStyle: 'floating',
    bookSpineColor: '#2D281E',
    borderRadiusPx: 12,
    customLogoUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=120&q=80',
    showPoweredBy: false,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const presets = [
    { name: 'Palace Gold', primary: '#D4AF37', bg: '#0F0E0C', surface: '#1A1815' },
    { name: 'Obsidian Noir', primary: '#FFFFFF', bg: '#000000', surface: '#18181B' },
    { name: 'Riviera Azur', primary: '#0284C7', bg: '#0B132B', surface: '#1C2541' },
    { name: 'Émeraude Prestige', primary: '#10B981', bg: '#06130E', surface: '#0E241B' },
  ];

  const handleSave = () => {
    localStorage.setItem(`flipbook_theme_${organizationId}`, JSON.stringify(config));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/20 rounded-2xl p-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 w-fit mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Phase 21 : Personnalisation Marque Blanche
          </span>
          <h2 className="text-xl font-bold text-white">Studio de Marque & Thèmes Visuels</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Adaptez les couleurs, la disposition de la barre de navigation et le logo pour une immersion client 100% sur mesure.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 self-start sm:self-auto"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              Modifications Enregistrées
            </>
          ) : (
            'Appliquer à Tous les Flipbooks'
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Controls */}
        <div className="lg:col-span-6 space-y-4">
          {/* Presets */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Palettes Prédéfinies
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  key={p.name}
                  onClick={() =>
                    setConfig({
                      ...config,
                      primaryColor: p.primary,
                      backgroundColor: p.bg,
                      surfaceColor: p.surface,
                    })
                  }
                  className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-left text-xs transition-all flex items-center gap-2.5"
                >
                  <div
                    className="w-5 h-5 rounded-full border border-white/20"
                    style={{ backgroundColor: p.primary }}
                  />
                  <div>
                    <p className="font-semibold text-white">{p.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">{p.primary}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Pickers */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Couleurs Principales
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-300 font-medium">Couleur Primaire (Boutons / Accents)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-white text-xs">{config.primaryColor}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-300 font-medium">Couleur d'Arrière-Plan Lecteur</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-white text-xs">{config.backgroundColor}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-300 font-medium">Tranche du Livre (Effet 3D)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.bookSpineColor}
                    onChange={(e) => setConfig({ ...config, bookSpineColor: e.target.value })}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-white text-xs">{config.bookSpineColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dock Layout Style */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Style de la Barre de Contrôle
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {(['floating', 'bottom-bar', 'minimalist-top'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setConfig({ ...config, dockStyle: style })}
                  className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                    config.dockStyle === style
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {style === 'floating'
                    ? 'Flottante'
                    : style === 'bottom-bar'
                    ? 'Barre Basse'
                    : 'Minimaliste Haut'}
                </button>
              ))}
            </div>
          </div>

          {/* White Label Options */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Masquer la mention "Propulsé par FlipBook Studio"</p>
                <p className="text-[11px] text-zinc-400">Neutralité totale de la marque</p>
              </div>
              <input
                type="checkbox"
                checked={!config.showPoweredBy}
                onChange={(e) => setConfig({ ...config, showPoweredBy: !e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </div>
          </div>
        </div>

        {/* Right: Live Mockup Preview */}
        <div className="lg:col-span-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                Aperçu en Direct du Lecteur
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">100% synchronisé</span>
            </div>

            {/* Mockup Frame */}
            <div
              className="w-full aspect-[4/3] rounded-xl border border-white/10 p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300"
              style={{ backgroundColor: config.backgroundColor }}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-black"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    FS
                  </div>
                  <span className="text-xs font-bold text-white">Hôtel Palace Riviera</span>
                </div>
                {!config.showPoweredBy ? (
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider">
                    Édition Privée
                  </span>
                ) : (
                  <span className="text-[9px] text-zinc-600">Propulsé par FlipBook Studio</span>
                )}
              </div>

              {/* Book Mockup in center */}
              <div className="relative mx-auto w-3/5 h-3/5 rounded shadow-2xl flex border border-white/10 overflow-hidden">
                <div className="w-1/2 bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 border-r border-zinc-700">
                  Page Gauche
                </div>
                <div className="w-1/2 bg-zinc-900 flex flex-col items-center justify-center p-2 text-center">
                  <div
                    className="w-full h-1.5 rounded mb-2"
                    style={{ backgroundColor: config.primaryColor }}
                  />
                  <span className="text-[10px] font-bold text-white">Suite Vue Mer</span>
                  <button
                    className="mt-2 px-2 py-0.5 rounded text-[8px] font-bold text-white"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    Réserver
                  </button>
                </div>
              </div>

              {/* Reader Dock Bar */}
              <div
                className={`mx-auto px-4 py-1.5 rounded-full border flex items-center gap-3 backdrop-blur-md shadow-xl ${
                  config.dockStyle === 'floating'
                    ? 'bg-black/60 border-white/10'
                    : 'w-full justify-center bg-black/80 border-white/10 rounded-none'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                <div
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  ▶
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Les modifications de style sont instantanément appliquées lors de l'intégration iframe, du QR Code ou de la lecture directe.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
