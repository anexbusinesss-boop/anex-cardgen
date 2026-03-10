import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken, TOKEN_COOKIE_NAME } from '@/lib/auth';

const protectedPaths = ['/admin/dashboard', '/admin/design'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

    if (isProtected) {
        const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }

        const isValid = await verifyAdminToken(token);
        if (!isValid) {
            const response = NextResponse.redirect(new URL('/admin', request.url));
            response.cookies.delete(TOKEN_COOKIE_NAME);
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/dashboard', '/admin/dashboard/:path*', '/admin/design', '/admin/design/:path*'],
};
