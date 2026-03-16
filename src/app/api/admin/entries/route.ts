import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
        const search = searchParams.get('search')?.trim() || '';

        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { phone: { contains: search, mode: 'insensitive' as const } },
                    { designation: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        const [entries, total] = await Promise.all([
            prisma.cardEntry.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.cardEntry.count({ where }),
        ]);

        return NextResponse.json({
            entries,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('[/api/admin/entries GET]', error);
        return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }
}
