import React, { useState, useEffect, useRef } from 'react';
import { Activity, Cpu, Sparkles, ChevronDown, ChevronUp, X } from 'lucide-react';
import { FlipPhysicsSettings } from '../types/saas';

interface PerformanceMonitorProps {
  physicsSettings?: FlipPhysicsSettings;
  onClose?: () => void;
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  physicsSettings,
  onClose,
  className = '',
}) => {
  const [fps, setFps] = useState<number>(60);
  const [frameTimeMs, setFrameTimeMs] = useState<number>(16.6);
  const [minFps, setMinFps] = useState<number>(60);
  const [maxFps, setMaxFps] = useState<number>(60);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [memoryMb, setMemoryMb] = useState<number | null>(null);

  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const frameTimesRef = useRef<number[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    const measureFrame = (now: number) => {
      if (!active) return;

      const delta = now - lastTimeRef.current;
      frameCountRef.current += 1;

      if (delta >= 16) {
        frameTimesRef.current.push(delta);
        if (frameTimesRef.current.length > 30) {
          frameTimesRef.current.shift();
        }
      }

      // Update calculations every 500ms for smooth, non-flickering display
      if (delta >= 500) {
        const calculatedFps = Math.round((frameCountRef.current * 1000) / delta);
        const avgFrameTime =
          frameTimesRef.current.length > 0
            ? frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length
            : 16.6;

        setFps(calculatedFps);
        setFrameTimeMs(Number(avgFrameTime.toFixed(1)));
        setMinFps((prev) => (prev === 60 ? calculatedFps : Math.min(prev, calculatedFps)));
        setMaxFps((prev) => Math.max(prev, calculatedFps));

        // Memory check if Chrome/Chromium environment
        const perf = window.performance as unknown as {
          memory?: { usedJSHeapSize: number };
        };
        if (perf && perf.memory) {
          setMemoryMb(Math.round(perf.memory.usedJSHeapSize / (1024 * 1024)));
        }

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animFrameIdRef.current = requestAnimationFrame(measureFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(measureFrame);

    return () => {
      active = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  // Determine health color
  const getStatusColor = () => {
    if (fps >= 55) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
    if (fps >= 35) return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
    return 'text-rose-400 bg-rose-500/20 border-rose-500/40';
  };

  const getDotColor = () => {
    if (fps >= 55) return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]';
    if (fps >= 35) return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]';
    return 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]';
  };

  return (
    <div
      id="dev-performance-monitor"
      className={`absolute top-16 left-4 z-40 select-none font-mono transition-all duration-200 ${className}`}
    >
      <div className="bg-zinc-950/85 backdrop-blur-md border border-zinc-800/80 rounded-xl shadow-xl overflow-hidden text-xs text-zinc-300">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-2.5 py-1.5 gap-2.5 bg-zinc-900/60 border-b border-zinc-800/50">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full animate-pulse ${getDotColor()}`} />
            <span className="font-semibold text-white tracking-wider">{fps} FPS</span>
            <span className="text-[10px] text-zinc-400">({frameTimeMs}ms)</span>
          </div>

          <div className="flex items-center gap-1">
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold uppercase tracking-wider ${getStatusColor()}`}
            >
              DEV
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800/80 transition-colors"
              title={isExpanded ? 'Réduire' : 'Détails de performance'}
            >
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800/80 transition-colors"
                title="Masquer l'indicateur"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Expanded Telemetry Details */}
        {isExpanded && (
          <div className="p-2.5 space-y-2 text-[11px] bg-zinc-950/95 border-t border-zinc-900 animate-in fade-in duration-100">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <span className="text-zinc-500">Cadence Min / Max :</span>
              <span className="text-right text-zinc-200">
                {minFps} / {maxFps} fps
              </span>

              <span className="text-zinc-500">Fréquence cible :</span>
              <span className="text-right text-emerald-400">60 Hz (16.6ms)</span>

              {memoryMb !== null && (
                <>
                  <span className="text-zinc-500">Mémoire JS Heap :</span>
                  <span className="text-right text-zinc-200">{memoryMb} Mo</span>
                </>
              )}
            </div>

            {physicsSettings && (
              <div className="pt-2 border-t border-zinc-800/80 space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    Moteur Physique
                  </span>
                  <span className="text-indigo-300 font-semibold">{physicsSettings.mode}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-500 text-[10px]">
                  <span>Rigidité feuille :</span>
                  <span className="text-zinc-300">{Math.round(physicsSettings.stiffness * 100)}%</span>
                </div>
                <div className="flex items-center justify-between text-zinc-500 text-[10px]">
                  <span>Ombre portée dynamique :</span>
                  <span className="text-zinc-300">
                    {Math.round(physicsSettings.shadowHardness * 100)}%
                  </span>
                </div>
              </div>
            )}

            <div className="pt-1.5 flex items-center justify-between text-[9px] text-zinc-500">
              <span className="flex items-center gap-1">
                <Cpu className="w-2.5 h-2.5" /> WebGL & CSS 3D
              </span>
              <button
                onClick={() => {
                  setMinFps(fps);
                  setMaxFps(fps);
                }}
                className="text-zinc-400 hover:text-indigo-300 underline"
              >
                Reset stats
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
