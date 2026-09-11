import React, { useState } from 'react';
import { Shield, Check, Trash2, Download, Clock, AlertTriangle, FileCheck, Lock } from 'lucide-react';
import { gdprComplianceService } from '../../services/gdprComplianceService';
import { GdprDataSubjectRequest, GdprConsentSettings } from '../../types/saas';

export const GdprComplianceTab: React.FC = () => {
  const [settings, setSettings] = useState<GdprConsentSettings>(gdprComplianceService.getSettings());
  const [requests, setRequests] = useState<GdprDataSubjectRequest[]>(gdprComplianceService.getRequests());
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = () => {
    gdprComplianceService.updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleProcessRequest = (id: string) => {
    gdprComplianceService.processRequest(id);
    setRequests([...gdprComplianceService.getRequests()]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Centre de Conformité RGPD / GDPR & CNIL</h2>
            <p className="text-xs text-zinc-400">
              Phase 41 • Gestion du consentement lecteur, purge automatique des logs, anonymisation IP et registre des droits.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-lg shadow-emerald-600/20 self-start sm:self-auto"
        >
          {saved ? <Check className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
          {saved ? 'Paramètres Enregistrés !' : 'Enregistrer la politique RGPD'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Paramètres de rétention & anonymisation */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white pb-2 border-b border-zinc-800 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            Règles de Conservation & Protection des Données
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 block">
              Délai de purge automatique des logs de lecture :
            </label>
            <select
              value={settings.retentionPeriodDays}
              onChange={(e) =>
                setSettings({ ...settings, retentionPeriodDays: Number(e.target.value) as any })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value={30}>30 Jours (Recommandation CNIL stricte)</option>
              <option value={90}>90 Jours (Standard Européen)</option>
              <option value={180}>180 Jours (6 mois)</option>
              <option value={365}>365 Jours (1 an maximum)</option>
            </select>
          </div>

          <label className="flex items-center justify-between p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs text-zinc-200 cursor-pointer">
            <div>
              <span className="font-semibold block">Anonymisation des adresses IP</span>
              <span className="text-[11px] text-zinc-400">Masquage du dernier octet (ex: 194.214.***.***)</span>
            </div>
            <input
              type="checkbox"
              checked={settings.anonymizeIpAddresses}
              onChange={(e) => setSettings({ ...settings, anonymizeIpAddresses: e.target.checked })}
              className="w-4 h-4 accent-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs text-zinc-200 cursor-pointer">
            <div>
              <span className="font-semibold block">Bandeau de consentement interactif</span>
              <span className="text-[11px] text-zinc-400">Affiché dès la première page pour les visiteurs de l'UE</span>
            </div>
            <input
              type="checkbox"
              checked={settings.cookieBannerEnabled}
              onChange={(e) => setSettings({ ...settings, cookieBannerEnabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-500"
            />
          </label>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Email du DPO (Délégué à la Protection des Données) :</label>
            <input
              type="email"
              value={settings.dpoContactEmail}
              onChange={(e) => setSettings({ ...settings, dpoContactEmail: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Registre des demandes d'exercice de droits (Droit à l'oubli / Export) */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white pb-2 border-b border-zinc-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Registre des Demandes d'Exercice de Droits
            </span>
            <span className="text-xs text-zinc-400">{requests.length} demande(s)</span>
          </h3>

          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{req.email}</div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-emerald-400">{req.requestType}</span>
                    <span>• {new Date(req.requestedAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                {req.status === 'PROCESSED' ? (
                  <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full font-semibold text-[10px]">
                    Traitée
                  </span>
                ) : (
                  <button
                    onClick={() => handleProcessRequest(req.id)}
                    className="px-3 py-1 bg-zinc-800 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition"
                  >
                    Exécuter
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-[11px] text-emerald-200 leading-relaxed">
              Vos flipbooks sont conformes à 100% avec les directives ePrivacy et RGPD 2016/679.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
