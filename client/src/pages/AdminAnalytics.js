import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        const serverMsg = err.response?.data?.msg;
        setError(serverMsg || 'Failed to fetch platform analytics. Please ensure you are logged in as an administrator.');
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="dashboard-page container">
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
        Calculating platform analytics...
      </div>
    </div>
  );

  if (error) return (
    <div className="dashboard-page container">
      <div className="alert" style={{ margin: '5rem auto', maxWidth: '500px' }}>
        <p style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Analytics Unavailable</p>
        <p>{error}</p>
        <button className="btn btn-sm" onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>Retry Sync</button>
      </div>
    </div>
  );

  const totalArticles = stats?.totalArticles || 0;
  const totalViews = stats?.totalViews || 0;
  const avgViews = Math.round(totalViews / (totalArticles || 1));

  return (
    <div className="dashboard-page">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ textAlign: 'left', margin: '0' }}>Platform Analytics</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Real-time metrics and audience engagement data to help you grow.
        </p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        <MetricCard 
          title="Total Articles" 
          value={totalArticles} 
          icon="📰" 
          description="Total published news stories"
          trend="+5% this week"
        />
        <MetricCard 
          title="Total Audience" 
          value={stats?.totalUsers || 0} 
          icon="👥" 
          description="Total registered users"
          color="var(--secondary)"
        />
        <MetricCard 
          title="Total Engagement" 
          value={totalViews} 
          icon="🔥" 
          description="Total article views across platform"
          color="var(--accent)"
        />
        <MetricCard 
          title="Popular Category" 
          value={stats?.mostPopularCategory || 'N/A'} 
          icon="⭐" 
          description="Most active news segment"
          color="#f59e0b"
          isString={true}
        />
      </div>

      <div className="card" style={{ marginTop: '3rem', padding: '2.5rem' }}>
        <h3>Analytics Overview</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Your platform is performing well. Here's a quick summary of your content strategy.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--border)' }}>
             <h4 style={{ marginBottom: '1rem' }}>💡 Content Tip</h4>
             <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
               Your audience is most engaged with <strong>{stats?.mostPopularCategory || 'N/A'}</strong> content. 
               Consider increasing output in this category to drive more traffic.
             </p>
          </div>
          <div style={{ padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--border)' }}>
             <h4 style={{ marginBottom: '1rem' }}>📈 Performance</h4>
             <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
               You currently have an average of <strong>{avgViews}</strong> views per article.
               Focus on SEO and social sharing to increase this metric.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, description, trend, color = 'var(--primary)', isString = false }) {
  return (
    <div className="card" style={{ padding: '2rem', borderBottom: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '2rem' }}>{icon}</span>
        {trend && <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '700', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '6px', height: 'fit-content' }}>{trend}</span>}
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
        {title}
      </div>
      <div style={{ fontSize: isString ? '1.75rem' : '3rem', fontWeight: '900', color: 'var(--text-main)', margin: '0.5rem 0' }}>
        {value}
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0' }}>
        {description}
      </p>
    </div>
  );
}
