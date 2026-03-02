import { useState } from 'react';
import { ShoppingBag, MapPin, Phone, Mail, User, CheckCircle, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const API_URL = 'http://localhost:1337';

export default function CheckoutPage({ onNavigate }) {
  const { cart, cartTotal, discount, discountAmount, finalTotal, promoCode, clearCart } = useCart();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.username || '',
    phone: '',
    address: '',
    city: '',
    notes: '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);

  const validateForm = () => {
    if (!formData.name.trim()) return 'Veuillez entrer votre nom';
    if (!formData.phone.trim()) return 'Veuillez entrer votre téléphone';
    if (!formData.address.trim()) return 'Veuillez entrer votre adresse';
    if (!formData.city) return 'Veuillez sélectionner une ville';
    if (!formData.email.trim()) return 'Veuillez entrer votre email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Veuillez entrer un email valide';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const items = cart.map(item => ({
        id: item.id,
        name: item.attributes?.name || item.name,
        price: item.attributes?.price || item.price,
        quantity: item.quantity || 1,
      }));

      const orderData = {
  order_id: `ORD-${Date.now()}`,
  items: JSON.stringify(items),
  total_amount: finalTotal,
  order_status: 'en_attente',
  customer_name: formData.name,
  customer_phone: formData.phone,
  customer_email: formData.email,
  shipping_address: formData.address,
  shipping_city: formData.city,
  notes: formData.notes,
  // On ajoute le client uniquement s'il est connecté
...(user?.id ? { client: user.id } : {}),
};

      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: orderData }),
      });

      const data = await res.json();

      if (data.data) {
        clearCart();
        setOrderComplete(true);
      } else {
        setError(data.error?.message || 'Erreur lors de la commande');
      }
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 animate-in fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={48} className="text-green-500" />
        </div>
        <h2 className="text-3xl font-black uppercase italic mb-3">Commande enregistrée!</h2>
        <p className="text-gray-500 mb-4 max-w-md">
          Votre commande a été enregistrée et est en attente de validation. 
          Vous recevrez un email bientôt pour vous informer du statut.
        </p>
        <p className="text-sm text-orange-600 font-medium mb-8">
          Vérifiez votre boîte email (y compris les spams)
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => onNavigate('home')}
            className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold uppercase hover:bg-orange-600 transition-colors"
          >
            Retour à la boutique
          </button>
          <button 
            onClick={() => { setOrderComplete(false); onNavigate('account'); }}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold uppercase hover:bg-gray-200 transition-colors"
          >
            Voir mes commandes
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <ShoppingBag size={80} className="text-gray-200 mb-6" />
        <h2 className="text-2xl font-black uppercase italic mb-3">Votre panier est vide</h2>
        <p className="text-gray-500 mb-8">Ajoutez des produits pour passer une commande</p>
        <button 
          onClick={() => onNavigate('home')}
          className="bg-orange-500 text-white px-8 py-4 rounded-xl font-black uppercase hover:bg-orange-600 transition-colors"
        >
          Découvrir les produits
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <button 
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Retour au panier
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black uppercase italic mb-6 flex items-center gap-3">
            <MapPin className="text-orange-500" /> Informations de livraison
          </h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nom complet *</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                  placeholder="votre@email.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone *</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                  placeholder="+237 6XX XXX XXX"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Adresse *</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-4 top-4 text-gray-400" />
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 resize-none"
                  rows={2}
                  placeholder="Quartier, rue..."
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Ville *</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
              >
                <option value="">Sélectionner une ville</option>
                <option value="Douala">Douala</option>
                <option value="Yaoundé">Yaoundé</option>
                <option value="Kribi">Kribi</option>
                <option value="Bafoussam">Bafoussam</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Notes (optionnel)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 resize-none"
                rows={2}
                placeholder="Instructions spéciales..."
              />
            </div>
          </form>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 h-fit sticky top-24">
          <h2 className="text-2xl font-black uppercase italic mb-6">Résumé</h2>
          
          <div className="space-y-3 mb-6">
            {cart.map((item, idx) => {
              const p = item.attributes || item;
              const qty = item.quantity || 1;
              return (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">{p.name} x{qty}</span>
                  <span className="font-bold">{(p.price * qty).toLocaleString()} FCFA</span>
                </div>
              );
            })}
          </div>
          
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{cartTotal.toLocaleString()} FCFA</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Remesse ({promoCode})</span>
                <span>-{discountAmount.toLocaleString()} FCFA</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-black uppercase italic pt-2">
              <span>Total</span>
              <span className="text-orange-600">{finalTotal.toLocaleString()} FCFA</span>
            </div>
          </div>
          
          <div className="mt-8 space-y-3">
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-orange-500 text-white py-4 rounded-xl font-black uppercase hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Traitement...
                </>
              ) : (
                'Confirmer la commande'
              )}
            </button>
            
            <p className="text-xs text-gray-500 text-center">
              Vous recevrez un email de confirmation après validation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
