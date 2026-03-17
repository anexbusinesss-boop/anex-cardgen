'use client';

import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { CardCanvasRef } from '@/components/CardCanvas';

const CardCanvas = dynamic(() => import('@/components/CardCanvas'), {
  ssr: false,
  loading: () => (
    <div className="canvas-container" style={{ background: '#f0f0f0', borderRadius: 16, aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'rgba(0,0,0,0.2)', fontSize: 18 }}>Loading canvas...</span>
    </div>
  ),
});

interface FormState {
  name: string;
  designation: string;
  phone: string;
}

const INITIAL_FORM: FormState = { name: '', designation: '', phone: '' };

export default function HomePage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [templateUrl, setTemplateUrl] = useState<string | null>(null);
  const [templateLoaded, setTemplateLoaded] = useState(false);
  const canvasRef = useRef<CardCanvasRef>(null);

  // Fetch template on mount
  const fetchTemplate = useCallback(async () => {
    try {
      const res = await fetch('/api/template');
      const data = await res.json();
      setTemplateUrl(data.url || null);
    } catch {
      setTemplateUrl(null);
    } finally {
      setTemplateLoaded(true);
    }
  }, []);

  // Use effect equivalent with useCallback
  if (!templateLoaded) {
    fetchTemplate();
  }

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.designation.trim()) newErrors.designation = 'Designation is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Save entry to DB
      await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      // Generate canvas
      await canvasRef.current?.generate(form.name, form.designation, form.phone);
      setGenerated(true);
    } catch (err) {
      console.error('Generation failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    await canvasRef.current?.download();
  };

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <main className="min-h-screen py-8 px-4">
      {/* Header */}
      <header className="text-center mb-10 animate-fade-in-up">
        <div className="inline-flex items-center gap-3 mb-4">
          <span style={{ fontSize: 40 }}>🌙</span>
          <span style={{ fontSize: 40 }}>⭐</span>
          <span style={{ fontSize: 40 }}>🌙</span>
        </div>
        <h1
          style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #d4a017, #f0c040)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.5px',
            marginBottom: 8,
          }}
        >
          Eid Wish Card Generator
        </h1>
        <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
          Create your personalized Eid Mubarak greeting card and download it in HD quality
        </p>
      </header>

      {/* Main content */}
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 32,
          alignItems: 'start',
        }}
      >
        {/* Form Panel */}
        <div className="glass-card" style={{ padding: 32 }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#d4a017',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span>✏️</span> Your Details
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                style={{ display: 'block', color: 'rgba(255,255,255,0.8)', marginBottom: 8, fontWeight: 500 }}
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="eid-input"
                value={form.name}
                onChange={handleChange('name')}
                maxLength={80}
              />
              {errors.name && (
                <p style={{ color: '#ff7b7b', fontSize: 13, marginTop: 5 }}>{errors.name}</p>
              )}
            </div>

            {/* Designation */}
            <div>
              <label
                htmlFor="designation"
                style={{ display: 'block', color: 'rgba(255,255,255,0.8)', marginBottom: 8, fontWeight: 500 }}
              >
                Designation
              </label>
              <input
                id="designation"
                type="text"
                placeholder="e.g. Software Engineer"
                className="eid-input"
                value={form.designation}
                onChange={handleChange('designation')}
                maxLength={80}
              />
              {errors.designation && (
                <p style={{ color: '#ff7b7b', fontSize: 13, marginTop: 5 }}>{errors.designation}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                style={{ display: 'block', color: 'rgba(0,0,0,0.7)', marginBottom: 8, fontWeight: 500 }}
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+880 1XXX-XXXXXX"
                className="eid-input"
                style={{ color: '#000', background: 'rgba(0,0,0,0.04)', borderColor: 'rgba(0,0,0,0.1)' }}
                value={form.phone}
                onChange={handleChange('phone')}
                maxLength={20}
              />
              {errors.phone && (
                <p style={{ color: '#d32f2f', fontSize: 13, marginTop: 5 }}>{errors.phone}</p>
              )}
            </div>

            {/* Generate button */}
            <button
              id="generate-btn"
              className="btn-primary"
              onClick={handleGenerate}
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? '⏳ Generating...' : '✨ Generate Card'}
            </button>

            {/* Download button */}
            {generated && (
              <button
                id="download-btn"
                className="btn-secondary"
                onClick={handleDownload}
              >
                📥 Download HD PNG (1080×1080)
              </button>
            )}
          </div>

          {/* Tips */}
          <div
            style={{
              marginTop: 24,
              padding: '14px 18px',
              background: 'rgba(212, 160, 23, 0.08)',
              borderRadius: 12,
              border: '1px solid rgba(212, 160, 23, 0.2)',
            }}
          >
            <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: 13, lineHeight: 1.6 }}>
              💡 <strong style={{ color: '#c39414' }}>Tip:</strong> Both English and Bengali text is supported. The font will automatically adjust.
            </p>
          </div>
        </div>

        {/* Canvas Preview Panel */}
        <div className="glass-card" style={{ padding: 32 }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#d4a017',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span>🖼️</span> Card Preview
          </h2>

          <CardCanvas ref={canvasRef} templateUrl={templateUrl} onGenerated={() => setGenerated(true)} />

          {generated && (
            <p
              style={{
                textAlign: 'center',
                marginTop: 14,
                color: '#4ade80',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              ✅ Card ready! Click Download to save.
            </p>
          )}

          {!templateUrl && templateLoaded && (
            <p
              style={{
                textAlign: 'center',
                marginTop: 14,
                color: 'rgba(255,255,255,0.4)',
                fontSize: 13,
              }}
            >
              No template uploaded yet. Admin must upload a card template first.
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          textAlign: 'center',
          marginTop: 48,
          color: 'rgba(255,255,255,0.3)',
          fontSize: 13,
        }}
      >
        <p style={{ fontWeight: 600, color: 'rgba(0,0,0,0.6)', marginBottom: 4 }}>
          Powered By ANEX Business Solution
        </p>
        <p style={{ fontSize: 12 }}>A gift to LPL Employees for this EID.</p>
      </footer>
    </main>
  );
}
