/**
 * PHASE 16: E-Commerce & Catalogue Shoppable Interactif
 * Gestion des produits shoppables, panier d'achat, commande WhatsApp et direct checkout.
 */

import { ShoppableProduct, CartItem, OrderRecord } from '../types/saas';

// Produits de démonstration rattachés aux flipbooks
export const SAMPLE_PRODUCTS: ShoppableProduct[] = [
  {
    id: 'prod-suite-royale',
    flipbookId: 'fb-hotel-riviera',
    pageNumber: 2,
    title: 'Nuitée Suite Présidentielle Vue Mer',
    sku: 'SUITE-PRES-01',
    price: 850,
    currency: 'EUR',
    description: '120m², terrasse panoramique privée sur la Méditerranée, jacuzzi extérieur, majordome dédié 24h/24.',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    variants: [
      { name: 'Saison', options: ['Basse Saison (850 €)', 'Haute Saison (1 200 €)'] },
      { name: 'Petit-déjeuner', options: ['Inclus (Champagne & Truffes)', 'Formule Express'] },
    ],
    category: 'Hébergement',
  },
  {
    id: 'prod-spa-signature',
    flipbookId: 'fb-hotel-riviera',
    pageNumber: 3,
    title: 'Rituel Spa Cinq Mondes & Soin Duo',
    sku: 'SPA-DUO-02',
    price: 320,
    currency: 'EUR',
    description: 'Massage signature aux huiles chaudes de Grasse de 90 min, accès privatif au hammam et bain à remous.',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    variants: [
      { name: 'Durée', options: ['60 minutes (220 €)', '90 minutes (320 €)', '120 minutes (410 €)'] },
    ],
    category: 'Bien-être',
  },
  {
    id: 'prod-champagne-dom',
    flipbookId: 'fb-hotel-riviera',
    pageNumber: 4,
    title: 'Dom Pérignon Vintage 2013 - Bouteille 75cl',
    sku: 'CAV-DOM-2013',
    price: 290,
    currency: 'EUR',
    description: 'Servi frappé en chambre dans son seau en cristal gravé aux armoiries du Palace.',
    imageUrl: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    category: 'Cave & Gastronomie',
  },
  {
    id: 'prod-villa-cannes',
    flipbookId: 'fb-immo-prestige',
    pageNumber: 2,
    title: 'Brochure Confidentielle Dossier Notarié',
    sku: 'DOSSIER-VILLA-01',
    price: 150,
    currency: 'EUR',
    description: 'Dossier technique complet, plans d’architecte et historique de propriété sécurisé.',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    category: 'Dossiers',
  },
  {
    id: 'prod-menu-degustation',
    flipbookId: 'fb-restaurant-etoile',
    pageNumber: 2,
    title: 'Menu Dégustation en 7 Temps du Chef',
    sku: 'MENU-7TEMPS',
    price: 195,
    currency: 'EUR',
    description: 'Accord mets & vins d’exception sélectionné par notre chef sommelier.',
    imageUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    category: 'Restauration',
  },
];

class EcommerceService {
  private cart: CartItem[] = [];
  private orders: OrderRecord[] = [
    {
      id: 'CMD-2026-891',
      flipbookId: 'fb-hotel-riviera',
      organizationId: 'org-luxury-hospitality',
      clientId: 'client-hotel-riviera',
      items: [
        {
          product: SAMPLE_PRODUCTS[0],
          quantity: 1,
          selectedVariant: 'Haute Saison (1 200 €)',
        },
        {
          product: SAMPLE_PRODUCTS[2],
          quantity: 2,
        },
      ],
      totalAmount: 1780,
      currency: 'EUR',
      customerName: 'Alexandre de Montmirail',
      customerPhone: '+33 6 45 89 12 34',
      customerEmail: 'alexandre@montmirail.fr',
      shippingAddress: 'Suite 402, Hôtel Riviera Palace',
      notes: 'Arrivée prévue à 18h00, champagne au frais.',
      checkoutMode: 'WHATSAPP',
      status: 'CONFIRMED',
      createdAt: Date.now() - 3600 * 1000 * 5,
    },
    {
      id: 'CMD-2026-890',
      flipbookId: 'fb-hotel-riviera',
      organizationId: 'org-luxury-hospitality',
      clientId: 'client-hotel-riviera',
      items: [
        {
          product: SAMPLE_PRODUCTS[1],
          quantity: 2,
          selectedVariant: '90 minutes (320 €)',
        },
      ],
      totalAmount: 640,
      currency: 'EUR',
      customerName: 'Sophie Laroche',
      customerPhone: '+33 6 12 34 56 78',
      customerEmail: 'sophie.laroche@orange.fr',
      checkoutMode: 'DIRECT',
      status: 'SHIPPED',
      createdAt: Date.now() - 3600 * 1000 * 24,
    },
  ];

