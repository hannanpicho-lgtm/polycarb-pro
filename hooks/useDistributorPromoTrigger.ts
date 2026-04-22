'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const MODAL_SHOWN_KEY = 'distributor-promo-shown';
const MODAL_SHOWN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// Routes where the promo should never appear
const SHELL_PREFIXES = ['/admin', '/portal', '/distributor', '/print'];

export function useDistributorPromoTrigger() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownToday, setHasShownToday] = useState(false);

  // Never trigger on internal shell routes
  const isShell = SHELL_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (isShell) return;

    // Check if modal was already shown in the past 24 h
    const lastShown = localStorage.getItem(MODAL_SHOWN_KEY);
    if (lastShown) {
      const lastShownTime = parseInt(lastShown, 10);
      if (Date.now() - lastShownTime < MODAL_SHOWN_EXPIRY_MS) {
        setHasShownToday(true);
        return;
      }
      localStorage.removeItem(MODAL_SHOWN_KEY);
    }

    if (hasShownToday) return;

    const markShown = () => {
      setIsOpen(true);
      localStorage.setItem(MODAL_SHOWN_KEY, Date.now().toString());
    };

    // Trigger 1: Timer — 20 s (less aggressive than 5 s)
    const timerTrigger = setTimeout(markShown, 20000);

    // Trigger 2: Scroll depth — 45 %
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
      if (pct >= 45) {
        markShown();
        document.removeEventListener('scroll', handleScroll);
      }
    };

    // Trigger 3: Exit intent — mouse leaves viewport at top
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        markShown();
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    document.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timerTrigger);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShell, hasShownToday]);

  return {
    isOpen,
    setIsOpen,
    handleOpen: () => setIsOpen(true),
    handleClose: () => setIsOpen(false),
  };
}
