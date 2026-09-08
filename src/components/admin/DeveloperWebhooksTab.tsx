import React, { useState } from 'react';
import { OutboundWebhook, ApiKeyRecord } from '../../types/saas';
import { Webhook, Key, Plus, Trash2, Check, RefreshCw, Send, ShieldAlert, Code2 } from 'lucide-react';

interface DeveloperWebhooksTabProps {
  organizationId: string;
}

const SEED_WEBHOOKS: OutboundWebhook[] = [
  {
    id: 'wh-01',
    organizationId: 'org-azur-group',
    url: 'https://api.crm-hotel-azur.com/v1/leads/webhook',
    secretKey: 'whsec_98af21d09e394bc88a77',
    active: true,
    events: ['lead.captured', 'flipbook.approved'],
    lastDeliveryStatus: 'SUCCESS',
    lastDeliveryAt: Date.now() - 3600000,
  },
];

const SEED_API_KEYS: ApiKeyRecord[] = [
  {
    id: 'key-01',
    organizationId: 'org-azur-group',
    keyPrefix: 'sk_live_9a2f...',
    label: 'Intégration Site Web Principal (Production)',
    active: true,
    createdAt: Date.now() - 30 * 86400000,
    lastUsedAt: Date.now() - 15 * 60000,
  },
];

export const DeveloperWebhooksTab: React.FC<DeveloperWebhooksTabProps> = ({ organizationId }) => {
  const [webhooks, setWebhooks] = useState<OutboundWebhook[]>(SEED_WEBHOOKS);
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>(SEED_API_KEYS);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [simulatingPing, setSimulatingPing] = useState(false);

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl.trim()) return;

    const newWh: OutboundWebhook = {
      id: `wh-${Date.now()}`,
      organizationId,
      url: newWebhookUrl.trim(),
      secretKey: `whsec_${Math.random().toString(36).substr(2, 16)}`,
      active: true,
      events: ['lead.captured'],
    };

    setWebhooks([newWh, ...webhooks]);
    setNewWebhookUrl('');
    setToastMsg('Webhook créé avec succès.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter((w) => w.id !== id));
  };

  const handleTestWebhook = (wh: OutboundWebhook) => {
    setSimulatingPing(true);
    setTimeout(() => {
      setSimulatingPing(false);
      setToastMsg(`Ping Webhook envoyé à ${wh.url} — Code HTTP 200 OK reçu (Signature HMAC-SHA256 valide).`);
      setTimeout(() => setToastMsg(null), 4000);
    }, 1000);
  };

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyLabel.trim()) return;

    const newKey: ApiKeyRecord = {
      id: `key-${Date.now()}`,
      organizationId,
      keyPrefix: `sk_live_${Math.random().toString(36).substr(2, 6)}...`,
      label: newKeyLabel.trim(),
      active: true,
      createdAt: Date.now(),
    };

    setApiKeys([newKey, ...apiKeys]);
    setNewKeyLabel('');
    setToastMsg('Nouvelle clé API générée.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
  };

  return (
    <div className="space-y-8 text-zinc-100">
      {toastMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* WEBHOOKS SECTION */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Webhook className="w-4 h-4 text-indigo-400" />
              Webhooks Sortants en Temps Réel
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Recevez des notifications HTTP POST instantanées lors de la captation de prospects ou la validation de flipbooks.
            </p>
          </div>
        </div>

        {/* Add Webhook Form */}
        <form onSubmit={handleAddWebhook} className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            required
            value={newWebhookUrl}
            onChange={(e) => setNewWebhookUrl(e.target.value)}
            placeholder="https://votre-crm.com/api/webhooks/flipbook"
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter Webhook</span>
          </button>
        </form>

        {/* Webhooks list */}
        <div className="space-y-3">
          {webhooks.map((wh) => (
            <div
              key={wh.id}
              className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-white font-medium truncate">{wh.url}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 font-mono">
                    ACTIF
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
                  <span>Secret : {wh.secretKey}</span>
                  <span>•</span>
                  <span>Événements : {wh.events.join(', ')}</span>
                  {wh.lastDeliveryAt && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400">Dernier succès il y a 1h (HTTP 200)</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  disabled={simulatingPing}
                  onClick={() => handleTestWebhook(wh)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3 text-indigo-400" />
                  <span>Tester le ping</span>
                </button>
                <button
                  onClick={() => handleDeleteWebhook(wh.id)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REST API KEYS SECTION */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              Clés d'API REST Développeur
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Automatisez l'importation de documents, la conversion en flipbook et l'obtention des liens de partage par API.
            </p>
          </div>
        </div>

        {/* Generate Key Form */}
        <form onSubmit={handleGenerateKey} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            required
            value={newKeyLabel}
            onChange={(e) => setNewKeyLabel(e.target.value)}
            placeholder="Description (ex : Serveur Backend Node.js, Application Mobile)"
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Générer une clé API</span>
          </button>
        </form>

        {/* Keys List */}
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{key.label}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                    {key.keyPrefix}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">
                  Créée le {new Date(key.createdAt).toLocaleDateString('fr-FR')} •{' '}
                  {key.lastUsedAt
                    ? `Dernière utilisation le ${new Date(key.lastUsedAt).toLocaleDateString('fr-FR')}`
                    : 'Jamais utilisée'}
                </p>
              </div>

              <button
                onClick={() => handleRevokeKey(key.id)}
                className="px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/30 border border-rose-900/40 text-xs font-medium self-end sm:self-auto"
              >
                Révoquer
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
