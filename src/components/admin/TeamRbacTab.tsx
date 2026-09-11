import React, { useState, useEffect } from 'react';
import { rbacService } from '../../services/rbacService';
import { TeamMemberRecord } from '../../types/saas';
import {
  Users,
  UserPlus,
  Shield,
  Check,
  X,
  Trash2,
  Clock,
  Key,
} from 'lucide-react';

interface TeamRbacTabProps {
  organizationId: string;
}

export const TeamRbacTab: React.FC<TeamRbacTabProps> = ({ organizationId }) => {
  const [members, setMembers] = useState<TeamMemberRecord[]>(() =>
    rbacService.getMembers(organizationId)
  );
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<TeamMemberRecord['role']>('OPERATOR');

  useEffect(() => {
    return rbacService.subscribe(() => {
      setMembers([...rbacService.getMembers(organizationId)]);
    });
  }, [organizationId]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail) return;
    rbacService.inviteMember(organizationId, newFullName, newEmail, newRole);
    setNewFullName('');
    setNewEmail('');
    setIsInviteOpen(false);
  };

  const handleTogglePermission = (
    memberId: string,
    key: keyof TeamMemberRecord['permissions'],
    currentVal: boolean
  ) => {
    rbacService.updatePermissions(memberId, { [key]: !currentVal });
  };

  const getRoleBadge = (role: TeamMemberRecord['role']) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Super Admin
          </span>
        );
      case 'ADMIN':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Admin
          </span>
        );
      case 'OPERATOR':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Opérateur Design
          </span>
        );
      case 'REVIEWER':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Relecteur
          </span>
        );
      case 'CLIENT':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Client
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/40 via-zinc-900 to-zinc-900 border border-purple-500/20 rounded-2xl p-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1.5 w-fit mb-1">
            <Shield className="w-3.5 h-3.5" />
            Phase 24 : Collaboration d'Équipe & RBAC
          </span>
          <h2 className="text-xl font-bold text-white">Gestion des Rôles & Permissions Granulaires</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Invitez vos designers, commerciaux et clients avec un accès strictement cloisonné à leurs fonctions.
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Inviter un Collaborateur
        </button>
      </div>

      {/* Team Matrix Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Membre</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3 text-center">Éditer Hotspots</th>
                <th className="px-4 py-3 text-center">Publier</th>
                <th className="px-4 py-3 text-center">Voir Leads</th>
                <th className="px-4 py-3 text-center">Facturation</th>
                <th className="px-4 py-3 text-center">Export ZIP</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{member.fullName}</p>
                    <p className="text-[11px] text-zinc-500">{member.email}</p>
                  </td>
                  <td className="px-4 py-3">{getRoleBadge(member.role)}</td>

                  {/* Permissions Checkboxes */}
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={member.permissions.canEditHotspots}
                      disabled={member.role === 'SUPER_ADMIN'}
                      onChange={() =>
                        handleTogglePermission(
                          member.id,
                          'canEditHotspots',
                          member.permissions.canEditHotspots
                        )
                      }
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={member.permissions.canPublish}
                      disabled={member.role === 'SUPER_ADMIN'}
                      onChange={() =>
                        handleTogglePermission(
                          member.id,
                          'canPublish',
                          member.permissions.canPublish
                        )
                      }
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={member.permissions.canViewLeads}
                      disabled={member.role === 'SUPER_ADMIN'}
                      onChange={() =>
                        handleTogglePermission(
                          member.id,
                          'canViewLeads',
                          member.permissions.canViewLeads
                        )
                      }
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={member.permissions.canManageBilling}
                      disabled={member.role === 'SUPER_ADMIN'}
                      onChange={() =>
                        handleTogglePermission(
                          member.id,
                          'canManageBilling',
                          member.permissions.canManageBilling
                        )
                      }
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={member.permissions.canExportOfflineZip}
                      disabled={member.role === 'SUPER_ADMIN'}
                      onChange={() =>
                        handleTogglePermission(
                          member.id,
                          'canExportOfflineZip',
                          member.permissions.canExportOfflineZip
                        )
                      }
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                  </td>

                  <td className="px-4 py-3 text-right">
                    {member.role !== 'SUPER_ADMIN' && (
                      <button
                        onClick={() => rbacService.removeMember(member.id)}
                        className="p-1.5 rounded hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Retirer le membre"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-400" />
                Inviter un Membre d'Équipe
              </h3>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Nom Complet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Élodie Martin"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Email Professionnel *</label>
                <input
                  type="email"
                  required
                  placeholder="elodie@entreprise.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Rôle Attribué *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="ADMIN">Administrateur (Gestion complète)</option>
                  <option value="OPERATOR">Opérateur Design (Création & Hotspots)</option>
                  <option value="REVIEWER">Relecteur Commercial (Consultation & Leads)</option>
                  <option value="CLIENT">Client Restreint (Lien direct & Partage)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md shadow-purple-500/20"
                >
                  Envoyer l'Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
