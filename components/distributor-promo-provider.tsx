'use client';

import { usePathname } from 'next/navigation';
import { DistributorPromoModal } from '@/components/distributor-promo-modal';
import { useDistributorPromoTrigger } from '@/hooks/useDistributorPromoTrigger';

interface DistributorPromoProviderProps {
  children: React.ReactNode;
}

const SHELL_PREFIXES = ['/admin', '/portal', '/distributor', '/print'];

export function DistributorPromoProvider({ children }: DistributorPromoProviderProps) {
  const pathname = usePathname();
  const { isOpen, handleClose } = useDistributorPromoTrigger();

  const isShell = SHELL_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <>
      {children}
      {!isShell && <DistributorPromoModal isOpen={isOpen} onClose={handleClose} />}
    </>
  );
}
