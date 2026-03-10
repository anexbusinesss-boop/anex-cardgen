import { NextRequest, NextResponse } from 'next/server';
import { signAdminToken, TOKEN_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { password } = body;

        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        if (!password || password !== adminPassword) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        const token = await signAdminToken();

        const response = NextResponse.json({ success: true });
        response.cookies.set(TOKEN_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 8, // 8 hours
        });

        return response;
    } catch (error) {
        console.error('[/api/admin/login POST]', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
