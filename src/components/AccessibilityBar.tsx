import React, { useState } from 'react';
import { AccessibilitySettings } from '../types/saas';
import {
  Eye,
  Type,
  ZoomIn,
  ZoomOut,
  Keyboard,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface AccessibilityBarProps {
  settings: AccessibilitySettings;
  onChange: (settings: AccessibilitySettings) => void;
}

export const AccessibilityBar: React.FC<AccessibilityBarProps> = ({ settings, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isKeyboardModalOpen, setIsKeyboardModalOpen] = useState(false);

  const toggleHighContrast = () => {
    onChange({ ...settings, highContrast: !settings.highContrast });
  };

  const toggleDyslexicFont = () => {
    onChange({ ...settings, dyslexicFont: !settings.dyslexicFont });
  };

  const adjustTextScale = (delta: number) => {
    const next = Math.max(100, Math.min(180, settings.textScalePercent + delta));
    onChange({ ...settings, textScalePercent: next });
  };

  return (
    <>
      <div className="relative inline-block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="Paramètres d'accessibilité (WCAG 2.1 AAA)"
          className={`p-2 rounded-full border transition-all flex items-center justify-center ${
            settings.highContrast || settings.dyslexicFont || settings.textScalePercent > 100
              ? 'bg-blue-600/30 text-blue-300 border-blue-500 shadow-md'
              : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-700/60'
          }`}
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Options Dropdown */}
        {isOpen && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl z-50 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                Accessibilité (a11y)
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-300">Contraste Élevé</span>
              <button
                onClick={toggleHighContrast}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  settings.highContrast ? 'bg-blue-600' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.highContrast ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Dyslexic Font Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-300">Police Dyslexie (OpenDyslexic)</span>
              <button
                onClick={toggleDyslexicFont}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  settings.dyslexicFont ? 'bg-blue-600' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.dyslexicFont ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Text Scale */}
            <div className="space-y-1 pt-1 border-t border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span>Taille du texte</span>
                <span className="font-mono text-blue-400">{settings.textScalePercent}%</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => adjustTextScale(-10)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex-1 flex items-center justify-center text-xs"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => adjustTextScale(10)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex-1 flex items-center justify-center text-xs"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Keyboard Shortcuts Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                setIsKeyboardModalOpen(true);
              }}
              className="w-full py-1.5 px-2.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center justify-center gap-1.5"
            >
              <Keyboard className="w-3.5 h-3.5" />
              Raccourcis Clavier
            </button>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      {isKeyboardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-blue-400" />
                Navigation au Clavier (WCAG)
              </h3>
              <button
                onClick={() => setIsKeyboardModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-300">Tourner la page suivante</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-white font-mono text-[11px] border border-zinc-700">
                  → / Espace
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-300">Tourner la page précédente</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-white font-mono text-[11px] border border-zinc-700">
                  ←
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-300">Aller à la couverture / Fin</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-white font-mono text-[11px] border border-zinc-700">
                  Home / End
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-300">Plein écran</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-white font-mono text-[11px] border border-zinc-700">
                  F
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-300">Recherche plein texte</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-white font-mono text-[11px] border border-zinc-700">
                  Ctrl / Cmd + F
                </kbd>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsKeyboardModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
