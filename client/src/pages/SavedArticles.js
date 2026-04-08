import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function SavedArticles() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/saved');
      setNews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (id) => {
    try {
      await api.post(`/auth/save/${id}`);
      fetchSaved();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="dashboard-page container" style={{ textAlign: 'center', padding: '5rem' }}>
      Fetching your bookmarked stories...
    </div>
  );

  return (
    <div className="dashboard-page container">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ textAlign: 'left', margin: '0' }}>Saved Articles</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Revisit the stories you've bookmarked for later.
        </p>
      </div>

      {news.length === 0 ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔖</div>
          <h3>No saved articles yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Explore the homepage to bookmark your favorite stories.</p>
          <Link to="/" className="btn btn-sm" style={{ marginTop: '1rem' }}>Browse Home</Link>
        </div>
      ) : (
        <div className="grid">
          {news.map(n => (
            <div key={n._id} className="card news-card">
              {n.image && (
                <img 
                  src={`http://localhost:5000${n.image}`} 
                  alt={n.title} 
                  className="news-img" 
                  style={{ height: '200px' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="news-content">
                <span className="badge">{n.category}</span>
                <h3>{n.title}</h3>
                <small style={{ color: 'var(--text-muted)', marginBottom: '1rem', display: 'block' }}>
                  Saved on: {new Date(n.createdAt).toLocaleDateString()}
                </small>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <Link to={`/news/${n._id}`} className="btn-link" style={{ fontWeight: '700' }}>
                    Read Now →
                  </Link>
                  <button 
                    className="btn btn-sm" 
                    onClick={() => handleUnsave(n._id)}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
