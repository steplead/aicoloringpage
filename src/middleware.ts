// import createMiddleware from 'next-intl/middleware';
// import { routing } from './i18n/routing';

// const intlMiddleware = createMiddleware(routing);

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Manual 'as-needed' routing logic for Cloudflare Edge compatibility
    const locales = ['en', 'es', 'pt', 'fr'];
    const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
    const isLocalized = localeMatch && locales.includes(localeMatch[1]);

    // If path is not localized (e.g. /blog), redirect to default locale (/en/blog)
    // We use a permanent redirect (308) to help Google consolidate indexing
    if (!isLocalized) {
        const url = new URL(request.url);
        url.pathname = `/en${pathname === '/' ? '' : pathname}`;
        return NextResponse.redirect(url, 308);
    }

    const locale = localeMatch![1];

    // Pass the request through with the locale header for server-side detection
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-NEXT-INTL-LOCALE', locale);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders
        }
    });

    // Security Headers
    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');

    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Enable XSS protection (legacy browsers)
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Referrer policy for privacy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions policy (restrict features)
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Content Security Policy (basic, allow inline scripts for Next.js)
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google.com *.googleapis.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: *.supabase.co *.unsplash.com https:; font-src 'self' data:; connect-src 'self' *.google.com *.googleapis.com *.supabase.co; frame-ancestors 'self';"
    );

    return response;
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
