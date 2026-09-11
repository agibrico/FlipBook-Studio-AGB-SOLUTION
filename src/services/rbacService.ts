/**
 * PHASE 24: Collaboration d'Équipe & Rôles RBAC Avancés
 * Gestion des collaborateurs d'une organisation, permissions granulaires et audit trail.
 */

import { TeamMemberRecord } from '../types/saas';

class RbacService {
  private members: TeamMemberRecord[] = [
    {
      id: 'usr-admin-1',
      organizationId: 'org-luxury-hospitality',
      email: 'alexandre.directeur@palace.com',
      fullName: 'Alexandre Laurent',
      role: 'SUPER_ADMIN',
      permissions: {
        canEditHotspots: true,
        canPublish: true,
        canViewLeads: true,
        canManageBilling: true,
        canExportOfflineZip: true,
      },
      lastActiveAt: Date.now() - 1000 * 60 * 12,
      createdAt: Date.now() - 1000 * 3600 * 24 * 30,
    },
    {
      id: 'usr-designer-2',
      organizationId: 'org-luxury-hospitality',
      email: 'claire.design@palace.com',
      fullName: 'Claire Fontaine',
      role: 'OPERATOR',
      permissions: {
        canEditHotspots: true,
        canPublish: false,
        canViewLeads: false,
        canManageBilling: false,
        canExportOfflineZip: true,
      },
      lastActiveAt: Date.now() - 1000 * 3600 * 2,
      createdAt: Date.now() - 1000 * 3600 * 24 * 15,
    },
    {
      id: 'usr-commercial-3',
      organizationId: 'org-luxury-hospitality',
      email: 'julien.sales@palace.com',
      fullName: 'Julien Mercier',
      role: 'REVIEWER',
      permissions: {
        canEditHotspots: false,
        canPublish: false,
        canViewLeads: true,
        canManageBilling: false,
        canExportOfflineZip: false,
      },
      lastActiveAt: Date.now() - 1000 * 3600 * 8,
      createdAt: Date.now() - 1000 * 3600 * 24 * 10,
    },
  ];

  private listeners: (() => void)[] = [];

  constructor() {
    try {
      const saved = localStorage.getItem('flipbook_team_members');
      if (saved) {
        this.members = JSON.parse(saved);
      }
    } catch {
      // Ignore
    }
  }

  private notify() {
    try {
      localStorage.setItem('flipbook_team_members', JSON.stringify(this.members));
    } catch {
      // Ignore
    }
    this.listeners.forEach((l) => l());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getMembers(orgId: string): TeamMemberRecord[] {
    return this.members.filter((m) => m.organizationId === orgId || !m.organizationId);
  }

  public inviteMember(
    orgId: string,
    fullName: string,
    email: string,
    role: TeamMemberRecord['role']
  ): TeamMemberRecord {
    const newMember: TeamMemberRecord = {
      id: `usr-${Date.now()}`,
      organizationId: orgId,
      fullName,
      email,
      role,
      permissions: {
        canEditHotspots: role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'OPERATOR',
        canPublish: role === 'SUPER_ADMIN' || role === 'ADMIN',
        canViewLeads: role !== 'OPERATOR',
        canManageBilling: role === 'SUPER_ADMIN',
        canExportOfflineZip: role !== 'CLIENT',
      },
      createdAt: Date.now(),
    };
    this.members.push(newMember);
    this.notify();
    return newMember;
  }

  public updatePermissions(
    memberId: string,
    permissions: Partial<TeamMemberRecord['permissions']>
  ) {
    const member = this.members.find((m) => m.id === memberId);
    if (member) {
      member.permissions = { ...member.permissions, ...permissions };
      this.notify();
    }
  }

  public removeMember(memberId: string) {
    this.members = this.members.filter((m) => m.id !== memberId);
    this.notify();
  }
}

export const rbacService = new RbacService();
