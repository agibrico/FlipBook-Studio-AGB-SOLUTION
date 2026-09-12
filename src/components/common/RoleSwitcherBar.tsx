import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUiTheme } from '../../contexts/UiThemeContext';
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
  const { isDark } = useUiTheme();

  return (
    <div
      id="saas-role-switcher-bar"
      className={`w-full px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs select-none z-50 transition-colors shadow-xs ${
        isDark
          ? 'bg-zinc-950 border-b border-zinc-800/80 text-zinc-300'
          : 'bg-white/95 border-b border-zinc-200 text-zinc-700'
      }`}
    >
      {/* Left: Organization & Multi-Tenant Info */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1.5 font-medium px-2 py-1 rounded border ${
          isDark
            ? 'text-white bg-zinc-900 border-zinc-800'
            : 'text-zinc-900 bg-zinc-100 border-zinc-200'
        }`}>
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className={`text-[11px] uppercase tracking-wider font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Tenant :</span>
          
          <div className="relative">
            <button
              id="tenant-dropdown-btn"
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className={`flex items-center gap-1 transition-colors font-medium ${
                isDark ? 'text-white hover:text-indigo-300' : 'text-zinc-900 hover:text-indigo-600'
              }`}
            >
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{activeOrg.name}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {isOrgDropdownOpen && (
              <div className={`absolute left-0 mt-1.5 w-64 border rounded-lg shadow-2xl py-1 z-50 text-left ${
                isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-800 shadow-xl'
              }`}>
                <div className={`px-3 py-1.5 text-[10px] uppercase font-bold border-b ${
                  isDark ? 'text-zinc-500 border-zinc-800' : 'text-zinc-400 border-zinc-100'
                }`}>
                  Changer d'Organisation SaaS
                </div>
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      switchOrganization(org.id);
                      setIsOrgDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-xs text-left flex items-center justify-between transition-colors ${
                      org.id === activeOrg.id
                        ? isDark ? 'bg-indigo-950/40 text-indigo-300 font-medium' : 'bg-indigo-50 text-indigo-700 font-medium'
                        : isDark ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <span className="truncate">{org.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {org.planId}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
          Plan {activeOrg.planId}
        </span>
      </div>

      {/* Center: View Mode Navigation tabs */}
      <div className={`flex items-center gap-1 p-0.5 rounded-lg border ${
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
      }`}>
        <button
          id="nav-view-reader"
          onClick={() => onChangeAppView('reader')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            currentAppView === 'reader'
              ? 'bg-indigo-600 text-white shadow-xs'
              : isDark
              ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
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
                ? 'bg-indigo-600 text-white shadow-xs'
                : isDark
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
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
              ? 'bg-amber-600 text-white shadow-xs'
              : isDark
              ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
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
              <span className="text-[10px] opacity-80 truncate max-w-[90px]">
                ({activeClient.companyName})
              </span>
            )}
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {isRoleDropdownOpen && (
            <div className={`absolute right-0 mt-1.5 w-72 border rounded-lg shadow-2xl py-1 z-50 text-left ${
              isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-800 shadow-xl'
            }`}>
              <div className={`px-3 py-1.5 text-[10px] uppercase font-bold border-b ${
                isDark ? 'text-zinc-500 border-zinc-800' : 'text-zinc-400 border-zinc-100'
              }`}>
                Simuler un Rôle Utilisateur (Test & Démo)
              </div>
              
              <button
                onClick={() => {
                  switchRole('SUPER_ADMIN');
                  setIsRoleDropdownOpen(false);
                  onChangeAppView('admin');
                }}
                className={`w-full px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                  role === 'SUPER_ADMIN'
                    ? isDark ? 'bg-rose-950/40 text-rose-300 font-semibold' : 'bg-rose-50 text-rose-700 font-semibold'
                    : isDark ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                <div className="flex-1">
                  <p className="leading-none">Super Administrateur</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Accès global multi-organisations & quotas</p>
                </div>
              </button>

              <button
                onClick={() => {
                  switchRole('ADMIN');
                  setIsRoleDropdownOpen(false);
                  onChangeAppView('admin');
                }}
                className={`w-full px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                  role === 'ADMIN'
                    ? isDark ? 'bg-indigo-950/40 text-indigo-300 font-semibold' : 'bg-indigo-50 text-indigo-700 font-semibold'
                    : isDark ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                <div className="flex-1">
                  <p className="leading-none">Administrateur SaaS</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Création clients, import, édition, vidéo</p>
                </div>
              </button>

              <button
                onClick={() => {
                  switchRole('OPERATOR');
                  setIsRoleDropdownOpen(false);
                  onChangeAppView('admin');
                }}
                className={`w-full px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                  role === 'OPERATOR'
                    ? isDark ? 'bg-emerald-950/40 text-emerald-300 font-semibold' : 'bg-emerald-50 text-emerald-700 font-semibold'
                    : isDark ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <div className="flex-1">
                  <p className="leading-none">Opérateur PAO</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Conception flipbook, vidéos & hotspots</p>
                </div>
              </button>

              <div className={`px-3 py-1 text-[10px] uppercase font-bold border-t mt-1 ${
                isDark ? 'text-zinc-500 border-zinc-800' : 'text-zinc-400 border-zinc-100'
              }`}>
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
                  className={`w-full px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                    role === 'CLIENT' && activeClient?.id === c.id
                      ? isDark ? 'bg-amber-950/40 text-amber-300 font-semibold' : 'bg-amber-50 text-amber-800 font-semibold'
                      : isDark ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <div className="flex-1 text-left">
                    <p className="leading-none">{c.companyName || c.name}</p>
                    <p className={`text-[10px] mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{c.activeFlipbookIds.length} document(s) assigné(s)</p>
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
