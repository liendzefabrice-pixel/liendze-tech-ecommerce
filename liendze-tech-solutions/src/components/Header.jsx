import { ShoppingCart, Search, Menu, X, Heart, User, LogOut, Package, UserPlus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';

export default function Header({ onNavigate, onOpenAuth, setIsCartOpen, isMobileMenuOpen, setIsMobileMenuOpen, searchQuery, setSearchQuery, categories, setSelectedCategory }) {
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();

  const navigateTo = (page) => {
    onNavigate(page);
    setSelectedCategory(null);
    setSearchQuery("");
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white border-b sticky top-0 z-40 p-4 flex items-center justify-between gap-4 shadow-sm">
        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-orange-500 hover:bg-orange-50 rounded-full transition-colors">
          <Menu size={28} />
        </button>
        
        <div className="flex-1 max-w-2xl relative">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            className="w-full border-2 border-orange-500 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onNavigate('home');
            }}
          />
          <div className="absolute right-0 top-0 bottom-0 bg-orange-500 text-white px-4 rounded-r-lg flex items-center">
            <Search size={20} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <button onClick={() => navigateTo('account')} className="text-orange-500 p-2 relative cursor-pointer hover:bg-orange-50 rounded-full transition-colors">
              <User size={28} />
            </button>
          ) : (
            <button onClick={onOpenAuth} className="text-orange-500 p-2 relative cursor-pointer hover:bg-orange-50 rounded-full transition-colors">
              <UserPlus size={28} />
            </button>
          )}

          <button onClick={() => navigateTo('wishlist')} className="text-orange-500 p-2 relative cursor-pointer hover:bg-orange-50 rounded-full transition-colors">
            <Heart size={28} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[11px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </button>

          <div onClick={() => setIsCartOpen(true)} className="text-orange-500 p-2 relative cursor-pointer hover:bg-orange-50 rounded-full transition-colors group">
            <ShoppingCart size={28} className="group-hover:scale-110 transition-transform" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse shadow-md">
                {itemCount}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[100] lg:hidden ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/60 transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className={`absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl transform transition-transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 bg-orange-500 text-white font-black italic shadow-md uppercase flex justify-between items-center">
            <span>Liendze Tech</span>
            <button onClick={() => setIsMobileMenuOpen(false)}><X size={24}/></button>
          </div>
          
          <div className="p-4 border-b">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Catégories</p>
            <div className="space-y-1">
              <div onClick={() => { setSelectedCategory(null); navigateTo('home'); }} className="p-3 font-medium hover:bg-orange-50 rounded-lg transition-colors">
                Tous les produits
              </div>
              {categories.map((cat) => (
                <div key={cat.id} onClick={() => { setSelectedCategory(cat.id); navigateTo('home'); }} className="p-3 font-medium hover:bg-orange-50 rounded-lg transition-colors">
                  {cat.name}
                </div>
              ))}
            </div>
          </div>

          <nav className="flex flex-col">
            <div onClick={() => navigateTo('home')} className="p-5 border-b font-bold uppercase hover:bg-orange-50 transition-colors">Boutique</div>
            <div onClick={() => navigateTo('wishlist')} className="p-5 border-b font-bold uppercase hover:bg-orange-50 transition-colors flex items-center gap-2">
              <Heart size={18} /> Ma Wishlist
            </div>
            <div onClick={() => navigateTo('account')} className="p-5 border-b font-bold uppercase hover:bg-orange-50 transition-colors flex items-center gap-2">
              <User size={18} /> Mon Compte
            </div>
            <div onClick={() => navigateTo('about')} className="p-5 border-b font-bold uppercase hover:bg-orange-50 transition-colors">À Propos</div>
            <div onClick={() => navigateTo('services')} className="p-5 border-b font-bold uppercase hover:bg-orange-50 transition-colors">Services</div>
            <div onClick={() => navigateTo('support')} className="p-5 font-bold uppercase hover:bg-orange-50 transition-colors">Support</div>
          </nav>
        </div>
      </div>
    </>
  );
}
