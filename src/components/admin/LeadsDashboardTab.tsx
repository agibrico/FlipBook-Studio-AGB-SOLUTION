import React, { useState, useMemo } from 'react';
import { leadService } from '../../services/leadService';
import { LeadRecord, LeadStatus, LeadFormType } from '../../types/saas';
import {
  Users,
  Download,
  Filter,
  Search,
  Mail,
  Phone,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface LeadsDashboardTabProps {
  organizationId: string;
}

export const LeadsDashboardTab: React.FC<LeadsDashboardTabProps> = ({ organizationId }) => {
  const [leads, setLeads] = useState<LeadRecord[]>(() => leadService.getLeads(organizationId));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (selectedStatus !== 'all' && l.status !== selectedStatus) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const match =
          l.fullName.toLowerCase().includes(query) ||
          l.email.toLowerCase().includes(query) ||
          (l.company && l.company.toLowerCase().includes(query)) ||
          l.flipbookTitle.toLowerCase().includes(query);
        if (!match) return false;
      }
      return true;
    });
  }, [leads, selectedStatus, searchTerm]);

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    leadService.updateLeadStatus(leadId, newStatus);
    setLeads(leadService.getLeads(organizationId));
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
    setToastMsg(`Statut mis à jour : ${newStatus}`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleExportCSV = () => {
    const csvContent = leadService.exportLeadsCSV(organizationId);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_prospects_${organizationId}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    setToastMsg('Fichier CSV généré et téléchargé.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleSimulateWebhook = (lead: LeadRecord) => {
    setToastMsg(`Prospect ${lead.fullName} synchronisé avec succès vers HubSpot & CRM externe via Webhook.`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Nouveau</span>;
      case 'CONTACTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Contacté</span>;
      case 'QUALIFIED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">Qualifié</span>;
      case 'CONVERTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Converti</span>;
    }
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Top Header with Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <p className="text-xs text-zinc-500 font-mono">Total Prospects Capturés</p>
          <p className="text-2xl font-bold text-white mt-1">{leads.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <p className="text-xs text-zinc-500 font-mono">Nouveaux (Non traités)</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{leads.filter((l) => l.status === 'NEW').length}</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <p className="text-xs text-zinc-500 font-mono">Qualifiés VIP</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{leads.filter((l) => l.status === 'QUALIFIED').length}</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <p className="text-xs text-zinc-500 font-mono">Taux de Conversion</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {leads.length > 0 ? `${Math.round((leads.filter((l) => l.status === 'CONVERTED').length / leads.length) * 100)}%` : '0%'}
          </p>
        </div>
      </div>

      {/* Actions and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, email..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="NEW">Nouveau</option>
            <option value="CONTACTED">Contacté</option>
            <option value="QUALIFIED">Qualifié</option>
            <option value="CONVERTED">Converti</option>
          </select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white border border-zinc-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 font-mono uppercase text-[10px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Prospect</th>
                <th className="py-3 px-4">Coordonnées</th>
                <th className="py-3 px-4">Flipbook Source</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    Aucun prospect ne correspond à vos filtres.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{lead.fullName}</p>
                      {lead.company && <p className="text-[11px] text-zinc-400">{lead.company}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <p className="text-zinc-300 font-mono text-[11px]">{lead.email}</p>
                        {lead.phone && <p className="text-zinc-500 font-mono text-[11px]">{lead.phone}</p>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-indigo-400">{lead.flipbookTitle}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">Page {lead.pageNumber} • {lead.formType}</p>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        className="bg-zinc-950 border border-zinc-700 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
                      >
                        <option value="NEW">Nouveau</option>
                        <option value="CONTACTED">Contacté</option>
                        <option value="QUALIFIED">Qualifié</option>
                        <option value="CONVERTED">Converti</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                      {new Date(lead.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200"
                      >
                        Détails
                      </button>
                      <button
                        onClick={() => handleSimulateWebhook(lead)}
                        title="Pousser vers le CRM (HubSpot / Salesforce)"
                        className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-xs text-indigo-300 border border-indigo-500/30"
                      >
                        Sync CRM
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 text-zinc-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{selectedLead.fullName}</h3>
                <p className="text-xs text-zinc-400">{selectedLead.company || 'Particulier'}</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Email :</span>
                <a href={`mailto:${selectedLead.email}`} className="text-indigo-400 hover:underline">
                  {selectedLead.email}
                </a>
              </div>
              {selectedLead.phone && (
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Téléphone :</span>
                  <a href={`tel:${selectedLead.phone}`} className="text-indigo-400 hover:underline">
                    {selectedLead.phone}
                  </a>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Flipbook d'origine :</span>
                <span className="text-white font-medium">{selectedLead.flipbookTitle} (Page {selectedLead.pageNumber})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Date de captation :</span>
                <span className="text-zinc-300 font-mono">
                  {new Date(selectedLead.createdAt).toLocaleString('fr-FR')}
                </span>
              </div>

              {selectedLead.message && (
                <div className="pt-2">
                  <span className="text-zinc-400 font-medium block mb-1">Message / Projet transmis :</span>
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs italic">
                    "{selectedLead.message}"
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-zinc-800">
              <a
                href={`mailto:${selectedLead.email}?subject=Suite à votre demande sur ${encodeURIComponent(selectedLead.flipbookTitle)}`}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Répondre par Email</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
