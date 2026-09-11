import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { tenantService } from '../../services/tenantService';
import { FlipbookRecord, ClientEntity } from '../../types/saas';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { LeadsDashboardTab } from './LeadsDashboardTab';
import { DeveloperWebhooksTab } from './DeveloperWebhooksTab';
import { EmbedGeneratorModal } from './EmbedGeneratorModal';
import { QrCodeModal } from './QrCodeModal';
import { offlineExportService } from '../../services/offlineExportService';
import { SAMPLE_BOOKS } from '../../services/sampleBooks';
import { EcommerceOrdersTab } from './EcommerceOrdersTab';
import { HeatmapAnalyticsTab } from './HeatmapAnalyticsTab';
import { BrandingCustomizerTab } from './BrandingCustomizerTab';
import { TeamRbacTab } from './TeamRbacTab';
import { TemplateLibraryTab } from './TemplateLibraryTab';
import { DeveloperApiTab } from './DeveloperApiTab';
import { BatchOperationsModal } from './BatchOperationsModal';
import { AbTestingTab } from './AbTestingTab';
import { DrmGovernanceTab } from './DrmGovernanceTab';
import { ProductSyncTab } from './ProductSyncTab';
import { EmailCampaignsTab } from './EmailCampaignsTab';
import { GdprComplianceTab } from './GdprComplianceTab';
import { CoBrowsingHostModal } from './CoBrowsingHostModal';
import {
  Users,
  BookOpen,
  HardDrive,
  Video,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  Search,
  CheckCircle2,
  Building,
  Mail,
  Phone,
  Eye,
  Settings,
  Sparkles,
  Lock,
  Globe,
  Share2,
  TrendingUp,
  BarChart3,
  CreditCard,
  Check,
  Zap,
  ExternalLink,
  FileText,
  Code,
  QrCode,
  Download,
  UserCheck,
  Webhook,
  ShoppingBag,
  Flame,
  Palette,
  Shield,
  Layers,
  Code2,
  Split,
  RefreshCw,
  Radio,
} from 'lucide-react';

