import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Organization,
  ClientEntity,
  FlipbookRecord,
  HotspotRecord,
  VideoAsset,
  ShareLinkRecord,
  FlipbookAnalyticsEvent,
  VideoAnalyticsEvent,
  AuditLogRecord,
} from '../types/saas';

// -------------------------------------------------------------
// ORGANIZATIONS
// -------------------------------------------------------------
export async function getOrganization(orgId: string): Promise<Organization | null> {
  try {
    const snap = await getDoc(doc(db, 'organizations', orgId));
    if (snap.exists()) {
      return snap.data() as Organization;
    }
  } catch (err) {
    console.warn('Erreur Firestore getOrganization:', err);
  }
  return null;
}

export async function saveOrganization(org: Organization): Promise<void> {
  await setDoc(doc(db, 'organizations', org.id), org, { merge: true });
}

// -------------------------------------------------------------
// CLIENTS
// -------------------------------------------------------------
export async function getClients(orgId: string): Promise<ClientEntity[]> {
  try {
    const q = query(collection(db, 'clients'), where('organizationId', '==', orgId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ClientEntity);
  } catch (err) {
    console.warn('Erreur Firestore getClients:', err);
    return [];
  }
}

export async function createClient(client: ClientEntity): Promise<void> {
  await setDoc(doc(db, 'clients', client.id), client);
}

// -------------------------------------------------------------
// FLIPBOOKS
// -------------------------------------------------------------
export async function getFlipbooks(orgId: string, clientId?: string): Promise<FlipbookRecord[]> {
  try {
    let q = query(collection(db, 'flipbooks'), where('organizationId', '==', orgId));
    if (clientId) {
      q = query(q, where('clientId', '==', clientId));
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as FlipbookRecord);
  } catch (err) {
    console.warn('Erreur Firestore getFlipbooks:', err);
    return [];
  }
}

export async function getFlipbookBySlug(slug: string): Promise<FlipbookRecord | null> {
  try {
    const q = query(collection(db, 'flipbooks'), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as FlipbookRecord;
    }
  } catch (err) {
    console.warn('Erreur Firestore getFlipbookBySlug:', err);
  }
  return null;
}

export async function saveFlipbook(flipbook: FlipbookRecord): Promise<void> {
  await setDoc(doc(db, 'flipbooks', flipbook.id), flipbook, { merge: true });
}

export async function updateFlipbookPermissions(
  flipbookId: string,
  permissions: Partial<FlipbookRecord['permissions']>
): Promise<void> {
  await updateDoc(doc(db, 'flipbooks', flipbookId), {
    permissions: permissions,
    updatedAt: Date.now(),
  });
}

// -------------------------------------------------------------
// HOTSPOTS
// -------------------------------------------------------------
export async function getHotspots(flipbookId: string): Promise<HotspotRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'flipbooks', flipbookId, 'hotspots'));
    return snap.docs.map((d) => d.data() as HotspotRecord);
  } catch (err) {
    console.warn('Erreur Firestore getHotspots:', err);
    return [];
  }
}

export async function saveHotspot(hotspot: HotspotRecord): Promise<void> {
  await setDoc(doc(db, 'flipbooks', hotspot.flipbookId, 'hotspots', hotspot.id), hotspot);
}

// -------------------------------------------------------------
// VIDEO ASSETS
// -------------------------------------------------------------
export async function saveVideoAsset(asset: VideoAsset): Promise<void> {
  await setDoc(doc(db, 'videoAssets', asset.id), asset);
}

export async function getVideoAssetByToken(token: string): Promise<VideoAsset | null> {
  try {
    const q = query(collection(db, 'videoAssets'), where('publicToken', '==', token), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as VideoAsset;
    }
  } catch (err) {
    console.warn('Erreur Firestore getVideoAssetByToken:', err);
  }
  return null;
}

// -------------------------------------------------------------
// SHARE LINKS
// -------------------------------------------------------------
export async function saveShareLink(link: ShareLinkRecord): Promise<void> {
  await setDoc(doc(db, 'shareLinks', link.id), link);
}

export async function getShareLink(token: string): Promise<ShareLinkRecord | null> {
  try {
    const q = query(collection(db, 'shareLinks'), where('token', '==', token), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as ShareLinkRecord;
    }
  } catch (err) {
    console.warn('Erreur Firestore getShareLink:', err);
  }
  return null;
}

// -------------------------------------------------------------
// ANALYTICS & AUDIT LOGS
// -------------------------------------------------------------
export async function logAnalyticsEvent(event: FlipbookAnalyticsEvent): Promise<void> {
  try {
    await setDoc(doc(db, 'analyticsEvents', event.id), event);
  } catch {
    // Fail silently for background telemetry
  }
}

export async function logVideoEvent(event: VideoAnalyticsEvent): Promise<void> {
  try {
    await setDoc(doc(db, 'analyticsEvents', event.id), event);
  } catch {
    // Fail silently for background telemetry
  }
}

export async function logAuditAction(log: AuditLogRecord): Promise<void> {
  try {
    await setDoc(doc(db, 'auditLogs', log.id), log);
  } catch (err) {
    console.warn('Erreur logAuditAction:', err);
  }
}
