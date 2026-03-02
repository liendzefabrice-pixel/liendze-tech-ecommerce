import { Facebook, Smartphone, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-gray-950 text-white pt-16 mt-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 pb-16">
        <div className="space-y-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center font-black italic text-xl">L</div>
            <span className="text-xl font-black tracking-tighter uppercase">LIENDZE TECH</span>
          </div>
          <p className="text-gray-400 text-sm italic leading-relaxed">Leader de la distribution informatique au Cameroun. Qualité & Performance IT directement importés pour vous.</p>
        </div>
        
        <div>
          <h4 className="font-bold text-orange-500 mb-6 uppercase text-sm border-b border-gray-800 pb-2">Navigation</h4>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li className="hover:text-orange-400 cursor-pointer transition-colors" onClick={() => onNavigate('home')}>Accueil Boutique</li>
            <li className="hover:text-orange-400 cursor-pointer transition-colors" onClick={() => onNavigate('wishlist')}>Ma Wishlist</li>
            <li className="hover:text-orange-400 cursor-pointer transition-colors" onClick={() => onNavigate('about')}>À Propos</li>
            <li className="hover:text-orange-400 cursor-pointer transition-colors" onClick={() => onNavigate('services')}>Nos Services</li>
            <li className="hover:text-orange-400 cursor-pointer transition-colors" onClick={() => onNavigate('support')}>Support Client</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold text-orange-500 mb-6 uppercase text-sm border-b border-gray-800 pb-2">Contact</h4>
          <div className="space-y-3 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-orange-500" />
              <span>+237 656 55 66 52</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-orange-500" />
              <span>contact@liendzetech.cm</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-orange-500" />
              <span>Douala / Yaoundé, Cameroun</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-orange-500 mb-6 uppercase text-sm border-b border-gray-800 pb-2">Suivez-nous</h4>
          <div className="flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="p-3 bg-gray-800 rounded-full hover:bg-orange-500 transition-colors">
              <Facebook size={22} />
            </a>
            <a href="https://wa.me/+237656556652" target="_blank" rel="noreferrer" className="p-3 bg-gray-800 rounded-full hover:bg-green-500 transition-colors">
              <Smartphone size={22} />
            </a>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-900 py-8 text-center text-gray-600 text-[10px] uppercase tracking-widest font-bold">
        © 2026 LIENDZE TECH SOLUTIONS - TOUS DROITS RÉSERVÉS
      </div>
    </footer>
  );
}
