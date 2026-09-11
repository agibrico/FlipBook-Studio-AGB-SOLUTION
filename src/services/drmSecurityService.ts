/**
 * Phase 35: Digital Rights Management (DRM) & Geo-fencing Service
 * Gouvernance stricte des catalogues confidentiels : expiration programmée,
 * déchiquetage numérique, contrôle territorial IP et protection anti-capture.
 */

import { DrmGovernancePolicy } from '../types/saas';

class DrmSecurityService {
  private policies: Map<string, DrmGovernancePolicy> = new Map();

  constructor() {
    // Initialise une politique par défaut pour le catalogue d'exemple
    this.policies.set('fbk-hotel-palace-nice', {
      flipbookId: 'fbk-hotel-palace-nice',
      isDrmEnabled: true,
      expiresAt: Date.now() + 14 * 86400000, // Expire dans 14 jours
      autoRevokeAfterMinutesFromFirstOpen: 60,
      allowedCountryCodes: ['FR', 'MC', 'BE', 'CH', 'LU', 'GB', 'US'],
      blockedCountryCodes: [],
      preventScreenshots: true,
      blurOnWindowBlur: true,
      blockPrinting: true,
      disableDevToolsInspect: false,
      screenDynamicFingerprint: true,
      accessKeyMaxUses: 1000,
      totalAccessesSoFar: 142,
    });
  }

  public getPolicy(flipbookId: string): DrmGovernancePolicy {
    return (
      this.policies.get(flipbookId) || {
        flipbookId,
        isDrmEnabled: false,
        expiresAt: null,
        allowedCountryCodes: [],
        blockedCountryCodes: [],
        preventScreenshots: false,
        blurOnWindowBlur: false,
        blockPrinting: false,
        disableDevToolsInspect: false,
        screenDynamicFingerprint: false,
        totalAccessesSoFar: 0,
      }
    );
  }

  public updatePolicy(policy: DrmGovernancePolicy): DrmGovernancePolicy {
    this.policies.set(policy.flipbookId, { ...policy });
    return policy;
  }

  /**
   * Vérifie si le document est encore valide ou expiré
   */
  public isDocumentExpired(flipbookId: string): boolean {
    const policy = this.getPolicy(flipbookId);
    if (!policy.isDrmEnabled || !policy.expiresAt) return false;
    return Date.now() > policy.expiresAt;
  }

  /**
   * Vérifie si le pays de l'utilisateur est autorisé
   */
  public isCountryAllowed(flipbookId: string, countryCode = 'FR'): boolean {
    const policy = this.getPolicy(flipbookId);
    if (!policy.isDrmEnabled) return true;

    if (policy.blockedCountryCodes.includes(countryCode.toUpperCase())) {
      return false;
    }
    if (policy.allowedCountryCodes.length > 0 && !policy.allowedCountryCodes.includes(countryCode.toUpperCase())) {
      return false;
    }
    return true;
  }

  /**
   * Génère le watermark dynamique pour empreinte de sécurité (anti-leak)
   */
  public getDynamicFingerprintText(userEmail?: string): string {
    const now = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const identity = userEmail || 'LECTEUR-CONFIDENTIEL';
    return `${identity} • IP: 194.214.**.** • ${now} • DRM PROTECTED`;
  }
}

export const drmSecurityService = new DrmSecurityService();
