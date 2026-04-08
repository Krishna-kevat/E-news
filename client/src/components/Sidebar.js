import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <Link to="/">ENEWS<span>.</span></Link>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {user.fullname.charAt(0)}
        </div>
        <div className="user-info">
          <div className="user-name">{user.fullname}</div>
          <div className="user-role">Administrator</div>
        </div>
      </div>

      <div className="sidebar-links">
        <div className="sidebar-group">Main Controls</div>
        <Link to="/dashboard" className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}>
          <span className="icon">📰</span> <span>Dashboard</span>
        </Link>
        <Link to="/analytics" className={`sidebar-link ${isActive('/analytics') ? 'active' : ''}`}>
          <span className="icon">📊</span> <span>Analytics</span>
        </Link>
        <Link to="/manage-users" className={`sidebar-link ${isActive('/manage-users') ? 'active' : ''}`}>
          <span className="icon">👥</span> <span>User Control</span>
        </Link>
        <Link to="/manage-comments" className={`sidebar-link ${isActive('/manage-comments') ? 'active' : ''}`}>
          <span className="icon">💬</span> <span>Comment Wall</span>
        </Link>
        <Link to="/admin/saved-insights" className={`sidebar-link ${isActive('/admin/saved-insights') ? 'active' : ''}`}>
          <span className="icon">🔖</span> <span>Saved Insights</span>
        </Link>
        
        <div className="sidebar-group">Personal</div>
        <Link to="/profile" className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}>
          <span className="icon">👤</span> <span>Profile</span>
        </Link>
      </div>

      <div className="sidebar-footer">
        <button 
          onClick={toggleTheme} 
          className="sidebar-link" 
          style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', marginBottom: '0.75rem' }}
        >
          <span className="icon">{theme === 'light' ? '🌙' : '☀️'}</span> 
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
        <Link to="/" className="sidebar-back">
          <span className="icon">🏠</span> <span>Back to Site</span>
        </Link>
        <button onClick={handleLogout} className="sidebar-logout">
          <span className="icon">🚪</span> <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
