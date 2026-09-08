import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/saas';
import {
  ShieldCheck,
  Building2,
  UserCheck,
  Eye,
  ChevronDown,
  Sparkles,
  Layers,
  BookOpen,
  LayoutDashboard,
  ExternalLink,
} from 'lucide-react';

interface RoleSwitcherBarProps {
  currentAppView: 'reader' | 'admin' | 'client';
  onChangeAppView: (view: 'reader' | 'admin' | 'client') => void;
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({
  currentAppView,
  onChangeAppView,
}) => {
  const {
    role,
    user,
    activeOrg,
    activeClient,
    organizations,
    clients,
    switchRole,
    switchOrganization,
  } = useAuth();

  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'SUPER_ADMIN':
        return { label: 'Super Admin', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'ADMIN':
        return { label: 'Administrateur', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'OPERATOR':
        return { label: 'Opérateur PAO', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'CLIENT':
        return { label: 'Client Final', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    }
  };

  const badge = getRoleBadge(role);

  return (
    <div
      id="saas-role-switcher-bar"
      className="w-full bg-zinc-950 border-b border-zinc-800/80 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-300 select-none z-50 transition-all shadow-md"
    >
      {/* Left: Organization & Multi-Tenant Info */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 font-medium text-white px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">Tenant :</span>
          
          <div className="relative">
            <button
              id="tenant-dropdown-btn"
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className="flex items-center gap-1 text-white hover:text-indigo-300 transition-colors font-medium"
            >
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{activeOrg.name}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {isOrgDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-64 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl py-1 z-50 text-left">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-zinc-500 border-b border-zinc-800">
                  Changer d'Organisation SaaS
                </div>
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      switchOrganization(org.id);
                      setIsOrgDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-xs text-left flex items-center justify-between hover:bg-zinc-800 transition-colors ${
                      org.id === activeOrg.id ? 'bg-indigo-950/40 text-indigo-300 font-medium' : 'text-zinc-300'
                    }`}
                  >
                    <span className="truncate">{org.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {org.planId}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Plan {activeOrg.planId}
        </span>
      </div>

      {/* Center: View Mode Navigation tabs */}
      <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
        <button
          id="nav-view-reader"
          onClick={() => onChangeAppView('reader')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            currentAppView === 'reader'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Lecteur Flipbook</span>
        </button>

        {role !== 'CLIENT' && (
          <button
            id="nav-view-admin"
            onClick={() => onChangeAppView('admin')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              currentAppView === 'admin'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Studio Admin & Clients</span>
          </button>
        )}

        <button
          id="nav-view-client"
          onClick={() => {
            if (role !== 'CLIENT') {
              switchRole('CLIENT');
            }
            onChangeAppView('client');
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            currentAppView === 'client'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Espace Client</span>
        </button>
      </div>

      {/* Right: Persona / Role Switcher for Testing & Demo */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            id="role-dropdown-btn"
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] font-medium transition-all ${badge.bg}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{badge.label}</span>
            {role === 'CLIENT' && activeClient && (
              <span className="text-[10px] text-amber-200 truncate max-w-[90px]">
                ({activeClient.companyName})
              </span>
            )}
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-72 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl py-1 z-50 text-left">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-zinc-500 border-b border-zinc-800">
                Simuler un Rôle Utilisateur (Test & Démo)
              </div>
              
              <button
                onClick={() => {
                  switchRole('SUPER_ADMIN');
                  setIsRoleDropdownOpen(false);
                  onChangeAppView('admin');
                }}
                className={`w-full px-3 py-2 text-xs flex items-center gap-2 hover:bg-zinc-800 transition-colors ${
                  role === 'SUPER_ADMIN' ? 'bg-rose-950/40 text-rose-300 font-semibold' : 'text-zinc-300'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                <div className="flex-1">
                  <p className="leading-none">Super Administrateur</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Accès global multi-organisations & quotas</p>
                </div>
              </button>

              <button
                onClick={() => {
                  switchRole('ADMIN');
                  setIsRoleDropdownOpen(false);
                  onChangeAppView('admin');
                }}
                className={`w-full px-3 py-2 text-xs flex items-center gap-2 hover:bg-zinc-800 transition-colors ${
                  role === 'ADMIN' ? 'bg-indigo-950/40 text-indigo-300 font-semibold' : 'text-zinc-300'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                <div className="flex-1">
                  <p className="leading-none">Administrateur SaaS</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Création clients, import, édition, vidéo</p>
                </div>
              </button>

              <button
                onClick={() => {
                  switchRole('OPERATOR');
                  setIsRoleDropdownOpen(false);
                  onChangeAppView('admin');
                }}
                className={`w-full px-3 py-2 text-xs flex items-center gap-2 hover:bg-zinc-800 transition-colors ${
                  role === 'OPERATOR' ? 'bg-emerald-950/40 text-emerald-300 font-semibold' : 'text-zinc-300'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <div className="flex-1">
                  <p className="leading-none">Opérateur PAO</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Conception flipbook, vidéos & hotspots</p>
                </div>
              </button>

              <div className="px-3 py-1 text-[10px] uppercase font-bold text-zinc-500 border-t border-zinc-800 mt-1">
                Espace Client Cloisonné (Rôle Client)
              </div>

              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    switchRole('CLIENT', c.id);
                    setIsRoleDropdownOpen(false);
                    onChangeAppView('client');
                  }}
                  className={`w-full px-3 py-2 text-xs flex items-center gap-2 hover:bg-zinc-800 transition-colors ${
                    role === 'CLIENT' && activeClient?.id === c.id
                      ? 'bg-amber-950/40 text-amber-300 font-semibold'
                      : 'text-zinc-300'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <div className="flex-1 text-left">
                    <p className="leading-none">{c.companyName || c.name}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{c.activeFlipbookIds.length} document(s) assigné(s)</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
