import { createContext, useContext, useEffect, useState } from 'react';

import {
  login as loginService,
  logout as logoutService,
  getCurrentUser
} from '../services/authService';

// Create the authentication context
const AuthContext = createContext(null);

// Authentication provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check whether a user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Log in a user
  const login = async (email, password) => {
    const data = await loginService(email, password);
    setUser(data.user);
    return data;
  };

  // Log out a user
  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for accessing authentication
export const useAuth = () => {
  return useContext(AuthContext);
};