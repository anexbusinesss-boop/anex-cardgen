'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const navItems = [
    { href: '/admin/dashboard', label: '📊 Dashboard', id: 'nav-dashboard' },
    { href: '/admin/design', label: '🖼️ Design', id: 'nav-design' },
];

export default function AdminNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await fetch('/api/admin/logout', { method: 'POST' });
            router.push('/admin');
        } catch {
            setLoggingOut(false);
        }
    };

    return (
        <nav
            style={{
                background: 'rgba(15, 45, 30, 0.95)',
                borderBottom: '1px solid rgba(212, 160, 23, 0.2)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 50,
            }}
        >
            <div
                style={{
                    maxWidth: 1200,
                    margin: '0 auto',
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: 64,
                }}
            >
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>🌙</span>
                    <div>
                        <p style={{ color: '#d4a017', fontWeight: 700, fontSize: 15, lineHeight: 1.1 }}>
                            Eid Card Admin
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Management Panel</p>
                    </div>
                </div>

                {/* Nav Links */}
                <div style={{ display: 'flex', gap: 4 }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                id={item.id}
                                href={item.href}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 10,
                                    fontSize: 14,
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? '#d4a017' : 'rgba(255,255,255,0.6)',
                                    background: isActive ? 'rgba(212, 160, 23, 0.12)' : 'transparent',
                                    border: isActive ? '1px solid rgba(212, 160, 23, 0.3)' : '1px solid transparent',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Logout */}
                <button
                    id="admin-logout-btn"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    style={{
                        background: 'rgba(255, 100, 100, 0.12)',
                        border: '1px solid rgba(255, 100, 100, 0.25)',
                        color: '#ff8080',
                        padding: '8px 16px',
                        borderRadius: 10,
                        fontSize: 14,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                >
                    {loggingOut ? '...' : '🚪 Logout'}
                </button>
            </div>
        </nav>
    );
}
