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
        const url = request.nextUrl.clone();
        url.pathname = `/en${pathname === '/' ? '' : pathname}`;
        return NextResponse.redirect(url, 308);
    }

    const locale = localeMatch![1];

    // Pass the request through with the locale header for server-side detection
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-NEXT-INTL-LOCALE', locale);

    return NextResponse.next({
        request: {
            headers: requestHeaders
        }
    });
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
