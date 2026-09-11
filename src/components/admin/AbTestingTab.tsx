import React, { useState } from 'react';
import { Split, Trophy, Plus, Check, Play, Pause, TrendingUp, BarChart2, Sparkles, ArrowRight } from 'lucide-react';
import { abTestingService } from '../../services/abTestingService';
import { AbTestExperiment } from '../../types/saas';

export const AbTestingTab: React.FC = () => {
  const [experiments, setExperiments] = useState<AbTestExperiment[]>(abTestingService.getExperiments());
  const [selectedExp, setSelectedExp] = useState<AbTestExperiment>(experiments[0]);

  const handleDeclareWinner = (variantId: string) => {
    abTestingService.declareWinner(selectedExp.id, variantId);
    setExperiments([...abTestingService.getExperiments()]);
    setSelectedExp({
      ...selectedExp,
      status: 'CONCLUDED',
      winnerVariantId: variantId,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Split className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Moteur A/B Testing & Split Traffic</h2>
            <p className="text-xs text-zinc-400">
              Phase 33 • Comparez des variantes de couvertures, de CTA et de parcours pour maximiser vos conversions.
            </p>
          </div>
        </div>

        <button className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-lg shadow-violet-600/20 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Créer un Test A/B
        </button>
      </div>

      {/* Selecteur d'expérimentation */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {experiments.map((exp) => (
          <button
            key={exp.id}
            onClick={() => setSelectedExp(exp)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              selectedExp.id === exp.id
                ? 'bg-violet-600/15 border-violet-500 text-violet-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {exp.title} ({exp.status === 'RUNNING' ? 'En cours' : 'Terminé'})
          </button>
        ))}
      </div>

      {/* Détail de l'expérimentation sélectionnée */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">{selectedExp.title}</h3>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  selectedExp.status === 'RUNNING'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {selectedExp.status === 'RUNNING' ? 'Actif (Trafic Réparti 50/50)' : 'Conclu'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Objectif principal : <span className="text-zinc-200 font-semibold">{selectedExp.goalMetric}</span> •
              Niveau de confiance statistique :{' '}
              <span className="text-violet-400 font-bold">{selectedExp.confidenceLevel}%</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Total vues test :</span>
            <span className="text-sm font-bold text-white">
              {selectedExp.variants.reduce((acc, v) => acc + v.viewsCount, 0).toLocaleString('fr-FR')}
            </span>
          </div>
        </div>

        {/* Comparatif des Variantes A vs B */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedExp.variants.map((variant) => {
            const isWinner = selectedExp.winnerVariantId === variant.id;
            const conversionRate =
              variant.viewsCount > 0 ? ((variant.conversionsCount / variant.viewsCount) * 100).toFixed(1) : '0';

            return (
              <div
                key={variant.id}
                className={`relative rounded-2xl border p-5 space-y-4 transition ${
                  isWinner
                    ? 'border-amber-500/80 bg-amber-950/10 shadow-xl shadow-amber-950/20'
                    : 'border-zinc-800 bg-zinc-950/50'
                }`}
              >
                {isWinner && (
                  <div className="absolute -top-3 right-4 px-3 py-1 bg-amber-500 text-zinc-950 text-[11px] font-bold rounded-full flex items-center gap-1 shadow-md">
                    <Trophy className="w-3.5 h-3.5" />
                    VAINQUEUR DÉSIGNÉ (+61% CA)
                  </div>
                )}

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">{variant.name}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{variant.description}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-zinc-800 rounded text-[11px] text-zinc-300 font-mono">
                    {variant.weightPercent}% trafic
                  </span>
                </div>

                {variant.coverImageUrl && (
                  <div className="h-40 rounded-xl overflow-hidden border border-zinc-800 relative group">
                    <img src={variant.coverImageUrl} alt="Variant cover" className="w-full h-full object-cover" />
                    {variant.ctaText && (
                      <div className="absolute bottom-3 left-3 right-3">
                        <div
                          className="px-3 py-1.5 rounded-lg text-white font-bold text-xs text-center shadow-lg"
                          style={{ backgroundColor: variant.ctaColor || '#4f46e5' }}
                        >
                          {variant.ctaText}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* KPI Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 uppercase block">Vues</span>
                    <span className="text-sm font-bold text-white">{variant.viewsCount}</span>
                  </div>
                  <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 uppercase block">Conversions</span>
                    <span className="text-sm font-bold text-violet-400">{variant.conversionsCount}</span>
                  </div>
                  <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 uppercase block">Taux</span>
                    <span className="text-sm font-bold text-emerald-400">{conversionRate}%</span>
                  </div>
                </div>

                {/* Montant commandes générées */}
                <div className="flex items-center justify-between text-xs px-3 py-2 bg-zinc-900/60 rounded-xl border border-zinc-800">
                  <span className="text-zinc-400">Chiffre d'Affaires Shoppable :</span>
                  <span className="font-bold text-amber-400">{variant.ordersTotalAmount.toLocaleString('fr-FR')} €</span>
                </div>

                {/* Action déclarer vainqueur */}
                {selectedExp.status === 'RUNNING' && (
                  <button
                    onClick={() => handleDeclareWinner(variant.id)}
                    className="w-full py-2 bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    Déployer cette variante à 100%
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
