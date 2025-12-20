import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export default getRequestConfig(async ({ requestLocale }) => {
  // Try to get locale from the custom header injected by our middleware first
  // This is crucial for Edge compatibility since we bypassed the standard next-intl middleware
  const localeHeader = (await headers()).get('X-NEXT-INTL-LOCALE');
  let locale = localeHeader || await requestLocale;

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
