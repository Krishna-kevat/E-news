import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user, login } = useAuth(); 
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    cno: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || '',
        email: user.email || '',
        cno: user.cno || ''
      });
    }
  }, [user]);

  if (!user) return (
    <div className="dashboard-page container">
      <p>Please login to view your profile.</p>
    </div>
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.fullname || !formData.email || !formData.cno) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      console.log('Updating profile with data:', formData);
      const res = await api.put('/auth/profile', formData);
      
      console.log('Profile updated successfully:', res.data);
      
      // Update context and local storage via the login function
      // Keep the existing token from the user object
      login(res.data, user.token);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update error:', err);
      const errorMsg = err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Failed to update profile';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page container">
      <div className="card auth-card" style={{ maxWidth: '600px', margin: '4rem auto' }}>
        <h1 style={{ textAlign: 'center' }}>My Profile</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', textAlign: 'center' }}>
          Manage your account details and contact information.
        </p>

        {message && (
          <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`} style={{ 
            background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            color: message.type === 'error' ? '#ef4444' : '#10b981',
            border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {message.text}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="profile-row" style={rowStyle}>
            <strong>Full Name</strong>
            {isEditing ? (
              <input 
                className="edit-input" 
                name="fullname" 
                value={formData.fullname} 
                onChange={handleChange} 
                placeholder="Full Name"
              />
            ) : (
              <span style={valueStyle}>{user.fullname}</span>
            )}
          </div>
          <div className="profile-row" style={rowStyle}>
            <strong>Username</strong>
            <span style={{ ...valueStyle, opacity: 0.6 }}>@{user.username}</span>
          </div>
          <div className="profile-row" style={rowStyle}>
            <strong>Email Address</strong>
            {isEditing ? (
              <input 
                className="edit-input" 
                name="email" 
                type="email"
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Email Address"
              />
            ) : (
              <span style={valueStyle}>{user.email}</span>
            )}
          </div>
          <div className="profile-row" style={rowStyle}>
            <strong>Contact No</strong>
            {isEditing ? (
              <input 
                className="edit-input" 
                name="cno" 
                value={formData.cno} 
                onChange={handleChange} 
                placeholder="Contact Number"
              />
            ) : (
              <span style={valueStyle}>{user.cno || 'Not set'}</span>
            )}
          </div>
          <div className="profile-row" style={rowStyle}>
            <strong>Account Role</strong>
            <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}`} style={{ marginTop: '5px', textTransform: 'capitalize' }}>
              {user.role}
            </span>
          </div>
        </div>
        
        <div style={{ marginTop: '2.5rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          {isEditing ? (
            <>
              <button 
                className="btn btn-sm" 
                onClick={handleSave} 
                disabled={loading}
                style={{ minWidth: '120px' }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="btn btn-sm" 
                onClick={() => { setIsEditing(false); setFormData({ fullname: user.fullname, email: user.email, cno: user.cno }); }}
                style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              className="btn btn-sm" 
              onClick={() => setIsEditing(true)}
              style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', minWidth: '120px', color: 'var(--text-main)' }}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '1rem',
  borderBottom: '1px solid var(--border)'
};

const valueStyle = {
  color: 'var(--text-main)',
  fontWeight: '500'
};
