import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export default getRequestConfig(async ({ requestLocale }) => {
  // Try to get locale from the custom header injected by our middleware first
  // This is crucial for Edge compatibility since we bypassed the standard next-intl middleware
  // Try to get locale from the custom header or Referer
  const headerList = await headers();
  const localeHeader = headerList.get('X-NEXT-INTL-LOCALE');
  const referer = headerList.get('referer');

  let locale = localeHeader || await requestLocale;

  // Fallback: Try to extract from Referer URL if everything else fails
  if (!locale && referer) {
    try {
      const url = new URL(referer);
      const match = url.pathname.match(/^\/([a-z]{2})(\/|$)/);
      if (match) {
        locale = match[1];
      }
    } catch (e) {
      // Ignore invalid URL errors
    }
  }

  // Ensure that a valid locale is used
  if (!locale || !['en', 'es', 'pt', 'fr'].includes(locale)) {
    locale = 'en';
  }

  return {
    locale,
    messages: await (async () => {
      try {
        return (await import(`../../messages/${locale}.json`)).default;
      } catch (error) {
        console.error(`Error loading messages for locale ${locale}:`, error);
        return {};
      }
    })()
  };
});
