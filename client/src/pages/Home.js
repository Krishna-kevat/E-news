import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Home() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchNews();
    }, 500); // Debounce to prevent excessive API calls
    return () => clearTimeout(delayDebounceFn);
  }, [activeCategory, searchTerm]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/news?category=${activeCategory}&search=${searchTerm}`);
      setNews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Technology', 'Politics', 'Business', 'Sports', 'Entertainment', 'Health'];

  const breakingNews = news.slice(0, 5);
  const trendingNews = [...news].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);
  const latestNews = news;

  return (
    <div className="dashboard-page container">
      {/* Search Header Section */}
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>Stay Informed.</h1>
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          <input 
            type="text" 
            placeholder="Search for stories, topics, or keywords..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '1.25rem 2rem', 
              borderRadius: '50px', 
              fontSize: '1.1rem',
              background: 'var(--bg-card)',
              border: '2px solid var(--border)',
              color: 'var(--text-main)',
              boxShadow: 'var(--shadow)',
              transition: 'all 0.3s ease'
            }}
            className="search-input-home"
          />
          <span style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '1.5rem' }}>🔍</span>
        </div>
      </div>

      {/* Breaking News Ticker */}
      {breakingNews.length > 0 && (
        <div className="breaking-ticker" style={{ background: 'var(--accent)', padding: '0.8rem 1.5rem', borderRadius: '12px', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
          <span style={{ background: '#fff', color: 'var(--accent)', padding: '0.2rem 0.8rem', borderRadius: '6px', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Breaking</span>
          <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
            {breakingNews.map((n, i) => (
              <span key={i} style={{ marginRight: '3rem' }}>• {n.title}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem' }}>
        {/* Main Content */}
        <div className="main-feed">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <h2 style={{ margin: 0, textAlign: 'left', fontSize: '1.75rem' }}>
              {searchTerm ? `Search Results for "${searchTerm}"` : `${activeCategory} Stories`}
            </h2>
            <div className="category-chips" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button 
                  key={cat} 
                  className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                  style={{ borderRadius: '20px', padding: '0.4rem 1.2rem', background: activeCategory === cat ? 'var(--primary)' : 'var(--bg-card)', color: activeCategory === cat ? '#fff' : 'var(--text-main)', border: '1px solid var(--border)' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Updating your feed...</div>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '2rem' }}>
              {news.length > 0 ? (
                news.map(n => <HomeNewsCard key={n._id} news={n} />)
              ) : (
                <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔦</div>
                  <h3>No stories found</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or category filters.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar / Trending */}
        <aside>
          <div className="card" style={{ padding: '2rem', sticky: 'top', top: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📈 Trending
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               {trendingNews.map((n, i) => (
                 <div key={n._id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--border)', lineHeight: '1' }}>0{i+1}</span>
                    <div>
                      <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                        <Link to={`/news/${n._id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>{n.title}</Link>
                      </h4>
                      <small style={{ color: 'var(--text-muted)' }}>{n.category} • {n.views || 0} Views</small>
                    </div>
                 </div>
               ))}
            </div>
            
            <hr style={{ margin: '2rem 0', borderColor: 'var(--border)', opacity: '0.5' }} />
            
            <div style={{ background: 'var(--bg-main)', padding: '1.5rem' , borderRadius: '12px', textAlign: 'center' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Join E-News</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Create an account to save articles and join the discussion.</p>
              <Link to="/register" className="btn btn-sm" style={{ width: '100%' }}>Get Started</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function HomeNewsCard({ news }) {
  return (
    <div className="card" style={{ display: 'grid', gridTemplateColumns: news.image ? '220px 1fr' : '1fr', gap: '2rem', padding: '1.5rem', borderLeft: `4px solid var(--primary)` }}>
      {news.image && (
        <div style={{ height: '160px', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <img 
            src={`http://localhost:5000${news.image}`} 
            alt={news.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.parentElement.style.display = 'none'; }}
          />
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="badge" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>{news.category}</span>
          <small style={{ color: 'var(--text-muted)' }}>{new Date(news.createdAt).toLocaleDateString()}</small>
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', lineHeight: '1.3' }}>
          <Link to={`/news/${news._id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>{news.title}</Link>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          {news.description.slice(0, 180)}...
        </p>
        <Link to={`/news/${news._id}`} className="btn-link" style={{ fontWeight: '700' }}>Read Full Story →</Link>
      </div>
    </div>
  );
}
