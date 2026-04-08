import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminUsers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users')
      .then(res => {
        setData(res.data);
        setLoading(true); // Wait for a bit to show a slight transition if needed, actually setLoading(false)
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-block`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error updating user status');
    }
  };

  return (
    <div className="dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ textAlign: 'left', margin: '0' }}>User Management</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Monitor account activity and manage platform access for all users.
          </p>
        </div>
        <div className="card" style={{ padding: '1rem 2rem', display: 'flex', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{data.length}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Users</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>
              {data.filter(d => d.user.isBlocked).length}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Blocked</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Fetching latest user data...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Status</th>
                <th>Engagement</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#fff' }}>
                        {d.user.fullname.charAt(0)}
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-main)', fontWeight: '600' }}>{d.user.fullname}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.user.email} • @{d.user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <span className={`role-badge ${d.user.role === 'admin' ? 'role-admin' : 'role-user'}`} style={{ alignSelf: 'flex-start' }}>
                        {d.user.role}
                      </span>
                      <span className={`status-badge ${d.user.isBlocked ? 'status-blocked' : 'status-active'}`}>
                        {d.user.isBlocked ? 'Suspended' : 'Active'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--primary)' }}>{d.likedCount}</span> Likes • <span style={{ color: 'var(--secondary)' }}>{d.commentedCount}</span> Comments
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {d.user.role !== 'admin' && (
                      <button 
                        className={`btn btn-sm ${d.user.isBlocked ? 'btn-success' : 'btn-danger'}`} 
                        onClick={() => handleToggleBlock(d.user._id)}
                        style={{ padding: '0.6rem 1.2rem' }}
                      >
                        {d.user.isBlocked ? 'Unblock Account' : 'Block User'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
