'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { DistributorPromoModal } from '@/components/distributor-promo-modal';
import { useDistributorPromoTrigger } from '@/hooks/useDistributorPromoTrigger';

interface DistributorPromoProviderProps {
  children: React.ReactNode;
}

const SHELL_PREFIXES = ['/admin', '/portal', '/distributor', '/print'];
const NO_MODAL = ['/distributors'];

export function DistributorPromoProvider({ children }: DistributorPromoProviderProps) {
  const pathname = usePathname();
  const { isOpen, handleClose, closeModalOnly } = useDistributorPromoTrigger();

  const isShell = SHELL_PREFIXES.some((p) => pathname.startsWith(p));
  const onDedicatedApplyPage = NO_MODAL.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const shouldShow = isOpen && !onDedicatedApplyPage;

  useEffect(() => {
    if (onDedicatedApplyPage && isOpen) {
      closeModalOnly();
    }
  }, [onDedicatedApplyPage, isOpen, closeModalOnly]);

  return (
    <>
      {children}
      {!isShell && <DistributorPromoModal isOpen={shouldShow} onClose={handleClose} />}
    </>
  );
}
