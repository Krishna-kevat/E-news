import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AdminNewsForm from '../components/AdminNewsForm';

export default function Dashboard() {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [savedIds, setSavedIds] = useState([]);
  const [editingNews, setEditingNews] = useState(null);

  useEffect(() => {
    if (user) {
      fetchNews();
      fetchSavedIds();
    }
  }, [user, category]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/news?search=${search}&category=${category}`);
      setNews(res.data);
      setEditingNews(null); // Reset editing state on refresh
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedIds = async () => {
    try {
      const res = await api.get('/auth/saved');
      setSavedIds(res.data.map(n => n._id));
    } catch (err) { console.error(err); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNews();
  };

  const toggleSave = async (id) => {
    try {
      await api.post(`/auth/save/${id}`);
      fetchSavedIds();
    } catch (err) { console.error(err); }
  };

  const toggleLike = async (id) => {
    try {
      await api.post(`/news/${id}/like`);
      fetchNews();
    } catch (err) { console.error(err); }
  };

  const addComment = async (id, text) => {
    if (!text) return;
    try {
      await api.post(`/news/${id}/comment`, { text });
      fetchNews();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await api.delete(`/news/${id}`);
      fetchNews();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (item) => {
    setEditingNews(item);
    document.getElementById('admin-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const getCategoryStyle = (cat) => {
    switch (cat) {
      case 'Technology': return { background: 'rgba(6, 182, 212, 0.1)', color: '#0891b2', border: '1px solid rgba(6, 182, 212, 0.2)' };
      case 'Politics': return { background: 'rgba(79, 70, 229, 0.1)', color: '#4338ca', border: '1px solid rgba(79, 70, 229, 0.2)' };
      case 'Business': return { background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.2)' };
      case 'Sports': return { background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.2)' };
      case 'Health': return { background: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)' };
      default: return { background: 'rgba(100, 116, 139, 0.1)', color: '#475569', border: '1px solid rgba(100, 116, 139, 0.2)' };
    }
  };

  if (!user) return (
    <div className="dashboard-page container">
      <p>Please login to view your dashboard.</p>
    </div>
  );

  return (
    <div className="dashboard-page container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Welcome back, <strong>{user.fullname}</strong>.
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '500px' }}>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '120px', padding: '0.75rem', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
          >
            {['All', 'Technology', 'Politics', 'Business', 'Sports', 'Entertainment', 'Health'].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder="Search news..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
          />
          <button className="btn" type="submit">Search</button>
        </form>
      </div>

      {user.role === 'admin' ? (
        <div className="admin-section">
          <AdminNewsForm onDone={fetchNews} editingItem={editingNews} onCancel={() => setEditingNews(null)} />
          <h3>Manage Published News</h3>
          {loading ? <div style={{ padding: '5rem', textAlign: 'center' }}>Updating management console...</div> : (
            <div className="grid">
              {news.length > 0 ? (
                news.map(n => (
                  <AdminNewsCard key={n._id} news={n} handleDelete={handleDelete} handleEdit={handleEdit} />
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔦</div>
                  <h3>No matching articles found</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search filters or category.</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="user-section">
          <h3>Latest Updates</h3>
          {loading && <div style={{ padding: '2rem', textAlign: 'center' }}>Syncing your feed...</div>}
          <div className="grid">
            {news.length > 0 ? (
              news.map(n => (
                <UserNewsCard
                  key={n._id}
                  news={n}
                  toggleLike={toggleLike}
                  toggleSave={toggleSave}
                  isSaved={savedIds.includes(n._id)}
                  addComment={addComment}
                  user={user}
                  categoryStyle={getCategoryStyle(n.category)}
                />
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔖</div>
                <h3>No stories found</h3>
                <p style={{ color: 'var(--text-muted)' }}>Try searching for something else.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminNewsCard({ news, handleDelete, handleEdit }) {
  return (
    <div className="card news-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span className="badge">{news.category}</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-sm" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', border: '1px solid rgba(37, 99, 235, 0.2)' }} onClick={() => handleEdit(news)}>Edit ✏️</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(news._id)}>Delete 🗑️</button>
        </div>
      </div>
      <h4>{news.title}</h4>
      <p style={{ marginBottom: '1rem' }}>
        {news.description.slice(0, 150)}{news.description.length > 150 ? '...' : ''}
      </p>
      <div className="meta" style={{ marginTop: 'auto' }}>
        <Link to={`/news/${news._id}`} className="btn-link" style={{ color: 'var(--primary)', fontWeight: '700' }}>
          Preview Article →
        </Link>
        <div className="stats">
          <span>{news.likes?.length || 0} Likes</span>
          <span>{news.comments?.length || 0} Comments</span>
        </div>
      </div>
    </div>
  );
}

function UserNewsCard({ news, toggleLike, toggleSave, isSaved, addComment, user, categoryStyle }) {
  return (
    <div className="card news-card">
      {news.image && (
        <img 
          src={`http://localhost:5000${news.image}`} 
          alt={news.title} 
          className="news-img" 
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      <div className="news-content">
        <span className="badge" style={categoryStyle}>{news.category}</span>
        <h3>{news.title}</h3>
        <small style={{ color: 'var(--text-muted)', marginBottom: '1rem', display: 'block' }}>
          {new Date(news.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
        </small>
        <p>
          {news.description.slice(0, 160)}{news.description.length > 160 ? '...' : ''}
        </p>
        <Link to={`/news/${news._id}`} className="btn-link" style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontWeight: '700' }}>
          View Full Details →
        </Link>
      </div>
      
      <div className="meta">
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button className="btn btn-sm" style={{ background: 'var(--bg-main)', color: 'var(--primary)', border: '1px solid var(--border)' }} onClick={() => toggleLike(news._id)}>
            ❤️ {news.likes?.length || 0}
          </button>
          <button 
            className="btn btn-sm" 
            style={{ 
              background: isSaved ? 'var(--primary)' : 'var(--bg-main)', 
              color: isSaved ? '#fff' : 'var(--text-muted)', 
              border: '1px solid var(--border)' 
            }} 
            onClick={() => toggleSave(news._id)}
          >
            {isSaved ? '🔖 Saved' : '🔖 Save'}
          </button>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{news.comments?.length || 0} Comments</span>
      </div>
    </div>
  );
}
