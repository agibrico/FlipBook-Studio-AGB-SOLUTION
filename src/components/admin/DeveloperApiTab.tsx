import React, { useState } from 'react';
import { API_ENDPOINTS, generateCodeSnippet } from '../../services/developerApiService';
import { ApiEndpointDoc } from '../../types/saas';
import {
  Code2,
  Terminal,
  Play,
  Key,
  Copy,
  Check,
  Globe,
  Sparkles,
  Server,
  Layers,
} from 'lucide-react';

interface DeveloperApiTabProps {
  organizationId: string;
}

export const DeveloperApiTab: React.FC<DeveloperApiTabProps> = ({ organizationId }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointDoc>(API_ENDPOINTS[0]);
  const [activeLang, setActiveLang] = useState<'curl' | 'javascript' | 'python' | 'php'>('curl');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isLoadingRun, setIsLoadingRun] = useState(false);
  const [liveResponse, setLiveResponse] = useState<any>(null);

  const codeSnippet = generateCodeSnippet(selectedEndpoint, activeLang);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTestCall = () => {
    setIsLoadingRun(true);
    setTimeout(() => {
      setLiveResponse({
        httpStatus: 200,
        statusText: 'OK',
        timeMs: Math.floor(25 + Math.random() * 40),
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'x-ratelimit-remaining': '994',
          'x-request-id': `req_${Math.random().toString(36).substring(2, 9)}`,
        },
        body: selectedEndpoint.sampleResponse,
      });
      setIsLoadingRun(false);
    }, 450);
  };

  const getMethodBadge = (method: ApiEndpointDoc['method']) => {
    switch (method) {
      case 'GET':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            GET
          </span>
        );
      case 'POST':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            POST
          </span>
        );
      case 'PUT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            PUT
          </span>
        );
      case 'DELETE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            DELETE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-cyan-950/40 via-zinc-900 to-zinc-900 border border-cyan-500/20 rounded-2xl p-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 w-fit mb-1">
            <Code2 className="w-3.5 h-3.5" />
            Phase 30 : API REST Publique Développeur
          </span>
          <h2 className="text-xl font-bold text-white">Explorateur d'API REST & Webhooks</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Automatisez la synchronisation de vos flipbooks, la récupération des commandes et l'export CRM.
          </p>
        </div>

        {/* API Key Box */}
        <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
          <Key className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="text-xs">
            <p className="text-zinc-500 text-[10px] uppercase font-mono">Clé API Organisation</p>
            <p className="font-mono text-white font-bold">fbk_live_9a87d...c4b3a2</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 cols: Endpoints Navigation */}
        <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
            Points d'Entrée Disponibles
          </h3>

          <div className="space-y-1.5">
            {API_ENDPOINTS.map((ep) => (
              <button
                key={ep.path + ep.method}
                onClick={() => {
                  setSelectedEndpoint(ep);
                  setLiveResponse(null);
                }}
                className={`w-full p-2.5 rounded-xl text-left text-xs transition-all border flex flex-col gap-1 ${
                  selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                    : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center gap-2 font-mono">
                  {getMethodBadge(ep.method)}
                  <span className="font-bold text-white truncate">{ep.path}</span>
                </div>
                <p className="text-[11px] text-zinc-500 truncate">{ep.summary}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right 8 cols: Interactive Runner & Code Snippets */}
        <div className="lg:col-span-8 space-y-4">
          {/* Endpoint Details Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                {getMethodBadge(selectedEndpoint.method)}
                <span className="text-sm font-mono font-extrabold text-white">
                  {selectedEndpoint.path}
                </span>
              </div>

              <button
                onClick={handleTestCall}
                disabled={isLoadingRun}
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isLoadingRun ? 'Exécution...' : 'Tester en Direct'}
              </button>
            </div>

            <p className="text-xs text-zinc-300">{selectedEndpoint.description}</p>

            {/* Code Snippets Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                  {(['curl', 'javascript', 'python', 'php'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveLang(lang)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[11px] uppercase transition-all ${
                        activeLang === lang
                          ? 'bg-cyan-600 text-white font-bold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedCode ? 'Copié' : 'Copier'}
                </button>
              </div>

              {/* Code Pre Box */}
              <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                {codeSnippet}
              </pre>
            </div>

            {/* Live Response Panel */}
            {liveResponse && (
              <div className="pt-3 border-t border-zinc-800 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Réponse du Serveur (HTTP {liveResponse.httpStatus})
                  </span>
                  <span className="font-mono text-zinc-500">{liveResponse.timeMs} ms</span>
                </div>

                <pre className="p-3.5 rounded-xl bg-zinc-950 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-60">
                  {JSON.stringify(liveResponse.body, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
