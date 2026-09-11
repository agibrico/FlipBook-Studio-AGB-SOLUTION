import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Sliders, ExternalLink } from 'lucide-react';
import { gdprComplianceService } from '../services/gdprComplianceService';

export const GdprConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [heatmaps, setHeatmaps] = useState(true);

  useEffect(() => {
    const userConsent = gdprComplianceService.getUserConsent();
    if (!userConsent.hasChosen) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    gdprComplianceService.saveUserConsent(true, true, true);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleRefuseNonEssential = () => {
    gdprComplianceService.saveUserConsent(false, false, false);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleSaveCustom = () => {
    gdprComplianceService.saveUserConsent(analytics, marketing, heatmaps);
    setShowBanner(false);
    setShowModal(false);
  };

  return (
    <>
      {/* Floating Bottom Cookie Banner */}
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-zinc-950/95 border border-zinc-700/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl shadow-2xl shadow-black/80 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 flex-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Respect de votre vie privée (RGPD)</span>
                <span className="text-[10px] text-emerald-400 lowercase font-normal">phase 41</span>
              </h4>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Nous utilisons des cookies essentiels et des traceurs anonymisés d'attention de lecture pour optimiser
                l'ergonomie de nos catalogues interactifs.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={handleAcceptAll}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition shadow-sm"
                >
                  Tout accepter
                </button>
                <button
                  onClick={handleRefuseNonEssential}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-lg text-xs transition"
                >
                  Continuer sans accepter
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-2.5 py-1.5 text-zinc-400 hover:text-white text-xs underline underline-offset-2 transition flex items-center gap-1"
                >
                  <Sliders className="w-3 h-3" />
                  Personnaliser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Granular Privacy Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">Centre de Préférences de Confidentialité</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh] text-xs">
              {/* Option 1 : Essentiels */}
              <div className="p-3.5 bg-zinc-950/50 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Cookies Essentiels de Navigation</span>
                  <span className="text-zinc-400 text-[11px]">
                    Indispensables pour mémoriser la page active, le zoom et vos marque-pages.
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 font-mono rounded">
                  TOUJOURS ACTIF
                </span>
              </div>

              {/* Option 2 : Analytics & Dwell Time */}
              <div className="p-3.5 bg-zinc-950/50 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Télémétrie d'audience anonymisée</span>
                  <span className="text-zinc-400 text-[11px]">
                    Comptage des vues de pages avec hachage d'IP (aucun cookie tiers).
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Option 3 : Heatmaps spatiales */}
              <div className="p-3.5 bg-zinc-950/50 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Cartes de chaleur (Heatmaps)</span>
                  <span className="text-zinc-400 text-[11px]">
                    Analyse des zones de clic et de lecture pour améliorer la mise en page.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={heatmaps}
                  onChange={(e) => setHeatmaps(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Option 4 : Marketing Retargeting */}
              <div className="p-3.5 bg-zinc-950/50 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Relances email personnalisées</span>
                  <span className="text-zinc-400 text-[11px]">
                    Permet d'activer des offres privées sur les produits consultés.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/60">
              <button
                onClick={handleRefuseNonEssential}
                className="text-xs text-zinc-400 hover:text-white underline underline-offset-2"
              >
                Tout refuser
              </button>
              <button
                onClick={handleSaveCustom}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition"
              >
                Enregistrer mes choix
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
