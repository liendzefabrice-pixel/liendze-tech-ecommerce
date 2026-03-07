/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API_URL from '../config/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [orders, setOrders] = useState([]);
  const [deliveryProfile, setDeliveryProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/orders/me`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      if (data.data) setOrders(data.data);
    } catch {
      console.error('Erreur fetch orders');
    }
  }, [user]);

  const fetchDeliveryProfile = useCallback(async () => {
    if (!user) {
      setDeliveryProfile(null);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/delivery-profiles/me`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      setDeliveryProfile(data.data || null);
    } catch {
      console.error('Erreur fetch delivery profile');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchDeliveryProfile();
    } else {
      setDeliveryProfile(null);
    }
  }, [user, fetchOrders, fetchDeliveryProfile]);

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/local/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (data.jwt) {
        const userData = {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          token: data.jwt,
        };
        setUser(userData);
        return { success: true };
      }
      return { success: false, error: data.error?.message || 'Erreur inscription' };
    } catch {
      return { success: false, error: 'Erreur connexion' };
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (data.jwt) {
        const userData = {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          token: data.jwt,
        };
        setUser(userData);
        return { success: true };
      }
      return { success: false, error: data.error?.message || 'Erreur connexion' };
    } catch {
      return { success: false, error: 'Erreur connexion' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setOrders([]);
  };

  const createOrder = async (orderData) => {
    if (!user) return { success: false, error: 'Non connecté' };
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ data: orderData }),
      });
      const data = await res.json();
      if (data.data) {
        fetchOrders();
        return { success: true, order: data.data };
      }
      return { success: false, error: 'Erreur création commande' };
    } catch {
      return { success: false, error: 'Erreur création commande' };
    }
  };

  const saveDeliveryProfile = async (profileData) => {
    if (!user) return { success: false, error: 'Non connecté' };

    try {
      const res = await fetch(`${API_URL}/api/delivery-profiles/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ data: profileData }),
      });
      const data = await res.json();

      if (data.data) {
        setDeliveryProfile(data.data);
        return { success: true, profile: data.data };
      }

      return { success: false, error: data.error?.message || 'Erreur sauvegarde livraison' };
    } catch {
      return { success: false, error: 'Erreur sauvegarde livraison' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      orders,
      deliveryProfile,
      loading,
      login,
      register,
      logout,
      createOrder,
      saveDeliveryProfile,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
