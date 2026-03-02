import { Package, Laptop, MousePointer2, Smartphone, Gamepad2 } from 'lucide-react';

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
      <div className="h-16 flex items-center px-4 border-b cursor-pointer" onClick={() => { setSelectedCategory(null); onNavigate('home'); }}>
        <div className="min-w-[32px] h-8 bg-orange-600 rounded flex items-center justify-center text-white font-black italic text-xl shadow-sm">L</div>
        <span className="ml-4 font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap tracking-tighter">LIENDZE TECH</span>
      </div>
      
      <div onClick={() => { setSelectedCategory(null); onNavigate('home'); }}
           className={`flex items-center px-4 py-4 cursor-pointer transition-colors ${!selectedCategory ? 'bg-orange-500 text-white' : 'hover:bg-orange-50 group-hover:hover:bg-orange-500 group-hover:hover:text-white'}`}>
        <div className="min-w-[32px]"><Package size={20}/></div>
        <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap flex-1">Tous</span>
      </div>

      <nav className="flex-1 mt-2 overflow-y-auto overflow-x-hidden">
        {categories.map((cat) => (
          <div key={cat.id}
               onClick={() => handleCategoryClick(cat.id)}
               className={`flex items-center px-4 py-4 cursor-pointer transition-colors ${selectedCategory === cat.id ? 'bg-orange-500 text-white' : 'hover:bg-orange-50 group-hover:hover:bg-orange-500 group-hover:hover:text-white'}`}>
            <div className="min-w-[32px]">{getIcon(cat.name)}</div>
            <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap flex-1">{cat.name}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}
