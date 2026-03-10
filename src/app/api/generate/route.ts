import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function sanitize(str: string): string {
    return str.replace(/[<>"'`]/g, '').trim();
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, designation, phone } = body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        if (!designation || typeof designation !== 'string' || designation.trim().length === 0) {
            return NextResponse.json({ error: 'Designation is required' }, { status: 400 });
        }
        if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
            return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
        }

        const entry = await prisma.cardEntry.create({
            data: {
                name: sanitize(name),
                designation: sanitize(designation),
                phone: sanitize(phone),
            },
        });

        return NextResponse.json({ success: true, id: entry.id }, { status: 201 });
    } catch (error) {
        console.error('[/api/generate POST]', error);
        return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 });
    }
}
