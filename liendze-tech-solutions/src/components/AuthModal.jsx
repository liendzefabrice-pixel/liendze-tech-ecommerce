import { useState } from 'react';
import { X, User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login, register, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    let result;
    if (mode === 'login') {
      result = await login(formData.email, formData.password);
    } else {
      if (!formData.username) {
        setError('Veuillez entrer un nom d\'utilisateur');
        return;
      }
      result = await register(formData.username, formData.email, formData.password);
    }
    
    if (result.success) {
      onClose();
      setFormData({ username: '', email: '', password: '' });
    } else {
      setError(result.error || 'Une erreur est survenue');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-black">
          <X size={24}/>
        </button>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-orange-600" />
          </div>
          <h2 className="text-2xl font-black uppercase italic">
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            {mode === 'login' ? 'Accédez à votre compte' : 'Rejoignez Liendze Tech'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Nom d'utilisateur"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          )}
          
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
              required
            />
          </div>
          
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mot de passe"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-black uppercase hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              mode === 'login' ? 'Se connecter' : 'Créer mon compte'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          {mode === 'login' ? (
            <p className="text-gray-600 text-sm">
              Pas encore de compte?{' '}
              <button onClick={() => { setMode('register'); setError(''); }} className="text-orange-600 font-bold hover:underline">
                S'inscrire
              </button>
            </p>
          ) : (
            <p className="text-gray-600 text-sm">
              Déjà un compte?{' '}
              <button onClick={() => { setMode('login'); setError(''); }} className="text-orange-600 font-bold hover:underline">
                Se connecter
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
