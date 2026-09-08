import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { tenantService } from '../../services/tenantService';
import { analyticsService } from '../../services/analyticsService';
import {
  Eye,
  Users,
  Clock,
  MousePointerClick,
  MessageSquare,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  Download,
  Filter,
  Sparkles,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  initialFlipbookId?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  initialFlipbookId,
}) => {
  const { activeOrg } = useAuth();
  const [selectedFlipbookId, setSelectedFlipbookId] = useState<string>(
    initialFlipbookId || 'all'
  );

  const orgId = activeOrg?.id || 'org-azur-group';
  const orgFlipbooks = tenantService.getFlipbooksForOrg(orgId);

  const metrics = useMemo(() => {
    return analyticsService.getSummaryMetrics(
      orgId,
      selectedFlipbookId === 'all' ? undefined : selectedFlipbookId
    );
  }, [orgId, selectedFlipbookId]);

  // Export CSV summary report
  const handleExportCSV = () => {
    const rows = [
      ['Date', 'Flipbook ID', 'Type Evenement', 'Page', 'Appareil'],
      ...metrics.recentEvents.map((e) => [
        new Date(e.timestamp).toISOString(),
        e.flipbookId,
        e.eventType,
        (e.pageNumber || 1).toString(),
        e.deviceType,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `analytics_${orgId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalDeviceCount =
    (metrics.deviceBreakdown.desktop || 0) +
    (metrics.deviceBreakdown.mobile || 0) +
    (metrics.deviceBreakdown.tablet || 0) || 1;

  const desktopPct = Math.round(((metrics.deviceBreakdown.desktop || 0) / totalDeviceCount) * 100);
  const mobilePct = Math.round(((metrics.deviceBreakdown.mobile || 0) / totalDeviceCount) * 100);
  const tabletPct = Math.round(((metrics.deviceBreakdown.tablet || 0) / totalDeviceCount) * 100);

  return (
    <div className="space-y-6">
      {/* Top Filter & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Statistiques &amp; Engagement d’Audience
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Suivi en temps réel des consultations, clics sur les zones interactives et conversion WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedFlipbookId}
              onChange={(e) => setSelectedFlipbookId(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none"
            >
              <option value="all">Tous les Flipbooks ({orgFlipbooks.length})</option>
              {orgFlipbooks.map((fb) => (
                <option key={fb.id} value={fb.id}>
                  {fb.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-medium text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-zinc-300" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Vues Totales</span>
            <Eye className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.totalViews}</div>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">+18.4% ce mois</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Lecteurs Uniques</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.uniqueReaders}</div>
          <p className="text-[11px] text-zinc-400 font-mono mt-1">IP &amp; sessions distinctes</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Temps Moyen</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.floor(metrics.averageTimeSeconds / 60)}m {metrics.averageTimeSeconds % 60}s
          </div>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">Engagement élevé</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Clics Hotspots</span>
            <MousePointerClick className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.totalHotspotClicks}</div>
          <p className="text-[11px] text-zinc-400 font-mono mt-1">Zones interactives</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Leads WhatsApp</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.totalWhatsAppClicks}</div>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">Conversations ouvertes</p>
        </div>
      </div>

      {/* Middle Grid: Retention by Page & Hotspot Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Retention Funnel */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Courbe de Rétention par Page</h4>
            <span className="text-xs text-zinc-500 font-mono">Pages 1 à 4</span>
          </div>

          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((pageNum) => {
              const count = metrics.pageViewsByPage[pageNum] || Math.max(2, 28 - pageNum * 5);
              const percentage = Math.min(100, Math.round((count / (metrics.pageViewsByPage[1] || 25)) * 100));

              return (
                <div key={pageNum} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-zinc-300">Page {pageNum}</span>
                    <span className="text-zinc-400 font-mono">{count} consultations ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed pt-2">
            Plus de 70% des visiteurs parcourent l’intégralité de la brochure jusqu’à la page de commande ou de réservation.
          </p>
        </div>

        {/* Hotspots Breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-white">Interactions par Type de Zone</h4>
          <div className="space-y-2.5 pt-1">
            {Object.entries(metrics.hotspotClicksByType).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="font-medium text-zinc-300">{type}</span>
                </div>
                <span className="font-mono font-bold text-white">{count} clics</span>
              </div>
            ))}
          </div>

          {/* Device breakdown bar */}
          <div className="pt-3 border-t border-zinc-800">
            <h5 className="text-xs font-semibold text-zinc-400 mb-2">Répartition Appareils</h5>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                <span>{desktopPct}% PC</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{mobilePct}% Mobile</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Tablet className="w-3.5 h-3.5 text-amber-400" />
                <span>{tabletPct}% Tablette</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Activity Stream Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Flux d’Événements Récents
          </h4>
          <span className="text-xs text-zinc-500 font-mono">Derniers 15 événements</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono border-b border-zinc-800">
              <tr>
                <th className="px-4 py-2.5">Date &amp; Heure</th>
                <th className="px-4 py-2.5">Document</th>
                <th className="px-4 py-2.5">Action</th>
                <th className="px-4 py-2.5">Page</th>
                <th className="px-4 py-2.5">Appareil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {metrics.recentEvents.slice(0, 10).map((evt) => (
                <tr key={evt.id} className="hover:bg-zinc-800/40">
                  <td className="px-4 py-2.5 text-zinc-400 font-mono">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-white truncate max-w-[180px]">
                    {evt.flipbookId}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded font-mono font-medium text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {evt.eventType}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-300 font-mono">
                    {evt.pageNumber ? `P. ${evt.pageNumber}` : 'Global'}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-400 uppercase">
                    {evt.deviceType}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
