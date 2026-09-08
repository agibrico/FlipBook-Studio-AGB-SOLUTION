import {
  Organization,
  ClientEntity,
  UserProfile,
  Membership,
  UserRole,
  FlipbookRecord,
} from '../types/saas';
import { db } from './firebase';
import { collection, doc, getDocs, setDoc, query, where } from 'firebase/firestore';

// Default initial seeded Organizations
export const SEED_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-azur-group',
    name: 'Groupe Hôtelier Azur & Resorts',
    slug: 'azur-resorts',
    planId: 'BUSINESS',
    maxStorageBytes: 50 * 1024 * 1024 * 1024, // 50 GB
    maxVideos: 100,
    maxFlipbooks: 50,
    usedStorageBytes: 2.4 * 1024 * 1024 * 1024,
    whiteLabelEnabled: true,
    primaryColor: '#4f46e5',
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now(),
  },
  {
    id: 'org-studio-media',
    name: 'Studio Numérique Horizon',
    slug: 'studio-horizon',
    planId: 'PRO',
    maxStorageBytes: 20 * 1024 * 1024 * 1024,
    maxVideos: 30,
    maxFlipbooks: 20,
    usedStorageBytes: 850 * 1024 * 1024,
    whiteLabelEnabled: false,
    primaryColor: '#059669',
    createdAt: Date.now() - 15 * 86400000,
    updatedAt: Date.now(),
  },
];

// Default initial seeded Clients for Organization 1
export const SEED_CLIENTS: ClientEntity[] = [
  {
    id: 'client-hotel-azur',
    organizationId: 'org-azur-group',
    name: 'Marc Delacroix (Directeur)',
    companyName: 'Hôtel Azur Palace 5★',
    email: 'direction@hotel-azur-palace.fr',
    phone: '+33 4 93 00 11 22',
    notes: 'Brochure de saison & Menus gastronomiques avec vidéos des suites Deluxe',
    activeFlipbookIds: ['sample-hotel-azur', 'sample-vibe-mag'],
    createdAt: Date.now() - 20 * 86400000,
    updatedAt: Date.now(),
  },
  {
    id: 'client-bistrot-etoile',
    organizationId: 'org-azur-group',
    name: 'Chef Hélène Rostang',
    companyName: 'Le Grand Bistrot Étoilé',
    email: 'contact@bistrot-etoile.com',
    phone: '+33 1 42 68 90 00',
    notes: 'Carte des vins & Menu dégustation saisonnier',
    activeFlipbookIds: ['sample-word-annual'],
    createdAt: Date.now() - 10 * 86400000,
    updatedAt: Date.now(),
  },
];

// Seed initial Flipbook Records corresponding to the client documents
export const SEED_FLIPBOOKS: FlipbookRecord[] = [
  {
    id: 'sample-hotel-azur',
    organizationId: 'org-azur-group',
    clientId: 'client-hotel-azur',
    title: 'Catalogue & Suites — Hôtel Azur Palace 5★',
    slug: 'catalogue-hotel-azur-palace',
    description: 'Présentation des chambres deluxe avec visite vidéo immersive et offres bien-être.',
    category: 'Hôtellerie de Luxe',
    sourceDocumentId: 'doc-hotel-azur-pdf',
    status: 'READY',
    visibility: 'PUBLIC',
    totalPages: 8,
    publicToken: 'f-azur-2026-vip',
    viewCount: 1420,
    language: 'fr',
    coverUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
    createdBy: 'admin-1',
    createdAt: Date.now() - 12 * 86400000,
    updatedAt: Date.now(),
    permissions: {
      allowDownload: true,
      allowPrint: true,
      allowShare: true,
      allowIndexing: true,
      passwordProtected: false,
      expiresAt: null,
      isActive: true,
    },
  },
  {
    id: 'sample-vibe-mag',
    organizationId: 'org-azur-group',
    clientId: 'client-hotel-azur',
    title: 'VIBE MAG — Le Futur du Code & Design',
    slug: 'vibe-mag-edition-tactile',
    description: 'Magazine éditorial interactif avec médias dynamiques, lecture audio et son haptique.',
    category: 'Presse & Média',
    sourceDocumentId: 'doc-vibe-mag-pdf',
    status: 'READY',
    visibility: 'PUBLIC',
    totalPages: 8,
    publicToken: 'f-vibe-mag-01',
    viewCount: 3890,
    language: 'fr',
    createdBy: 'admin-1',
    createdAt: Date.now() - 25 * 86400000,
    updatedAt: Date.now(),
    permissions: {
      allowDownload: true,
      allowPrint: true,
      allowShare: true,
      allowIndexing: true,
      passwordProtected: false,
      expiresAt: null,
      isActive: true,
    },
  },
  {
    id: 'sample-word-annual',
    organizationId: 'org-azur-group',
    clientId: 'client-bistrot-etoile',
    title: 'Rapport Annuel & Menus 2026 — Le Grand Bistrot',
    slug: 'menu-et-rapport-grand-bistrot',
    description: 'Document officiel avec typographie pagination automatique et synthèse des millésimes.',
    category: 'Restauration',
    sourceDocumentId: 'doc-bistrot-docx',
    status: 'READY',
    visibility: 'PASSWORD_PROTECTED',
    totalPages: 7,
    publicToken: 'f-bistrot-confidentiel',
    viewCount: 650,
    language: 'fr',
    createdBy: 'admin-1',
    createdAt: Date.now() - 8 * 86400000,
    updatedAt: Date.now(),
    permissions: {
      allowDownload: false,
      allowPrint: true,
      allowShare: true,
      allowIndexing: false,
      passwordProtected: true,
      passwordHash: 'azur2026', // Pour démo
      expiresAt: Date.now() + 180 * 86400000,
      isActive: true,
    },
  },
];

