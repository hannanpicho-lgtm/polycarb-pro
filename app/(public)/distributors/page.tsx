import type { Metadata } from 'next';
import { DistributorProgramPage } from '@/components/distributor-program-page';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Distributor program',
  description: `Apply to become an authorized ${siteConfig.company.shortName} distributor — tiered pricing, full catalog, and partner support. USD & AUD.`,
  openGraph: {
    title: `Distributor program | ${siteConfig.company.name}`,
    description: 'Join our industrial partner network for engineering-grade polycarbonate distribution.',
  },
};

export default function DistributorsPage() {
  return <DistributorProgramPage />;
}
