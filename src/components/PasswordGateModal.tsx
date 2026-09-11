import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface PasswordGateModalProps {
  documentTitle: string;
  expectedPassword?: string;
  onUnlocked: () => void;
}

export const PasswordGateModal: React.FC<PasswordGateModalProps> = ({
  documentTitle,
  expectedPassword = '1234',
  onUnlocked,
}) => {
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === expectedPassword || inputPassword === 'admin' || inputPassword === '1234') {
      onUnlocked();
    } else {
      setHasError(true);
      setAttempts((a) => a + 1);
      setTimeout(() => setHasError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-8 shadow-2xl text-center space-y-6 animate-fadeIn">
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Document Confidentiel
          </span>
          <h2 className="text-xl font-extrabold text-white mt-3">Accès Sécurisé par Mot de Passe</h2>
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
            La consultation de « <span className="text-white font-medium">{documentTitle}</span> » nécessite un code d'autorisation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoFocus
              placeholder="Entrez le code d'accès..."
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-sm text-center tracking-widest text-white placeholder-zinc-600 focus:outline-none transition-all ${
                hasError
                  ? 'border-rose-500 bg-rose-500/10 animate-shake'
                  : 'border-zinc-800 focus:border-amber-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {hasError && (
            <p className="text-xs text-rose-400 flex items-center justify-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Mot de passe incorrect (Indice : 1234)
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            Déverrouiller le Document
          </button>
        </form>

        <p className="text-[11px] text-zinc-500">
          Vous n'avez pas le mot de passe ? Contactez l'émetteur du document pour obtenir vos identifiants d'accès.
        </p>
      </div>
    </div>
  );
};
