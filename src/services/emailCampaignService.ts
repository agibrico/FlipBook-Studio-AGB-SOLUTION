/**
 * Phase 39: Automated Email Campaigns & Reader Retargeting
 * Déclenchement automatique de séquences de suivi personnalisées
 * selon le comportement du lecteur dans le flipbook.
 */

import { EmailCampaignSequence } from '../types/saas';

class EmailCampaignService {
  private campaigns: EmailCampaignSequence[] = [
    {
      id: 'cmp-abandoned-3',
      organizationId: 'org-azur-group',
      flipbookId: 'fbk-hotel-palace-nice',
      name: 'Relance Lecteur Hésitant (Arrêt avant la Page 3)',
      trigger: 'ABANDONED_READER',
      delayHours: 2,
      subject: 'Avez-vous trouvé l\'inspiration pour votre prochain séjour à Nice ?',
      emailBodyHtml:
        '<p>Bonjour {{name}},</p><p>Nous avons remarqué que vous avez consulté notre brochure exclusive. Découvrez notre offre d\'accueil personnalisée valable jusqu\'à dimanche.</p>',
      active: true,
      stats: {
        sentCount: 340,
        openRatePercent: 54.2,
        clickRatePercent: 22.8,
        conversionsCount: 29,
      },
    },
    {
      id: 'cmp-high-engagement',
      organizationId: 'org-azur-group',
      flipbookId: 'fbk-hotel-palace-nice',
      name: 'VIP High-Intent (Lecture > 3 minutes sur les Suites)',
      trigger: 'HIGH_ENGAGEMENT',
      delayHours: 1,
      subject: 'Votre invitation privée : Surclassement offert sur votre Suite',
      emailBodyHtml:
        '<p>Bonjour {{name}},</p><p>Merci pour votre intérêt prononcé pour nos Suites d\'Exception. Votre majordome dédié se tient à votre disposition pour planifier chaque détail.</p>',
      active: true,
      stats: {
        sentCount: 185,
        openRatePercent: 78.4,
        clickRatePercent: 41.2,
        conversionsCount: 46,
      },
    },
    {
      id: 'cmp-cart-abandon',
      organizationId: 'org-azur-group',
      flipbookId: 'fbk-hotel-palace-nice',
      name: 'Panier Shoppable Non Finalisé',
      trigger: 'CART_ABANDONED',
      delayHours: 4,
      subject: 'Vos articles sélectionnés vous attendent dans votre catalogue',
      emailBodyHtml:
        '<p>Bonjour,</p><p>Vos articles sont réservés dans votre panier pour encore quelques heures. Cliquez ici pour finaliser directement avec un conseiller.</p>',
      active: true,
      stats: {
        sentCount: 92,
        openRatePercent: 68.0,
        clickRatePercent: 35.5,
        conversionsCount: 18,
      },
    },
  ];

  public getCampaigns(flipbookId?: string): EmailCampaignSequence[] {
    if (!flipbookId) return this.campaigns;
    return this.campaigns.filter((c) => c.flipbookId === flipbookId);
  }

  public toggleCampaign(id: string) {
    const c = this.campaigns.find((cmp) => cmp.id === id);
    if (c) c.active = !c.active;
  }

  public addCampaign(campaign: Omit<EmailCampaignSequence, 'id' | 'stats'>): EmailCampaignSequence {
    const newCamp: EmailCampaignSequence = {
      ...campaign,
      id: `cmp-${Date.now()}`,
      stats: {
        sentCount: 0,
        openRatePercent: 0,
        clickRatePercent: 0,
        conversionsCount: 0,
      },
    };
    this.campaigns.unshift(newCamp);
    return newCamp;
  }
}

export const emailCampaignService = new EmailCampaignService();
