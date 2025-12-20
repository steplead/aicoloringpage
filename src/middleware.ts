import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
    // Match only internationalized pathnames
    matcher: [
        // Match all pathnames except for
        // - API routes
        // - _next (static files, etc.)
        // - _vercel
        // - all files with an extension (e.g. favicon.ico, logo.png)
        '/((?!api|_next|_vercel|.*\\..*).*)',
        // Specifically allow localized routes even if they have query params like ?_rsc
        '/(en|es|pt|fr)/:path*'
    ]
};
