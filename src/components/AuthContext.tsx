import React, { createContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Props from '../interface/Props';

const API = import.meta.env.DEV ? import.meta.env.VITE_REACT_APP_API_LOCAL : import.meta.env.VITE_REACT_APP_API;

export const AuthContext = createContext({ isAuthenticated: false, username: '', email: '', logout: async () => {} });

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
	const location = useLocation();

  // Check authentication status when the app loads
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API}/user/profile`, {
          method: 'GET',
					headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') }
          // credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUsername(data.username);
          setEmail(data.email);
        } else {
          setIsAuthenticated(false);
          navigate('/login');
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
        navigate('/login');
      }
    };

    if (location.pathname !== '/register') checkAuth();
  }, [navigate]);

	// Logout function to clear authentication state
  const logout = async () => {
    try {
      const response = await fetch(`${API}/user/logout`, {
        method: 'POST',
        // credentials: 'include',
      });

      if (response.ok) {
        localStorage.removeItem('access_token');
        navigate('/login');
      }
      else {
				console.error('Logout failed');
      }
    } catch (error) {
      console.error('An error occurred: ', error);
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, email, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
