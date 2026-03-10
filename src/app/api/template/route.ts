import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest) {
    try {
        const active = await prisma.templateImage.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });

        if (!active) {
            return NextResponse.json({ url: null }, { status: 200 });
        }

        return NextResponse.json({ url: active.url }, { status: 200 });
    } catch (error) {
        console.error('[/api/template GET]', error);
        return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
    }
}
