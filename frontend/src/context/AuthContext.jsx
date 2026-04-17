import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import client from '../api/client.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = window.localStorage.getItem('mams_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await client.get('/auth/me');
        setUser(response.data.data.user);
      } catch (_error) {
        window.localStorage.removeItem('mams_token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await client.post('/auth/login', credentials);
      const { token, user: authenticatedUser } = response.data.data;
      window.localStorage.setItem('mams_token', token);
      setUser(authenticatedUser);
      toast.success('Welcome back. Access granted.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed.');
      throw error;
    }
  };

  const logout = () => {
    window.localStorage.removeItem('mams_token');
    setUser(null);
    toast.success('You have been signed out.');
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
