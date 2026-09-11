import React, { useState } from 'react';
import { TEMPLATE_PRESETS } from '../../services/templateService';
import { FlipbookTemplatePreset } from '../../types/saas';
import {
  Sparkles,
  Check,
  Building,
  Utensils,
  Home,
  Shirt,
  Briefcase,
  Store,
  Layers,
} from 'lucide-react';

interface TemplateLibraryTabProps {
  organizationId: string;
  onApplyTemplate?: (template: FlipbookTemplatePreset) => void;
}

export const TemplateLibraryTab: React.FC<TemplateLibraryTabProps> = ({
  organizationId,
  onApplyTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const categories = [
    { id: 'ALL', label: 'Tous les Métiers' },
    { id: 'HOSPITALITY', label: 'Hôtellerie Luxe' },
    { id: 'REAL_ESTATE', label: 'Immobilier' },
    { id: 'GASTRONOMY', label: 'Restauration' },
    { id: 'FASHION', label: 'Mode & Lookbook' },
    { id: 'CORPORATE', label: 'Rapport Annuel' },
    { id: 'RETAIL', label: 'B2B & Distribution' },
  ];

  const filtered = TEMPLATE_PRESETS.filter(
    (t) => selectedCategory === 'ALL' || t.category === selectedCategory
  );

  const handleApply = (tpl: FlipbookTemplatePreset) => {
    setAppliedId(tpl.id);
    if (onApplyTemplate) {
      onApplyTemplate(tpl);
    }
    setTimeout(() => setAppliedId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/20 rounded-2xl p-5">
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 w-fit mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          Phase 25 : Bibliothèque de Modèles Clé en Main
        </span>
        <h2 className="text-xl font-bold text-white">Presets & Thématiques Métiers</h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Déployez en un clic une configuration visuelle, des zones interactives et une ambiance adaptées à votre secteur d'activité.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === c.id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-emerald-500/40 transition-all shadow-xl"
          >
            <div>
              {/* Preview Image */}
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                <img
                  src={tpl.previewImageUrl}
                  alt={tpl.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-3 text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 text-zinc-300 backdrop-blur-sm border border-white/10">
                  Format {tpl.recommendedAspect}
                </span>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2">
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {tpl.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{tpl.description}</p>

                <div className="pt-2 flex items-center gap-2 text-[11px] text-zinc-500">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{tpl.sampleHotspotsCount} zones interactives configurées</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800/60 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded-full border border-white/20"
                  style={{ backgroundColor: tpl.themeConfig.primaryColor }}
                />
                <div
                  className="w-4 h-4 rounded-full border border-white/20"
                  style={{ backgroundColor: tpl.themeConfig.backgroundColor }}
                />
              </div>

              <button
                onClick={() => handleApply(tpl)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  appliedId === tpl.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-zinc-800 hover:bg-emerald-600 text-white'
                }`}
              >
                {appliedId === tpl.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Modèle Appliqué !
                  </>
                ) : (
                  'Appliquer le Modèle'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
