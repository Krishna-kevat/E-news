import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminNewsForm({ onDone, editingItem, onCancel }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'General', image: null });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setForm({
        title: editingItem.title || '',
        description: editingItem.description || '',
        category: editingItem.category || 'General',
        image: null // We don't populate image file but can keep old one in DB
      });
      setMsg('');
    } else {
      setForm({ title: '', description: '', category: 'General', image: null });
    }
  }, [editingItem]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile = (e) => setForm({ ...form, image: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (form.title.length < 3) { setMsg('Title too short'); return; }
    if (form.description.length < 10) { setMsg('Description too short'); return; }

    setLoading(true);
    const data = new FormData();
    data.append('title', form.title);
    data.append('description', form.description);
    data.append('category', form.category);
    if (form.image) data.append('image', form.image);

    try {
      if (editingItem) {
        await api.put(`/news/${editingItem._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMsg('News article successfully updated!');
      } else {
        await api.post('/news', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMsg('News article successfully published!');
      }
      
      setForm({ title: '', description: '', category: 'General', image: null });
      if (onDone) onDone();
      setLoading(false);
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.msg || 'Error processing request');
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '3rem' }} id="admin-form">
      <h3>{editingItem ? 'Edit Article' : 'Publish New Article'}</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        {editingItem ? 'Make changes to your published story.' : 'Create and share the latest updates with your audience.'}
      </p>

      {msg && <div className="alert" style={{ background: msg.includes('success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: msg.includes('success') ? 'var(--primary)' : '#ef4444', borderColor: msg.includes('success') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}>{msg}</div>}
      
      <form onSubmit={handleSubmit} className="form">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <label>
            Article Title
            <input 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              placeholder="Enter a catchy title..."
              required 
            />
          </label>
          <label>
            News Category
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="General">General</option>
              <option value="Sports">Sports</option>
              <option value="Politics">Politics</option>
              <option value="Technology">Technology</option>
              <option value="Business">Business</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Health">Health</option>
            </select>
          </label>
        </div>

        <label>
          Full Description
          <textarea 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            placeholder="Tell the story in detail..."
            style={{ minHeight: '150px' }}
            required 
          />
        </label>

        <label>
          {editingItem ? 'Update Image (Optional)' : 'Cover Image (Optional)'}
          <div style={{ position: 'relative', marginTop: '5px' }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFile} 
              style={{ padding: '4px' }}
            />
          </div>
        </label>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Processing...' : (editingItem ? 'Update Article' : 'Publish Article')}
          </button>
          {editingItem && (
            <button className="btn" type="button" onClick={onCancel} style={{ background: 'var(--bg-body)', color: 'var(--text-main)', border: '1px solid var(--border)', boxShadow: 'none' }}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
