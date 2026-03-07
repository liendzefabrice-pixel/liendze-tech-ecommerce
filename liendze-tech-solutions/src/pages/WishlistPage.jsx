import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';
import { getMediaUrl } from '../config/api';

export default function WishlistPage({ onViewProduct }) {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const moveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <Heart size={80} className="text-gray-200 mb-6" />
        <h2 className="text-2xl font-black uppercase italic mb-3">Votre wishlist est vide</h2>
        <p className="text-gray-500 mb-8">Ajoutez des produits que vous aimez à votre wishlist</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase italic flex items-center gap-3">
            <Heart className="text-pink-500" size={28} /> Ma Wishlist
          </h2>
          <p className="text-gray-500 mt-1">{wishlist.length} produit{wishlist.length > 1 ? 's' : ''} sauvegardé{wishlist.length > 1 ? 's' : ''}</p>
        </div>
        <button 
          onClick={clearWishlist}
          className="text-red-500 text-sm font-bold uppercase hover:underline"
        >
          Tout supprimer
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => {
          const p = product.attributes || product;
          return (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
              <div className="aspect-square bg-gray-50 flex items-center justify-center p-4 cursor-pointer overflow-hidden relative" onClick={() => onViewProduct(product)}>
                {p.image?.url || p.image?.data?.attributes?.url ? (
                  <img 
                    src={getMediaUrl(p.image?.url || p.image?.data?.attributes?.url)} 
                    alt={p.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                  />
                ) : (
                  <Package size={48} className="text-gray-200" />
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFromWishlist(product.id); }}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-bold uppercase text-sm truncate mb-1">{p.name}</h3>
                <p className="text-orange-600 font-black italic">{p.price?.toLocaleString()} FCFA</p>
                <button 
                  onClick={() => moveToCart(product)}
                  className="w-full mt-3 bg-orange-500 text-white py-2 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
                >
                  <ShoppingCart size={14} /> Ajouter au panier
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
