import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES, type UserRole } from '../types/auth';
import { getObjectsLookupApi, type ObjectLookupItem } from '../api/faq';
import { 
  getOrdersByStatusApi, 
  updateOrderStatusApi, 
  addStockApi, 
  type OrderData, 
  type OrderStatus 
} from '../api/order';

interface NotificationState {
  message: string;
  type: 'success' | 'error';
}

const Orders: React.FC = () => {
  // --- AUTHENTIFICATION CONTEXTE ---
  const { user } = useAuth();

  // --- ÉTATS DES DONNÉES ---
  const [ordersPaid, setOrdersPaid] = useState<OrderData[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<OrderData[]>([]);
  const [ordersSending, setOrdersSending] = useState<OrderData[]>([]);
  const [ordersClosed, setOrdersClosed] = useState<OrderData[]>([]);
  const [objects, setObjects] = useState<ObjectLookupItem[]>([]);

  // --- ÉTATS D'AFFICHAGE & CHARGEMENTS ---
  const [showStockForm, setShowStockForm] = useState<boolean>(false);
  const [loadingStatuses, setLoadingStatuses] = useState<{ [key in OrderStatus]?: boolean }>({
    PAID: false, LOADING: false, SENDING: false, CLOSED: false
  });
  const [expandedOrders, setExpandedOrders] = useState<{ [key: number]: boolean }>({});
  const [actionLoadingIds, setActionLoadingIds] = useState<{ [key: number]: boolean }>({});
  
  // 🔄 ÉTAT POUR PLIER/DÉPLIER LES LISTES ENTIÈRES (Ouvertes par défaut)
  const [expandedLists, setExpandedLists] = useState<{ [key in OrderStatus]: boolean }>({
    PAID: true,
    LOADING: true,
    SENDING: true,
    CLOSED: true
  });
  
  // Choix temporaire du select pour la liste CLOSED
  const [selectedClosedStatus, setSelectedClosedStatus] = useState<{ [key: number]: OrderStatus }>({});

  // --- FORMULAIRE STOCK ---
  const [stockForm, setStockForm] = useState({ id_object: '', quantity_add: '' });
  const [isSubmittingStock, setIsSubmittingStock] = useState<boolean>(false);

  // --- BANNIÈRE DE NOTIFICATION ---
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const triggerNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- VERIFICATION DES DROITS POUR LE FLUX CLOSED ---
  const allowedRoles: UserRole[] = [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN_SIMPLE,
    USER_ROLES.MANAGER
  ];

  const canSeeClosedOrders = user && allowedRoles.includes(user.id_role);

  // --- CHARGEMENT D'UNE LISTE UNIQUE CIBLÉE ---
  const fetchOrdersByStatus = async (status: OrderStatus) => {
    setLoadingStatuses(prev => ({ ...prev, [status]: true }));
    try {
      const res = await getOrdersByStatusApi(status);
      if (res.status === 'OK') {
        if (status === 'PAID') setOrdersPaid(res.data);
        if (status === 'LOADING') setOrdersLoading(res.data);
        if (status === 'SENDING') setOrdersSending(res.data);
        if (status === 'CLOSED') setOrdersClosed(res.data);
      } else {
        triggerNotification(`Erreur lors du chargement du flux ${status}`, 'error');
      }
    } catch (err) {
      console.error(`Erreur d'API sur le flux ${status}:`, err);
    } finally {
      setLoadingStatuses(prev => ({ ...prev, [status]: false }));
    }
  };

  // --- CHARGEMENT AUTOMATIQUE AU CHARGEMENT DE LA PAGE ---
  useEffect(() => {
    if (user) {
      fetchOrdersByStatus('PAID');
      fetchOrdersByStatus('LOADING');
      fetchOrdersByStatus('SENDING');
      
      if (canSeeClosedOrders) {
        fetchOrdersByStatus('CLOSED');
      }

      getObjectsLookupApi()
        .then(resObj => {
          if (resObj.status === 'OK') setObjects(resObj.data);
        })
        .catch(err => console.error(err));
    }
  }, [user, user?.id_role]);

  // --- MISE À JOUR DU STATUT D'UNE COMMANDE ---
  const handleUpdateStatus = async (id_order: number, currentStatus: OrderStatus, nextStatus: OrderStatus) => {
    setActionLoadingIds(prev => ({ ...prev, [id_order]: true }));
    try {
      const res = await updateOrderStatusApi({ id_order, status: nextStatus });
      if (res.status === 'OK') {
        triggerNotification(`Commande N°${id_order} passée en ${nextStatus} !`, 'success');
        setExpandedOrders(prev => ({ ...prev, [id_order]: false }));
        fetchOrdersByStatus(currentStatus);
        fetchOrdersByStatus(nextStatus);
      } else {
        triggerNotification(res.message || "Erreur lors du changement de statut.", 'error');
      }
    } catch (err) {
      triggerNotification("Impossible de modifier le statut.", 'error');
    } finally {
      setActionLoadingIds(prev => ({ ...prev, [id_order]: false }));
    }
  };

  // --- ENREGISTREMENT EN STOCK ---
  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(stockForm.quantity_add);
    if (!stockForm.id_object || isNaN(qty)) {
      return triggerNotification("Veuillez renseigner un produit et une quantité valide.", 'error');
    }

    setIsSubmittingStock(true);
    try {
      const res = await addStockApi({
        id_object: parseInt(stockForm.id_object),
        quantity_add: qty
      });

      if (res.status === 'OK') {
        triggerNotification(res.data || "Stock mis à jour avec succès !", 'success');
        setStockForm({ id_object: '', quantity_add: '' });
        setShowStockForm(false);
      } else {
        triggerNotification(res.message || "Échec de l'ajustement du stock.", 'error');
      }
    } catch (err) {
      triggerNotification("Erreur lors de la liaison au serveur.", 'error');
    } finally {
      setIsSubmittingStock(false);
    }
  };

  const toggleExpandOrder = (id_order: number) => {
    setExpandedOrders(prev => ({ ...prev, [id_order]: !prev[id_order] }));
  };

  // Inverser l'état d'ouverture d'une liste entière
  const toggleExpandList = (status: OrderStatus) => {
    setExpandedLists(prev => ({ ...prev, [status]: !prev[status] }));
  };

  // --- RENDER D'UNE LIGNE DE TABLEAU INTERACTIVE ---
  const renderOrderRow = (order: OrderData, actionButton: React.ReactNode) => {
    const isExpanded = expandedOrders[order.id_order] || false;
    return (
      <div key={order.id_order} className="border-b border-gray-100 last:border-0">
        <div 
          onClick={() => toggleExpandOrder(order.id_order)} 
          className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer text-xs"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 flex-1">
            <div>
              <span className="text-gray-400 block font-medium">Commande</span>
              <strong className="text-gray-900 text-sm">N° {order.id_order}</strong>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Client</span>
              <strong className="text-gray-700 block max-w-[150px] truncate">{order.firstname} {order.surname}</strong>
              <span className="text-gray-400 text-[10px] block truncate">{order.customer_mail}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Date & Total</span>
              <span className="text-gray-600 block">{new Date(order.order_date).toLocaleDateString('fr-FR')}</span>
              <strong className="text-emerald-700 font-bold">{order.total_price} €</strong>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Articles</span>
              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md font-bold text-[10px]">
                {order.total_items} {order.total_items > 1 ? 'objets' : 'objet'}
              </span>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-3 self-end md:self-center">
            {actionButton}
            <span className="text-gray-400 font-bold text-xs hidden md:inline w-6 text-center">
              {isExpanded ? '🔼' : '🔽'}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="bg-slate-50/50 p-4 border-t border-dashed border-gray-100 text-xs">
            <div className="bg-white rounded-lg border border-gray-100 p-3 max-w-2xl space-y-2 shadow-2xs">
              <div className="font-bold text-gray-400 uppercase tracking-wider text-[10px] mb-1">Articles de la commande :</div>
              {order.items.map((item) => (
                <div key={item.id_order_item} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0 text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">x{item.quantity}</span>
                    <span className="font-semibold">{item.object_title}</span>
                    {item.object_sku && <span className="text-gray-400 text-[10px] font-mono">({item.object_sku})</span>}
                  </div>
                  <span className="font-medium text-gray-500">{item.unit_price} € / u</span>
                </div>
              ))}
              <div className="pt-2 text-[10px] text-gray-400 font-mono truncate">
                Ref Paiement: {order.payment_ref}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans text-slate-800 relative">
      
      {/* ALERTE FLOATING DESIGN */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <span>{notification.type === 'success' ? '✅' : '❌'}</span>
          <span>{notification.message}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TOP PANEL */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-gray-900">Suivi Logistique des Commandes</h1>
            <p className="text-xs text-gray-400 mt-0.5">Expédiez les commandes clients et ajustez l'état des stocks réels.</p>
          </div>
          <button 
            onClick={() => {
              fetchOrdersByStatus('PAID');
              fetchOrdersByStatus('LOADING');
              fetchOrdersByStatus('SENDING');
              if (canSeeClosedOrders) fetchOrdersByStatus('CLOSED');
            }} 
            className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-xs self-start sm:self-center"
          >
            🔄 Tout rafraîchir
          </button>
        </div>

        {/* STOCKS ACCORDION */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
          <button 
            onClick={() => setShowStockForm(!showStockForm)} 
            className="w-full flex justify-between items-center p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors font-bold text-sm text-slate-900"
          >
            <span className="flex items-center gap-2">📦 Mouvement de Stock (Ajout / Retrait)</span>
            <span className="text-xs text-blue-600 font-semibold">{showStockForm ? 'Masquer 🔼' : 'Déplier 🔽'}</span>
          </button>
          {showStockForm && (
            <form onSubmit={handleAddStock} className="p-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Sélectionner l'objet</label>
                <select 
                  value={stockForm.id_object} 
                  onChange={e => setStockForm({...stockForm, id_object: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-medium"
                >
                  <option value="">-- Choisir un produit --</option>
                  {objects.map(o => <option key={o.id_object} value={o.id_object}>{o.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Quantité à ajouter (Négatif pour retirer)</label>
                <input 
                  type="number" 
                  placeholder="Ex: 10 ou -5" 
                  value={stockForm.quantity_add} 
                  onChange={e => setStockForm({...stockForm, quantity_add: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-bold"
                />
              </div>
              <div className="flex items-end">
                <button 
                  type="submit" 
                  disabled={isSubmittingStock}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-xs"
                >
                  {isSubmittingStock ? 'Mise à jour...' : 'Appliquer le mouvement'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* COULOIRS DE LOGISTIQUE */}
        <div className="grid grid-cols-1 gap-6">

          {/* FLUX 1 : PAID */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div 
              onClick={() => toggleExpandList('PAID')}
              className="p-4 bg-amber-50/50 border-b border-gray-100 flex justify-between items-center cursor-pointer select-none hover:bg-amber-100/40 transition-colors"
            >
              <h3 className="font-black text-xs uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> 💳 Commandes PAID (À préparer)
              </h3>
              <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                <button onClick={() => fetchOrdersByStatus('PAID')} className="text-[11px] text-amber-700 font-bold hover:underline">
                  {loadingStatuses['PAID'] ? 'Chargement...' : '🔄 Rafraîchir'}
                </button>
                <span className="text-xs text-amber-800 font-bold">{expandedLists['PAID'] ? '🔼' : '🔽'}</span>
              </div>
            </div>
            {expandedLists['PAID'] && (
              <div className="divide-y divide-gray-100">
                {ordersPaid.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400">Aucune commande en attente de préparation.</div>
                ) : (
                  ordersPaid.map(order => renderOrderRow(order, (
                    <button
                      disabled={actionLoadingIds[order.id_order]}
                      onClick={() => handleUpdateStatus(order.id_order, 'PAID', 'LOADING')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[11px] font-bold transition-all shadow-xs"
                    >
                      🚀 Lancer la préparation
                    </button>
                  )))
                )}
              </div>
            )}
          </div>

          {/* FLUX 2 : LOADING */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div 
              onClick={() => toggleExpandList('LOADING')}
              className="p-4 bg-blue-50/50 border-b border-gray-100 flex justify-between items-center cursor-pointer select-none hover:bg-blue-100/40 transition-colors"
            >
              <h3 className="font-black text-xs uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> 📦 Commandes LOADING (En cours de carton)
              </h3>
              <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                <button onClick={() => fetchOrdersByStatus('LOADING')} className="text-[11px] text-blue-700 font-bold hover:underline">
                  {loadingStatuses['LOADING'] ? 'Chargement...' : '🔄 Rafraîchir'}
                </button>
                <span className="text-xs text-blue-800 font-bold">{expandedLists['LOADING'] ? '🔼' : '🔽'}</span>
              </div>
            </div>
            {expandedLists['LOADING'] && (
              <div className="divide-y divide-gray-100">
                {ordersLoading.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400">Aucune commande en cours d'emballage.</div>
                ) : (
                  ordersLoading.map(order => renderOrderRow(order, (
                    <button
                      disabled={actionLoadingIds[order.id_order]}
                      onClick={() => handleUpdateStatus(order.id_order, 'LOADING', 'SENDING')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold transition-all shadow-xs"
                    >
                      🚚 Marquer comme Expédiée
                    </button>
                  )))
                )}
              </div>
            )}
          </div>

          {/* FLUX 3 : SENDING */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div 
              onClick={() => toggleExpandList('SENDING')}
              className="p-4 bg-indigo-50/50 border-b border-gray-100 flex justify-between items-center cursor-pointer select-none hover:bg-indigo-100/40 transition-colors"
            >
              <h3 className="font-black text-xs uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> 🚚 Commandes SENDING (En transit)
              </h3>
              <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                <button onClick={() => fetchOrdersByStatus('SENDING')} className="text-[11px] text-indigo-700 font-bold hover:underline">
                  {loadingStatuses['SENDING'] ? 'Chargement...' : '🔄 Rafraîchir'}
                </button>
                <span className="text-xs text-indigo-800 font-bold">{expandedLists['SENDING'] ? '🔼' : '🔽'}</span>
              </div>
            </div>
            {expandedLists['SENDING'] && (
              <div className="divide-y divide-gray-100">
                {ordersSending.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400">Aucune commande en transit.</div>
                ) : (
                  ordersSending.map(order => renderOrderRow(order, (
                    <button
                      disabled={actionLoadingIds[order.id_order]}
                      onClick={() => handleUpdateStatus(order.id_order, 'SENDING', 'CLOSED')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[11px] font-bold transition-all shadow-xs"
                    >
                      🔒 Clôturer la commande
                    </button>
                  )))
                )}
              </div>
            )}
          </div>

          {/* FLUX 4 : CLOSED */}
          {canSeeClosedOrders && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden animate-fadeIn">
              <div 
                onClick={() => toggleExpandList('CLOSED')}
                className="p-4 bg-slate-100/70 border-b border-gray-100 flex justify-between items-center cursor-pointer select-none hover:bg-slate-200/60 transition-colors"
              >
                <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span> ✅ Archivé : Commandes CLOSED
                </h3>
                <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                  <button onClick={() => fetchOrdersByStatus('CLOSED')} className="text-[11px] text-slate-700 font-bold hover:underline">
                    {loadingStatuses['CLOSED'] ? 'Chargement...' : '🔄 Rafraîchir'}
                  </button>
                  <span className="text-xs text-slate-800 font-bold">{expandedLists['CLOSED'] ? '🔼' : '🔽'}</span>
                </div>
              </div>
              {expandedLists['CLOSED'] && (
                <div className="divide-y divide-gray-100">
                  {ordersClosed.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">Aucune commande archivée.</div>
                  ) : (
                    ordersClosed.map(order => {
                      const currentChosen = selectedClosedStatus[order.id_order] || 'CLOSED';
                      return renderOrderRow(order, (
                        <div className="flex items-center gap-2">
                          <select
                            value={currentChosen}
                            onChange={(e) => setSelectedClosedStatus({
                              ...selectedClosedStatus,
                              [order.id_order]: e.target.value as OrderStatus
                            })}
                            className="bg-gray-50 border border-gray-200 rounded p-1 text-[11px] font-medium text-slate-800"
                          >
                            <option value="CLOSED">CLOSED</option>
                            <option value="PAID">PAID</option>
                            <option value="LOADING">LOADING</option>
                            <option value="SENDING">SENDING</option>
                          </select>
                          <button
                            disabled={currentChosen === 'CLOSED' || actionLoadingIds[order.id_order]}
                            onClick={() => handleUpdateStatus(order.id_order, 'CLOSED', currentChosen)}
                            className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wide border transition-all ${
                              currentChosen !== 'CLOSED'
                                ? 'bg-emerald-600 text-white border-emerald-600 cursor-pointer hover:bg-emerald-700'
                                : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                            }`}
                          >
                            OK
                          </button>
                        </div>
                      ));
                    })
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Orders;