
import { apiRequest } from './api';

// Register a new user
export const signup = async (fullName, email, password) => {
  return await apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      fullName,
      email,
      password,
    }),
  });
};

// Log in an existing user
export const login = async (email, password) => {
  return await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

// Log out the current user
export const logout = async () => {
  return await apiRequest('/auth/logout', {
    method: 'POST',
  });
};

// Get the currently logged-in user
export const getCurrentUser = async () => {
  return await apiRequest('/auth/me', {
    method: 'GET',
  });
};