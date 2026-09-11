/**
 * Phase 36: Live Co-Browsing & Guided Sales Tour Service
 * Synchronisation temps réel entre l'agent commercial et le client.
 */

import { CoBrowsingSession } from '../types/saas';

type CoBrowsingListener = (session: CoBrowsingSession | null) => void;

class CoBrowsingService {
  private currentSession: CoBrowsingSession | null = null;
  private listeners: Set<CoBrowsingListener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('flipbook_cobrowsing_channel');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'SYNC_SESSION') {
          this.currentSession = event.data.session;
          this.notify();
        } else if (event.data?.type === 'PAGE_TURN' && this.currentSession) {
          this.currentSession.activePage = event.data.page;
          this.notify();
        } else if (event.data?.type === 'LASER_MOVE' && this.currentSession) {
          this.currentSession.laserCoordinates = event.data.coordinates;
          this.notify();
        }
      };
    }
  }

  public getSession(): CoBrowsingSession | null {
    return this.currentSession;
  }

  public subscribe(listener: CoBrowsingListener): () => void {
    this.listeners.add(listener);
    listener(this.currentSession);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.currentSession ? { ...this.currentSession } : null));
  }

  /**
   * Démarrer une session hôte (commercial / guide)
   */
  public startHostSession(flipbookId: string, hostName = 'Conseiller Commercial'): CoBrowsingSession {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    this.currentSession = {
      id: `cobs-${Date.now()}`,
      sessionCode: pin,
      flipbookId,
      hostName,
      hostRole: 'SALES_REP',
      activePage: 1,
      laserCoordinates: { x: 50, y: 50 },
      zoomLevel: 1,
      guestCount: 1,
      isLive: true,
      audioVoiceStatus: 'SPEAKING',
      notes: 'Visite guidée interactive du catalogue avec présentation des offres phares.',
      startedAt: Date.now(),
    };

    this.broadcastSession();
    this.notify();
    return this.currentSession;
  }

  /**
   * Rejoindre une session invitée avec le code PIN
   */
  public joinSession(sessionCode: string, guestName = 'Client Visiteur'): boolean {
    if (this.currentSession && this.currentSession.sessionCode === sessionCode) {
      this.currentSession.guestCount += 1;
      this.broadcastSession();
      this.notify();
      return true;
    }
    // Simulation session si code valide à 6 chiffres
    if (sessionCode.length === 6) {
      this.currentSession = {
        id: `cobs-guest-${Date.now()}`,
        sessionCode,
        flipbookId: 'fbk-hotel-palace-nice',
        hostName: 'Jean Dupont (Directeur Commercial)',
        hostRole: 'SALES_REP',
        activePage: 1,
        laserCoordinates: { x: 50, y: 50 },
        zoomLevel: 1,
        guestCount: 2,
        isLive: true,
        audioVoiceStatus: 'LISTENING',
        notes: `Connecté en tant que ${guestName}`,
        startedAt: Date.now(),
      };
      this.broadcastSession();
      this.notify();
      return true;
    }
    return false;
  }

  public updatePage(page: number) {
    if (!this.currentSession) return;
    this.currentSession.activePage = page;
    this.broadcastChannel?.postMessage({ type: 'PAGE_TURN', page });
    this.notify();
  }

  public updateLaser(coords: { x: number; y: number }) {
    if (!this.currentSession) return;
    this.currentSession.laserCoordinates = coords;
    this.broadcastChannel?.postMessage({ type: 'LASER_MOVE', coordinates: coords });
    this.notify();
  }

  public toggleAudio() {
    if (!this.currentSession) return;
    this.currentSession.audioVoiceStatus =
      this.currentSession.audioVoiceStatus === 'SPEAKING' ? 'MUTED' : 'SPEAKING';
    this.broadcastSession();
    this.notify();
  }

  public endSession() {
    this.currentSession = null;
    this.broadcastChannel?.postMessage({ type: 'SYNC_SESSION', session: null });
    this.notify();
  }

  private broadcastSession() {
    this.broadcastChannel?.postMessage({ type: 'SYNC_SESSION', session: this.currentSession });
  }
}

export const coBrowsingService = new CoBrowsingService();
