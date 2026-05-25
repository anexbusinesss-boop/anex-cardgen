'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) { setError('Please enter your password'); return; }
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/admin/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid password. Please try again.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        className="lpl-card"
        style={{ width: '100%', maxWidth: 420, padding: '44px 36px', textAlign: 'center' }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #C8102E, #A00D23)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 6px 20px rgba(200,16,46,0.3)',
          }}
        >
          <span style={{ color: '#fff', fontSize: 26, fontWeight: 900, lineHeight: 1 }}>A</span>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1B3A6B', marginBottom: 6 }}>
          Admin Panel
        </h1>
        <p style={{ color: '#9090AA', fontSize: 14, marginBottom: 32 }}>
          Eid Card Generator · Management
        </p>

        {/* Divider */}
        <div style={{
          height: 1.5,
          background: 'linear-gradient(90deg, transparent, #E4AE28, transparent)',
          marginBottom: 28,
        }} />

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ textAlign: 'left' }}>
            <label
              htmlFor="password"
              className="field-label"
            >
              Admin Password
            </label>
            <input
              id="password"
              type="password"
              className="lpl-input"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(200,16,46,0.06)',
                border: '1px solid rgba(200,16,46,0.22)',
                borderRadius: 10,
                padding: '11px 16px',
                color: '#C8102E',
                fontSize: 13,
                fontWeight: 500,
                textAlign: 'left',
              }}
            >
              {error}
            </div>
          )}

          <button
            id="login-btn"
            type="submit"
            className="btn-generate"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: 28, color: '#C0C0D0', fontSize: 12 }}>
          Password is configured via environment variable
        </p>
      </div>
    </main>
  );
}
