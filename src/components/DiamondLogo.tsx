import React from 'react';

type Props = React.SVGProps<SVGSVGElement> & { title?: string };

export default function DiamondLogo({ className, title = 'Zenite logo', ...props }: Props) {
  // Keep the component API the same but render a dashboard/grid icon to better
  // represent the app's purpose. Consumers still pass `className` for sizing.
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : 'true'}
      role="img"
      className={className}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {/* Recreate a compact dashboard/grid icon similar to lucide's LayoutDashboard */}
      <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#059669" />
      <rect x="13" y="3" width="8" height="4" rx="1" fill="#34d399" />
      <rect x="13" y="9" width="8" height="12" rx="1" fill="#10b981" />
      <rect x="3" y="13" width="8" height="6" rx="1" fill="#6ee7b7" />
      {/* subtle outline */}
      <rect x="3" y="3" width="18" height="18" fill="none" stroke="#064e3b" strokeWidth="0.4" rx="2" />
    </svg>
  );
}
