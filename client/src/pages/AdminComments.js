import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComments = () => {
    setLoading(true);
    setError(null);
    api.get('/admin/comments')
      .then(res => {
        setComments(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        const serverMsg = err.response?.data?.msg;
        setError(serverMsg || 'Failed to sync platform comments. Please check your admin privileges.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleDelete = async (newsId, commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment? This action is permanent and helpful for spam control.')) return;
    try {
      await api.delete(`/admin/comments/${newsId}/${commentId}`);
      fetchComments();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error deleting comment');
    }
  };

  return (
    <div className="dashboard-page">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ textAlign: 'left', margin: '0' }}>Comment Management</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Monitor platform discussions and remove spam or inappropriate content for audience protection.
        </p>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Syncing platform comments...</div>
        ) : error ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ color: '#ef4444', marginBottom: '1rem', fontWeight: '700' }}>Error: {error}</div>
            <button className="btn btn-sm" onClick={fetchComments}>Re-sync Comments</button>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>User & Comment</th>
                <th>Source Article</th>
                <th>Posted Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '4rem' }}>
                    No comments found across the platform.
                  </td>
                </tr>
              ) : (
                comments.map((c, idx) => (
                  <tr key={idx}>
                    <td style={{ maxWidth: '400px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '0.4rem' }}>{c.name}</div>
                      <div style={{ color: 'var(--text-main)', lineHeight: '1.4' }}>"{c.text}"</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{c.newsTitle}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {c.newsId?.slice(-6)}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.9rem' }}>{new Date(c.date).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(c.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => handleDelete(c.newsId, c._id)}
                        style={{ padding: '0.6rem 1.2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        🗑️ Delete Spam
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
