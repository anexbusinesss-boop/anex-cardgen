import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('template') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Only JPG and PNG files are allowed' },
                { status: 400 }
            );
        }

        // Max 10MB
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be under 10MB' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64String = buffer.toString('base64');
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const url = `data:${mimeType};base64,${base64String}`;

        // Deactivate all existing templates
        await prisma.templateImage.updateMany({
            where: { isActive: true },
            data: { isActive: false },
        });

        // Create new active template
        const template = await prisma.templateImage.create({
            data: { url, isActive: true },
        });

        return NextResponse.json({ success: true, url: template.url }, { status: 201 });
    } catch (error) {
        console.error('[/api/admin/upload POST]', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
