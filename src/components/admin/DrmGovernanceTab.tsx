import React, { useState } from 'react';
import { Lock, ShieldAlert, Globe, Clock, Flame, Check, AlertTriangle, Key } from 'lucide-react';
import { drmSecurityService } from '../../services/drmSecurityService';
import { DrmGovernancePolicy } from '../../types/saas';

export const DrmGovernanceTab: React.FC = () => {
  const [policy, setPolicy] = useState<DrmGovernancePolicy>(
    drmSecurityService.getPolicy('fbk-hotel-palace-nice')
  );
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof DrmGovernancePolicy) => {
    setPolicy((prev) => ({
      ...prev,
      [key]: !prev[key as any],
    }));
  };

  const handleSave = () => {
    drmSecurityService.updatePolicy(policy);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Gouvernance DRM & Contrôle d'Accès Territorial</h2>
            <p className="text-xs text-zinc-400">
              Phase 35 • Protection anti-fuite, compte à rebours de déchiquetage numérique et blocage par pays (IP).
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-lg shadow-rose-600/20 self-start sm:self-auto"
        >
          {saved ? <Check className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          {saved ? 'Politique Enregistrée !' : 'Enregistrer la politique DRM'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panneau 1 : Expiration & Révocation */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Clock className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white">Durée de vie & Déchiquetage à distance</h3>
          </div>

          <label className="flex items-center justify-between p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-white block">Activer la protection DRM stricte</span>
              <span className="text-[11px] text-zinc-400">
                Bloque le cache navigateur et force une vérification de licence à chaque ouverture.
              </span>
            </div>
            <input
              type="checkbox"
              checked={policy.isDrmEnabled}
              onChange={() => handleToggle('isDrmEnabled')}
              className="w-4 h-4 accent-rose-500 cursor-pointer"
            />
          </label>

          <div className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-2">
            <span className="text-xs font-semibold text-white block">Compte à rebours d'expiration :</span>
            <select
              value={policy.expiresAt ? '14d' : 'none'}
              onChange={(e) => {
                const val = e.target.value;
                setPolicy({
                  ...policy,
                  expiresAt:
                    val === 'none'
                      ? null
                      : Date.now() + (val === '24h' ? 86400000 : val === '7d' ? 7 * 86400000 : 14 * 86400000),
                });
              }}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-rose-500"
            >
              <option value="none">Aucune expiration (Permanent)</option>
              <option value="24h">24 Heures (Autodestruction ultra-courte)</option>
              <option value="7d">7 Jours (Campagne hebdomadaire)</option>
              <option value="14d">14 Jours (Période d'appel d'offres)</option>
            </select>
          </div>

          {/* Révocation d'urgence */}
          <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-rose-300 block">Déchiquetage Instantané (Kill-Switch)</span>
                <span className="text-[10px] text-zinc-400">Révocation immédiate pour tous les liens en circulation</span>
              </div>
            </div>
            <button
              onClick={() => {
                setPolicy({ ...policy, expiresAt: Date.now() - 1000 });
                drmSecurityService.updatePolicy({ ...policy, expiresAt: Date.now() - 1000 });
                alert('Document révoqué avec succès ! Plus aucun lecteur ne pourra l\'ouvrir.');
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition"
            >
              Révoquer
            </button>
          </div>
        </div>

        {/* Panneau 2 : Geo-Fencing & Protection Anti-Fuite */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Globe className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white">Filtrage Géographique IP (Geo-Fencing)</h3>
          </div>

          <div className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-2">
            <span className="text-xs font-semibold text-white block">Pays autorisés exclusivement :</span>
            <div className="flex flex-wrap gap-1.5">
              {['FR', 'MC', 'BE', 'CH', 'LU', 'US', 'GB', 'CA', 'DE'].map((code) => {
                const isAllowed = policy.allowedCountryCodes.includes(code);
                return (
                  <button
                    key={code}
                    onClick={() => {
                      const updated = isAllowed
                        ? policy.allowedCountryCodes.filter((c) => c !== code)
                        : [...policy.allowedCountryCodes, code];
                      setPolicy({ ...policy, allowedCountryCodes: updated });
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition border ${
                      isAllowed
                        ? 'bg-rose-600 border-rose-500 text-white'
                        : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {code}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-zinc-500">
              Les requêtes provenant d'autres pays recevront une page de refus de conformité territoriale.
            </p>
          </div>

          {/* Toggles Anti-Leak */}
          <div className="space-y-2 pt-1">
            <label className="flex items-center justify-between p-2.5 bg-zinc-950/40 rounded-lg border border-zinc-800/80 text-xs text-zinc-300">
              <span>Flouter le catalogue si la fenêtre perd le focus</span>
              <input
                type="checkbox"
                checked={policy.blurOnWindowBlur}
                onChange={() => handleToggle('blurOnWindowBlur')}
                className="w-4 h-4 accent-rose-500"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 bg-zinc-950/40 rounded-lg border border-zinc-800/80 text-xs text-zinc-300">
              <span>Empreinte visuelle dynamique (Email + IP incrustés)</span>
              <input
                type="checkbox"
                checked={policy.screenDynamicFingerprint}
                onChange={() => handleToggle('screenDynamicFingerprint')}
                className="w-4 h-4 accent-rose-500"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 bg-zinc-950/40 rounded-lg border border-zinc-800/80 text-xs text-zinc-300">
              <span>Interdire l'impression papier ou PDF virtuelle</span>
              <input
                type="checkbox"
                checked={policy.blockPrinting}
                onChange={() => handleToggle('blockPrinting')}
                className="w-4 h-4 accent-rose-500"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
