// utils/auth.js
export const logout = () => {
  // Clear all authentication data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  
  // Redirect to home page
  window.location.href = '/';
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user') || sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};