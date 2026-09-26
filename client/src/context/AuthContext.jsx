import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('resourcexchange_token') || null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('resourcexchange_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [allBusinesses, setAllBusinesses] = useState([]);
  const [activeRole, setActiveRole] = useState('seeker'); // 'seeker' | 'provider'
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [compareList, setCompareList] = useState([]); // array of resource objects (max 3)
  const [toasts, setToasts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Show Toast
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch initial businesses list (for demo switcher)
  const loadBusinesses = useCallback(async () => {
    try {
      const list = await api.getBusinesses();
      setAllBusinesses(list);
      return list;
    } catch (err) {
      console.error('Failed to load businesses:', err);
      return [];
    }
  }, []);

  // Rehydrate user session from token
  useEffect(() => {
    async function rehydrate() {
      setIsLoading(true);
      const list = await loadBusinesses();
      const storedToken = localStorage.getItem('resourcexchange_token');

      if (storedToken) {
        try {
          const data = await api.getMe();
          if (data && data.user) {
            setCurrentUser(data.user);
            setToken(storedToken);
            localStorage.setItem('resourcexchange_user', JSON.stringify(data.user));
          } else {
            // Token invalid or expired
            localStorage.removeItem('resourcexchange_token');
            localStorage.removeItem('resourcexchange_user');
            setToken(null);
            setCurrentUser(null);
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          localStorage.removeItem('resourcexchange_token');
          localStorage.removeItem('resourcexchange_user');
          setToken(null);
          setCurrentUser(null);
        }
      } else {
        // No stored token: if user has logged out, remain logged out
        const hasLoggedOut = localStorage.getItem('resourcexchange_logged_out') === 'true';
        if (!hasLoggedOut && list.length > 0 && !localStorage.getItem('resourcexchange_visited')) {
          localStorage.setItem('resourcexchange_visited', 'true');
          try {
            const demoData = await api.login({ businessId: list[0].id });
            localStorage.setItem('resourcexchange_token', demoData.token);
            localStorage.setItem('resourcexchange_user', JSON.stringify(demoData.user));
            setToken(demoData.token);
            setCurrentUser(demoData.user);
          } catch (err) {
            console.error('Failed to init demo session:', err);
          }
        } else {
          setToken(null);
          setCurrentUser(null);
        }
      }
      setIsLoading(false);
    }

    rehydrate();
  }, [loadBusinesses]);

  // Fetch notifications for current user
  const loadNotifications = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await api.getNotifications(currentUser.id);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 8000);
      return () => clearInterval(interval);
    }
  }, [currentUser, loadNotifications]);

  // Login with Email + Password or Demo businessId
  const login = async (credentials) => {
    try {
      const data = await api.login(credentials);
      localStorage.removeItem('resourcexchange_logged_out');
      localStorage.setItem('resourcexchange_token', data.token);
      localStorage.setItem('resourcexchange_user', JSON.stringify(data.user));
      setToken(data.token);
      setCurrentUser(data.user);
      addToast(`Welcome back, ${data.user.name}!`, 'success');
      return data;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  // Instant demo login by business ID (used by demo buttons & switcher)
  const loginDemo = async (businessId) => {
    try {
      const data = await api.login({ businessId });
      localStorage.removeItem('resourcexchange_logged_out');
      localStorage.setItem('resourcexchange_token', data.token);
      localStorage.setItem('resourcexchange_user', JSON.stringify(data.user));
      setToken(data.token);
      setCurrentUser(data.user);
      addToast(`Logged in as demo account: ${data.user.name}`, 'success');
      return data;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  // Signup
  const signup = async (userData) => {
    try {
      const data = await api.signup(userData);
      localStorage.removeItem('resourcexchange_logged_out');
      localStorage.setItem('resourcexchange_token', data.token);
      localStorage.setItem('resourcexchange_user', JSON.stringify(data.user));
      setToken(data.token);
      setCurrentUser(data.user);
      await loadBusinesses();
      addToast(`Account created successfully for ${data.user.name}!`, 'success');
      return data;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('resourcexchange_token');
    localStorage.removeItem('resourcexchange_user');
    localStorage.setItem('resourcexchange_logged_out', 'true');
    setToken(null);
    setCurrentUser(null);
    setNotifications([]);
    setUnreadCount(0);
    setCompareList([]);
    addToast('You have been logged out.', 'info');
  };

  // Switch Business Account (for Demo bar)
  const switchBusiness = async (businessId) => {
    await loginDemo(businessId);
  };

  // Reset demo database
  const resetDemo = async () => {
    try {
      await api.resetDemoData();
      const list = await loadBusinesses();
      if (list.length > 0) {
        await loginDemo(list[0].id);
      }
      setCompareList([]);
      addToast('Database reset to fresh demo state with realistic data!', 'success');
    } catch (err) {
      addToast('Failed to reset demo data', 'error');
    }
  };

  // Comparison Management
  const toggleCompare = (resource) => {
    setCompareList(prev => {
      const exists = prev.some(r => r.id === resource.id);
      if (exists) {
        return prev.filter(r => r.id !== resource.id);
      } else {
        if (prev.length >= 3) {
          addToast('You can compare a maximum of 3 resources at once', 'info');
          return prev;
        }
        addToast(`Added "${resource.title}" to compare list`, 'success');
        return [...prev, resource];
      }
    });
  };

  const removeFromCompare = (resourceId) => {
    setCompareList(prev => prev.filter(r => r.id !== resourceId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isAuthenticated = !!token && !!currentUser;

  return (
    <AuthContext.Provider
      value={{
        token,
        currentUser,
        isAuthenticated,
        allBusinesses,
        activeRole,
        setActiveRole,
        notifications,
        unreadCount,
        loadNotifications,
        switchBusiness,
        login,
        loginDemo,
        signup,
        register: signup,
        logout,
        resetDemo,
        compareList,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        toasts,
        addToast,
        removeToast,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
