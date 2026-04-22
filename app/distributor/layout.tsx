import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Distributor Portal — Covestro Polycarbonates',
  description: 'Partner access: pricing, catalog and order management',
  robots: { index: false, follow: false },
};

export default function DistributorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
