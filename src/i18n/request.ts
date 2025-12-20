import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

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
