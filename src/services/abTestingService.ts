/**
 * Phase 33: A/B Testing & Split Traffic Engine
 * Comparaison de variantes de couvertures, de CTA et de parcours de lecture.
 */

import { AbTestExperiment, AbTestVariant } from '../types/saas';

class AbTestingService {
  private experiments: AbTestExperiment[] = [
    {
      id: 'exp-cover-2026',
      organizationId: 'org-azur-group',
      flipbookId: 'fbk-hotel-palace-nice',
      title: 'Optimisation de la Couverture : Minimaliste vs Luxe Doré',
      status: 'RUNNING',
      goalMetric: 'LEADS',
      startDate: Date.now() - 7 * 86400000,
      confidenceLevel: 94.2,
      variants: [
        {
          id: 'var-a',
          name: 'Variante A (Couverture Photo Plein Format)',
          description: 'Couverture standard avec vue panoramique de la Baie des Anges',
          coverImageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80',
          ctaText: 'Découvrir la brochure',
          ctaColor: '#4f46e5',
          startPage: 1,
          weightPercent: 50,
          viewsCount: 1420,
          conversionsCount: 88,
          ordersTotalAmount: 18400,
        },
        {
          id: 'var-b',
          name: 'Variante B (Luxe Épuré & Bouton WhatsApp)',
          description: 'Couverture texturée or avec CTA direct de réservation VIP',
          coverImageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop&q=80',
          ctaText: 'Réserver un séjour d\'exception',
          ctaColor: '#f59e0b',
          startPage: 1,
          weightPercent: 50,
          viewsCount: 1485,
          conversionsCount: 142,
          ordersTotalAmount: 32600,
        },
      ],
    },
    {
      id: 'exp-pricing-cta',
      organizationId: 'org-azur-group',
      flipbookId: 'fbk-restaurant-etoile',
      title: 'CTA Menu Dégustation : Devis Immédiat vs Réservation',
      status: 'RUNNING',
      goalMetric: 'ORDERS',
      startDate: Date.now() - 3 * 86400000,
      confidenceLevel: 88.5,
      variants: [
        {
          id: 'var-menu-a',
          name: 'Formulaire Classique',
          description: 'Lien vers page de contact standard',
          weightPercent: 50,
          viewsCount: 850,
          conversionsCount: 42,
          ordersTotalAmount: 4800,
        },
        {
          id: 'var-menu-b',
          name: 'Panier Shoppable Direct',
          description: 'Ajout instantané des menus au panier WhatsApp',
          weightPercent: 50,
          viewsCount: 840,
          conversionsCount: 89,
          ordersTotalAmount: 11200,
        },
      ],
    },
  ];

  public getExperiments(flipbookId?: string): AbTestExperiment[] {
    if (!flipbookId) return this.experiments;
    return this.experiments.filter((e) => e.flipbookId === flipbookId);
  }

  public getActiveVariant(flipbookId: string): AbTestVariant | null {
    const exp = this.experiments.find((e) => e.flipbookId === flipbookId && e.status === 'RUNNING');
    if (!exp || exp.variants.length === 0) return null;

    // Simulation split 50/50 basé sur session
    const rand = Math.random() * 100;
    let accumulated = 0;
    for (const variant of exp.variants) {
      accumulated += variant.weightPercent;
      if (rand <= accumulated) {
        return variant;
      }
    }
    return exp.variants[0];
  }

  public recordConversion(experimentId: string, variantId: string, amount = 0) {
    const exp = this.experiments.find((e) => e.id === experimentId);
    if (!exp) return;
    const variant = exp.variants.find((v) => v.id === variantId);
    if (!variant) return;

    variant.conversionsCount += 1;
    variant.ordersTotalAmount += amount;
  }

  public declareWinner(experimentId: string, winnerVariantId: string) {
    const exp = this.experiments.find((e) => e.id === experimentId);
    if (!exp) return;
    exp.status = 'CONCLUDED';
    exp.winnerVariantId = winnerVariantId;
    exp.endDate = Date.now();
  }

  public createExperiment(exp: Omit<AbTestExperiment, 'id' | 'startDate' | 'confidenceLevel'>): AbTestExperiment {
    const newExp: AbTestExperiment = {
      ...exp,
      id: `exp-${Date.now()}`,
      startDate: Date.now(),
      confidenceLevel: 50.0,
    };
    this.experiments.unshift(newExp);
    return newExp;
  }
}

export const abTestingService = new AbTestingService();
