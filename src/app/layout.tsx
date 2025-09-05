import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import Script from 'next/script';
import { Navbar, Sidebar } from '../components';
import Providers from '../components/Providers';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Zenite',
  description: 'A zenful productivity app.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // TODO: replace with real auth logic
  const isLoggedIn = false;

  // read cookie at request-time so server-rendered HTML can include the right theme class
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('zenite.theme')?.value;
  const daisyCookie = cookieStore.get('zenite.daisy')?.value;
  const htmlClass = themeCookie === 'dark' ? 'dark' : '';
  const dataTheme = daisyCookie ?? 'cupcake';

  return (
    <ClerkProvider>
      <html lang="en" className={htmlClass} data-theme={dataTheme}>
        <head>
          {/* Link built Tailwind/DaisyUI CSS as a fallback so dev server or Turbopack quirks won't hide styles */}
          <link rel="stylesheet" href="/tailwind.css" />
          {/* Run before React hydration to apply the saved theme immediately */}
          <Script id="theme-init" strategy="beforeInteractive">
            {`(function(){try{var t=localStorage.getItem('zenite.theme');if(t==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark')}catch(e){} })()`}
          </Script>
        </head>

        <body
          className={`font-vend bg-base-100 text-base-content dark:bg-base-200 dark:text-base-content`}
          style={{ ['--nav-height' as string]: '72px' } as React.CSSProperties}
        >
          <Providers>
            <Navbar />
            {/* spacer for fixed navbar height (kept for layout), use CSS var '--nav-height' for precise centering */}
            <div style={{ height: 72 }} />
            <div className="flex">
              <Sidebar isLoggedIn={isLoggedIn} />
              {/* reserve space for fixed sidebar on md+;  w-52 is the default sidebar width */}
              <main className="flex-1 p-6 md:pl-52">{children}</main>
            </div>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
