import React from 'react';
import { BookPage } from '../types';
import { HotspotRecord } from '../types/saas';
import {
  ExternalLink,
  Play,
  ShoppingBag,
  Info,
  Phone,
  Mail,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

interface FlipPageRendererProps {
  page?: BookPage;
  pageNumber: number;
  totalPages: number;
  isCover?: boolean;
  side?: 'left' | 'right' | 'single';
  onHotspotClick?: (hotspot: HotspotRecord) => void;
  onNavigateToPage?: (page: number) => void;
}

export const FlipPageRenderer: React.FC<FlipPageRendererProps> = ({
  page,
  pageNumber,
  totalPages,
  side = 'single',
  onHotspotClick,
  onNavigateToPage,
}) => {
  if (!page) {
    return (
      <div className="w-full h-full bg-zinc-100/90 flex items-center justify-center text-zinc-400 font-mono text-xs select-none">
        Page vide
      </div>
    );
  }

  const handleHotspotTrigger = (e: React.MouseEvent, hotspot: HotspotRecord) => {
    e.stopPropagation();
    if (hotspot.type === 'URL' && hotspot.targetUrl) {
      if (hotspot.targetUrl.startsWith('page:')) {
        const pageJump = parseInt(hotspot.targetUrl.replace('page:', ''), 10);
        if (!isNaN(pageJump)) {
          onNavigateToPage?.(pageJump);
          return;
        }
      } else {
        window.open(hotspot.targetUrl, '_blank', 'noopener,noreferrer');
        return;
      }
    }

    onHotspotClick?.(hotspot);
  };

  return (
    <div
      className={`w-full h-full relative overflow-hidden select-none bg-white ${
        side === 'left' ? 'rounded-l-sm' : side === 'right' ? 'rounded-r-sm' : 'rounded-sm'
      }`}
    >
      {/* Visual paper lighting gradient & spine crease */}
      {side === 'left' && (
        <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-black/15 via-black/5 to-transparent pointer-events-none z-20" />
      )}
      {side === 'right' && (
        <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-black/15 via-black/5 to-transparent pointer-events-none z-20" />
      )}

      {/* Subtle paper grain / border edge */}
      <div className="absolute inset-0 border border-zinc-200/40 pointer-events-none z-20" />

      {/* Content Rendering */}
      {page.type === 'image' && page.imageUrl ? (
        <div className="w-full h-full flex items-center justify-center bg-white p-1 sm:p-2 relative">
          <img
            src={page.imageUrl}
            alt={`Page ${pageNumber}`}
            className="w-full h-full object-contain pointer-events-none"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : page.htmlContent ? (
        <div
          className="w-full h-full overflow-y-auto relative"
          dangerouslySetInnerHTML={{ __html: page.htmlContent }}
        />
      ) : (
        <div className="w-full h-full p-8 flex flex-col justify-between text-zinc-700 bg-white relative">
          <div className="text-xs text-zinc-400 font-mono flex justify-between">
            <span>{page.title || `Page ${pageNumber}`}</span>
            <span>{pageNumber} / {totalPages}</span>
          </div>
          <div className="my-auto font-serif text-base leading-relaxed">
            {page.text || 'Page sans contenu'}
          </div>
          <div className="text-center text-xs text-zinc-400 font-mono">
            — {pageNumber} —
          </div>
        </div>
      )}

      {/* PHASE 8 & 10: Interactive Hotspots Layer */}
      {page.hotspots && page.hotspots.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-30">
          {page.hotspots.map((hotspot) => {
            const isPageJump = hotspot.type === 'URL' && hotspot.targetUrl?.startsWith('page:');

            return (
              <div
                key={hotspot.id}
                onClick={(e) => handleHotspotTrigger(e, hotspot)}
                style={{
                  left: `${hotspot.region.x * 100}%`,
                  top: `${hotspot.region.y * 100}%`,
                  width: `${Math.max(hotspot.region.width * 100, 3)}%`,
                  height: `${Math.max(hotspot.region.height * 100, 3)}%`,
                }}
                className="absolute pointer-events-auto cursor-pointer group transition-all"
                title={hotspot.label}
              >
                {/* Visual hotspot outline & highlight zone */}
                <div className="w-full h-full border border-dashed border-indigo-400/60 bg-indigo-500/10 rounded group-hover:bg-indigo-500/25 group-hover:border-indigo-500 transition-colors relative">
                  {/* Pulsing Radar Marker Icon */}
                  <div className="absolute -top-3 -left-3 flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-indigo-400 opacity-60"></span>
                    <span className="relative inline-flex items-center justify-center rounded-full h-7 w-7 bg-indigo-600 text-white shadow-lg border border-white text-[10px] group-hover:scale-110 transition-transform">
                      {hotspot.type === 'VIDEO' ? (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      ) : hotspot.type === 'PRODUCT' ? (
                        <ShoppingBag className="w-3.5 h-3.5" />
                      ) : hotspot.type === 'PHONE' ? (
                        <Phone className="w-3.5 h-3.5" />
                      ) : hotspot.type === 'WHATSAPP' ? (
                        <MessageSquare className="w-3.5 h-3.5" />
                      ) : hotspot.type === 'EMAIL' ? (
                        <Mail className="w-3.5 h-3.5" />
                      ) : isPageJump ? (
                        <ArrowRight className="w-3.5 h-3.5" />
                      ) : hotspot.type === 'TOOLTIP' ? (
                        <Info className="w-3.5 h-3.5" />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </div>

                  {/* Hotspot Floating Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-zinc-900/95 backdrop-blur text-white text-[11px] font-sans font-medium rounded-md shadow-xl border border-zinc-700 whitespace-nowrap z-40 pointer-events-none flex items-center gap-1.5">
                    <span>{hotspot.label}</span>
                    {hotspot.productPrice && (
                      <span className="text-emerald-400 font-mono font-bold">
                        ({hotspot.productPrice})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
