import React, { useState, useEffect, useMemo } from 'react';
import { ecommerceService, SAMPLE_PRODUCTS } from '../../services/ecommerceService';
import { OrderRecord } from '../../types/saas';
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Search,
  Filter,
  MessageCircle,
  ExternalLink,
  Package,
  DollarSign,
} from 'lucide-react';

interface EcommerceOrdersTabProps {
  organizationId: string;
}

export const EcommerceOrdersTab: React.FC<EcommerceOrdersTabProps> = ({ organizationId }) => {
  const [orders, setOrders] = useState<OrderRecord[]>(() => ecommerceService.getOrders());
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    return ecommerceService.subscribe(() => {
      setOrders([...ecommerceService.getOrders()]);
    });
  }, []);

  const metrics = useMemo(() => ecommerceService.getMetrics(), [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          (o.customerEmail && o.customerEmail.toLowerCase().includes(q)) ||
          o.customerPhone.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const handleUpdateStatus = (orderId: string, status: OrderRecord['status']) => {
    ecommerceService.updateOrderStatus(orderId, status);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status });
    }
    setToastMsg(`Commande ${orderId} passée en statut : ${status}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const getStatusBadge = (status: OrderRecord['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> En attente
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="w-3 h-3" /> Confirmée
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Truck className="w-3 h-3" /> Expédiée
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
            <XCircle className="w-3 h-3" /> Annulée
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Chiffre d'Affaires</p>
            <p className="text-2xl font-bold text-white mt-1">
              {metrics.totalRevenue.toLocaleString('fr-FR')} €
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Total Commandes</p>
            <p className="text-2xl font-bold text-white mt-1">{metrics.totalOrders}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">À Traiter</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{metrics.pendingOrders}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Panier Moyen</p>
            <p className="text-2xl font-bold text-white mt-1">{metrics.averageOrderValue} €</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900 p-3 rounded-xl border border-zinc-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher une commande..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="CONFIRMED">Confirmée</option>
            <option value="SHIPPED">Expédiée</option>
            <option value="CANCELLED">Annulée</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Réf Commande</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Articles</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Canal</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                    Aucune commande trouvée.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-zinc-800/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-white flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-indigo-400" />
                      {order.id}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{order.customerName}</p>
                      <p className="text-[11px] text-zinc-400">{order.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-white">
                        {order.items.reduce((sum, it) => sum + it.quantity, 0)} article(s)
                      </span>
                      <p className="text-[11px] text-zinc-400 truncate max-w-xs">
                        {order.items.map((it) => it.product.title).join(', ')}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400 text-sm">
                      {order.totalAmount.toLocaleString('fr-FR')} {order.currency}
                    </td>
                    <td className="px-4 py-3">
                      {order.checkoutMode === 'WHATSAPP' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                          <MessageCircle className="w-3 h-3" /> WhatsApp
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-400">
                          Direct
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {selectedOrder.id}
                </span>
                <h3 className="text-base font-bold text-white mt-1">Détail de la Commande</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                <p className="text-zinc-400">Client : <span className="text-white font-semibold">{selectedOrder.customerName}</span></p>
                <p className="text-zinc-400">Téléphone : <span className="text-white font-mono">{selectedOrder.customerPhone}</span></p>
                {selectedOrder.customerEmail && (
                  <p className="text-zinc-400">Email : <span className="text-white">{selectedOrder.customerEmail}</span></p>
                )}
                {selectedOrder.shippingAddress && (
                  <p className="text-zinc-400">Adresse : <span className="text-white">{selectedOrder.shippingAddress}</span></p>
                )}
                {selectedOrder.notes && (
                  <p className="text-zinc-400">Notes : <span className="text-amber-300 italic">{selectedOrder.notes}</span></p>
                )}
              </div>

              <div>
                <h4 className="text-zinc-400 font-semibold mb-2">Articles commandés :</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded bg-zinc-950 border border-zinc-800"
                    >
                      <div className="flex items-center gap-2.5">
                        {item.product.imageUrl && (
                          <img
                            src={item.product.imageUrl}
                            alt=""
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-white">{item.product.title}</p>
                          <p className="text-[11px] text-zinc-400">
                            Quantité : {item.quantity} {item.selectedVariant ? `• ${item.selectedVariant}` : ''}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-white">
                        {(item.product.price * item.quantity).toLocaleString('fr-FR')} {item.product.currency}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="font-bold text-white">Total Commande TTC</span>
                <span className="text-base font-extrabold text-emerald-400">
                  {selectedOrder.totalAmount.toLocaleString('fr-FR')} {selectedOrder.currency}
                </span>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Changer le statut :</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['PENDING', 'CONFIRMED', 'SHIPPED', 'CANCELLED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                      className={`py-1.5 rounded text-xs font-semibold transition-all ${
                        selectedOrder.status === st
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              {selectedOrder.customerPhone && (
                <a
                  href={`https://api.whatsapp.com/send?phone=${selectedOrder.customerPhone.replace(/[^0-9+]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Contacter sur WhatsApp
                </a>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
