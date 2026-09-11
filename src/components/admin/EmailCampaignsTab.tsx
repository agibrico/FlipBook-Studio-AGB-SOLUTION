import React, { useState } from 'react';
import { Mail, Send, Play, Pause, Plus, Check, Clock, TrendingUp, Users } from 'lucide-react';
import { emailCampaignService } from '../../services/emailCampaignService';
import { EmailCampaignSequence } from '../../types/saas';

export const EmailCampaignsTab: React.FC = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaignSequence[]>(emailCampaignService.getCampaigns());

  const handleToggle = (id: string) => {
    emailCampaignService.toggleCampaign(id);
    setCampaigns([...emailCampaignService.getCampaigns()]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Relances Automatisées & Smart Retargeting</h2>
            <p className="text-xs text-zinc-400">
              Phase 39 • Déclenchez des e-mails personnalisés selon le comportement et l'attention de lecture de vos prospects.
            </p>
          </div>
        </div>

        <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-lg shadow-blue-600/20 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Créer une Séquence
        </button>
      </div>

      {/* Liste des séquences de relance */}
      <div className="grid grid-cols-1 gap-4">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    camp.active ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-zinc-600'
                  }`}
                />
                <h3 className="text-sm font-bold text-white">{camp.name}</h3>
                <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-md font-mono">
                  Déclencheur : {camp.trigger}
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-medium">Objet : "{camp.subject}"</p>
              <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  Délai après lecture : {camp.delayHours} heure(s)
                </span>
              </div>
            </div>

            {/* Statistiques d'envois et conversion */}
            <div className="flex items-center gap-4 text-center border-t md:border-t-0 md:border-l border-zinc-800 pt-3 md:pt-0 md:pl-6">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Envoyés</span>
                <span className="text-sm font-bold text-white">{camp.stats.sentCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Ouverture</span>
                <span className="text-sm font-bold text-blue-400">{camp.stats.openRatePercent}%</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Clics</span>
                <span className="text-sm font-bold text-emerald-400">{camp.stats.clickRatePercent}%</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Conversions</span>
                <span className="text-sm font-bold text-amber-400">{camp.stats.conversionsCount}</span>
              </div>

              {/* Bouton Toggle Actif */}
              <button
                onClick={() => handleToggle(camp.id)}
                className={`ml-2 p-2 rounded-xl border transition ${
                  camp.active
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                }`}
                title={camp.active ? 'Mettre en pause' : 'Activer'}
              >
                {camp.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
