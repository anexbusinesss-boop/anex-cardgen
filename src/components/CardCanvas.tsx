'use client';

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { getCanvasFont } from '@/lib/fontDetect';

export interface CardCanvasRef {
    generate: (name: string, designation: string, phone: string) => Promise<void>;
    download: () => Promise<void>;
}

interface CardCanvasProps {
    templateUrl: string | null;
    onGenerated?: () => void;
}

const CANVAS_SIZE = 1080;
const TEXT_X = 460;
const TEXT_COLOR = '#333333';

const CardCanvas = forwardRef<CardCanvasRef, CardCanvasProps>(
    ({ templateUrl, onGenerated }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const generatedRef = useRef(false);

        const loadImage = (src: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const img = new window.Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });
        };

        const generate = useCallback(
            async (name: string, designation: string, phone: string) => {
                const canvas = canvasRef.current;
                if (!canvas) return;

                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                canvas.width = CANVAS_SIZE;
                canvas.height = CANVAS_SIZE;

                // Fill background
                ctx.fillStyle = '#f8f4e8';
                ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

                // Draw template background
                if (templateUrl) {
                    try {
                        const img = await loadImage(templateUrl);
                        // Cover-fit into 1080x1080
                        const scale = Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
                        const w = img.width * scale;
                        const h = img.height * scale;
                        const x = (CANVAS_SIZE - w) / 2;
                        const y = (CANVAS_SIZE - h) / 2;
                        ctx.drawImage(img, x, y, w, h);
                    } catch {
                        console.error('Failed to load template image');
                    }
                }

                // Draw texts
                ctx.fillStyle = TEXT_COLOR;
                ctx.textBaseline = 'alphabetic';
                ctx.textAlign = 'left';

                // Name — 35px bold, 70px above bottom
                ctx.font = getCanvasFont(35, 700, name);
                ctx.fillText(name, TEXT_X, CANVAS_SIZE - 70);

                // Designation — 22px normal, 42px above bottom
                ctx.font = getCanvasFont(22, 400, designation);
                ctx.fillText(designation, TEXT_X, CANVAS_SIZE - 42);

                // Phone — 22px normal, 18px above bottom
                ctx.font = getCanvasFont(22, 400, phone);
                ctx.fillText(phone, TEXT_X, CANVAS_SIZE - 18);

                generatedRef.current = true;
                onGenerated?.();
            },
            [templateUrl, onGenerated]
        );

        const download = useCallback((): Promise<void> => {
            return new Promise((resolve, reject) => {
                const canvas = canvasRef.current;
                if (!canvas || !generatedRef.current) {
                    resolve();
                    return;
                }
                // Use toBlob() — produces a proper binary PNG file instead of a
                // base64 data URL, which is more reliable across all browsers and
                // won't hit the URL length limit on large (1080x1080) canvases.
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Failed to create PNG blob'));
                        return;
                    }
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = 'eid-card.png';
                    link.href = url;
                    // Must be in DOM for Firefox to trigger download
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    // Revoke after a short delay to let the browser initiate the download
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                    resolve();
                }, 'image/png');
            });
        }, []);

        useImperativeHandle(ref, () => ({ generate, download }), [generate, download]);

        // Draw placeholder when no card generated yet
        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            canvas.width = CANVAS_SIZE;
            canvas.height = CANVAS_SIZE;
            ctx.fillStyle = '#1a3d2b';
            ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            ctx.fillStyle = 'rgba(212, 160, 23, 0.15)';
            ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            // Decorative text
            ctx.fillStyle = 'rgba(212, 160, 23, 0.4)';
            ctx.font = 'bold 52px Trebuchet MS, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Eid Mubarak', CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 30);
            ctx.font = '28px Trebuchet MS, Arial, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillText('Fill the form to generate your card', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 40);
        }, []);

        return (
            <div className="canvas-container">
                <canvas ref={canvasRef} />
            </div>
        );
    }
);

CardCanvas.displayName = 'CardCanvas';
export default CardCanvas;
