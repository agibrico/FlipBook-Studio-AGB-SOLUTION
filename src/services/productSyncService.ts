/**
 * Phase 38: Live Catalog Product Sync Service
 * Synchronisation dynamique des stocks, prix et références produits
 * sans réimporter ni réexporter le PDF initial.
 */

import { SyncedProductItem, CatalogSyncStatus } from '../types/saas';

class ProductSyncService {
  private products: SyncedProductItem[] = [
    {
      sku: 'PAL-SUITE-PRES',
      title: 'Suite Présidentielle Baie des Anges',
      category: 'Hébergement Luxe',
      currentPrice: 2850,
      previousPrice: 3200,
      stockQuantity: 2,
      inStock: true,
      mappedPageNumber: 2,
      lastSyncedAt: Date.now() - 3600000,
    },
    {
      sku: 'PAL-SUITE-PANOR',
      title: 'Suite Panoramique Penthouse',
      category: 'Hébergement Luxe',
      currentPrice: 1950,
      stockQuantity: 4,
      inStock: true,
      mappedPageNumber: 3,
      lastSyncedAt: Date.now() - 3600000,
    },
    {
      sku: 'PAL-SPA-RITUEL',
      title: 'Soin Rituel Caviar & Or 24K',
      category: 'Spa & Bien-être',
      currentPrice: 420,
      stockQuantity: 12,
      inStock: true,
      mappedPageNumber: 4,
      lastSyncedAt: Date.now() - 3600000,
    },
    {
      sku: 'PAL-GASTRO-DEGUST',
      title: 'Menu Dégustation Signature 7 Services',
      category: 'Haute Gastronomie',
      currentPrice: 260,
      previousPrice: 280,
      stockQuantity: 25,
      inStock: true,
      mappedPageNumber: 5,
      lastSyncedAt: Date.now() - 3600000,
    },
    {
      sku: 'PAL-CHAMPAGNE-VINT',
      title: 'Champagne Dom Pérignon Vintage Réserve',
      category: 'Cave Privée',
      currentPrice: 650,
      stockQuantity: 0,
      inStock: false,
      mappedPageNumber: 5,
      lastSyncedAt: Date.now() - 3600000,
    },
  ];

  public getProducts(): SyncedProductItem[] {
    return [...this.products];
  }

  public getSyncStatus(): CatalogSyncStatus {
    const inStock = this.products.filter((p) => p.inStock).length;
    return {
      totalProducts: this.products.length,
      inStockCount: inStock,
      outOfStockCount: this.products.length - inStock,
      lastSyncTimestamp: Date.now() - 15 * 60000,
      sourceType: 'CSV_UPLOAD',
    };
  }

  public updateProductPrice(sku: string, newPrice: number, inStock?: boolean) {
    const p = this.products.find((item) => item.sku === sku);
    if (!p) return;
    p.previousPrice = p.currentPrice;
    p.currentPrice = newPrice;
    if (inStock !== undefined) p.inStock = inStock;
    p.lastSyncedAt = Date.now();
  }

  public importCsv(csvContent: string): number {
    // Parse basique de lignes CSV : SKU, Titre, Prix, Stock, Page
    const lines = csvContent.trim().split('\n');
    let imported = 0;
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 4) {
        const sku = parts[0].trim();
        const title = parts[1].trim();
        const price = parseFloat(parts[2].trim()) || 0;
        const stock = parseInt(parts[3].trim(), 10) || 0;
        const page = parseInt(parts[4]?.trim() || '1', 10) || 1;

        const existing = this.products.find((p) => p.sku === sku);
        if (existing) {
          existing.title = title;
          existing.previousPrice = existing.currentPrice;
          existing.currentPrice = price;
          existing.stockQuantity = stock;
          existing.inStock = stock > 0;
          existing.lastSyncedAt = Date.now();
        } else {
          this.products.push({
            sku,
            title,
            category: 'Général',
            currentPrice: price,
            stockQuantity: stock,
            inStock: stock > 0,
            mappedPageNumber: page,
            lastSyncedAt: Date.now(),
          });
        }
        imported++;
      }
    }
    return imported;
  }
}

export const productSyncService = new ProductSyncService();
