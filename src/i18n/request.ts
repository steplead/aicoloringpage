```typescript
import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export default getRequestConfig(async ({ requestLocale }) => {
  // Hardcoded fallback to 'en' to diagnose Edge compatibility
  // This bypasses header/referer checks to verify if context detection is the root cause
  const locale = 'en';

  return {
    locale,
    messages: await (async () => {
      try {
        return (await import(`../../ messages / ${ locale }.json`)).default;
      } catch (error) {
        console.error(`Error loading messages for locale ${ locale }: `, error);
        return {};
      }
    })()
  };
});
