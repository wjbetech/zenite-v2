import type { Metadata } from 'next';
// ClerkProvider temporarily disabled to debug headers() runtime errors
import 'react-toastify/dist/ReactToastify.css';
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

  // DEV-only: log SSR-derived values to help debug serialization problems
  if (process.env.NODE_ENV !== 'production') {
    try {
      // stringify defensively so any non-plain values are visible without throwing

      console.debug('[SSR Debug] ssrDaisyTheme=', JSON.stringify(ssrDaisyTheme));

      console.debug('[SSR Debug] sidebarCollapsed=', JSON.stringify(sidebarCollapsed));

      console.debug('[SSR Debug] initialSidebarWidth=', JSON.stringify(initialSidebarWidth));
    } catch (e) {
      console.warn('[SSR Debug] failed to stringify SSR values', e);
    }
  }

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
        <Script id="daisy-theme-init" strategy="beforeInteractive">
          {`(function(){
  try {
    var docEl = document.documentElement;
    // ensure Tailwind dark mode class cannot affect DaisyUI
    docEl.classList.remove('dark');

    var allowed = new Set(['pastel','cupcake','nord','business','dim']);
    var key = 'zenite.daisy';

    function readTheme(){
      var t = '';
      // cookie first
      try {
        var cookie = document.cookie || '';
        var match = cookie.split(';').map(function(s){return s.trim();}).find(function(s){return s.indexOf(key + '=')===0;});
        if (match) t = decodeURIComponent(match.split('=')[1] || '');
      } catch(e){}
      // then localStorage
      if (!t) {
        try { t = (localStorage.getItem(key) || '').trim(); } catch(e){}
      }
      t = (t || '').toLowerCase();
      if (t === 'dark' || !allowed.has(t)) t = 'cupcake';
      return t;
    }

    var current = readTheme();
    docEl.setAttribute('data-theme', current);

    // Guard against any code flipping data-theme back to 'dark' or an invalid value
    try {
      var mo = new MutationObserver(function(muts){
        for (var i=0;i<muts.length;i++) {
          var m = muts[i];
          if (m.type === 'attributes' && m.attributeName === 'data-theme') {
            var val = (docEl.getAttribute('data-theme') || '').toLowerCase();
            if (val === 'dark' || !allowed.has(val)) {
              docEl.setAttribute('data-theme', current);
            }
          }
        }
      });
      mo.observe(docEl, { attributes: true, attributeFilter: ['data-theme'] });
    } catch(e){}
  } catch (e) {}
})()`}
        </Script>
      </head>

      <body className={`font-vend text-base-content`}>
        <Providers>
          <Navbar />
          {/* Navbar now overlays content. Do not apply top padding so pages sit underneath the absolute navbar. */}
          <div className="flex h-screen">
            <Sidebar isLoggedIn={isLoggedIn} />
            <main className="flex-1 h-full flex flex-col min-h-0">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