class TenantService {
  private organizations: Map<string, Organization> = new Map();
  private clients: Map<string, ClientEntity> = new Map();
  private flipbooks: Map<string, FlipbookRecord> = new Map();
  private activeOrgId: string = 'org-azur-group';
  private isInitialized = false;

  constructor() {
    this.initLocalMemory();
  }

  private initLocalMemory() {
    SEED_ORGANIZATIONS.forEach((o) => this.organizations.set(o.id, { ...o }));
    SEED_CLIENTS.forEach((c) => this.clients.set(c.id, { ...c }));
    SEED_FLIPBOOKS.forEach((f) => this.flipbooks.set(f.id, { ...f }));
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    try {
      // Synchronize with Firestore if available
      const orgsSnap = await getDocs(collection(db, 'organizations'));
      if (!orgsSnap.empty) {
        orgsSnap.forEach((docSnap) => {
          const org = docSnap.data() as Organization;
          this.organizations.set(org.id, org);
        });
      } else {
        // Seed default organizations to Firestore
        for (const org of SEED_ORGANIZATIONS) {
          await setDoc(doc(db, 'organizations', org.id), org);
        }
      }

      // Seed default clients to Firestore
      const clientsSnap = await getDocs(collection(db, 'clients'));
      if (!clientsSnap.empty) {
        clientsSnap.forEach((d) => {
          const c = d.data() as ClientEntity;
          this.clients.set(c.id, c);
        });
      } else {
        for (const client of SEED_CLIENTS) {
          await setDoc(doc(db, 'clients', client.id), client);
        }
      }

      // Seed flipbooks
      const fbSnap = await getDocs(collection(db, 'flipbooks'));
      if (!fbSnap.empty) {
        fbSnap.forEach((d) => {
          const f = d.data() as FlipbookRecord;
          this.flipbooks.set(f.id, f);
        });
      } else {
        for (const fb of SEED_FLIPBOOKS) {
          await setDoc(doc(db, 'flipbooks', fb.id), fb);
        }
      }

      this.isInitialized = true;
    } catch (e) {
      console.warn('TenantService Firestore sync fallback to memory:', e);
      this.isInitialized = true;
    }
  }

  public getOrganizations(): Organization[] {
    return Array.from(this.organizations.values());
  }

  public getActiveOrganization(): Organization {
    const org = this.organizations.get(this.activeOrgId);
    return org || SEED_ORGANIZATIONS[0];
  }

  public setActiveOrganization(orgId: string): void {
    if (this.organizations.has(orgId)) {
      this.activeOrgId = orgId;
    }
  }

