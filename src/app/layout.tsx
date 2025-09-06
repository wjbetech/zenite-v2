import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
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
  // we no longer track a binary light/dark state. persist only the daisy theme.
  const daisyCookie = cookieStore.get('zenite.daisy')?.value;
  const htmlClass = '';
  const dataTheme = daisyCookie ?? 'pastel';

  return (
    <ClerkProvider>
      <html lang="en" className={htmlClass} data-theme={dataTheme}>
        <head></head>

        <body
          className={`font-vend bg-base-100 text-base-content`}
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
