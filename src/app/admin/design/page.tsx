'use client';

import { useState, useEffect } from 'react';
import AdminNav from '@/components/AdminNav';
import Image from 'next/image';

export default function AdminDesignPage() {
  const [currentTemplate, setCurrentTemplate] = useState<string | null>(null);
  const [selectedFile,    setSelectedFile]    = useState<File | null>(null);
  const [previewUrl,      setPreviewUrl]      = useState<string | null>(null);
  const [uploading,       setUploading]       = useState(false);
  const [message,         setMessage]         = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(true);

  useEffect(() => {
    fetch('/api/template')
      .then((r) => r.json())
      .then((d) => setCurrentTemplate(d.url || null))
      .catch(() => setCurrentTemplate(null))
      .finally(() => setLoadingTemplate(false));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setMessage({ type: 'error', text: 'Only JPG and PNG files are accepted.' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File must be under 10 MB.' });
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMessage(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append('template', selectedFile);
    try {
      const res  = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      let data: { url?: string; error?: string; details?: string } = {};
      try {
        data = await res.json();
      } catch {
        setMessage({ type: 'error', text: `Server error (HTTP ${res.status}). Check server logs.` });
        return;
      }
      if (res.ok && data.url) {
        setCurrentTemplate(data.url);
        setSelectedFile(null);
        setPreviewUrl(null);
        setMessage({ type: 'success', text: 'Template uploaded and activated successfully.' });
        const input = document.getElementById('template-input') as HTMLInputElement;
        if (input) input.value = '';
      } else {
        const errText = data.details
          ? `${data.error}: ${data.details}`
          : (data.error || 'Upload failed. Please try again.');
        setMessage({ type: 'error', text: errText });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setMessage({ type: 'error', text: `Network error: ${msg}` });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <AdminNav />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 24px' }}>

        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ display: 'inline-block', width: 3, height: 22, background: '#C8960C', borderRadius: 2 }} />
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1B3A6B', margin: 0 }}>
              Template Management
            </h1>
          </div>
          <p style={{ color: '#9090AA', fontSize: 13, marginLeft: 13 }}>
            Upload and activate the card background image (1080 × 1080 px)
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>

          {/* ── Upload Panel ─────────────────────────── */}
          <div className="lpl-card" style={{ padding: '30px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
              <span style={{ display: 'inline-block', width: 3, height: 18, background: '#C8102E', borderRadius: 2 }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1B3A6B', margin: 0 }}>
                Upload New Template
              </h2>
            </div>

            {/* Drop zone */}
            <label
              htmlFor="template-input"
              style={{
                display: 'block',
                border: `2px dashed ${selectedFile ? '#C8960C' : '#E4D9C4'}`,
                borderRadius: 14,
                padding: previewUrl ? 0 : '36px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: selectedFile ? 'rgba(200,150,12,0.04)' : '#FAFAF7',
                marginBottom: 16,
                transition: 'border-color 0.2s, background 0.2s',
                overflow: 'hidden',
              }}
            >
              {previewUrl ? (
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    style={{ objectFit: 'contain' }}
                    unoptimized
                  />
                </div>
              ) : (
                <>
                  <div style={{
                    width: 52, height: 52, borderRadius: 12,
                    background: 'rgba(200,150,12,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px',
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8960C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21,15 16,10 5,21"/>
                    </svg>
                  </div>
                  <p style={{ color: '#4A4868', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                    Click to select image
                  </p>
                  <p style={{ color: '#9090AA', fontSize: 12.5 }}>JPG or PNG · max 10 MB</p>
                </>
              )}
              <input
                id="template-input"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>

            {selectedFile && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                background: 'rgba(200,150,12,0.06)',
                borderRadius: 10,
                border: '1px solid rgba(200,150,12,0.16)',
                marginBottom: 14,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8960C" strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                <span style={{ fontSize: 13, color: '#4A4868', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedFile.name}
                </span>
                <span style={{ fontSize: 12, color: '#9090AA', flexShrink: 0 }}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}

            {/* Status message */}
            {message && (
              <div style={{
                background: message.type === 'success' ? 'rgba(22,163,74,0.07)' : 'rgba(200,16,46,0.07)',
                border: `1px solid ${message.type === 'success' ? 'rgba(22,163,74,0.22)' : 'rgba(200,16,46,0.22)'}`,
                borderRadius: 10,
                padding: '11px 16px',
                color: message.type === 'success' ? '#16a34a' : '#C8102E',
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 14,
              }}>
                {message.text}
              </div>
            )}

            <button
              id="upload-btn"
              className="btn-generate"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading…' : 'Upload & Activate Template'}
            </button>

            {/* Note */}
            <div style={{
              marginTop: 18,
              padding: '11px 15px',
              background: 'rgba(27,58,107,0.04)',
              borderRadius: 10,
              border: '1px solid rgba(27,58,107,0.10)',
            }}>
              <p style={{ color: '#6B7AA0', fontSize: 12.5, lineHeight: 1.65 }}>
                <strong style={{ color: '#1B3A6B' }}>Note:</strong> Only one template is active at a time.
                Uploading a new image automatically deactivates the previous one.
              </p>
            </div>
          </div>

          {/* ── Active Template Preview ───────────────── */}
          <div className="lpl-card" style={{ padding: '30px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
              <span style={{ display: 'inline-block', width: 3, height: 18, background: '#16a34a', borderRadius: 2 }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1B3A6B', margin: 0 }}>
                Active Template
              </h2>
            </div>

            {loadingTemplate ? (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <div style={{
                  width: 32, height: 32, border: '3px solid #E4D9C4',
                  borderTopColor: '#C8102E', borderRadius: '50%',
                  margin: '0 auto 14px',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ color: '#9090AA', fontSize: 13 }}>Loading…</p>
              </div>
            ) : currentTemplate ? (
              <>
                <div style={{
                  position: 'relative', width: '100%', aspectRatio: '1/1',
                  borderRadius: 12, overflow: 'hidden',
                  border: '1.5px solid rgba(200,150,12,0.25)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                }}>
                  <Image
                    src={currentTemplate}
                    alt="Active template"
                    fill
                    style={{ objectFit: 'contain' }}
                    unoptimized
                  />
                </div>
                <div style={{
                  marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '10px 14px',
                  background: 'rgba(22,163,74,0.06)',
                  borderRadius: 10, border: '1px solid rgba(22,163,74,0.18)',
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block', flexShrink: 0 }} />
                  <p style={{ color: '#16a34a', fontSize: 13, fontWeight: 600 }}>
                    Active — this template is live on the generator
                  </p>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '52px 20px' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: 'rgba(200,150,12,0.07)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C8960C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                </div>
                <p style={{ color: '#4A4868', fontWeight: 600, fontSize: 15 }}>No template uploaded</p>
                <p style={{ color: '#9090AA', fontSize: 13, marginTop: 5 }}>
                  Upload a card image to get started
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
