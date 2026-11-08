import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google'
import { Footer } from '@/components/Footer'
import { InstallPrompt } from '@/components/InstallPrompt'
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  return {
    title: "AI Coloring Page | Free Printable Coloring Pages Generator",
    description: "Turn your ideas and photos into high-quality, printable coloring pages instantly with AI.",
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "AI Coloring",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
          <Footer />
          <InstallPrompt />
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || 'G-MKSF7CEXN3'} />
          <script
            dangerouslySetInnerHTML={{
              __html: `document.addEventListener('click',function(e){var a=e.target&&e.target.closest?e.target.closest('a'):null;if(!a||!a.href||a.hasAttribute('download'))return;if(a.target&&a.target!=='_self')return;if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button)return;var u;try{u=new URL(a.href,location.href)}catch(err){return}if(u.origin!==location.origin)return;if(u.pathname===location.pathname&&u.search===location.search)return;e.preventDefault();location.href=u.href},true);`,
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
