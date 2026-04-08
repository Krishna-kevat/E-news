import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import NewsDetails from './pages/NewsDetails';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminComments from './pages/AdminComments';
import AdminSaved from './pages/AdminSaved';
import SavedArticles from './pages/SavedArticles';
import "./styles.css";


import Sidebar from './components/Sidebar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to='/login' />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  return user && user.role === 'admin' ? children : <Navigate to='/' />;
}

function AppContent() {
  const { user } = useAuth();
  
  // Define pages that should use the admin sidebar
  const isAdminPage = user?.role === 'admin';

  return (
    <div className={isAdminPage ? "app-layout" : "standard-layout"}>
      {isAdminPage ? <Sidebar /> : <Navbar />}
      
      <main className={isAdminPage ? "main-content" : "container"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/saved" element={<PrivateRoute><SavedArticles /></PrivateRoute>} />
          <Route path="/news/:id" element={<PrivateRoute><NewsDetails /></PrivateRoute>} />
          <Route path="/manage-users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
          <Route path="/manage-comments" element={<AdminRoute><AdminComments /></AdminRoute>} />
          <Route path="/admin/saved-insights" element={<AdminRoute><AdminSaved /></AdminRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
