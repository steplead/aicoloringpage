import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import en from '../../messages/en.json';

type MessageTree = Record<string, unknown>;

function englishFallback(namespace: string | undefined, key: string): string {
  const root = en as MessageTree;
  const bucket = namespace ? root[namespace] : root;
  if (bucket && typeof bucket === 'object' && key in (bucket as MessageTree)) {
    const value = (bucket as MessageTree)[key];
    if (typeof value === 'string') return value;
  }
  return namespace ? `${namespace}.${key}` : key;
}

export default getRequestConfig(async ({ requestLocale }) => {
  // Locale comes from the `[locale]` segment (setRequestLocale during SSG).
  // Do not read headers() here — that opts every page into per-request SSR.
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    onError(error) {
      // Incomplete locale files (PetPage, a few DirectoryPage keys) must not
      // fail static generation. English copy is used instead.
      if (error.code === 'MISSING_MESSAGE') return;
      console.error(error);
    },
    getMessageFallback({ namespace, key }) {
      return englishFallback(namespace, key);
    },
  };
});
