/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

const API_URL = 'http://localhost:1337';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [orders, setOrders] = useState([]);
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
      const res = await fetch(`${API_URL}/api/orders?filters[client][id][$eq]=${user.id}&populate=*`, {
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

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

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

  return (
    <AuthContext.Provider value={{
      user,
      orders,
      loading,
      login,
      register,
      logout,
      createOrder,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
