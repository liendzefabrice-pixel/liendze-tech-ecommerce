import { useState, useEffect } from 'react';
import { ShieldCheck, Clock, CheckCircle2, Wrench, Monitor } from 'lucide-react';

// Importation du logo
import logo from './assets/logo.png'; 

import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { AuthProvider } from './contexts/AuthContext';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import ProductModal from './components/ProductModal';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { getApiUrl } from './config/api';

import WishlistPage from './pages/WishlistPage';
import AccountPage from './pages/AccountPage';
import CheckoutPage from './pages/CheckoutPage';

function AppContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState("home");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Fetch products when category changes
  useEffect(() => {
    let url = getApiUrl('/api/products?populate=*');
    if (selectedCategory) {
      url = getApiUrl(`/api/products?filters[category][id][$eq]=${selectedCategory}&populate=*`);
    }
    
    fetch(url)
      .then((res) => res.json())
      .then((response) => {
        if (response?.data) setProducts(response.data);
      }).catch(err => console.error("Erreur produits:", err));
  }, [selectedCategory]);

  useEffect(() => {
    fetch(getApiUrl('/api/categories'))
      .then((res) => res.json())
      .then((response) => {
        if (response?.data) {
          const formatted = response.data.map(item => ({
            id: item.id,
            name: item.attributes?.name || item.name || "",
          }));
          setCategories(formatted);
        }
      }).catch(err => console.error("Erreur catégories:", err));
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    setSearchQuery("");
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  };

  const filteredProducts = products.filter(product => {
    const p = product.attributes || product;
    const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigateTo('checkout');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <>
            {!selectedCategory && !searchQuery && (
              <div className="bg-white rounded-xl shadow-sm border border-orange-100 mb-10 p-8 border-l-8 border-l-orange-500 animate-in fade-in duration-500 flex flex-col md:flex-row items-center gap-8">
                {/* Ajout du logo dans le bloc de bienvenue */}
                <img src={logo} alt="LTS Logo" className="h-28 w-auto object-contain" />
                <div>
                  <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase leading-tight">
                    Bienvenue chez <span className="text-orange-500">Liendze Tech</span>
                  </h2>
                  <p className="text-gray-600 text-lg italic max-w-2xl">
                    Qualité & Performance IT directement importés pour vous au Cameroun.
                  </p>
                </div>
              </div>
            )}

            <h3 className="text-xl font-black mb-8 uppercase tracking-tighter border-l-4 border-orange-500 pl-3 italic text-gray-900">
              {selectedCategory 
                ? `Rayon : ${categories.find(c => c.id === selectedCategory)?.name}` 
                : "Nos Articles"}
            </h3>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">Aucun produit trouvé</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onViewDetails={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            )}
          </>
        );

      case 'about':
        return (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-4xl mx-auto animate-in fade-in">
            <div className="flex items-center gap-6 mb-8">
               <img src={logo} alt="Logo" className="h-16 w-auto" />
               <h2 className="text-4xl font-black italic uppercase">
                 À Propos de <span className="text-orange-500">Liendze Tech</span>
               </h2>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed italic mb-8">
              Leader de la distribution informatique au Cameroun, nous fournissons du matériel certifié pour professionnels et particuliers.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-orange-50 rounded-2xl">
                <ShieldCheck className="mx-auto text-orange-600 mb-2" size={32} /> 
                <h4 className="font-bold">Qualité</h4>
              </div>
              <div className="text-center p-6 bg-orange-50 rounded-2xl">
                <Clock className="mx-auto text-orange-600 mb-2" size={32} /> 
                <h4 className="font-bold">SAV Réactif</h4>
              </div>
              <div className="text-center p-6 bg-orange-50 rounded-2xl">
                <CheckCircle2 className="mx-auto text-orange-600 mb-2" size={32} /> 
                <h4 className="font-bold">Garantie</h4>
              </div>
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom duration-500">
            <h2 className="text-4xl font-black italic uppercase mb-12 border-l-8 border-orange-500 pl-6">
              Nos <span className="text-orange-500">Services IT</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border-t-8 border-orange-600 hover:shadow-xl transition-shadow">
                <Wrench className="text-orange-600 mb-4" size={40}/>
                <h3 className="text-xl font-black uppercase mb-4 italic">Maintenance & Dépannage</h3>
                <p className="text-gray-600 text-sm italic">Réparation laptops, écrans et installation systèmes.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border-t-8 border-gray-900 hover:shadow-xl transition-shadow">
                <Monitor className="text-gray-900 mb-4" size={40}/>
                <h3 className="text-xl font-black uppercase mb-4 italic">Solutions Réseaux</h3>
                <p className="text-gray-600 text-sm italic">Installation Wi-Fi Pro et configuration serveurs.</p>
              </div>
            </div>
          </div>
        );

      case 'support':
        return (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in">
            <div className="bg-orange-600 p-8 text-white text-center">
              <h2 className="text-3xl font-black uppercase italic">Contactez le Support</h2>
            </div>
            <div className="p-8 grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-orange-600 font-bold">📞</span>
                  <p className="font-bold">+237 656 55 66 52</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-orange-600 font-bold">✉️</span>
                  <p className="font-bold">contact@liendzetech.cm</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-orange-600 font-bold">📍</span>
                  <p className="font-bold">Douala / Yaoundé, Cameroun</p>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl text-sm italic">
                 <p className="font-bold mb-2 uppercase">Horaires</p>
                 <p>Lun - Ven : 08h30 - 18h00</p>
                 <p>Samedi : 09h00 - 15h00</p>
              </div>
            </div>
          </div>
        );

      case 'wishlist':
        return <WishlistPage onViewProduct={setSelectedProduct} />;

      case 'account':
        return <AccountPage onNavigate={navigateTo} />;

      case 'checkout':
        return <CheckoutPage onNavigate={navigateTo} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      <Sidebar 
        categories={categories} 
        selectedCategory={selectedCategory} 
        setSelectedCategory={setSelectedCategory}
        onNavigate={navigateTo}
      />

      <div className="lg:ml-16 flex-1 flex flex-col transition-all duration-300">
        <Header 
          onNavigate={navigateTo}
          onOpenAuth={() => setIsAuthOpen(true)}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1">
          {renderPage()}
        </main>

        <Footer onNavigate={navigateTo} />
      </div>

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />

      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/+237656556652" 
        target="_blank" 
        rel="noreferrer" 
        className="fixed bottom-8 right-8 z-50 hover:scale-110 transition-transform shadow-2xl rounded-full"
      >
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
          alt="WA" 
          className="w-16 h-16" 
        />
      </a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AppContent />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
