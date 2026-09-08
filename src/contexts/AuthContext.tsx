import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Organization, UserRole, ClientEntity } from '../types/saas';
import { tenantService, SEED_ORGANIZATIONS, SEED_CLIENTS } from '../services/tenantService';

interface AuthContextType {
  user: UserProfile;
  role: UserRole;
  activeOrg: Organization;
  activeClient: ClientEntity | null;
  organizations: Organization[];
  clients: ClientEntity[];
  switchRole: (newRole: UserRole, clientId?: string) => void;
  switchOrganization: (orgId: string) => void;
  createClient: (data: { name: string; companyName?: string; email: string; phone?: string; notes?: string }) => Promise<ClientEntity>;
  refreshTenantData: () => void;
}

const defaultUser: UserProfile = {
  id: 'usr-admin-1',
  email: 'admin@hotel-azur-group.com',
  displayName: 'Alexandre Laurent (Directeur Général)',
  systemRole: 'STANDARD_USER',
  createdAt: Date.now() - 30 * 86400000,
  updatedAt: Date.now(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [activeOrg, setActiveOrg] = useState<Organization>(tenantService.getActiveOrganization());
  const [activeClient, setActiveClient] = useState<ClientEntity | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>(tenantService.getOrganizations());
  const [clients, setClients] = useState<ClientEntity[]>(tenantService.getClients(activeOrg.id));

  // Initialize service & Firestore data
  useEffect(() => {
    tenantService.initialize().then(() => {
      refreshTenantData();
    });
  }, []);

  const refreshTenantData = () => {
    const orgs = tenantService.getOrganizations();
    setOrganizations(orgs);
    const currOrg = tenantService.getActiveOrganization();
    setActiveOrg(currOrg);
    const cls = tenantService.getClients(currOrg.id);
    setClients(cls);
  };

  const switchRole = (newRole: UserRole, clientId?: string) => {
    setRole(newRole);
    if (newRole === 'CLIENT') {
      const targetClient = clientId
        ? tenantService.getClientById(clientId)
        : clients[0] || SEED_CLIENTS[0];
      setActiveClient(targetClient || null);
      setUser({
        id: `usr-client-${targetClient?.id || 'demo'}`,
        email: targetClient?.email || 'client@hotel-azur.fr',
        displayName: targetClient?.name || 'Client Propriétaire',
        systemRole: 'STANDARD_USER',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else if (newRole === 'SUPER_ADMIN') {
      setActiveClient(null);
      setUser({
        id: 'usr-super-admin',
        email: 'superadmin@flipbook-saas.cloud',
        displayName: 'Super Admin Plateforme',
        systemRole: 'SUPER_ADMIN',
        createdAt: Date.now() - 100 * 86400000,
        updatedAt: Date.now(),
      });
    } else if (newRole === 'OPERATOR') {
      setActiveClient(null);
      setUser({
        id: 'usr-operator-1',
        email: 'operateur@hotel-azur-group.com',
        displayName: 'Sophie Martin (Opératrice PAO)',
        systemRole: 'STANDARD_USER',
        createdAt: Date.now() - 10 * 86400000,
        updatedAt: Date.now(),
      });
    } else {
      // ADMIN
      setActiveClient(null);
      setUser(defaultUser);
    }
  };

  const switchOrganization = (orgId: string) => {
    tenantService.setActiveOrganization(orgId);
    const org = tenantService.getActiveOrganization();
    setActiveOrg(org);
    const cls = tenantService.getClients(org.id);
    setClients(cls);
    if (role === 'CLIENT') {
      setActiveClient(cls[0] || null);
    }
  };

  const handleCreateClient = async (data: {
    name: string;
    companyName?: string;
    email: string;
    phone?: string;
    notes?: string;
  }) => {
    const newClient = await tenantService.createClient(activeOrg.id, data);
    refreshTenantData();
    return newClient;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        activeOrg,
        activeClient,
        organizations,
        clients,
        switchRole,
        switchOrganization,
        createClient: handleCreateClient,
        refreshTenantData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
