import { Package, Laptop, MousePointer2, Smartphone, Gamepad2 } from 'lucide-react';

// Importation du logo officiel
import logo from '../assets/logo.png';

export default function Sidebar({ categories, selectedCategory, setSelectedCategory, onNavigate }) {
  const getIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('laptop') || lowerName.includes('portable')) return <Laptop size={20} />;
    if (lowerName.includes('accessoire') || lowerName.includes('souris')) return <MousePointer2 size={20} />;
    if (lowerName.includes('téléphone') || lowerName.includes('mobile')) return <Smartphone size={20} />;
    if (lowerName.includes('gaming') || lowerName.includes('console')) return <Gamepad2 size={20} />;
    return <Package size={20} />;
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    onNavigate('home');
  };

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-50 bg-white shadow-xl w-16 hover:w-64 transition-all duration-300 group flex-col border-r border-orange-500 overflow-hidden">
      {/* Header de la Sidebar avec le Logo */}
      <div className="h-16 flex items-center px-3.5 border-b cursor-pointer" onClick={() => { setSelectedCategory(null); onNavigate('home'); }}>
        <div className="min-w-[32px] flex items-center justify-center">
          <img 
            src={logo} 
            alt="L" 
            className="h-8 w-auto object-contain" 
          />
        </div>
        <span className="ml-4 font-black text-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap tracking-tighter uppercase italic">
          LIENDZE <span className="text-orange-500">TECH</span>
        </span>
      </div>
      
      {/* Bouton "Tous les produits" */}
      <div onClick={() => { setSelectedCategory(null); onNavigate('home'); }}
           className={`flex items-center px-4 py-4 cursor-pointer transition-colors ${!selectedCategory ? 'bg-orange-500 text-white' : 'hover:bg-orange-50 group-hover:hover:bg-orange-500 group-hover:hover:text-white'}`}>
        <div className="min-w-[32px]"><Package size={20}/></div>
        <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap flex-1 text-sm uppercase tracking-wider">Tous les produits</span>
      </div>

      {/* Navigation des Catégories */}
      <nav className="flex-1 mt-2 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {categories.map((cat) => (
          <div key={cat.id}
               onClick={() => handleCategoryClick(cat.id)}
               className={`flex items-center px-4 py-4 cursor-pointer transition-colors ${selectedCategory === cat.id ? 'bg-orange-500 text-white' : 'hover:bg-orange-50 group-hover:hover:bg-orange-500 group-hover:hover:text-white'}`}>
            <div className="min-w-[32px]">{getIcon(cat.name)}</div>
            <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap flex-1 text-sm">{cat.name}</span>
          </div>
        ))}
      </nav>

      {/* Petit rappel de marque en bas quand la sidebar est ouverte */}
      <div className="p-4 opacity-0 group-hover:opacity-100 transition-opacity border-t border-gray-50 bg-gray-50">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
          Solutions IT Certifiées
        </p>
      </div>
    </aside>
  );
}