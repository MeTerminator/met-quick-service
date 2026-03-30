'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/Guestbook.module.css';

interface Message {
  title: string;
  username: string;
  content: string;
  timestamp: string;
  id: string;
}

export default function Guestbook() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    username: '',
    content: ''
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  const fetchMessages = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Load username from memory
    const savedUsername = localStorage.getItem('saved-guestbook-username');
    if (savedUsername) {
      setFormData(prev => ({ ...prev, username: savedUsername }));
    }

    // Poll for new messages every 10 seconds for "real-time" feel
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      // Remember username
      localStorage.setItem('saved-guestbook-username', formData.username);

      setStatus({ type: 'success', message: 'Message posted successfully!' });
      setFormData(prev => ({ ...prev, title: '', content: '' }));
      fetchMessages(); // Refresh messages immediately
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Guestbook</h1>
        <p>By MeTerminator</p>
        <a
          href="http://met6.top/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.homeBtn}
        >
          MeT-Home
        </a>
      </header>

      <section className={styles.formCard}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Title (max 80 chars)</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                maxLength={80}
                required
                className={styles.input}
                placeholder="Title Section"
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Username (max 40 chars)</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                maxLength={40}
                required
                className={styles.input}
                placeholder="Username Section"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Content (max 5000 chars)</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              maxLength={5000}
              required
              className={styles.textarea}
              placeholder="Content Section"
            />
          </div>

          {status.message && (
            <div style={{
              marginTop: '15px',
              padding: '10px',
              borderRadius: '8px',
              textAlign: 'center',
              backgroundColor: status.type === 'error' ? 'rgba(255, 100, 100, 0.1)' : 'rgba(100, 255, 100, 0.1)',
              color: status.type === 'error' ? '#ff6b6b' : '#51cf66',
              fontSize: '0.9rem'
            }}>
              {status.message}
            </div>
          )}

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Posting...' : 'Post Message'}
          </button>
        </form>
      </section>

      <section className={styles.messagesList}>
        <div className={styles.sectionHeader}>
          <h2 style={{ margin: 0, fontFamily: 'Outfit, sans-serif' }}>Recent Messages</h2>
          <button
            onClick={() => {
              setFetching(true);
              fetchMessages();
            }}
            disabled={fetching}
            className={styles.refreshBtn}
          >
            <svg className={`${styles.refreshBtnSVG} ${fetching ? styles.rotating : ''}`} viewBox="0 0 24 24">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
            </svg>
            {fetching ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {fetching && messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>No messages.</div>
        ) : (
          <div className={styles.messagesContainer}>
            {messages.map((msg) => (
              <article key={msg.id} className={styles.messageCard}>
                <div className={styles.messageHeader}>
                  <div>
                    <h3 className={styles.messageTitle}>{msg.title}</h3>
                    <div className={styles.messageUsername}>by @{msg.username}</div>
                  </div>
                  <span className={styles.messageDate}>
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className={styles.messageContent}>{msg.content}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
