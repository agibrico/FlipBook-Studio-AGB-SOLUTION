import React, { useState } from 'react';
import { heatmapService } from '../../services/heatmapService';
import {
  Flame,
  Clock,
  Eye,
  MousePointer,
  ZoomIn,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface HeatmapAnalyticsTabProps {
  flipbookId?: string;
}

export const HeatmapAnalyticsTab: React.FC<HeatmapAnalyticsTabProps> = ({ flipbookId }) => {
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [activeOverlay, setActiveOverlay] = useState<'heatmap' | 'clicks' | 'clean'>('heatmap');

  const allMetrics = heatmapService.getAllMetrics();
  const currentMetric = heatmapService.getMetricsForPage(selectedPage) || allMetrics[0];
  const funnel = heatmapService.getDropoffFunnel();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-orange-950/40 via-zinc-900 to-zinc-900 border border-orange-500/20 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              Phase 20 : Heatmaps & Rétention
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">Cartographie de Chaleur & Zones d'Attention</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Visualisez précisément où vos lecteurs cliquent, zooment et combien de secondes ils consacrent à chaque page.
          </p>
        </div>

        {/* Overlay Mode Switcher */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveOverlay('heatmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeOverlay === 'heatmap'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Heatmap
          </button>
          <button
            onClick={() => setActiveOverlay('clicks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeOverlay === 'clicks'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            Points de Clics
          </button>
          <button
            onClick={() => setActiveOverlay('clean')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeOverlay === 'clean'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Vue Nette
          </button>
        </div>
      </div>

      {/* Main Grid: Page Heatmap Viewer & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Interactive Page Stage with Heatmap Overlay */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Visualisation Page {selectedPage}</span>
              <span className="text-[11px] text-zinc-500 font-mono">
                ({currentMetric?.totalViews || 0} vues enregistrées)
              </span>
            </div>

            {/* Page Navigator */}
            <div className="flex items-center gap-2">
              <button
                disabled={selectedPage <= 1}
                onClick={() => setSelectedPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-zinc-300">
                {selectedPage} / {allMetrics.length}
              </span>
              <button
                disabled={selectedPage >= allMetrics.length}
                onClick={() => setSelectedPage((p) => Math.min(allMetrics.length, p + 1))}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white text-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Page Canvas Container */}
          <div className="relative aspect-[3/4] max-h-[480px] mx-auto bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Mock Page Background Image */}
            <img
              src={`https://images.unsplash.com/photo-${
                selectedPage === 1
                  ? '1542314831-068cd1dbfeeb'
                  : selectedPage === 2
                  ? '1582719478250-c89cae4dc85b'
                  : selectedPage === 3
                  ? '1540555700478-4be289fbecef'
                  : '1569919659476-f0852f6834b7'
              }?auto=format&fit=crop&w=800&q=80`}
              alt={`Page ${selectedPage}`}
              className="w-full h-full object-cover select-none"
            />

            {/* Heatmap Overlay */}
            {activeOverlay === 'heatmap' && (
              <div className="absolute inset-0 pointer-events-none">
                {currentMetric?.heatmapPoints.map((pt, idx) => (
                  <div
                    key={idx}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen filter blur-md animate-pulse"
                    style={{
                      left: `${pt.x * 100}%`,
                      top: `${pt.y * 100}%`,
                      width: `${120 * pt.intensity}px`,
                      height: `${120 * pt.intensity}px`,
                      background: `radial-gradient(circle, rgba(255, 69, 0, 0.7) 0%, rgba(255, 215, 0, 0.4) 45%, rgba(255, 0, 0, 0) 70%)`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Exact Click Points Mode */}
            {activeOverlay === 'clicks' && (
              <div className="absolute inset-0 pointer-events-none">
                {currentMetric?.heatmapPoints.map((pt, idx) => (
                  <div
                    key={idx}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-indigo-400 bg-indigo-500/50 flex items-center justify-center text-[9px] font-bold text-white shadow-lg"
                    style={{
                      left: `${pt.x * 100}%`,
                      top: `${pt.y * 100}%`,
                    }}
                  >
                    {idx + 1}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 5 cols: Attention Metrics & Dropoff Funnel */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card: Current Page KPIs */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Statistiques Page {selectedPage}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Temps de Lecture Moyen
                </div>
                <p className="text-xl font-extrabold text-white mt-1">
                  {currentMetric?.averageDwellSeconds}s
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                  <MousePointer className="w-3.5 h-3.5 text-indigo-400" />
                  Clics Zones Actives
                </div>
                <p className="text-xl font-extrabold text-white mt-1">
                  {currentMetric?.hotspotClicks}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                  <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                  Zooms / Inspections
                </div>
                <p className="text-xl font-extrabold text-white mt-1">
                  {currentMetric?.zoomInteractions}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  Taux de Décrochage
                </div>
                <p className="text-xl font-extrabold text-rose-400 mt-1">
                  {currentMetric?.dropOffRatePercent}%
                </p>
              </div>
            </div>
          </div>

          {/* Card: Dropoff Funnel */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Entonnoir de Lecture (Rétention)
            </h3>
            <p className="text-[11px] text-zinc-500">
              Pourcentage des visiteurs progressant de la couverture jusqu'aux pages intérieures :
            </p>

            <div className="space-y-2 pt-1">
              {funnel.map((item) => (
                <div
                  key={item.pageNumber}
                  onClick={() => setSelectedPage(item.pageNumber)}
                  className={`p-2 rounded-lg cursor-pointer transition-all border ${
                    selectedPage === item.pageNumber
                      ? 'bg-indigo-500/10 border-indigo-500/30'
                      : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-white">Page {item.pageNumber}</span>
                    <span className="font-mono font-bold text-indigo-400">
                      {item.retentionPercent}% ({item.views} lecteurs)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.retentionPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