  private listeners: (() => void)[] = [];

  constructor() {
    try {
      const saved = localStorage.getItem('flipbook_cart');
      if (saved) {
        this.cart = JSON.parse(saved);
      }
      const savedOrders = localStorage.getItem('flipbook_orders');
      if (savedOrders) {
        this.orders = JSON.parse(savedOrders);
      }
    } catch {
      // Ignore
    }
  }

  private notify() {
    try {
      localStorage.setItem('flipbook_cart', JSON.stringify(this.cart));
      localStorage.setItem('flipbook_orders', JSON.stringify(this.orders));
    } catch {
      // Ignore
    }
    this.listeners.forEach((l) => l());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getProductsForFlipbook(flipbookId: string): ShoppableProduct[] {
    return SAMPLE_PRODUCTS.filter((p) => p.flipbookId === flipbookId || !p.flipbookId);
  }

  public getProductById(productId: string): ShoppableProduct | undefined {
    return SAMPLE_PRODUCTS.find((p) => p.id === productId);
  }

  public getCart(): CartItem[] {
    return this.cart;
  }

  public getCartTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  public getCartItemCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  public addToCart(product: ShoppableProduct, quantity: number = 1, variant?: string) {
    const existingIndex = this.cart.findIndex(
      (item) => item.product.id === product.id && item.selectedVariant === variant
    );
    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({ product, quantity, selectedVariant: variant });
    }
    this.notify();
  }

  public updateQuantity(productId: string, quantity: number, variant?: string) {
    if (quantity <= 0) {
      this.removeFromCart(productId, variant);
      return;
    }
    const item = this.cart.find(
      (it) => it.product.id === productId && it.selectedVariant === variant
    );
    if (item) {
      item.quantity = quantity;
      this.notify();
    }
  }

  public removeFromCart(productId: string, variant?: string) {
    this.cart = this.cart.filter(
      (it) => !(it.product.id === productId && it.selectedVariant === variant)
    );
    this.notify();
  }

  public clearCart() {
    this.cart = [];
    this.notify();
  }

  /**
   * Génère le lien WhatsApp pré-rempli pour commander directement
   */
  public generateWhatsAppOrderUrl(
    phoneNumber: string,
    customerName: string,
    notes?: string
  ): string {
    const total = this.getCartTotal();
    const itemsList = this.cart
      .map(
        (it) =>
          `• ${it.quantity}x ${it.product.title} (${it.selectedVariant ? it.selectedVariant + ' - ' : ''}${it.product.price} €)`
      )
      .join('\n');

    const message = `🛍️ *NOUVELLE COMMANDE CATALOGUE INTERACTIF*
Client : *${customerName}*
Date : ${new Date().toLocaleDateString('fr-FR')}

*Articles commandés :*
${itemsList}

💰 *Total TTC : ${total.toLocaleString('fr-FR')} EUR*
${notes ? `\n📝 *Notes :* ${notes}` : ''}

Merci de me confirmer la disponibilité et les modalités de règlement.`;

    const encoded = encodeURIComponent(message);
    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
  }

  public placeOrder(orderData: {
    flipbookId: string;
    organizationId: string;
    clientId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    shippingAddress?: string;
    notes?: string;
    checkoutMode: 'WHATSAPP' | 'DIRECT' | 'STRIPE';
  }): OrderRecord {
    const newOrder: OrderRecord = {
      id: `CMD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      flipbookId: orderData.flipbookId,
      organizationId: orderData.organizationId,
      clientId: orderData.clientId,
      items: [...this.cart],
      totalAmount: this.getCartTotal(),
      currency: 'EUR',
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerEmail: orderData.customerEmail,
      shippingAddress: orderData.shippingAddress,
      notes: orderData.notes,
      checkoutMode: orderData.checkoutMode,
      status: 'PENDING',
      createdAt: Date.now(),
    };

    this.orders.unshift(newOrder);
    this.clearCart();
    return newOrder;
  }

  public getOrders(): OrderRecord[] {
    return this.orders;
  }

  public updateOrderStatus(orderId: string, status: OrderRecord['status']) {
    const found = this.orders.find((o) => o.id === orderId);
    if (found) {
      found.status = status;
      this.notify();
    }
  }

  public getMetrics() {
    const totalRevenue = this.orders.reduce((acc, o) => acc + o.totalAmount, 0);
    const totalOrders = this.orders.length;
    const pendingOrders = this.orders.filter((o) => o.status === 'PENDING').length;
    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    };
  }
}

export const ecommerceService = new EcommerceService();
