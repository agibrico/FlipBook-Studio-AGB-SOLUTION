import { LeadRecord, LeadFormType, LeadStatus, LeadGateSettings } from '../types/saas';

const STORAGE_KEY = 'flipbook_leads_store';

export const SEED_LEADS: LeadRecord[] = [
  {
    id: 'lead-001',
    organizationId: 'org-azur-group',
    clientId: 'cli-hotel-azur-nice',
    flipbookId: 'doc-hotel-luxury-2026',
    flipbookTitle: 'Catalogue Prestige & Suites 2026',
    pageNumber: 3,
    fullName: 'Éléonore de Montmirail',
    email: 'eleonore.montmirail@patrimoine-luxe.fr',
    phone: '+33 6 12 34 56 78',
    company: 'Patrimoine & Prestige SA',
    message: 'Souhaite privatiser la Suite Présidentielle et organiser un cocktail pour 40 personnes en juin.',
    formType: 'GATE_LOCK',
    status: 'QUALIFIED',
    createdAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'lead-002',
    organizationId: 'org-azur-group',
    clientId: 'cli-hotel-azur-nice',
    flipbookId: 'doc-hotel-luxury-2026',
    flipbookTitle: 'Catalogue Prestige & Suites 2026',
    pageNumber: 4,
    fullName: 'Marc Valenti',
    email: 'm.valenti@riviera-yachting.mc',
    phone: '+377 98 76 54 32',
    company: 'Riviera Yachting Monaco',
    message: 'Demande de brochure traiteur & tarifs conciergerie VIP pour la saison estivale.',
    formType: 'QUOTE',
    status: 'NEW',
    createdAt: Date.now() - 5 * 3600000,
  },
  {
    id: 'lead-003',
    organizationId: 'org-azur-group',
    clientId: 'cli-restaurant-baie-des-anges',
    flipbookId: 'doc-carte-gastronomique-ete',
    flipbookTitle: 'Carte Gastronomique & Vins Rares — Saison Été',
    pageNumber: 2,
    fullName: 'Sophie Chen',
    email: 'sophie.chen@global-epicure.com',
    phone: '+33 7 89 01 23 45',
    company: 'Global Epicure Consulting',
    message: 'Réservation table chef étoilé pour délégation internationale (12 couverts).',
    formType: 'INQUIRY',
    status: 'CONTACTED',
    createdAt: Date.now() - 24 * 3600000,
  },
];

class LeadService {
  private leads: LeadRecord[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.leads = JSON.parse(stored);
      } else {
        this.leads = [...SEED_LEADS];
        this.saveToStorage();
      }
    } catch {
      this.leads = [...SEED_LEADS];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.leads));
    } catch (e) {
      console.warn('Unable to persist leads to localStorage', e);
    }
  }

  public getLeads(organizationId: string, flipbookId?: string): LeadRecord[] {
    return this.leads.filter((l) => {
      if (l.organizationId !== organizationId) return false;
      if (flipbookId && l.flipbookId !== flipbookId) return false;
      return true;
    }).sort((a, b) => b.createdAt - a.createdAt);
  }

  public submitLead(data: {
    organizationId: string;
    clientId: string;
    flipbookId: string;
    flipbookTitle: string;
    pageNumber: number;
    fullName: string;
    email: string;
    phone?: string;
    company?: string;
    message?: string;
    formType: LeadFormType;
  }): LeadRecord {
    const newLead: LeadRecord = {
      id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      ...data,
      status: 'NEW',
      createdAt: Date.now(),
    };

    this.leads.unshift(newLead);
    this.saveToStorage();
    return newLead;
  }

  public updateLeadStatus(leadId: string, newStatus: LeadStatus) {
    const lead = this.leads.find((l) => l.id === leadId);
    if (lead) {
      lead.status = newStatus;
      this.saveToStorage();
    }
  }

  public exportLeadsCSV(organizationId: string, flipbookId?: string): string {
    const list = this.getLeads(organizationId, flipbookId);
    const headers = ['Date', 'Flipbook', 'Page', 'Nom Complet', 'Email', 'Téléphone', 'Société', 'Type Formulaire', 'Statut', 'Message'];
    const rows = list.map((l) => [
      new Date(l.createdAt).toLocaleDateString('fr-FR') + ' ' + new Date(l.createdAt).toLocaleTimeString('fr-FR'),
      `"${l.flipbookTitle.replace(/"/g, '""')}"`,
      l.pageNumber,
      `"${l.fullName.replace(/"/g, '""')}"`,
      `"${l.email}"`,
      `"${l.phone || ''}"`,
      `"${(l.company || '').replace(/"/g, '""')}"`,
      l.formType,
      l.status,
      `"${(l.message || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public getLeadGateSettings(flipbookId: string): LeadGateSettings {
    // Par défaut, débloqué ou verrou à la page 3
    return {
      enabled: true,
      gatePageNumber: 3,
      requiredFields: 'full_contact',
      title: 'Accédez à l’intégralité de la publication',
      subtitle: 'Complétez ce court formulaire pour poursuivre la lecture et recevoir la brochure haute résolution par email.',
      allowSkip: false,
    };
  }
}

export const leadService = new LeadService();
