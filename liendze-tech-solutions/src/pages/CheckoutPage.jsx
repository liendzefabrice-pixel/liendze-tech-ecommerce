import { useEffect, useState } from 'react';
import { ShoppingBag, MapPin, Phone, Mail, User, CheckCircle, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

// Importation du logo officiel
import logo from '../assets/logo.png';

const API_URL = 'http://localhost:1337';

export default function CheckoutPage({ onNavigate }) {
  const { cart, cartTotal, discount, discountAmount, finalTotal, promoCode, clearCart } = useCart();
  const { user, deliveryProfile, saveDeliveryProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.username || '',
    phone: '',
    address: '',
    city: '',
    notes: '',
    email: user?.email || '',
  });
  const [saveAsDefault, setSaveAsDefault] = useState(!!user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData((current) => ({
      ...current,
      name: deliveryProfile?.full_name || user.username || current.name,
      phone: deliveryProfile?.phone || current.phone,
      address: deliveryProfile?.address || current.address,
      city: deliveryProfile?.city || current.city,
      notes: deliveryProfile?.notes || current.notes,
      email: deliveryProfile?.email || user.email || current.email,
    }));
  }, [deliveryProfile, user]);

  useEffect(() => {
    setSaveAsDefault(!!user);
  }, [user]);

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
        delivery_info: {
          full_name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          notes: formData.notes,
        },
        ...(user?.id ? { client: user.id } : {}),
      };

      if (user && saveAsDefault) {
        const saveProfileResult = await saveDeliveryProfile(orderData.delivery_info);

        if (!saveProfileResult.success) {
          setError(saveProfileResult.error || 'Impossible de sauvegarder votre adresse de livraison');
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
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
        {/* Logo de succès */}
        <img src={logo} alt="Liendze Tech" className="h-16 mb-8" />
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle size={48} className="text-green-500" />
        </div>
        <h2 className="text-3xl font-black uppercase italic mb-3 tracking-tighter">Commande enregistrée!</h2>
        <p className="text-gray-500 mb-4 max-w-md italic">
          Votre commande a été enregistrée et est en attente de validation. 
          Un expert **Liendze Tech** vous contactera sous peu.
        </p>
        <p className="text-sm text-orange-600 font-bold mb-8 uppercase tracking-widest">
          Vérifiez votre boîte email
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => onNavigate('home')}
            className="bg-orange-500 text-white px-8 py-3 rounded-xl font-black uppercase hover:bg-orange-600 transition-colors shadow-lg shadow-orange-100"
          >
            Retour à la boutique
          </button>
          <button 
            onClick={() => { setOrderComplete(false); onNavigate('account'); }}
            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-black uppercase hover:bg-gray-200 transition-colors"
          >
            Mes commandes
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
        <p className="text-gray-500 mb-8 italic">Besoin d'un nouveau laptop ou d'un accessoire ?</p>
        <button 
          onClick={() => onNavigate('home')}
          className="bg-orange-500 text-white px-10 py-4 rounded-xl font-black uppercase hover:bg-orange-600 transition-colors"
        >
          Découvrir nos offres
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors font-bold uppercase text-xs tracking-widest"
        >
          <ArrowLeft size={18} /> Retour au panier
        </button>
        <img src={logo} alt="Liendze Tech" className="h-8 opacity-50" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:items-start">
        {/* Formulaire de livraison */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3 border-l-4 border-orange-500 pl-4">
            Livraison
          </h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 animate-bounce">
              <AlertCircle size={20} />
              <span className="text-sm font-bold uppercase">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 ml-1">Nom complet *</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-orange-500 outline-none transition-all font-medium"
                    placeholder="Prénom et Nom"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 ml-1">Téléphone *</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-orange-500 outline-none transition-all font-medium"
                    placeholder="+237 6..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-400 ml-1">Email *</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-orange-500 outline-none transition-all font-medium"
                  placeholder="votre@email.com"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 ml-1">Ville *</label>
                <select
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-orange-500 outline-none transition-all font-medium appearance-none"
                >
                  <option value="">Choisir...</option>
                  <option value="Douala">Douala</option>
                  <option value="Yaoundé">Yaoundé</option>
                  <option value="Kribi">Kribi</option>
                  <option value="Bafoussam">Bafoussam</option>
                  <option value="Autre">Autre ville</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 ml-1">Quartier / Rue *</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-orange-500 outline-none transition-all font-medium"
                    placeholder="Précisez votre adresse"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-400 ml-1">Notes de livraison</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-orange-500 outline-none transition-all font-medium resize-none"
                rows={2}
                placeholder="Ex: Appeler avant d'arriver..."
              />
            </div>

            {user && (
              <label className="flex items-start gap-3 rounded-2xl border border-orange-100 bg-orange-50/60 px-4 py-3">
                <input
                  type="checkbox"
                  checked={saveAsDefault}
                  onChange={(e) => setSaveAsDefault(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">
                  Enregistrer ces informations comme adresse de livraison par défaut pour mes prochaines commandes.
                </span>
              </label>
            )}
          </form>
        </div>

        {/* Résumé du Panier */}
        <div className="bg-gray-900 rounded-3xl p-6 md:p-8 shadow-2xl text-white h-fit sticky top-24">
          <h2 className="text-xl font-black uppercase italic mb-8 border-b border-gray-800 pb-4 tracking-tighter">
            Votre Commande
          </h2>
          
          <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
            {cart.map((item, idx) => {
              const p = item.attributes || item;
              const qty = item.quantity || 1;
              return (
                <div key={idx} className="flex justify-between items-center gap-4 animate-in slide-in-from-right duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold truncate max-w-[180px]">{p.name}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-black">Quantité: {qty}</span>
                  </div>
                  <span className="font-black text-orange-500 whitespace-nowrap italic">{(p.price * qty).toLocaleString()} FCFA</span>
                </div>
              );
            })}
          </div>
          
          <div className="border-t border-gray-800 pt-6 space-y-3">
            <div className="flex justify-between text-gray-400 text-xs font-bold uppercase">
              <span>Sous-total</span>
              <span>{cartTotal.toLocaleString()} FCFA</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-green-400 text-xs font-bold uppercase">
                <span>Remise ({promoCode})</span>
                <span>-{discountAmount.toLocaleString()} FCFA</span>
              </div>
            )}
            
            <div className="flex justify-between items-end pt-4">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Total Final</span>
              <span className="text-3xl font-black text-orange-500 italic">
                {finalTotal.toLocaleString()} <small className="text-xs italic uppercase">FCFA</small>
              </span>
            </div>
          </div>
          
          <div className="mt-10">
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  Traitement...
                </>
              ) : (
                'Confirmer la commande'
              )}
            </button>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-gray-500">
              <CheckCircle size={14} className="text-green-500" />
              <p className="text-[10px] font-bold uppercase tracking-tighter">Paiement à la livraison sécurisé</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
