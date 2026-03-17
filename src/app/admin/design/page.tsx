'use client';

import { useState, useEffect } from 'react';
import AdminNav from '@/components/AdminNav';
import Image from 'next/image';

export default function AdminDesignPage() {
    const [currentTemplate, setCurrentTemplate] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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
            setMessage({ type: 'error', text: 'File must be under 10MB.' });
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
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (res.ok) {
                setCurrentTemplate(data.url);
                setSelectedFile(null);
                setPreviewUrl(null);
                setMessage({ type: 'success', text: '✅ Template uploaded and activated successfully!' });
                // Reset the file input
                const input = document.getElementById('template-input') as HTMLInputElement;
                if (input) input.value = '';
            } else {
                const errorText = data.details ? `${data.error}: ${data.details}` : (data.error || 'Upload failed. Please try again.');
                setMessage({ type: 'error', text: errorText });
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh' }}>
            <AdminNav />

            <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
                {/* Page Header */}
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#d4a017', marginBottom: 4 }}>
                        🖼️ Design Management
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
                        Upload and manage the Eid card template (1080×1080)
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28 }}>
                    {/* Upload Section */}
                    <div className="glass-card" style={{ padding: 32 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#d4a017', marginBottom: 20 }}>
                            📤 Upload New Template
                        </h2>

                        {/* Drop zone */}
                        <label
                            htmlFor="template-input"
                            style={{
                                display: 'block',
                                border: '2px dashed rgba(212, 160, 23, 0.4)',
                                borderRadius: 16,
                                padding: '32px 20px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                background: selectedFile ? 'rgba(212, 160, 23, 0.06)' : 'rgba(255,255,255,0.03)',
                                marginBottom: 20,
                            }}
                        >
                            {previewUrl ? (
                                <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        fill
                                        style={{ objectFit: 'contain', borderRadius: 12 }}
                                        unoptimized
                                    />
                                </div>
                            ) : (
                                <>
                                    <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 4 }}>
                                        Click to select image
                                    </p>
                                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                                        JPG or PNG, max 10MB
                                    </p>
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
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 14, textAlign: 'center' }}>
                                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                        )}

                        {message && (
                            <div
                                style={{
                                    background: message.type === 'success' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 100, 100, 0.1)',
                                    border: `1px solid ${message.type === 'success' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(255, 100, 100, 0.3)'}`,
                                    borderRadius: 10,
                                    padding: '12px 16px',
                                    color: message.type === 'success' ? '#4ade80' : '#ff8080',
                                    fontSize: 14,
                                    marginBottom: 16,
                                }}
                            >
                                {message.text}
                            </div>
                        )}

                        <button
                            id="upload-btn"
                            className="btn-primary"
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                        >
                            {uploading ? '⏳ Uploading...' : '🚀 Upload & Activate Template'}
                        </button>

                        <div
                            style={{
                                marginTop: 20,
                                padding: '12px 16px',
                                background: 'rgba(212, 160, 23, 0.06)',
                                borderRadius: 10,
                                border: '1px solid rgba(212, 160, 23, 0.15)',
                            }}
                        >
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, lineHeight: 1.7 }}>
                                ℹ️ <strong style={{ color: '#d4a017' }}>Note:</strong> Only one active template exists at a time.
                                Uploading a new template will automatically deactivate the previous one.
                                The template will be used as the background for all generated cards.
                            </p>
                        </div>
                    </div>

                    {/* Current Template */}
                    <div className="glass-card" style={{ padding: 32 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#d4a017', marginBottom: 20 }}>
                            ✅ Current Active Template
                        </h2>

                        {loadingTemplate ? (
                            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>
                                <p>Loading...</p>
                            </div>
                        ) : currentTemplate ? (
                            <>
                                <div
                                    style={{
                                        position: 'relative',
                                        width: '100%',
                                        aspectRatio: '1/1',
                                        borderRadius: 16,
                                        overflow: 'hidden',
                                        border: '2px solid rgba(212, 160, 23, 0.3)',
                                    }}
                                >
                                    <Image
                                        src={currentTemplate}
                                        alt="Active template"
                                        fill
                                        style={{ objectFit: 'contain' }}
                                        unoptimized
                                    />
                                </div>
                                <p
                                    style={{
                                        marginTop: 12,
                                        color: '#4ade80',
                                        fontSize: 13,
                                        textAlign: 'center',
                                        fontWeight: 500,
                                    }}
                                >
                                    ✅ Active — This template is live
                                </p>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 48, color: 'rgba(255,255,255,0.3)' }}>
                                <div style={{ fontSize: 44, marginBottom: 12 }}>🈳</div>
                                <p style={{ fontSize: 14 }}>No template uploaded yet.</p>
                                <p style={{ fontSize: 12, marginTop: 6 }}>Upload a template to get started.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
