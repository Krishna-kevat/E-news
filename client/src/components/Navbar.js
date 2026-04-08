import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="nav">
      <div className="nav-brand"><Link to="/">ENEWS</Link></div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <button 
          onClick={toggleTheme} 
          className="btn-link" 
          style={{ fontSize: '1.2rem', padding: '0 0.5rem' }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        {user && <Link to="/dashboard">Dashboard</Link>}
        {user && <Link to="/saved">Saved</Link>}
        {user && <Link to="/profile">Profile</Link>}
        {!user && <Link to="/register">Register</Link>}
        {!user && <Link to="/login">Login</Link>}
        {user && <button className="btn-link" onClick={handleLogout}>Logout</button>}
      </div>
    </nav>
  );
}