interface AdminDashboardProps {
  onOpenFlipbook: (flipbookId: string) => void;
  onOpenUpload: () => void;
  onOpenVisualEditor?: (flipbookId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenFlipbook,
  onOpenUpload,
  onOpenVisualEditor,
}) => {
  const { activeOrg, role, clients, switchRole, createClient, refreshTenantData } = useAuth();

  const [activeTab, setActiveTab] = useState<
    | 'clients'
    | 'flipbooks'
    | 'quotas'
    | 'analytics'
    | 'orders'
    | 'heatmaps'
    | 'branding'
    | 'team'
    | 'templates'
    | 'api'
    | 'abtesting'
    | 'drm'
    | 'productsync'
    | 'emails'
    | 'gdpr'
  >('clients');
  const [isCoBrowsingModalOpen, setIsCoBrowsingModalOpen] = useState(false);
  const [selectedFlipbookIds, setSelectedFlipbookIds] = useState<string[]>([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [analyticsFlipbookId, setAnalyticsFlipbookId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState(activeOrg.customDomain || 'flipbook.azur-palace.fr');
  const [isDomainSaved, setIsDomainSaved] = useState(false);
  const [planSuccessMsg, setPlanSuccessMsg] = useState<string | null>(null);

  // New Client Form
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');
  const [formError, setFormError] = useState('');

  const orgFlipbooks = tenantService.getFlipbooksForOrg(activeOrg.id);

  // Handle client creation
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail) {
      setFormError('Le nom et l’email sont requis.');
      return;
    }
    setFormError('');
    await createClient({
      name: newClientName,
      companyName: newClientCompany,
      email: newClientEmail,
      phone: newClientPhone,
      notes: newClientNotes,
    });
    setNewClientName('');
    setNewClientCompany('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientNotes('');
    setIsAddClientModalOpen(false);
  };

  // Reassign flipbook to a client
  const handleAssignFlipbook = async (flipbookId: string, clientId: string) => {
    await tenantService.assignFlipbookToClient(flipbookId, clientId);
    refreshTenantData();
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFlipbooks = orgFlipbooks.filter(
    (f) =>
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="admin-dashboard-container" className="flex-1 w-full overflow-y-auto bg-zinc-950 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Administration SaaS Multi-Tenant
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {activeOrg.name} ({activeOrg.slug})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Studio de Gestion & Attribution Clients
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="admin-btn-new-client"
              onClick={() => setIsAddClientModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm transition-all border border-zinc-700 shadow-sm"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Nouveau Client</span>
            </button>

            <button
              id="admin-btn-upload-doc"
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-md shadow-indigo-500/20"
            >
              <BookOpen className="w-4 h-4" />
              <span>Importer un Document</span>
            </button>
          </div>
        </div>

        {/* SaaS Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 uppercase font-medium">Clients Actifs</p>
              <p className="text-2xl font-bold text-white mt-1">{clients.length}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Cloisonnés par tenant</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 uppercase font-medium">Flipbooks Publiés</p>
              <p className="text-2xl font-bold text-white mt-1">{orgFlipbooks.length}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Disponibles QR / Web</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 uppercase font-medium">Stockage Utilisé</p>
              <p className="text-2xl font-bold text-white mt-1">2.4 Go</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Quota: 50 Go (Plan {activeOrg.planId})</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 uppercase font-medium">Vidéos Actives</p>
              <p className="text-2xl font-bold text-white mt-1">4</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Cloudflare Stream Provider</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20">
              <Video className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Navigation & Search */}
        <div className="flex flex-col gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === 'clients'
                    ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Clients ({clients.length})
              </button>
              <button
                onClick={() => setActiveTab('flipbooks')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === 'flipbooks'
                    ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Flipbooks ({orgFlipbooks.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeTab === 'orders'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-amber-300 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>Commandes</span>
              </button>
              <button
                onClick={() => setActiveTab('heatmaps')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeTab === 'heatmaps'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-rose-300 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Heatmaps</span>
              </button>
              <button
                onClick={() => setActiveTab('branding')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeTab === 'branding'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span>Marque Blanche</span>
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeTab === 'team'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Équipe & Rôles</span>
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeTab === 'templates'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Modèles</span>
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeTab === 'api'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>API REST</span>
              </button>
              <button
                onClick={() => setActiveTab('abtesting')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeTab === 'abtesting'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Split className="w-3.5 h-3.5 text-violet-400" />
                <span>Tests A/B</span>
              </button>
              <button
                onClick={() => setActiveTab('drm')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeTab === 'drm'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>DRM & Geo</span>
              </button>
              <button
                onClick={() => setActiveTab('productsync')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeTab === 'productsync'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Sync Produits</span>
              </button>
              <button
                onClick={() => setActiveTab('emails')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeTab === 'emails'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>E-mails Auto</span>
              </button>
              <button
                onClick={() => setActiveTab('gdpr')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeTab === 'gdpr'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>RGPD / Privacy</span>
              </button>
              <button
                onClick={() => setIsCoBrowsingModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20"
                title="Démarrer une présentation synchronisée en direct avec un client"
              >
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>Co-Browsing Live</span>
              </button>
              <button
                onClick={() => {
                  setAnalyticsFlipbookId(undefined);
                  setActiveTab('analytics');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeTab === 'analytics'
                    ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                <span>Stats</span>
              </button>
              <button
                onClick={() => setActiveTab('quotas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === 'quotas'
                    ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Organisation
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* TAB 1: CLIENT MANAGEMENT */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => {
                const assignedDocs = orgFlipbooks.filter((fb) => fb.clientId === client.id);

                return (
                  <div
                    key={client.id}
                    id={`client-card-${client.id}`}
                    className="bg-zinc-900 border border-zinc-800/90 rounded-xl p-5 hover:border-zinc-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h3 className="font-bold text-white text-base leading-tight">
                            {client.companyName || client.name}
                          </h3>
                          <p className="text-xs text-zinc-400 font-medium mt-0.5">{client.name}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {assignedDocs.length} document(s)
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-zinc-400 py-2 border-t border-zinc-800/60">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        {client.notes && (
                          <p className="text-[11px] text-zinc-500 italic mt-1 line-clamp-2">
                            "{client.notes}"
                          </p>
                        )}
                      </div>

                      {/* Assigned Documents List */}
                      <div className="mt-3 pt-2 border-t border-zinc-800/60">
                        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                          Documents Attribués :
                        </p>
                        {assignedDocs.length === 0 ? (
                          <p className="text-xs text-zinc-500 italic">Aucun flipbook assigné pour le moment.</p>
                        ) : (
                          <div className="space-y-1">
                            {assignedDocs.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between text-xs bg-zinc-950/60 px-2 py-1 rounded border border-zinc-800/50"
                              >
                                <span className="truncate max-w-[170px] text-zinc-300">{doc.title}</span>
                                <button
                                  onClick={() => onOpenFlipbook(doc.id)}
                                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 text-[11px]"
                                >
                                  <span>Voir</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action button: Test Client Perspective */}
                    <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-2">
                      <button
                        onClick={() => {
                          switchRole('CLIENT', client.id);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Tester la vue de ce client</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: FLIPBOOKS & ATTRIBUTION */}
        {activeTab === 'flipbooks' && (
          <div className="space-y-3">
            {/* Batch Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    filteredFlipbooks.length > 0 &&
                    selectedFlipbookIds.length === filteredFlipbooks.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFlipbookIds(filteredFlipbooks.map((f) => f.id));
                    } else {
                      setSelectedFlipbookIds([]);
                    }
                  }}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
                <span className="text-xs text-zinc-400">
                  {selectedFlipbookIds.length} sélectionné(s)
                </span>
              </div>

              {selectedFlipbookIds.length > 0 && (
                <button
                  onClick={() => setIsBatchModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 animate-fadeIn"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Actions groupées ({selectedFlipbookIds.length})
                </button>
              )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-950 text-xs uppercase text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="px-4 py-3 w-10"></th>
                      <th className="px-4 py-3">Document / Flipbook</th>
                      <th className="px-4 py-3">Statut & Pages</th>
                      <th className="px-4 py-3">Attribution Client</th>
                      <th className="px-4 py-3">Visibilité</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredFlipbooks.map((fb) => {
                      const assignedClient = clients.find((c) => c.id === fb.clientId);
                      const isSelected = selectedFlipbookIds.includes(fb.id);

                      return (
                        <tr
                          key={fb.id}
                          className={`transition-colors ${
                            isSelected ? 'bg-indigo-950/20' : 'hover:bg-zinc-800/40'
                          }`}
                        >
                          <td className="px-4 py-3.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFlipbookIds((prev) => [...prev, fb.id]);
                                } else {
                                  setSelectedFlipbookIds((prev) =>
                                    prev.filter((id) => id !== fb.id)
                                  );
                                }
                              }}
                              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-white">{fb.title}</div>
                            <div className="text-xs text-zinc-500 font-mono mt-0.5">
                              /f/{fb.slug} • {fb.viewCount} vues
                            </div>
                          </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              {fb.status}
                            </span>
                            <span className="text-xs text-zinc-400">{fb.totalPages} pages</span>
                          </div>
                        </td>

                        {/* Direct Client Assignment Dropdown (SaaS Core) */}
                        <td className="px-4 py-3.5">
                          <select
                            value={fb.clientId}
                            onChange={(e) => handleAssignFlipbook(fb.id, e.target.value)}
                            className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 font-medium focus:outline-none focus:border-amber-500"
                          >
                            {clients.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.companyName || c.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-xs">
                            {fb.visibility === 'PUBLIC' ? (
                              <span className="flex items-center gap-1 text-emerald-400">
                                <Globe className="w-3.5 h-3.5" /> Public
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-amber-400">
                                <Lock className="w-3.5 h-3.5" /> Protégé
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setAnalyticsFlipbookId(fb.id);
                              setActiveTab('analytics');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-medium transition-all"
                            title="Consulter les statistiques d'audience"
                          >
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                            <span>Stats</span>
                          </button>
                          {onOpenVisualEditor && (
                            <button
                              onClick={() => onOpenVisualEditor(fb.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-medium transition-all"
                              title="Ouvrir l'éditeur de zones interactives"
                            >
                              <Sparkles className="w-3 h-3 text-indigo-400" />
                              <span>Éditer zones</span>
                            </button>
                          )}
                          <button
                            onClick={() => onOpenFlipbook(fb.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all"
                          >
                            <span>Ouvrir</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

        {/* TAB 3: QUOTAS & ABONNEMENT SAAS */}
        {activeTab === 'quotas' && (
          <div className="space-y-6">
            {/* Plan Alert if changed */}
            {planSuccessMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                <span>{planSuccessMsg}</span>
                <button onClick={() => setPlanSuccessMsg(null)} className="text-emerald-400 hover:text-white font-bold">✕</button>
              </div>
            )}

            {/* Current Plan Overview Card */}
            <div className="bg-gradient-to-r from-indigo-950/60 via-zinc-900 to-zinc-900 border border-indigo-500/30 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                    ABONNEMENT ACTIF
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">Stripe Sub ID: sub_102839x9</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Formule {activeOrg.planId}</h3>
                <p className="text-xs text-zinc-300">
                  Renouvellement automatique le 1er du mois • Facturation centralisée pour l’organisation.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const invoice = `Facture Stripe FLIPBOOK-STUDIO #${Date.now()}\nOrganisation: ${activeOrg.name}\nFormule: ${activeOrg.planId}\nMontant: 199.00 EUR HT\nStatut: PAYÉ`;
                    const blob = new Blob([invoice], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `facture_${activeOrg.slug}_2026.txt`;
                    a.click();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white border border-zinc-700 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Dernière Facture PDF</span>
                </button>
                <button
                  onClick={() => {
                    setPlanSuccessMsg('Portail Stripe ouvert : redirection vers votre espace de paiement sécurisé.');
                    setTimeout(() => setPlanSuccessMsg(null), 4000);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Gérer la Facturation</span>
                </button>
              </div>
            </div>

            {/* Quotas & Usage Meters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Storage Meter */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">Stockage Cloud</span>
                  <HardDrive className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-xl font-bold text-white">
                  {(activeOrg.usedStorageBytes / (1024 * 1024 * 1024)).toFixed(1)} Go / {(activeOrg.maxStorageBytes / (1024 * 1024 * 1024)).toFixed(0)} Go
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${Math.round((activeOrg.usedStorageBytes / activeOrg.maxStorageBytes) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">
                  {Math.round((activeOrg.usedStorageBytes / activeOrg.maxStorageBytes) * 100)}% utilisé (PDFs + Pages WebP + Médias)
                </p>
              </div>

              {/* Flipbooks Meter */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">Flipbooks Actifs</span>
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold text-white">
                  {orgFlipbooks.length} / {activeOrg.maxFlipbooks}
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.round((orgFlipbooks.length / activeOrg.maxFlipbooks) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">
                  {activeOrg.maxFlipbooks - orgFlipbooks.length} publications restantes dans votre formule
                </p>
              </div>

              {/* Videos Meter */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">Vidéos Streaming HD</span>
                  <Video className="w-4 h-4 text-violet-400" />
                </div>
                <div className="text-xl font-bold text-white">
                  4 / {activeOrg.maxVideos}
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{ width: `${Math.round((4 / activeOrg.maxVideos) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">
                  Cloudflare Stream CDN mondial sans publicité
                </p>
              </div>
            </div>

            {/* Plans Comparison Grid */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">Changer de Formule</h4>
                  <p className="text-xs text-zinc-400">
                    Mise à niveau instantanée avec ajustement automatique au prorata Stripe.
                  </p>
                </div>
                <span className="text-xs text-indigo-400 font-mono">Facturation mensuelle sans engagement</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                {[
                  {
                    id: 'STARTER',
                    name: 'Starter',
                    price: '29 €',
                    flipbooks: '5 flipbooks',
                    storage: '5 Go',
                    videos: '5 vidéos',
                    whiteLabel: false,
                    customDomain: false,
                  },
                  {
                    id: 'PRO',
                    name: 'Pro Studio',
                    price: '79 €',
                    flipbooks: '20 flipbooks',
                    storage: '25 Go',
                    videos: '30 vidéos',
                    whiteLabel: false,
                    customDomain: true,
                  },
                  {
                    id: 'BUSINESS',
                    name: 'Business Multi-Clients',
                    price: '199 €',
                    flipbooks: '50 flipbooks',
                    storage: '100 Go',
                    videos: '100 vidéos',
                    whiteLabel: true,
                    customDomain: true,
                  },
                  {
                    id: 'ENTERPRISE',
                    name: 'Enterprise Privé',
                    price: '499 €',
                    flipbooks: 'Illimité',
                    storage: '500 Go',
                    videos: '500 vidéos',
                    whiteLabel: true,
                    customDomain: true,
                  },
                ].map((plan) => {
                  const isCurrent = activeOrg.planId === plan.id;

                  return (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                        isCurrent
                          ? 'bg-indigo-950/30 border-indigo-500/60 shadow-lg'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-bold text-white text-sm">{plan.name}</h5>
                            <p className="text-lg font-extrabold text-indigo-400 mt-1">
                              {plan.price}
                              <span className="text-xs font-normal text-zinc-400"> /mois</span>
                            </p>
                          </div>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500 text-white">
                              ACTUEL
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5 pt-2 text-xs border-t border-zinc-800">
                          <div className="flex items-center gap-2 text-zinc-300">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{plan.flipbooks}</span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-300">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{plan.storage} stockage</span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-300">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{plan.videos}</span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-300">
                            <Check
                              className={`w-3.5 h-3.5 shrink-0 ${
                                plan.whiteLabel ? 'text-emerald-400' : 'text-zinc-600'
                              }`}
                            />
                            <span className={plan.whiteLabel ? 'text-zinc-300' : 'text-zinc-600 line-through'}>
                              Marque Blanche
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        {isCurrent ? (
                          <button
                            disabled
                            className="w-full py-1.5 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800/60 text-xs font-semibold"
                          >
                            Formule Actuelle
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              activeOrg.planId = plan.id as any;
                              setPlanSuccessMsg(`Votre abonnement a été migré avec succès vers le plan ${plan.name}. Quotas mis à jour.`);
                              setTimeout(() => setPlanSuccessMsg(null), 4000);
                            }}
                            className="w-full py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700 transition-colors"
                          >
                            Passer à {plan.name}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Domain & White-Label Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    Domaine Personnalisé (CNAME)
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    SSL Automatique
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Affichez les flipbooks sous votre propre nom de domaine ou celui de vos clients.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customDomainInput}
                    onChange={(e) => setCustomDomainInput(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="flipbook.mon-hotel.fr"
                  />
                  <button
                    onClick={() => {
                      activeOrg.customDomain = customDomainInput;
                      setIsDomainSaved(true);
                      setTimeout(() => setIsDomainSaved(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
                  >
                    {isDomainSaved ? 'Enregistré !' : 'Valider CNAME'}
                  </button>
                </div>
                <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 font-mono">
                  Enregistrement DNS requis :<br />
                  <span className="text-amber-300">CNAME</span> {customDomainInput} → <span className="text-indigo-400">ingress.flipbookstudio.app</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Marque Blanche (White Label)
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Inclus Plan Business
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Supprimez toute mention de la plateforme pour une intégration 100% neutre.
                </p>
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">Logo et Footer Masqués</p>
                    <p className="text-[11px] text-zinc-400">Seul le logo de votre client s’affichera</p>
                  </div>
                  <button
                    onClick={() => {
                      activeOrg.whiteLabelEnabled = !activeOrg.whiteLabelEnabled;
                      setPlanSuccessMsg(`Marque blanche ${activeOrg.whiteLabelEnabled ? 'activée' : 'désactivée'}.`);
                      setTimeout(() => setPlanSuccessMsg(null), 3000);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      activeOrg.whiteLabelEnabled
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {activeOrg.whiteLabelEnabled ? 'ACTIVÉE' : 'DÉSACTIVÉE'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIENCE ANALYTICS & RETENTION */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard initialFlipbookId={analyticsFlipbookId} />
        )}

        {/* TAB 5: E-COMMERCE ORDERS (Phase 16) */}
        {activeTab === 'orders' && (
          <EcommerceOrdersTab organizationId={activeOrg.id} />
        )}

        {/* TAB 6: HEATMAPS ANALYTICS (Phase 20) */}
        {activeTab === 'heatmaps' && (
          <HeatmapAnalyticsTab
            flipbooks={orgFlipbooks}
            defaultFlipbookId={orgFlipbooks[0]?.id || 'fbk-hotel-palace-nice'}
          />
        )}

        {/* TAB 7: BRANDING & PORTAL CUSTOMIZER (Phase 21) */}
        {activeTab === 'branding' && (
          <BrandingCustomizerTab organizationId={activeOrg.id} />
        )}

        {/* TAB 8: TEAM COLLABORATION & RBAC (Phase 24) */}
        {activeTab === 'team' && (
          <TeamRbacTab organizationId={activeOrg.id} />
        )}

        {/* TAB 9: TEMPLATES PRESETS LIBRARY (Phase 25) */}
        {activeTab === 'templates' && (
          <TemplateLibraryTab organizationId={activeOrg.id} />
        )}

        {/* TAB 10: DEVELOPER REST API & WEBHOOKS (Phase 30) */}
        {activeTab === 'api' && (
          <DeveloperApiTab organizationId={activeOrg.id} />
        )}

        {/* TAB 11: A/B TESTING & SPLIT TRAFFIC (Phase 33) */}
        {activeTab === 'abtesting' && (
          <AbTestingTab />
        )}

        {/* TAB 12: DRM GOVERNANCE & GEO-FENCING (Phase 35) */}
        {activeTab === 'drm' && (
          <DrmGovernanceTab />
        )}

        {/* TAB 13: CATALOG PRODUCT & STOCK SYNC (Phase 38) */}
        {activeTab === 'productsync' && (
          <ProductSyncTab />
        )}

        {/* TAB 14: AUTOMATED EMAIL RETARGETING (Phase 39) */}
        {activeTab === 'emails' && (
          <EmailCampaignsTab />
        )}

        {/* TAB 15: GDPR & PRIVACY CENTER (Phase 41) */}
        {activeTab === 'gdpr' && (
          <GdprComplianceTab />
        )}

        {/* CO-BROWSING HOST MODAL (Phase 36) */}
        {isCoBrowsingModalOpen && (
          <CoBrowsingHostModal
            flipbookId={orgFlipbooks[0]?.id || 'fbk-hotel-palace-nice'}
            isOpen={isCoBrowsingModalOpen}
            onClose={() => setIsCoBrowsingModalOpen(false)}
            onSessionStarted={() => {
              setIsCoBrowsingModalOpen(false);
              onOpenFlipbook(orgFlipbooks[0]?.id || 'fbk-hotel-palace-nice');
            }}
          />
        )}

        {/* BATCH OPERATIONS MODAL (Phase 27) */}
        {isBatchModalOpen && (
          <BatchOperationsModal
            selectedFlipbooks={orgFlipbooks.filter((fb) =>
              selectedFlipbookIds.includes(fb.id)
            )}
            clients={clients}
            onClose={() => setIsBatchModalOpen(false)}
            onSuccess={(msg) => {
              setPlanSuccessMsg(msg);
              setSelectedFlipbookIds([]);
              setTimeout(() => setPlanSuccessMsg(null), 4000);
            }}
          />
        )}

        {/* MODAL: ADD CLIENT */}
        {isAddClientModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-lg font-bold text-white">Nouveau Client</h3>
                <button
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="text-zinc-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="p-2.5 rounded bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveClient} className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Nom du Contact *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Jean Dupont"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Société / Établissement</label>
                  <input
                    type="text"
                    placeholder="Ex: Hôtel Riviera Spa"
                    value={newClientCompany}
                    onChange={(e) => setNewClientCompany(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Email Professionnel *</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@hotel-riviera.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Téléphone (WhatsApp)</label>
                  <input
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Notes / Instructions</label>
                  <textarea
                    rows={2}
                    placeholder="Documents prévus: Brochure d'été, Carte des vins..."
                    value={newClientNotes}
                    onChange={(e) => setNewClientNotes(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsAddClientModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-500/20"
                  >
                    Créer le Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
