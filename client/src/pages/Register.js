import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ 
    fullname: '', 
    email: '', 
    password: '', 
    username: '', 
    gender: 'male', 
    cno: '' 
  });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const strongEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (form.fullname.length < 3) { setMsg('Fullname too short'); return; }
    if (!strongEmail(form.email)) { setMsg('Invalid email'); return; }
    if (form.password.length < 6) { setMsg('Password must be at least 6 characters'); return; }
    if (form.username.length < 3) { setMsg('Username too short'); return; }
    if (!/^[0-9]{7,15}$/.test(form.cno)) { setMsg('Contact number must be digits (7-15)'); return; }

    try {
      const res = await api.post('/auth/register', form);
      if (res.data && res.data.token) {
        localStorage.setItem('enews_token', res.data.token);
        window.alert('Registration successful! You will be redirected to Dashboard.');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.msg || (err.response?.data?.errors?.[0]?.msg) || 'Registration failed');
    }
  };

  return (
    <div className="dashboard-page container">
      <div className="card auth-card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <h1>Create Account</h1>
        {msg && <div className="alert">{msg}</div>}
        <form onSubmit={handleSubmit} className="form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <label>
              Full Name
              <input name="fullname" value={form.fullname} onChange={handleChange} placeholder="John Doe" required />
            </label>
            <label>
              Username
              <input name="username" value={form.username} onChange={handleChange} placeholder="johndoe123" required />
            </label>
          </div>
          
          <label>
            Email Address
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
          </label>
          
          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
          </label>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <label>
              Gender
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              Contact Number
              <input name="cno" value={form.cno} onChange={handleChange} placeholder="1234567890" required />
            </label>
          </div>

          <button className="btn" type="submit" style={{ marginTop: '1rem' }}>Register Now</button>
        </form>
        <p className="note" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}
