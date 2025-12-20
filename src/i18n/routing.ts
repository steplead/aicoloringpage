export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ['en', 'es', 'pt', 'fr'],

    // Used when no locale matches
    defaultLocale: 'en',
    localePrefix: 'as-needed'
});

export const { Link, redirect, usePathname, useRouter } =
    createNavigation(routing);
