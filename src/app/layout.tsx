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
  const htmlClass = themeCookie === 'dark' ? 'dark' : '';

  return (
    <ClerkProvider>
      <html lang="en" className={htmlClass}>
        <head>
          {/* Run before React hydration to apply the saved theme immediately */}
          <Script id="theme-init" strategy="beforeInteractive">
            {`(function(){try{var t=localStorage.getItem('zenite.theme');if(t==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark')}catch(e){} })()`}
          </Script>
        </head>

        <body
          className={`font-vend bg-white text-slate-900 dark:bg-gray-900 dark:text-white`}
          style={{ ['--nav-height' as string]: '72px' } as React.CSSProperties}
        >
          <Providers>
            <Navbar />
            {/* spacer for fixed navbar height (kept for layout), use CSS var '--nav-height' for precise centering */}
            <div style={{ height: 72 }} />
            <div className="flex">
              <Sidebar isLoggedIn={isLoggedIn} />
              <main className="flex-1 p-6">{children}</main>
            </div>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
