import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hotel_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('hotel_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('hotel_user', JSON.stringify(res.data));
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user: userData, welcome_message } = res.data;
    localStorage.setItem('hotel_token', access_token);
    localStorage.setItem('hotel_user', JSON.stringify(userData));
    setUser(userData);
    return { user: userData, welcome_message };
  };

  const register = async (name, email, password, phone) => {
    const res = await api.post('/auth/register', { name, email, password, phone });
    const { access_token, user: userData, welcome_message } = res.data;
    localStorage.setItem('hotel_token', access_token);
    localStorage.setItem('hotel_user', JSON.stringify(userData));
    setUser(userData);
    return { user: userData, welcome_message };
  };

  const loginWithGoogle = async (googleData) => {
    const res = await api.post('/auth/google', googleData);
    const { access_token, user: userData, welcome_message } = res.data;
    localStorage.setItem('hotel_token', access_token);
    localStorage.setItem('hotel_user', JSON.stringify(userData));
    setUser(userData);
    return { user: userData, welcome_message };
  };

  const sendPhoneOtp = async (phone) => {
    const res = await api.post('/auth/send-otp', { phone });
    return res.data;
  };

  const verifyPhoneOtp = async (phone, otp) => {
    const res = await api.post('/auth/verify-otp', { phone, otp });
    const { access_token, user: userData, welcome_message } = res.data;
    localStorage.setItem('hotel_token', access_token);
    localStorage.setItem('hotel_user', JSON.stringify(userData));
    setUser(userData);
    return { user: userData, welcome_message };
  };

  const logout = () => {
    localStorage.removeItem('hotel_token');
    localStorage.removeItem('hotel_user');
    setUser(null);
  };

  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('hotel_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, login, register, loginWithGoogle, 
      sendPhoneOtp, verifyPhoneOtp, logout, updateProfileState 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
