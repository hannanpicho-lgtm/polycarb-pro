'use client';

import { DistributorPromoModal } from '@/components/distributor-promo-modal';
import { useDistributorPromoTrigger } from '@/hooks/useDistributorPromoTrigger';

interface DistributorPromoProviderProps {
  children: React.ReactNode;
}

export function DistributorPromoProvider({ children }: DistributorPromoProviderProps) {
  const { isOpen, handleClose } = useDistributorPromoTrigger();

  return (
    <>
      {children}
      <DistributorPromoModal isOpen={isOpen} onClose={handleClose} />
    </>
  );
}
