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

// Text rendered centered in the bottom text area of the template.
// Black fill, Trebuchet MS font, no shadow — matches the light/white bottom zone.
const TEXT_CX    = CANVAS_SIZE / 2;
const NAME_Y     = CANVAS_SIZE - 88;   // moved up 6 px
const DESG_Y     = CANVAS_SIZE - 56;   // moved up 6 px
const PHONE_Y    = CANVAS_SIZE - 28;   // moved up 6 px

const CardCanvas = forwardRef<CardCanvasRef, CardCanvasProps>(
  ({ templateUrl, onGenerated }, ref) => {
    const canvasRef  = useRef<HTMLCanvasElement>(null);
    const doneRef    = useRef(false);

    const loadImage = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload  = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    const generate = useCallback(
      async (name: string, designation: string, phone: string) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width  = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;

        // Cream background fallback
        ctx.fillStyle = '#FDF8F0';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Draw template (cover-fit)
        if (templateUrl) {
          try {
            const img   = await loadImage(templateUrl);
            const scale = Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
            const w     = img.width  * scale;
            const h     = img.height * scale;
            const x     = (CANVAS_SIZE - w) / 2;
            const y     = (CANVAS_SIZE - h) / 2;
            ctx.drawImage(img, x, y, w, h);
          } catch {
            console.error('Failed to load template image');
          }
        }

        // Text — black, Trebuchet MS, centred in the card's text zone
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle    = '#000000';
        ctx.shadowColor  = 'transparent';
        ctx.shadowBlur   = 0;

        ctx.font = getCanvasFont(36, 700, name);
        ctx.fillText(name, TEXT_CX, NAME_Y);

        ctx.font = getCanvasFont(22, 400, designation);
        ctx.fillText(designation, TEXT_CX, DESG_Y);

        ctx.font = getCanvasFont(22, 400, phone);
        ctx.fillText(phone, TEXT_CX, PHONE_Y);

        doneRef.current = true;
        onGenerated?.();
      },
      [templateUrl, onGenerated]
    );

    const download = useCallback((): Promise<void> =>
      new Promise((resolve, reject) => {
        const canvas = canvasRef.current;
        if (!canvas || !doneRef.current) { resolve(); return; }
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error('Failed to create PNG blob')); return; }
          const url  = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = 'eid-al-adha-card.png';
          link.href     = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          resolve();
        }, 'image/png');
      }),
    []);

    useImperativeHandle(ref, () => ({ generate, download }), [generate, download]);

    // Placeholder canvas — matches the card's cream/gold aesthetic
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width  = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;

      // Cream gradient background
      const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE);
      bg.addColorStop(0,   '#FDF8F0');
      bg.addColorStop(0.7, '#F5EAD5');
      bg.addColorStop(1,   '#EDD9B4');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Gold bottom strip
      const strip = ctx.createLinearGradient(0, CANVAS_SIZE - 160, 0, CANVAS_SIZE);
      strip.addColorStop(0, 'rgba(200,150,12,0)');
      strip.addColorStop(1, 'rgba(200,150,12,0.35)');
      ctx.fillStyle = strip;
      ctx.fillRect(0, CANVAS_SIZE - 160, CANVAS_SIZE, 160);

      // Centre text
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle = '#C8102E';
      ctx.font      = 'bold 72px Georgia, serif';
      ctx.fillText('EID AL-ADHA', CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 48);

      ctx.fillStyle = '#1B3A6B';
      ctx.font      = 'italic 52px Georgia, serif';
      ctx.fillText('Mubarak', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 30);

      // Divider line
      ctx.strokeStyle = '#C8960C';
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.moveTo(CANVAS_SIZE / 2 - 140, CANVAS_SIZE / 2 + 72);
      ctx.lineTo(CANVAS_SIZE / 2 + 140, CANVAS_SIZE / 2 + 72);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.font      = '26px Georgia, Arial, sans-serif';
      ctx.fillText('Fill the form to generate your card', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 112);
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
