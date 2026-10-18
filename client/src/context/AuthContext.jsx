import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('placeconnect_token') || null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Load current user profile on initial mount or token change
  const fetchMe = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('placeconnect_token');
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('[AuthContext] Session expired or invalid:', err.response?.data?.message || err.message);
      localStorage.removeItem('placeconnect_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const receivedToken = res.data.token;
        const loggedUser = res.data.user;
        localStorage.setItem('placeconnect_token', receivedToken);
        setToken(receivedToken);
        setUser(loggedUser);
        toast.success(`Welcome back, ${loggedUser.name}!`);
        return { success: true, user: loggedUser };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const registerStudent = async (data) => {
    try {
      const res = await api.post('/auth/register/student', data);
      if (res.data.success) {
        const receivedToken = res.data.token;
        const newUser = res.data.user;
        localStorage.setItem('placeconnect_token', receivedToken);
        setToken(receivedToken);
        setUser(newUser);
        toast.success('Student account created successfully!');
        return { success: true, user: newUser };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      toast.error(msg);
      return { success: false, message: msg, errors: err.response?.data?.errors };
    }
  };

  const registerRecruiter = async (data) => {
    try {
      const res = await api.post('/auth/register/recruiter', data);
      if (res.data.success) {
        const receivedToken = res.data.token;
        const newUser = res.data.user;
        localStorage.setItem('placeconnect_token', receivedToken);
        setToken(receivedToken);
        setUser(newUser);
        toast.success('Recruiter registered! Your company is pending admin review.');
        return { success: true, user: newUser };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      return { success: false, message: msg, errors: err.response?.data?.errors };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Continue client cleanup even if network fails
    } finally {
      localStorage.removeItem('placeconnect_token');
      setToken(null);
      setUser(null);
      toast.info('You have logged out.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        loading,
        login,
        registerStudent,
        registerRecruiter,
        logout,
        refreshUser: fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
