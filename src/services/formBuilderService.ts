/**
 * Phase 32: In-Page Interactive Form Builder & Lead Sheets
 * Formulaires dynamiques intégrés directement sur n'importe quelle page du flipbook
 * (demande de devis personnalisée, calculatrice de tarif, contact express).
 */

import { InPageFormConfig, InPageFormSubmission } from '../types/saas';

class FormBuilderService {
  private forms: InPageFormConfig[] = [
    {
      id: 'form-hotel-devis',
      flipbookId: 'fbk-hotel-palace-nice',
      pageNumber: 2,
      title: 'Devis Express & Disponibilité Suite',
      subtitle: 'Obtenez une proposition tarifaire sur-mesure en 2 minutes',
      submitButtonText: 'Demander un devis VIP',
      successMessage: 'Votre demande a été transmise au service réservation. Un concierge vous contactera sous 30 minutes.',
      enablePriceCalculation: true,
      priceFormula: 'nights * 1200 + guests * 150',
      fields: [
        {
          id: 'fullName',
          label: 'Nom et Prénom',
          type: 'TEXT',
          placeholder: 'ex: Claire de Saint-Germain',
          required: true,
        },
        {
          id: 'email',
          label: 'Adresse Email',
          type: 'EMAIL',
          placeholder: 'votre.email@exemple.com',
          required: true,
        },
        {
          id: 'phone',
          label: 'Téléphone (WhatsApp)',
          type: 'PHONE',
          placeholder: '+33 6 12 34 56 78',
          required: false,
        },
        {
          id: 'suiteType',
          label: 'Catégorie de Suite',
          type: 'SELECT',
          required: true,
          options: ['Suite Deluxe Mer', 'Suite Présidentielle', 'Penthouse Panoramique'],
          defaultValue: 'Suite Deluxe Mer',
        },
        {
          id: 'nights',
          label: 'Nombre de Nuitées',
          type: 'RANGE_SLIDER',
          required: true,
          defaultValue: 3,
          unit: 'nuits',
        },
        {
          id: 'notes',
          label: 'Demandes particulières & Accueil personnalisé',
          type: 'TEXTAREA',
          placeholder: 'Allergies, champagne en chambre, transfert hélicoptère...',
          required: false,
        },
      ],
    },
  ];

  private submissions: InPageFormSubmission[] = [
    {
      id: 'sub-1',
      formId: 'form-hotel-devis',
      flipbookId: 'fbk-hotel-palace-nice',
      pageNumber: 2,
      values: {
        fullName: 'Baron Philippe de Rothschild',
        email: 'philippe.rothschild@luxury-estate.fr',
        phone: '+33 6 98 76 54 32',
        suiteType: 'Suite Présidentielle',
        nights: 4,
        notes: 'Transfert aéroport Nice Côte d\'Azur en berline requis.',
      },
      submittedAt: Date.now() - 2 * 3600000,
      calculatedQuoteTotal: 5400,
    },
  ];

  public getForms(flipbookId: string, pageNumber?: number): InPageFormConfig[] {
    return this.forms.filter(
      (f) => f.flipbookId === flipbookId && (pageNumber === undefined || f.pageNumber === pageNumber)
    );
  }

  public getFormById(id: string): InPageFormConfig | undefined {
    return this.forms.find((f) => f.id === id);
  }

  public submitForm(submission: Omit<InPageFormSubmission, 'id' | 'submittedAt'>): InPageFormSubmission {
    const newSub: InPageFormSubmission = {
      ...submission,
      id: `sub-${Date.now()}`,
      submittedAt: Date.now(),
    };
    this.submissions.unshift(newSub);
    return newSub;
  }

  public getSubmissions(formId?: string): InPageFormSubmission[] {
    if (!formId) return this.submissions;
    return this.submissions.filter((s) => s.formId === formId);
  }
}

export const formBuilderService = new FormBuilderService();
