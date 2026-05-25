import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken, TOKEN_COOKIE_NAME } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';

export async function POST(req: NextRequest) {
    // Auth check — same guard the middleware uses for pages
    const token = req.cookies.get(TOKEN_COOKIE_NAME)?.value;
    if (!token || !(await verifyAdminToken(token))) {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('template') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Only JPG and PNG files are allowed' }, { status: 400 });
        }

        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be under 10 MB' }, { status: 400 });
        }

        const ext      = file.type === 'image/png' ? 'png' : 'jpg';
        const filename = `template_${Date.now()}.${ext}`;

        let url: string;

        if (process.env.BLOB_READ_WRITE_TOKEN) {
            // Production: Vercel Blob storage
            const { put } = await import('@vercel/blob');
            const blob = await put(filename, file, { access: 'public' });
            url = blob.url;
        } else {
            // Development / no-Blob fallback: save to public/uploads/
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');
            await fs.mkdir(uploadDir, { recursive: true });
            const buffer = Buffer.from(await file.arrayBuffer());
            await fs.writeFile(path.join(uploadDir, filename), buffer);
            url = `/uploads/${filename}`;
        }

        // Deactivate previous templates
        await prisma.templateImage.updateMany({
            where: { isActive: true },
            data:  { isActive: false },
        });

        // Save new active template
        const template = await prisma.templateImage.create({
            data: { url, isActive: true },
        });

        return NextResponse.json({ success: true, url: template.url }, { status: 201 });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[/api/admin/upload]', message);
        return NextResponse.json({ error: 'Upload failed', details: message }, { status: 500 });
    }
}
