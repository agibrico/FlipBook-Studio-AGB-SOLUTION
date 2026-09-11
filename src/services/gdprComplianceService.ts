/**
 * Phase 41: Enterprise GDPR / RGPD & Privacy Center Service
 * Gestionnaire de consentement, purge des données et droits des personnes.
 */

import { GdprConsentSettings, GdprDataSubjectRequest } from '../types/saas';

class GdprComplianceService {
  private consentSettings: GdprConsentSettings = {
    cookieBannerEnabled: true,
    allowEssential: true,
    allowAnalyticsTelemetry: true,
    allowMarketingRetargeting: false,
    allowHeatmapTracking: true,
    retentionPeriodDays: 90,
    anonymizeIpAddresses: true,
    privacyPolicyUrl: 'https://flipbookstudio.pro/privacy',
    dpoContactEmail: 'dpo@flipbookstudio.pro',
  };

  private userConsent: {
    hasChosen: boolean;
    analytics: boolean;
    marketing: boolean;
    heatmaps: boolean;
    timestamp?: number;
  } = {
    hasChosen: false,
    analytics: true,
    marketing: false,
    heatmaps: true,
  };

  private requests: GdprDataSubjectRequest[] = [
    {
      id: 'req-gdpr-1',
      email: 'alexandre.v@consulting.fr',
      requestType: 'EXPORT_DATA',
      status: 'PROCESSED',
      requestedAt: Date.now() - 3 * 86400000,
      completedAt: Date.now() - 2 * 86400000,
    },
    {
      id: 'req-gdpr-2',
      email: 'sophie.bernard@lux.ch',
      requestType: 'DELETE_PURGE',
      status: 'PROCESSED',
      requestedAt: Date.now() - 1 * 86400000,
      completedAt: Date.now() - 12 * 3600000,
    },
  ];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('flipbook_gdpr_consent');
        if (saved) {
          this.userConsent = JSON.parse(saved);
        }
      } catch {
        // storage disabled
      }
    }
  }

  public getSettings(): GdprConsentSettings {
    return { ...this.consentSettings };
  }

  public updateSettings(settings: Partial<GdprConsentSettings>) {
    this.consentSettings = { ...this.consentSettings, ...settings };
  }

  public getUserConsent() {
    return { ...this.userConsent };
  }

  public saveUserConsent(analytics: boolean, marketing: boolean, heatmaps: boolean) {
    this.userConsent = {
      hasChosen: true,
      analytics,
      marketing,
      heatmaps,
      timestamp: Date.now(),
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('flipbook_gdpr_consent', JSON.stringify(this.userConsent));
      } catch {
        // ignore
      }
    }
  }

  public getRequests(): GdprDataSubjectRequest[] {
    return [...this.requests];
  }

  public submitSubjectRequest(email: string, requestType: 'EXPORT_DATA' | 'DELETE_PURGE' | 'RECTIFY'): GdprDataSubjectRequest {
    const req: GdprDataSubjectRequest = {
      id: `req-${Date.now()}`,
      email,
      requestType,
      status: 'PENDING',
      requestedAt: Date.now(),
    };
    this.requests.unshift(req);
    return req;
  }

  public processRequest(id: string) {
    const req = this.requests.find((r) => r.id === id);
    if (req) {
      req.status = 'PROCESSED';
      req.completedAt = Date.now();
    }
  }
}

export const gdprComplianceService = new GdprComplianceService();
