import type { Metadata } from 'next';
// ClerkProvider temporarily disabled to debug headers() runtime errors
import './globals.css';
// import Script from 'next/script';
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
  // DaisyUI theme cookie for SSR (sanitize to known themes)
  const allowedThemes = new Set(['pastel', 'cupcake', 'nord', 'business', 'dim']);
  const cookieThemeRaw = cookieStore.get('zenite.daisy')?.value;
  const normalizedCookie = (cookieThemeRaw || '').trim().toLowerCase();
  const ssrDaisyTheme =
    normalizedCookie && normalizedCookie !== 'cupcake' && allowedThemes.has(normalizedCookie)
      ? normalizedCookie
      : 'cupcake';
  // read sidebar collapsed cookie so SSR can set an initial sidebar width and avoid layout flicker
  const sidebarCollapsed = cookieStore.get('zenite.sidebarCollapsed')?.value === 'true';
  const initialSidebarWidth = sidebarCollapsed ? '64px' : '208px';

  return (
    <html
      lang="en"
      data-theme={ssrDaisyTheme}
      suppressHydrationWarning
      style={
        {
          ['--nav-height' as string]: '72px',
          ['--sidebar-width' as string]: initialSidebarWidth,
        } as React.CSSProperties
      }
    >
      <head>
        {/* DaisyUI theme is applied via data-theme only */}
        {/* Apply DaisyUI theme ASAP. Prefer cookie, then localStorage. */}
        {/* <Script id="daisy-theme-init" strategy="beforeInteractive">
          {`(function(){
  try {
    // ensure Tailwind dark mode class cannot affect DaisyUI
    document.documentElement.classList.remove('dark');

    var allowed = new Set(['pastel','cupcake','nord','business','dim']);
    var key = 'zenite.daisy';
    var t = '';

    // 1) cookie takes precedence
    try {
      var cookie = document.cookie || '';
      var match = cookie.split(';').map(function(s){return s.trim();}).find(function(s){return s.indexOf(key + '=')===0;});
      if (match) {
        t = decodeURIComponent(match.split('=')[1] || '');
      }
    } catch (e) {}

    // 2) fallback to localStorage
    if (!t) {
      try { t = (localStorage.getItem(key) || '').trim(); } catch(e) {}
    }

    t = (t || '').toLowerCase();
    if (t === 'dark' || !allowed.has(t)) { t = 'cupcake'; }

    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})()`}
        </Script> */}
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
