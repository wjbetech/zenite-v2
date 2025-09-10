import type { Metadata } from 'next';
// ClerkProvider temporarily disabled to debug headers() runtime errors
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

  // read cookies at request-time
  const cookieStore = await cookies();
  // DaisyUI theme cookie for SSR
  const daisyThemeCookie = cookieStore.get('zenite.daisy')?.value;
  const ssrDaisyTheme = daisyThemeCookie || 'pastel';
  // read sidebar collapsed cookie so SSR can set an initial sidebar width and avoid layout flicker
  const sidebarCollapsed = cookieStore.get('zenite.sidebarCollapsed')?.value === 'true';
  const initialSidebarWidth = sidebarCollapsed ? '64px' : '208px';

  return (
    <html
      lang="en"
      data-theme={ssrDaisyTheme}
      style={
        {
          ['--nav-height' as string]: '72px',
          ['--sidebar-width' as string]: initialSidebarWidth,
        } as React.CSSProperties
      }
    >
      <head>
        {/* DaisyUI theme is applied via data-theme only */}
        {/* Apply DaisyUI theme from localStorage ASAP if present (overrides cookie) */}
        <Script id="daisy-theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('zenite.daisy');if(t){document.documentElement.setAttribute('data-theme', t);}}catch(e){}})()`}
        </Script>
      </head>

      <body className={`font-vend bg-base-100 text-base-content`}>
        <Providers>
          <Navbar />
          {/* spacer for fixed navbar height (kept for layout), use CSS var '--nav-height' for precise centering */}
          <div style={{ height: 72 }} />
          <div className="flex">
            <Sidebar isLoggedIn={isLoggedIn} />
            {/* spacer so fixed-position sidebar doesn't overlap the flex content */}
            <div style={{ width: 'var(--sidebar-width)', minWidth: 'var(--sidebar-width)' }} />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
