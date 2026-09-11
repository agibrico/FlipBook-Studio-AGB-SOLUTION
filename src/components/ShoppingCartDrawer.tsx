import React, { useState, useEffect } from 'react';
import { ecommerceService } from '../services/ecommerceService';
import { CartItem } from '../types/saas';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  CreditCard,
  X,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

interface ShoppingCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  flipbookId: string;
  organizationId: string;
  clientId: string;
  merchantPhone?: string;
}

export const ShoppingCartDrawer: React.FC<ShoppingCartDrawerProps> = ({
  isOpen,
  onClose,
  flipbookId,
  organizationId,
  clientId,
  merchantPhone = '+33 6 12 34 56 78',
}) => {
  const [cart, setCart] = useState<CartItem[]>(() => ecommerceService.getCart());
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [orderConfirmedId, setOrderConfirmedId] = useState<string | null>(null);

  useEffect(() => {
    return ecommerceService.subscribe(() => {
      setCart([...ecommerceService.getCart()]);
    });
  }, []);

  if (!isOpen) return null;

  const total = ecommerceService.getCartTotal();

  const handleWhatsAppCheckout = () => {
    if (!customerName) {
      alert('Veuillez renseigner votre nom pour finaliser la commande.');
      return;
    }
    const url = ecommerceService.generateWhatsAppOrderUrl(merchantPhone, customerName, notes);
    ecommerceService.placeOrder({
      flipbookId,
      organizationId,
      clientId,
      customerName,
      customerPhone: customerPhone || merchantPhone,
      notes,
      checkoutMode: 'WHATSAPP',
    });
    window.open(url, '_blank');
    onClose();
  };

  const handleDirectCheckout = () => {
    if (!customerName) {
      alert('Veuillez renseigner votre nom pour valider la commande.');
      return;
    }
    const order = ecommerceService.placeOrder({
      flipbookId,
      organizationId,
      clientId,
      customerName,
      customerPhone: customerPhone || 'Non renseigné',
      notes,
      checkoutMode: 'DIRECT',
    });
    setOrderConfirmedId(order.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 text-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Mon Panier Interactif</h3>
                <p className="text-xs text-zinc-400">
                  {cart.reduce((sum, it) => sum + it.quantity, 0)} article(s) sélectionné(s)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white text-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {orderConfirmedId ? (
              <div className="p-6 text-center space-y-4 bg-zinc-950 rounded-2xl border border-emerald-500/30">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">Commande Confirmée !</h4>
                <p className="text-xs text-zinc-400">
                  Votre commande sous la référence <span className="font-mono text-emerald-400 font-bold">{orderConfirmedId}</span> a été transmise à notre équipe.
                </p>
                <button
                  onClick={() => {
                    setOrderConfirmedId(null);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
                >
                  Continuer la lecture
                </button>
              </div>
            ) : cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto" />
                <p className="text-sm font-semibold text-zinc-400">Votre panier est vide</p>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Cliquez sur les pastilles produits "Ajouter au Panier" présentes sur les pages du catalogue pour commander.
                </p>
              </div>
            ) : (
              <>
                {/* Item List */}
                <div className="space-y-3">
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        {item.product.imageUrl && (
                          <img
                            src={item.product.imageUrl}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="text-xs font-bold text-white line-clamp-1">
                            {item.product.title}
                          </p>
                          <p className="text-[11px] text-zinc-400 font-mono">
                            {item.product.price} € {item.selectedVariant ? `• ${item.selectedVariant}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                          <button
                            onClick={() =>
                              ecommerceService.updateQuantity(
                                item.product.id,
                                item.quantity - 1,
                                item.selectedVariant
                              )
                            }
                            className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono font-bold px-1.5">{item.quantity}</span>
                          <button
                            onClick={() =>
                              ecommerceService.updateQuantity(
                                item.product.id,
                                item.quantity + 1,
                                item.selectedVariant
                              )
                            }
                            className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            ecommerceService.removeFromCart(item.product.id, item.selectedVariant)
                          }
                          className="p-1.5 text-zinc-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Checkout Form */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-zinc-400">
                    Vos Coordonnées
                  </h4>

                  <div>
                    <label className="block text-zinc-400 mb-1">Votre Nom *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Alexandre Dupont"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Téléphone portable</label>
                    <input
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Instructions particulières</label>
                    <input
                      type="text"
                      placeholder="Ex: Date souhaitée, chambre d'hôtel..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer with Totals & Actions */}
          {cart.length > 0 && !orderConfirmedId && (
            <div className="p-5 border-t border-zinc-800 bg-zinc-950/80 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-zinc-300">Total TTC</span>
                <span className="text-xl font-extrabold text-amber-400">
                  {total.toLocaleString('fr-FR')} €
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleWhatsAppCheckout}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Direct
                </button>

                <button
                  onClick={handleDirectCheckout}
                  className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  Valider la Commande
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
