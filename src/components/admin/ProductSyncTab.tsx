import React, { useState } from 'react';
import { RefreshCw, UploadCloud, Download, Check, AlertCircle, ShoppingBag, Edit3 } from 'lucide-react';
import { productSyncService } from '../../services/productSyncService';
import { SyncedProductItem, CatalogSyncStatus } from '../../types/saas';

export const ProductSyncTab: React.FC = () => {
  const [products, setProducts] = useState<SyncedProductItem[]>(productSyncService.getProducts());
  const [syncStatus, setSyncStatus] = useState<CatalogSyncStatus>(productSyncService.getSyncStatus());
  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleSavePrice = (sku: string) => {
    productSyncService.updateProductPrice(sku, editPrice);
    setProducts(productSyncService.getProducts());
    setSyncStatus(productSyncService.getSyncStatus());
    setEditingSku(null);
  };

  const handleToggleStock = (sku: string, currentStock: boolean) => {
    const p = products.find((item) => item.sku === sku);
    if (p) {
      productSyncService.updateProductPrice(sku, p.currentPrice, !currentStock);
      setProducts(productSyncService.getProducts());
      setSyncStatus(productSyncService.getSyncStatus());
    }
  };

  const handleTriggerSync = () => {
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Synchronisation Flux Produits & Stocks (CSV / ERP)</h2>
            <p className="text-xs text-zinc-400">
              Phase 38 • Mettez à jour les prix, remises et stocks de vos hotspots sans réimporter ni réexporter le PDF.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleTriggerSync}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            {syncSuccess ? <Check className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
            {syncSuccess ? 'Hotspots Actualisés !' : 'Synchroniser les Hotspots'}
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Total Références</span>
          <span className="text-2xl font-bold text-white mt-1 block">{syncStatus.totalProducts}</span>
        </div>
        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Articles En Stock</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">{syncStatus.inStockCount}</span>
        </div>
        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Ruptures Signalées</span>
          <span className="text-2xl font-bold text-rose-400 mt-1 block">{syncStatus.outOfStockCount}</span>
        </div>
        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Source Active</span>
          <span className="text-sm font-bold text-amber-300 mt-2 block">{syncStatus.sourceType}</span>
        </div>
      </div>

      {/* Tableau des références mappées aux pages */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Articles Mappés sur les Pages du Flipbook</h3>
          <span className="text-xs text-zinc-400">Dernière mise à jour auto : il y a 15 min</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
              <tr>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Titre & Catégorie</th>
                <th className="px-6 py-3">Page Flipbook</th>
                <th className="px-6 py-3">Prix Actuel</th>
                <th className="px-6 py-3">Disponibilité</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {products.map((p) => (
                <tr key={p.sku} className="hover:bg-zinc-800/30 transition">
                  <td className="px-6 py-3.5 font-mono text-amber-400 font-bold">{p.sku}</td>
                  <td className="px-6 py-3.5">
                    <div className="font-semibold text-white">{p.title}</div>
                    <div className="text-[11px] text-zinc-500">{p.category}</div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="px-2 py-0.5 bg-zinc-800 rounded text-zinc-300 font-medium">
                      Page {p.mappedPageNumber}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    {editingSku === p.sku ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-20 px-2 py-1 bg-zinc-950 border border-amber-500 rounded text-xs text-white"
                        />
                        <button
                          onClick={() => handleSavePrice(p.sku)}
                          className="p-1 bg-amber-500 text-zinc-950 rounded hover:bg-amber-400"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {p.currentPrice.toLocaleString('fr-FR')} €
                        </span>
                        {p.previousPrice && (
                          <span className="text-[11px] text-zinc-500 line-through">
                            {p.previousPrice.toLocaleString('fr-FR')} €
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setEditingSku(p.sku);
                            setEditPrice(p.currentPrice);
                          }}
                          className="text-zinc-500 hover:text-amber-400 p-1"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <button
                      onClick={() => handleToggleStock(p.sku, p.inStock)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                        p.inStock
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                      }`}
                    >
                      {p.inStock ? 'En Stock' : 'Épuisé'}
                    </button>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <span className="text-[11px] text-zinc-500">Auto-sync actif</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
