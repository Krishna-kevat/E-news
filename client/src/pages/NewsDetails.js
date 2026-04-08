import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NewsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetchNews();
  }, [id]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/news/${id}`);
      setNews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async () => {
    try {
      await api.post(`/news/${id}/like`);
      fetchNews();
    } catch (err) { console.error(err); }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await api.post(`/news/${id}/comment`, { text: commentText });
      setCommentText('');
      fetchNews();
    } catch (err) { console.error(err); }
  };

  const formatContent = (text) => {
    if (!text) return [];
    // Remove bracketed references like [1], [Source], [Reference]
    const cleaned = text.replace(/\[\d+\]|\[.*?\]/g, '').trim();
    // Split into paragraphs by double newlines
    return cleaned.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  };

  const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text ? text.split(/\s+/).length : 0;
    return Math.ceil(words / wordsPerMinute);
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '10rem' }}>Loading full story...</div>;
  if (!news) return <div className="container" style={{ textAlign: 'center', padding: '10rem' }}>Article not found.</div>;

  const paragraphs = formatContent(news.description);
  const readingTime = calculateReadingTime(news.description);

  return (
    <div className="dashboard-page container">
      <button className="btn btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '2rem', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-main)' }}>
        ← Back to Dashboard
      </button>

      <div className="card detailed-news-card" style={{ maxWidth: '900px', margin: '0 auto', padding: '0', overflow: 'hidden' }}>
        {news.image && (
          <img 
            src={`http://localhost:5000${news.image}`} 
            alt={news.title} 
            style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
        
        <div style={{ padding: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span className="badge">{news.category}</span>
              <span className="reading-info" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                ⏱️ {readingTime} min read
              </span>
            </div>
            <small style={{ color: 'var(--text-muted)' }}>
              {new Date(news.createdAt).toLocaleDateString(undefined, { dateStyle: 'full' })}
            </small>
          </div>

          <h1 style={{ fontSize: '3.5rem', marginBottom: '2rem', textAlign: 'left', lineHeight: '1.1' }}>{news.title}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
              {news.author?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{news.author?.name || 'Anonymous Reporter'}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Staff Writer • E-News Media Group</div>
            </div>
          </div>

          <article className="article-body">
            {paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </article>

          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', padding: '1.5rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: '3rem' }}>
             <button 
                className="btn btn-sm" 
                style={{ background: 'var(--bg-main)', color: 'var(--primary)', border: '1px solid var(--border)', padding: '0.75rem 1.5rem' }} 
                onClick={toggleLike}
              >
                {news.likes?.length || 0} Likes 👍
              </button>
              <div style={{ color: 'var(--text-muted)' }}>{news.comments?.length || 0} Comments Join the conversation</div>
          </div>

          {/* Comment Section */}
          <div className="comment-section">
            <h3 style={{ marginBottom: '2rem' }}>Discussion ({news.comments?.length || 0})</h3>
            
            <div className="comment-list" style={{ maxHeight: 'unset', marginBottom: '3rem' }}>
              {news.comments && news.comments.length > 0 ? (
                news.comments.map((c, idx) => (
                  <div key={idx} className="comment" style={{ background: 'var(--bg-main)', padding: '1.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="comment-author" style={{ fontSize: '1rem' }}>{c.name}</span>
                      <small style={{ color: 'var(--text-muted)' }}>{new Date(c.createdAt || Date.now()).toLocaleDateString()}</small>
                    </div>
                    <span className="comment-text" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>{c.text}</span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem', background: 'var(--bg-main)', borderRadius: '16px' }}>
                  No thoughts shared yet. Be the first to comment on this story.
                </div>
              )}
            </div>

            <div className="card" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
              <h4 style={{ marginBottom: '1rem' }}>Add your comment</h4>
              <form onSubmit={addComment} className="comment-form" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
                <textarea
                  placeholder={user ? "Share your perspective..." : "Please login to join the discussion"}
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  disabled={!user}
                  style={{ 
                    width: '100%', 
                    minHeight: '120px', 
                    background: '#fff', 
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '1rem',
                    color: 'var(--text-main)',
                    fontFamily: 'inherit'
                  }}
                />
                <button 
                  className="btn" 
                  type="submit" 
                  disabled={!user || !commentText.trim()}
                  style={{ alignSelf: 'flex-end' }}
                >
                  Post Comment
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
