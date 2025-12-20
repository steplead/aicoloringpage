// import createMiddleware from 'next-intl/middleware';
// import { routing } from './i18n/routing';

// const intlMiddleware = createMiddleware(routing);

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Manual 'as-needed' routing logic for Cloudflare Edge compatibility
    // If the user visits the root '/', rewrite to the default locale '/en'
    // This allows the localized page src/app/[locale]/page.tsx to handle the request
    if (pathname === '/') {
        request.nextUrl.pathname = '/en';
        return NextResponse.rewrite(request.nextUrl);
    }

    // For other localized paths (e.g., /es, /fr), they are already handled by the router
    // matching src/app/[locale]/...

    return NextResponse.next();
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
