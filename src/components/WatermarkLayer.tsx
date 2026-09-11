import React from 'react';

interface WatermarkLayerProps {
  watermarkText?: string;
  enabled?: boolean;
}

export const WatermarkLayer: React.FC<WatermarkLayerProps> = ({
  watermarkText = 'CONFIDENTIEL • FLIPBOOK STUDIO',
  enabled = true,
}) => {
  if (!enabled) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none">
      <div className="w-[200%] h-[200%] -top-1/2 -left-1/2 absolute flex flex-wrap items-center justify-around rotate-[-30deg] opacity-[0.06] text-white font-mono text-sm uppercase tracking-widest leading-loose">
        {Array.from({ length: 32 }).map((_, i) => (
          <span key={i} className="p-8">
            {watermarkText}
          </span>
        ))}
      </div>
    </div>
  );
};
