import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import en from '../../messages/en.json';
import es from '../../messages/es.json';
import pt from '../../messages/pt.json';
import fr from '../../messages/fr.json';

const messagesSource = {
  en,
  es,
  pt,
  fr
};

export default getRequestConfig(async ({ requestLocale }) => {
  // Try to get locale from the custom header injected by our middleware first
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
    messages: messagesSource[locale as keyof typeof messagesSource]
  };
});
