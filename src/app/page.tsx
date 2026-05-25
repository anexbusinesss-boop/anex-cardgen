'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { CardCanvasRef } from '@/components/CardCanvas';

const CardCanvas = dynamic(() => import('@/components/CardCanvas'), {
  ssr: false,
  loading: () => (
    <div
      className="canvas-container"
      style={{
        background: 'linear-gradient(160deg, #FDF8F0, #F5EAD5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ color: '#C8960C', fontSize: 15, fontWeight: 600, letterSpacing: 0.5 }}>
        Loading…
      </span>
    </div>
  ),
});

interface FormState {
  name: string;
  designation: string;
  phone: string;
}

const INITIAL: FormState = { name: '', designation: '', phone: '' };

export default function HomePage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [templateUrl, setTemplateUrl] = useState<string | null>(null);
  const [templateLoaded, setTemplateLoaded] = useState(false);
  const canvasRef = useRef<CardCanvasRef>(null);

  useEffect(() => {
    fetch('/api/template')
      .then((r) => r.json())
      .then((d) => setTemplateUrl(d.url || null))
      .catch(() => setTemplateUrl(null))
      .finally(() => setTemplateLoaded(true));
  }, []);

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.designation.trim()) e.designation = 'Designation is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGenerate = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      await canvasRef.current?.generate(form.name, form.designation, form.phone);
      setGenerated(true);
    } catch (err) {
      console.error('Generation failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => canvasRef.current?.download();

  const handleChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '40px 16px 56px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* ── Header ───────────────────────────────────── */}
      <header className="anim-up" style={{ textAlign: 'center', marginBottom: 52 }}>

        {/* Top badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid rgba(200,150,12,0.20)',
            borderRadius: 40,
            padding: '7px 20px',
            marginBottom: 32,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          {/* Red dot */}
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#C8102E',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: '#1B3A6B',
              letterSpacing: 0.8,
              textTransform: 'uppercase',
            }}
          >
            ANEX Business Solution
          </span>
          {/* Gold dot */}
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#C8960C',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
        </div>

        {/* Main title — mirrors the card design */}
        <div style={{ lineHeight: 1 }}>
          <h1
            style={{
              fontSize: 'clamp(44px, 9vw, 86px)',
              fontWeight: 900,
              color: '#C8102E',
              letterSpacing: '-1px',
              textTransform: 'uppercase',
              fontFamily: 'Georgia, "Times New Roman", serif',
              margin: 0,
            }}
          >
            EID AL-ADHA
          </h1>
          <div
            style={{
              fontSize: 'clamp(30px, 6vw, 60px)',
              color: '#1B3A6B',
              fontFamily: "'Dancing Script', Georgia, cursive",
              fontWeight: 400,
              marginTop: 4,
              letterSpacing: 1,
            }}
          >
            Mubarak
          </div>
        </div>

        {/* Gold divider */}
        <div
          style={{
            height: '1.5px',
            background:
              'linear-gradient(90deg, transparent, #E4AE28 30%, #E4AE28 70%, transparent)',
            maxWidth: 260,
            margin: '22px auto',
          }}
        />

        <p
          style={{
            color: '#7070A0',
            fontSize: 15,
            maxWidth: 420,
            margin: '0 auto',
            lineHeight: 1.75,
            fontWeight: 400,
          }}
        >
          Create your personalized greeting card and download it in HD quality
        </p>
      </header>

      {/* ── Two-column layout ────────────────────────── */}
      <div
        style={{
          maxWidth: 1060,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 28,
          alignItems: 'start',
        }}
      >
        {/* ── Form Panel ───────────────────────────── */}
        <div className="lpl-card" style={{ padding: '32px 28px' }}>
          {/* Panel header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 3,
                  height: 20,
                  background: '#C8102E',
                  borderRadius: 2,
                }}
              />
              <h2
                style={{ fontSize: 17, fontWeight: 700, color: '#1B3A6B', margin: 0 }}
              >
                Your Details
              </h2>
            </div>
            <p style={{ fontSize: 13, color: '#9090AA', marginLeft: 13 }}>
              Fill in your info to personalise the card
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Name */}
            <div>
              <label htmlFor="name" className="field-label">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="lpl-input"
                value={form.name}
                onChange={handleChange('name')}
                maxLength={80}
              />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>

            {/* Designation */}
            <div>
              <label htmlFor="designation" className="field-label">
                Designation
              </label>
              <input
                id="designation"
                type="text"
                placeholder="e.g. Senior Executive"
                className="lpl-input"
                value={form.designation}
                onChange={handleChange('designation')}
                maxLength={80}
              />
              {errors.designation && (
                <p className="field-error">{errors.designation}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="field-label">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+880 1XXX-XXXXXX"
                className="lpl-input"
                value={form.phone}
                onChange={handleChange('phone')}
                maxLength={20}
              />
              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              <button
                className="btn-generate"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? 'Generating…' : 'Generate My Card'}
              </button>

              {generated && (
                <button
                  className="btn-download anim-in"
                  onClick={handleDownload}
                >
                  Download HD Card &nbsp;(1080 × 1080 PNG)
                </button>
              )}
            </div>
          </div>

          {/* Tip box */}
          <div
            style={{
              marginTop: 24,
              padding: '12px 16px',
              background: 'rgba(200,150,12,0.06)',
              borderRadius: 10,
              border: '1px solid rgba(200,150,12,0.16)',
            }}
          >
            <p style={{ color: '#8A7A50', fontSize: 12.5, lineHeight: 1.65 }}>
              <strong style={{ color: '#C8960C' }}>Tip:</strong> English and Bengali
              text are both supported — the font adjusts automatically.
            </p>
          </div>
        </div>

        {/* ── Preview Panel ─────────────────────────── */}
        <div className="lpl-card" style={{ padding: '32px 28px' }}>
          {/* Panel header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 3,
                  height: 20,
                  background: '#C8960C',
                  borderRadius: 2,
                }}
              />
              <h2
                style={{ fontSize: 17, fontWeight: 700, color: '#1B3A6B', margin: 0 }}
              >
                Card Preview
              </h2>
            </div>
            <p style={{ fontSize: 13, color: '#9090AA', marginLeft: 13 }}>
              1080 × 1080 px · PNG
            </p>
          </div>

          <CardCanvas
            ref={canvasRef}
            templateUrl={templateUrl}
            onGenerated={() => setGenerated(true)}
          />

          {/* Ready state */}
          {generated && (
            <div
              className="anim-in"
              style={{
                marginTop: 14,
                padding: '11px 16px',
                background: 'rgba(27,58,107,0.05)',
                borderRadius: 10,
                border: '1px solid rgba(27,58,107,0.12)',
                textAlign: 'center',
              }}
            >
              <p style={{ color: '#1B3A6B', fontSize: 13, fontWeight: 600 }}>
                Card ready — click Download to save
              </p>
            </div>
          )}

          {/* No template */}
          {!templateUrl && templateLoaded && (
            <p
              style={{
                textAlign: 'center',
                marginTop: 14,
                color: '#BDB0A0',
                fontSize: 13,
              }}
            >
              No template uploaded yet. An admin must upload the card template first.
            </p>
          )}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────── */}
      <footer style={{ textAlign: 'center', marginTop: 56 }}>
        {/* Red-gold-navy tri-line accent */}
        <div
          style={{
            height: '1.5px',
            background:
              'linear-gradient(90deg, transparent, #C8102E 20%, #C8960C 50%, #1B3A6B 80%, transparent)',
            maxWidth: 200,
            margin: '0 auto 20px',
          }}
        />

        <p
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: '#1B3A6B',
            letterSpacing: 0.5,
            marginBottom: 5,
          }}
        >
          ANEX Business Solution
        </p>
        <p style={{ fontSize: 12, color: '#A0A0B8', fontWeight: 400 }}>
          A special gift to LPL Employees this Eid Al-Adha
        </p>
      </footer>
    </main>
  );
}
