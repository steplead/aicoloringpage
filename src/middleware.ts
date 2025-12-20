// import createMiddleware from 'next-intl/middleware';
// import { routing } from './i18n/routing';

// const intlMiddleware = createMiddleware(routing);

import { NextResponse } from 'next/server';

export default function middleware(request: any) {
    // try {
    //     const intlMiddleware = createMiddleware(routing);
    //     return intlMiddleware(request);
    // } catch (error) {
    //     console.error('Middleware Error:', error);
    //     return new Response('Middleware Failed: ' + String(error), { status: 500 });
    // }
    return NextResponse.next();
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
