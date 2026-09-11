/**
 * PHASE 20: Heatmaps & Analyse d'Attention Lecteur
 * Enregistre les clics relatifs, le temps de rétention par page (dwell time)
 * et génère la matrice de chaleur et l'entonnoir d'abandon.
 */

import { HeatmapPoint, PageAttentionMetric } from '../types/saas';

class HeatmapService {
  private pageStartTime: number = Date.now();
  private currentPage: number = 1;
  private currentFlipbookId: string = 'fb-hotel-riviera';

  private metricsByPage: Record<number, PageAttentionMetric> = {
    1: {
      pageNumber: 1,
      averageDwellSeconds: 42,
      totalViews: 1240,
      zoomInteractions: 85,
      hotspotClicks: 140,
      dropOffRatePercent: 4.5,
      heatmapPoints: [
        { x: 0.5, y: 0.45, intensity: 0.9, type: 'CLICK' },
        { x: 0.52, y: 0.48, intensity: 0.8, type: 'CLICK' },
        { x: 0.35, y: 0.8, intensity: 0.6, type: 'CLICK' },
      ],
    },
    2: {
      pageNumber: 2,
      averageDwellSeconds: 58,
      totalViews: 1184,
      zoomInteractions: 142,
      hotspotClicks: 320,
      dropOffRatePercent: 6.2,
      heatmapPoints: [
        { x: 0.65, y: 0.35, intensity: 0.95, type: 'CLICK' },
        { x: 0.68, y: 0.4, intensity: 0.85, type: 'CLICK' },
        { x: 0.25, y: 0.75, intensity: 0.7, type: 'ZOOM' },
      ],
    },
    3: {
      pageNumber: 3,
      averageDwellSeconds: 64,
      totalViews: 1110,
      zoomInteractions: 190,
      hotspotClicks: 410,
      dropOffRatePercent: 8.1,
      heatmapPoints: [
        { x: 0.7, y: 0.3, intensity: 0.9, type: 'CLICK' },
        { x: 0.72, y: 0.32, intensity: 0.85, type: 'CLICK' },
        { x: 0.45, y: 0.6, intensity: 0.65, type: 'CLICK' },
      ],
    },
    4: {
      pageNumber: 4,
      averageDwellSeconds: 35,
      totalViews: 1020,
      zoomInteractions: 60,
      hotspotClicks: 190,
      dropOffRatePercent: 12.0,
      heatmapPoints: [
        { x: 0.5, y: 0.5, intensity: 0.7, type: 'CLICK' },
      ],
    },
  };

  public trackPageView(flipbookId: string, pageNumber: number) {
    // Record dwell time for previous page
    const elapsedSeconds = Math.round((Date.now() - this.pageStartTime) / 1000);
    if (elapsedSeconds > 1 && elapsedSeconds < 1800) {
      if (!this.metricsByPage[this.currentPage]) {
        this.metricsByPage[this.currentPage] = {
          pageNumber: this.currentPage,
          averageDwellSeconds: elapsedSeconds,
          totalViews: 1,
          zoomInteractions: 0,
          hotspotClicks: 0,
          dropOffRatePercent: 5.0,
          heatmapPoints: [],
        };
      } else {
        const m = this.metricsByPage[this.currentPage];
        m.averageDwellSeconds = Math.round((m.averageDwellSeconds * m.totalViews + elapsedSeconds) / (m.totalViews + 1));
        m.totalViews += 1;
      }
    }

    this.currentFlipbookId = flipbookId;
    this.currentPage = pageNumber;
    this.pageStartTime = Date.now();
  }

  public recordInteraction(x: number, y: number, type: 'CLICK' | 'HOVER' | 'ZOOM') {
    if (!this.metricsByPage[this.currentPage]) {
      this.metricsByPage[this.currentPage] = {
        pageNumber: this.currentPage,
        averageDwellSeconds: 30,
        totalViews: 1,
        zoomInteractions: type === 'ZOOM' ? 1 : 0,
        hotspotClicks: type === 'CLICK' ? 1 : 0,
        dropOffRatePercent: 5.0,
        heatmapPoints: [],
      };
    }

    const metric = this.metricsByPage[this.currentPage];
    if (type === 'ZOOM') metric.zoomInteractions += 1;
    if (type === 'CLICK') metric.hotspotClicks += 1;

    metric.heatmapPoints.push({
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
      intensity: 0.8,
      type,
    });
  }

  public getMetricsForPage(pageNumber: number): PageAttentionMetric | undefined {
    return this.metricsByPage[pageNumber];
  }

  public getAllMetrics(): PageAttentionMetric[] {
    return Object.values(this.metricsByPage).sort((a, b) => a.pageNumber - b.pageNumber);
  }

  public getDropoffFunnel() {
    const pages = this.getAllMetrics();
    const baseViews = pages[0]?.totalViews || 1000;
    return pages.map((p) => ({
      pageNumber: p.pageNumber,
      views: p.totalViews,
      retentionPercent: Math.round((p.totalViews / baseViews) * 100),
      dwellSeconds: p.averageDwellSeconds,
    }));
  }
}

export const heatmapService = new HeatmapService();
