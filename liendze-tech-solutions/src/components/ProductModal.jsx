import { X, ShoppingCart, Heart, Star, Check, Truck, Shield } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { getMediaUrl } from '../config/api';

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  if (!product) return null;
  
  const p = product.attributes || product;
  const imageUrl = p.image?.url || p.image?.data?.attributes?.url 
    ? getMediaUrl(p.image?.url || p.image?.data?.attributes?.url) 
    : null;
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-10 relative shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 md:right-7 md:top-7 text-gray-400 hover:text-black transition-all">
          <X size={28}/>
        </button>
        
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 mt-4">
          {/* Image */}
          <div className="w-full md:w-1/2 aspect-square bg-gray-50 rounded-2xl flex items-center justify-center p-6 border shadow-inner">
            {imageUrl ? (
              <img src={imageUrl} className="w-full h-full object-contain" alt={p.name} />
            ) : (
              <span className="text-gray-300 text-lg">Pas d'image</span>
            )}
          </div>
          
          {/* Details */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-start justify-between">
              <h2 className="text-2xl md:text-3xl font-black mb-2 uppercase italic text-gray-950">{p.name}</h2>
              <button 
                onClick={() => toggleWishlist(product)}
                className={`p-2 rounded-full transition-all ${inWishlist ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400 hover:text-pink-500'}`}
              >
                <Heart size={22} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-orange-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < 4 ? 'currentColor' : 'none'} className={i >= 4 ? 'text-gray-300' : ''} />
                ))}
              </div>
              <span className="text-sm text-gray-500">(12 avis)</span>
            </div>
            
            <div className="text-3xl md:text-4xl font-black text-orange-600 mb-6 italic">
              {p.price?.toLocaleString()} USD
            </div>
            
            {p.description && (
              <div className="bg-gray-50 p-5 rounded-2xl mb-6 border-l-4 border-orange-500">
                <h4 className="font-bold text-gray-900 text-sm uppercase mb-2">Description</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{p.description}</p>
              </div>
            )}
            
            {/* Benefits */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck size={18} className="text-orange-500" />
                <span>Livraison rapide</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield size={18} className="text-orange-500" />
                <span>Garantie 1 an</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check size={18} className="text-green-500" />
                <span>Qualité vérifiée</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check size={18} className="text-green-500" />
                <span>Support inclus</span>
              </div>
            </div>
            
            <div className="mt-auto space-y-3">
              <button 
                onClick={() => { addToCart(product); onClose(); }}
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black text-center shadow-lg uppercase hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} /> Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
