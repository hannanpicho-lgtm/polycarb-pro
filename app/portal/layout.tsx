import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Portal — Covestro Polycarbonates',
  description: 'View your orders, quotes and account details',
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
