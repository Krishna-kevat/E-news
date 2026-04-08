import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await api.post('/auth/login', form);
      if (res.data && res.data.token) {
        login(res.data.user, res.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="dashboard-page container">
      <div className="card auth-card" style={{ maxWidth: '450px', margin: '4rem auto' }}>
        <h1>Login</h1>
        {msg && <div className="alert">{msg}</div>}
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Email
            <input 
              name="email" 
              type="email" 
              value={form.email} 
              onChange={handleChange} 
              placeholder="Enter your email"
              required 
            />
          </label>
          <label>
            Password
            <input 
              name="password" 
              type="password" 
              value={form.password} 
              onChange={handleChange} 
              placeholder="Enter your password"
              required 
            />
          </label>
          <button className="btn" type="submit">Login</button>
        </form>
        <p className="note" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
