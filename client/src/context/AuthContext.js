import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('enews_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (user) localStorage.setItem('enews_user', JSON.stringify(user));
    else localStorage.removeItem('enews_user');
  }, [user]);

  const login = (userObj, token) => {
    setUser({ ...userObj, token });
    localStorage.setItem('enews_token', token);
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('enews_token');
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