  public async createOrganization(data: Omit<Organization, 'id' | 'createdAt' | 'updatedAt' | 'usedStorageBytes'>): Promise<Organization> {
    const id = `org-${Date.now()}`;
    const newOrg: Organization = {
      ...data,
      id,
      usedStorageBytes: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.organizations.set(id, newOrg);
    this.activeOrgId = id;
    try {
      await setDoc(doc(db, 'organizations', id), newOrg);
    } catch (e) {
      console.warn('Firestore write failed:', e);
    }
    return newOrg;
  }

  public getClients(orgId: string): ClientEntity[] {
    return Array.from(this.clients.values()).filter((c) => c.organizationId === orgId);
  }

  public getClientById(clientId: string): ClientEntity | undefined {
    return this.clients.get(clientId);
  }

  public async createClient(orgId: string, data: { name: string; companyName?: string; email: string; phone?: string; notes?: string }): Promise<ClientEntity> {
    const id = `client-${Date.now()}`;
    const newClient: ClientEntity = {
      id,
      organizationId: orgId,
      name: data.name,
      companyName: data.companyName || '',
      email: data.email,
      phone: data.phone || '',
      notes: data.notes || '',
      activeFlipbookIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.clients.set(id, newClient);
    try {
      await setDoc(doc(db, 'clients', id), newClient);
    } catch (e) {
      console.warn('Firestore write failed:', e);
    }
    return newClient;
  }

  public getFlipbooksForOrg(orgId: string): FlipbookRecord[] {
    return Array.from(this.flipbooks.values()).filter((f) => f.organizationId === orgId);
  }

  public getFlipbooksForClient(orgId: string, clientId: string): FlipbookRecord[] {
    return Array.from(this.flipbooks.values()).filter(
      (f) => f.organizationId === orgId && f.clientId === clientId
    );
  }

  public async assignFlipbookToClient(flipbookId: string, clientId: string): Promise<void> {
    const fb = this.flipbooks.get(flipbookId);
    if (fb) {
      fb.clientId = clientId;
      fb.updatedAt = Date.now();
      this.flipbooks.set(flipbookId, fb);

      const client = this.clients.get(clientId);
      if (client && !client.activeFlipbookIds.includes(flipbookId)) {
        client.activeFlipbookIds.push(flipbookId);
        client.updatedAt = Date.now();
        this.clients.set(clientId, client);
      }

      try {
        await setDoc(doc(db, 'flipbooks', flipbookId), fb, { merge: true });
        if (client) {
          await setDoc(doc(db, 'clients', clientId), client, { merge: true });
        }
      } catch (e) {
        console.warn('Firestore assign failed:', e);
      }
    }
  }

  public async updateFlipbookPermissions(
    flipbookId: string,
    permissions: Partial<FlipbookRecord['permissions']>
  ): Promise<void> {
    const fb = this.flipbooks.get(flipbookId);
    if (fb) {
      fb.permissions = {
        ...fb.permissions,
        ...permissions,
      };
      fb.updatedAt = Date.now();
      this.flipbooks.set(flipbookId, fb);
      try {
        await setDoc(doc(db, 'flipbooks', flipbookId), fb, { merge: true });
      } catch (e) {
        console.warn('Firestore update permissions failed:', e);
      }
    }
  }

  public async createFlipbook(data: Partial<FlipbookRecord> & { organizationId: string; title: string; clientId: string }): Promise<FlipbookRecord> {
    const id = data.id || `fb-${Date.now()}`;
    const newFb: FlipbookRecord = {
      id,
      organizationId: data.organizationId,
      clientId: data.clientId,
      title: data.title,
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: data.description || '',
      category: data.category || 'General',
      sourceDocumentId: data.sourceDocumentId || `doc-${Date.now()}`,
      status: data.status || 'READY',
      visibility: data.visibility || 'PUBLIC',
      totalPages: data.totalPages || 1,
      coverUrl: data.coverUrl,
      publicToken: data.publicToken || `tok-${Date.now()}`,
      viewCount: data.viewCount || 0,
      language: data.language || 'fr',
      createdBy: data.createdBy || 'operator',
      permissions: data.permissions || {
        allowDownload: true,
        allowPrint: true,
        allowShare: true,
        allowIndexing: true,
        passwordProtected: false,
        isActive: true,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.flipbooks.set(id, newFb);

    // Also associate with client
    const client = this.clients.get(data.clientId);
    if (client && !client.activeFlipbookIds.includes(id)) {
      client.activeFlipbookIds.push(id);
      this.clients.set(data.clientId, client);
    }

    try {
      await setDoc(doc(db, 'flipbooks', id), newFb);
    } catch (e) {
      console.warn('Firestore createFlipbook failed:', e);
    }
    return newFb;
  }

  public async updateFlipbook(id: string, patch: Partial<FlipbookRecord>): Promise<FlipbookRecord | undefined> {
    const fb = this.flipbooks.get(id);
    if (!fb) return undefined;

    const updated = {
      ...fb,
      ...patch,
      updatedAt: Date.now(),
    };
    this.flipbooks.set(id, updated);

    try {
      await setDoc(doc(db, 'flipbooks', id), updated, { merge: true });
    } catch (e) {
      console.warn('Firestore updateFlipbook failed:', e);
    }
    return updated;
  }
}

export const tenantService = new TenantService();
