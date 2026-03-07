import { ShoppingCart, Package, Heart, Eye } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { getMediaUrl } from '../config/api';

export default function ProductCard({ product, onViewDetails }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  const p = product.attributes || product;
  const imageUrl = p.image?.url || p.image?.data?.attributes?.url 
    ? getMediaUrl(p.image?.url || p.image?.data?.attributes?.url) 
    : null;
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-transparent hover:border-orange-200 hover:shadow-xl transition-all duration-300 group flex flex-col overflow-hidden">
      <div className="aspect-square bg-gray-50 flex items-center justify-center p-4 cursor-pointer overflow-hidden relative" onClick={onViewDetails}>
        {imageUrl ? (
          <img src={imageUrl} alt={p.name} className="w-full h-full object-contain transition-transform duration-500 ease-in-out group-hover:scale-110" />
        ) : (
          <Package size={56} className="text-gray-200 group-hover:scale-110 transition-transform" />
        )}
        
        {/* Wishlist Button */}
        <button 
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all ${inWishlist ? 'bg-pink-500 text-white' : 'bg-white text-gray-400 hover:text-pink-500 shadow-md'}`}
        >
          <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        {/* Quick View */}
        <button 
          onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
          className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Eye size={18} className="text-orange-600" />
        </button>
      </div>
      
      <div className="p-5 flex flex-col flex-1 border-t">
        <h3 className="text-sm font-bold truncate uppercase text-gray-800">{p.name}</h3>
        <p className="text-orange-600 font-black mt-1 text-xl mb-5 italic">{p.price?.toLocaleString()} FCFA</p>
        
        <div className="mt-auto space-y-2">
          <button 
            onClick={handleAddToCart}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 uppercase hover:bg-orange-600 transition-colors transform active:scale-95 shadow-md shadow-orange-100"
          >
            <ShoppingCart size={15} /> AJOUTER AU PANIER
          </button>
          <button 
            onClick={onViewDetails}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-xs uppercase hover:bg-gray-200 transition-colors"
          >
            DÉTAILS
          </button>
        </div>
      </div>
    </div>
  );
}
