import { useEffect, useMemo, useState } from 'react';
import { User, Package, LogOut, ShoppingBag, Clock, CheckCircle, Truck, MapPin, Save, ChevronDown, ChevronUp, Phone, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function AccountPage({ onNavigate }) {
  const { user, orders, deliveryProfile, logout, saveDeliveryProfile, isAuthenticated } = useAuth();
  const { clearCart } = useCart();
  const [activeTab, setActiveTab] = useState('orders');
  const [deliveryForm, setDeliveryForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });
  const [deliveryStatus, setDeliveryStatus] = useState({ type: '', message: '' });
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const defaultDate = useMemo(() => new Date().toISOString(), []);

  const formatDate = (dateStr) => {
    if (!dateStr) return new Date(defaultDate).toLocaleDateString('fr-FR');
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const handleLogout = () => {
    logout();
    clearCart();
    onNavigate('home');
  };

  useEffect(() => {
    setDeliveryForm({
      full_name: deliveryProfile?.full_name || user?.username || '',
      email: deliveryProfile?.email || user?.email || '',
      phone: deliveryProfile?.phone || '',
      address: deliveryProfile?.address || '',
      city: deliveryProfile?.city || '',
      notes: deliveryProfile?.notes || '',
    });
  }, [deliveryProfile, user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'payé': return 'bg-green-100 text-green-700';
      case 'livré': return 'bg-blue-100 text-blue-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'payé': return <CheckCircle size={16} />;
      case 'livré': return <Truck size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6">
          <User size={48} className="text-orange-500" />
        </div>
        <h2 className="text-2xl font-black uppercase italic mb-3">Connectez-vous</h2>
        <p className="text-gray-500 mb-8 max-w-md">Connectez-vous pour voir votre historique de commandes et gérer votre compte</p>
        <button 
          onClick={() => {}}
          className="bg-orange-500 text-white px-8 py-4 rounded-xl font-black uppercase hover:bg-orange-600 transition-colors"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <User size={40} className="text-orange-600" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black uppercase italic">{user.username}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} /> Déconnexion
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase text-sm transition-colors ${activeTab === 'orders' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
        >
          <Package size={18} /> Commandes
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase text-sm transition-colors ${activeTab === 'profile' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
        >
          <User size={18} /> Profil
        </button>
        <button
          onClick={() => setActiveTab('delivery')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase text-sm transition-colors ${activeTab === 'delivery' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
        >
          <MapPin size={18} /> Livraison
        </button>
      </div>

      {/* Content */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
              <ShoppingBag size={64} className="text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Aucune commande</h3>
              <p className="text-gray-500 mb-6">Vous n'avez pas encore passé de commande</p>
              <button 
                onClick={() => onNavigate('home')}
                className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold uppercase hover:bg-orange-600 transition-colors"
              >
                Découvrir les produits
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const o = order.attributes || order;
              const orderItems = normalizeOrderItems(o.items);
              const deliveryInfo = o.delivery_info || {};
              const isExpanded = expandedOrderId === order.id;
              return (
                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="font-bold text-gray-900">Commande #{o.order_id || order.id}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(o.order_status)}`}>
                      {getStatusIcon(o.order_status)}
                      {o.order_status === 'en_attente' ? 'En attente' : o.order_status === 'payé' ? 'Payé' : 'Livré'}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Articles</p>
                        <p className="font-semibold text-gray-900">{orderItems.length} produit{orderItems.length > 1 ? 's' : ''}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="inline-flex items-center gap-2 rounded-xl border border-orange-200 px-4 py-2 text-sm font-bold uppercase text-orange-600 hover:bg-orange-50 transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {isExpanded ? 'Masquer' : 'Voir détails'}
                      </button>
                    </div>
                    <div className="flex justify-between font-black text-lg">
                      <span>Total</span>
                      <span className="text-orange-600">{o.total_amount?.toLocaleString()} USD</span>
                    </div>

                    {isExpanded && (
                      <div className="mt-5 grid gap-5 border-t pt-5 md:grid-cols-[1.3fr_1fr]">
                        <div>
                          <h4 className="text-sm font-black uppercase text-gray-500 mb-3">Contenu de la commande</h4>
                          <div className="space-y-2">
                            {orderItems.map((item, idx) => (
                              <div key={idx} className="flex justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm">
                                <span className="text-gray-700">{item.name} x{item.quantity}</span>
                                <span className="font-bold text-gray-900">{item.price * item.quantity} USD</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-black uppercase text-gray-500 mb-3">Livraison</h4>
                          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3 text-sm">
                            <div>
                              <p className="text-gray-400 uppercase text-xs font-bold">Destinataire</p>
                              <p className="font-semibold text-gray-900">{deliveryInfo.full_name || 'Non renseigné'}</p>
                            </div>
                            <div className="flex items-start gap-2 text-gray-700">
                              <Mail size={15} className="mt-0.5 text-orange-500" />
                              <span>{deliveryInfo.email || 'Email non renseigné'}</span>
                            </div>
                            <div className="flex items-start gap-2 text-gray-700">
                              <Phone size={15} className="mt-0.5 text-orange-500" />
                              <span>{deliveryInfo.phone || 'Téléphone non renseigné'}</span>
                            </div>
                            <div className="flex items-start gap-2 text-gray-700">
                              <MapPin size={15} className="mt-0.5 text-orange-500" />
                              <span>{[deliveryInfo.address, deliveryInfo.city].filter(Boolean).join(', ') || 'Adresse non renseignée'}</span>
                            </div>
                            {deliveryInfo.notes && (
                              <div>
                                <p className="text-gray-400 uppercase text-xs font-bold">Instructions</p>
                                <p className="text-gray-700">{deliveryInfo.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6">Informations du compte</h3>
          <div className="space-y-4">
            <div className="flex justify-between py-4 border-b">
              <span className="text-gray-600">Nom d'utilisateur</span>
              <span className="font-bold">{user.username}</span>
            </div>
            <div className="flex justify-between py-4 border-b">
              <span className="text-gray-600">Email</span>
              <span className="font-bold">{user.email}</span>
            </div>
            <div className="flex justify-between py-4">
              <span className="text-gray-600">Membre depuis</span>
              <span className="font-bold">2026</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'delivery' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold">Informations de livraison</h3>
              <p className="text-gray-500 text-sm mt-1">
                Ces informations seront pré-remplies lors de vos prochaines commandes.
              </p>
            </div>
          </div>

          {deliveryStatus.message && (
            <div className={`mb-6 rounded-2xl px-4 py-3 text-sm font-medium ${deliveryStatus.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {deliveryStatus.message}
            </div>
          )}

          <form
            className="space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              setSavingDelivery(true);
              setDeliveryStatus({ type: '', message: '' });

              const result = await saveDeliveryProfile(deliveryForm);

              if (result.success) {
                setDeliveryStatus({ type: 'success', message: 'Informations de livraison enregistrées.' });
              } else {
                setDeliveryStatus({ type: 'error', message: result.error || 'Impossible d’enregistrer vos informations.' });
              }

              setSavingDelivery(false);
            }}
          >
            <div className="grid md:grid-cols-2 gap-5">
              <label className="space-y-2">
                <span className="text-xs font-black uppercase text-gray-400 ml-1">Nom complet *</span>
                <input
                  type="text"
                  required
                  value={deliveryForm.full_name}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, full_name: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-orange-500 outline-none transition-all font-medium"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase text-gray-400 ml-1">Téléphone *</span>
                <input
                  type="tel"
                  required
                  value={deliveryForm.phone}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, phone: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-orange-500 outline-none transition-all font-medium"
                />
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="text-xs font-black uppercase text-gray-400 ml-1">Email *</span>
              <input
                type="email"
                required
                value={deliveryForm.email}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, email: e.target.value })}
                className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-orange-500 outline-none transition-all font-medium"
              />
            </label>

            <div className="grid md:grid-cols-2 gap-5">
              <label className="space-y-2">
                <span className="text-xs font-black uppercase text-gray-400 ml-1">Ville *</span>
                <select
                  required
                  value={deliveryForm.city}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, city: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-orange-500 outline-none transition-all font-medium appearance-none"
                >
                  <option value="">Choisir...</option>
                  <option value="Douala">Douala</option>
                  <option value="Yaoundé">Yaoundé</option>
                  <option value="Kribi">Kribi</option>
                  <option value="Bafoussam">Bafoussam</option>
                  <option value="Autre">Autre ville</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase text-gray-400 ml-1">Adresse *</span>
                <input
                  type="text"
                  required
                  value={deliveryForm.address}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, address: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-orange-500 outline-none transition-all font-medium"
                />
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="text-xs font-black uppercase text-gray-400 ml-1">Notes de livraison</span>
              <textarea
                value={deliveryForm.notes}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-orange-500 outline-none transition-all font-medium resize-none"
              />
            </label>

            <button
              type="submit"
              disabled={savingDelivery}
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-black uppercase hover:bg-orange-600 transition-colors disabled:opacity-60"
            >
              {savingDelivery ? 'Enregistrement...' : <><Save size={16} /> Enregistrer</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function normalizeOrderItems(items) {
  if (Array.isArray(items)) {
    return items;
  }

  if (typeof items === 'string') {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}
