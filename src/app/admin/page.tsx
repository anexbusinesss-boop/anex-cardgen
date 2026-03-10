'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password.trim()) {
            setError('Please enter your password');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
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
            }}
        >
            <div
                className="glass-card"
                style={{
                    width: '100%',
                    maxWidth: 420,
                    padding: 40,
                    textAlign: 'center',
                }}
            >
                {/* Icon */}
                <div style={{ fontSize: 56, marginBottom: 16 }}>🔐</div>

                <h1
                    style={{
                        fontSize: 28,
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #d4a017, #f0c040)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        marginBottom: 8,
                    }}
                >
                    Admin Panel
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 32, fontSize: 14 }}>
                    Eid Card Generator Management
                </p>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ textAlign: 'left' }}>
                        <label
                            htmlFor="password"
                            style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: 8, fontSize: 14, fontWeight: 500 }}
                        >
                            Admin Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="eid-input"
                            placeholder="Enter admin password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div
                            style={{
                                background: 'rgba(255, 100, 100, 0.12)',
                                border: '1px solid rgba(255, 100, 100, 0.3)',
                                borderRadius: 10,
                                padding: '12px 16px',
                                color: '#ff8080',
                                fontSize: 14,
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <button
                        id="login-btn"
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ marginTop: 8 }}
                    >
                        {loading ? '⏳ Signing in...' : '🚀 Sign In'}
                    </button>
                </form>

                <p style={{ marginTop: 28, color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
                    Password is set via environment variable
                </p>
            </div>
        </main>
    );
}
