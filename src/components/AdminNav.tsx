'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', id: 'nav-dashboard' },
  { href: '/admin/design',    label: 'Template',  id: 'nav-design' },
];

export default function AdminNav() {
  const pathname   = usePathname();
  const router     = useRouter();
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
        background: 'rgba(255,255,255,0.95)',
        borderBottom: '1px solid rgba(200,150,12,0.18)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      }}
    >
      {/* Red top accent */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #C8102E 0%, #C8960C 50%, #1B3A6B 100%)' }} />

      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 60,
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #C8102E, #A00D23)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 900 }}>A</span>
          </div>
          <div>
            <p style={{ color: '#1B3A6B', fontWeight: 800, fontSize: 14, lineHeight: 1.1 }}>
              ANEX Admin
            </p>
            <p style={{ color: '#9090AA', fontSize: 11 }}>Card Management</p>
          </div>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 4 }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                id={item.id}
                href={item.href}
                style={{
                  padding: '7px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  color: active ? '#C8102E' : '#4A4868',
                  background: active ? 'rgba(200,16,46,0.07)' : 'transparent',
                  border: active ? '1px solid rgba(200,16,46,0.18)' : '1px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.18s ease',
                  letterSpacing: 0.2,
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
            background: 'rgba(200,16,46,0.06)',
            border: '1px solid rgba(200,16,46,0.18)',
            color: '#C8102E',
            padding: '7px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: loggingOut ? 'not-allowed' : 'pointer',
            opacity: loggingOut ? 0.5 : 1,
            transition: 'all 0.18s ease',
          }}
        >
          {loggingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>
    </nav>
  );
}
