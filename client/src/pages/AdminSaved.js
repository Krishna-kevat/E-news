import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function AdminSaved() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/saved-insights');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to sync saved insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Analyzing global bookmarks...</div>;

  return (
    <div className="container">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1>Saved Insights</h1>
        <p style={{ color: 'var(--text-muted)' }}>Analyze which stories your audience is bookmarking for later.</p>
      </div>

      {error ? (
        <div className="alert">{error}</div>
      ) : data.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📉</div>
          <h3>No insights available</h3>
          <p style={{ color: 'var(--text-muted)' }}>Users haven't bookmarked any articles yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Article Headline</th>
                <th>Category</th>
                <th>Views</th>
                <th>Total Saves</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item._id}>
                  <td style={{ fontWeight: '600', color: 'var(--text-main)', maxWidth: '400px' }}>{item.title}</td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                      {item.category}
                    </span>
                  </td>
                  <td>{item.views}</td>
                  <td style={{ fontWeight: '800', color: 'var(--accent)' }}>
                    🔖 {item.saveCount}
                  </td>
                  <td>
                    <Link to={`/news/${item._id}`} className="btn btn-sm">View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
