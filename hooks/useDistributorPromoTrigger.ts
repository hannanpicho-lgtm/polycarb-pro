'use client';

import { useEffect, useState } from 'react';

const MODAL_SHOWN_KEY = 'distributor-promo-shown';
const MODAL_SHOWN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useDistributorPromoTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownToday, setHasShownToday] = useState(false);

  useEffect(() => {
    // Check if modal was already shown today
    const lastShown = localStorage.getItem(MODAL_SHOWN_KEY);
    if (lastShown) {
      const lastShownTime = parseInt(lastShown, 10);
      const now = Date.now();
      if (now - lastShownTime < MODAL_SHOWN_EXPIRY_MS) {
        setHasShownToday(true);
        return;
      }
      // Clear expired flag
      localStorage.removeItem(MODAL_SHOWN_KEY);
    }

    // Trigger 1: Timer (5 seconds)
    const timerTrigger = setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem(MODAL_SHOWN_KEY, Date.now().toString());
    }, 5000);

    // Trigger 2: Scroll depth (40%)
    const handleScroll = () => {
      if (isOpen || hasShownToday) return;

      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const scrollPercent = scrollHeight > 0 ? (scrolled / scrollHeight) * 100 : 0;

      if (scrollPercent >= 40) {
        setIsOpen(true);
        localStorage.setItem(MODAL_SHOWN_KEY, Date.now().toString());
        document.removeEventListener('scroll', handleScroll);
      }
    };

    // Trigger 3: Exit intent (mouse leaving viewport at top)
    const handleMouseLeave = (e: MouseEvent) => {
      if (isOpen || hasShownToday) return;
      
      if (e.clientY <= 0) {
        setIsOpen(true);
        localStorage.setItem(MODAL_SHOWN_KEY, Date.now().toString());
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    if (!hasShownToday) {
      document.addEventListener('scroll', handleScroll);
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      clearTimeout(timerTrigger);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isOpen, hasShownToday]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  return {
    isOpen,
    setIsOpen,
    handleOpen,
    handleClose,
  };
}
