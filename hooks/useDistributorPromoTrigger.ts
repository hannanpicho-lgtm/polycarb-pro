'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  distributorPromoCheckSession,
  distributorPromoIsPermanentlyBlocked,
  distributorPromoIsInQuietPeriod,
  distributorPromoMarkQuietForDays,
  migrateLegacyDistributorPromoStorage,
} from '@/lib/distributor-promo';

// Routes where the promo should never appear
const SHELL_PREFIXES = ['/admin', '/portal', '/distributor', '/print'];
// Dedicated application page — no popup over the full form
const NO_MODAL_PATHS = ['/distributors'];

// Single soft trigger: delay after page load (no exit-intent, no scroll spam)
const AUTO_OPEN_DELAY_MS = 90_000;

export function useDistributorPromoTrigger() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const hasOpenedThisMount = useRef(false);

  const isShell = SHELL_PREFIXES.some((p) => pathname.startsWith(p));
  const isNoModalRoute = NO_MODAL_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const tryOpen = useCallback(async () => {
    if (hasOpenedThisMount.current) return;
    if (typeof window === 'undefined') return;
    await distributorPromoCheckSession();
    if (distributorPromoIsPermanentlyBlocked() || distributorPromoIsInQuietPeriod()) return;

    hasOpenedThisMount.current = true;
    setIsOpen(true);
    // Do not show again (even on new tab) until snooze elapses
    distributorPromoMarkQuietForDays();
  }, []);

  // Legacy key migration + session: logged-in distributors never see the modal
  useEffect(() => {
    if (isShell || isNoModalRoute) return;
    migrateLegacyDistributorPromoStorage();
    void distributorPromoCheckSession();
  }, [isShell, isNoModalRoute]);

  // Single timer-based trigger (no scroll / exit-intent)
  useEffect(() => {
    if (isShell || isNoModalRoute) return;
    if (typeof window === 'undefined') return;
    migrateLegacyDistributorPromoStorage();
    if (distributorPromoIsPermanentlyBlocked() || distributorPromoIsInQuietPeriod()) return;

    const t = setTimeout(() => {
      void tryOpen();
    }, AUTO_OPEN_DELAY_MS);
    return () => clearTimeout(t);
  }, [isShell, isNoModalRoute, pathname, tryOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    // Dismissal extends quiet period (harmless if already set at open)
    distributorPromoMarkQuietForDays();
  }, []);

  /** Close without extending snooze (e.g. navigated to /distributors full-page form). */
  const closeModalOnly = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    setIsOpen,
    handleOpen: () => {
      if (distributorPromoIsPermanentlyBlocked() || distributorPromoIsInQuietPeriod()) return;
      void tryOpen();
    },
    handleClose,
    closeModalOnly,
  };
}
