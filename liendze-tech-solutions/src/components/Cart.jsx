import { useState } from 'react';
import { X, Trash2, Minus, Plus, Tag, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function Cart({ isOpen, onClose, onCheckout }) {
  const { cart, removeFromCart, updateQuantity, cartTotal, applyPromoCode, discount, discountAmount, finalTotal } = useCart();
  const [promoInput, setPromoInput] = useState('');
  const [promoMsg, setPromoMsg] = useState('');

  const handleApplyPromo = () => {
    const result = applyPromoCode(promoInput);
    if (result.success) {
      setPromoMsg(`Code appliqué! -${result.discount}%`);
    } else {
      setPromoMsg('Code promo invalide');
    }
    setTimeout(() => setPromoMsg(''), 3000);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex justify-end ${isOpen ? 'visible' : 'invisible'}`}>
      <div className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}></div>
      
      <div className={`relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col rounded-l-3xl overflow-hidden transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 bg-orange-600 text-white font-black italic flex justify-between shadow-md">
          <h2 className="uppercase flex items-center gap-2">
            <ShoppingBag size={20}/> VOTRE PANIER ({cart.length})
          </h2>
          <button onClick={onClose}><X size={26}/></button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag size={64} className="text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">Votre panier est vide</p>
            <button onClick={onClose} className="mt-4 text-orange-600 font-bold uppercase hover:underline">
              Continuez vos achats
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {cart.map((item, idx) => {
                const pi = item.attributes || item;
                const price = pi.price || 0;
                const qty = item.quantity || 1;
                return (
                  <div key={idx} className="flex gap-4 items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                      {pi.image?.url || pi.image?.data?.attributes?.url ? (
                        <img 
                          src={`http://localhost:1337${pi.image?.url || pi.image?.data?.attributes?.url}`} 
                          alt={pi.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-gray-300">Img</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold uppercase truncate text-gray-800">{pi.name}</p>
                      <p className="text-orange-600 font-black italic">{(price * qty).toLocaleString()} FCFA</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button 
                          onClick={() => updateQuantity(item.id, qty - 1)}
                          className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-bold w-6 text-center">{qty}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, qty + 1)}
                          className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={20}/>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Promo Code */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Code promo"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <button 
                  onClick={handleApplyPromo}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold uppercase hover:bg-gray-800"
                >
                  Appliquer
                </button>
              </div>
              {promoMsg && (
                <p className={`text-xs mt-2 ${promoMsg.includes('appliqué') ? 'text-green-600' : 'text-red-500'}`}>
                  {promoMsg}
                </p>
              )}
            </div>

            <div className="p-6 border-t bg-white shadow-2xl">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sous-total</span>
                  <span>{cartTotal.toLocaleString()} FCFA</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Remise ({discount}%)</span>
                    <span>-{discountAmount.toLocaleString()} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between text-2xl font-black uppercase italic">
                  <span>TOTAL :</span>
                  <span className="text-orange-600">{finalTotal.toLocaleString()} FCFA</span>
                </div>
              </div>
              
              <button 
                onClick={onCheckout}
                className="w-full bg-green-500 text-white py-4.5 rounded-xl font-black text-lg uppercase shadow-lg hover:bg-green-600 transform active:scale-95 transition-all"
              >
                Passer la commande
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
