import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendar - Zenite',
};

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  // This layout delegates most styling to the child Page and the root layout.
  return <>{children}</>;
}
