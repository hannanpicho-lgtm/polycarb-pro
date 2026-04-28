'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export interface ProductPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    image?: string;
    category: 'sheets' | 'rods' | 'resins' | 'specialty';
    promoText: string;
    benefits: string[];
    testimonial?: string;
    ctaText?: string;
    ctaLink?: string;
  };
}

const categoryColors: Record<string, { badge: string; border: string; bg: string }> = {
  sheets: { badge: 'bg-blue-100 text-blue-900', border: 'border-blue-300', bg: 'bg-blue-50' },
  rods: { badge: 'bg-slate-100 text-slate-900', border: 'border-slate-300', bg: 'bg-slate-50' },
  resins: {
    badge: 'bg-purple-100 text-purple-900',
    border: 'border-purple-300',
    bg: 'bg-purple-50',
  },
  specialty: {
    badge: 'bg-orange-100 text-orange-900',
    border: 'border-orange-300',
    bg: 'bg-orange-50',
  },
};

function getCategoryColors(category: string): { badge: string; border: string; bg: string } {
  return (categoryColors[category] ?? categoryColors['sheets'])!;
}

export function ProductPromoModal({ isOpen, onClose, product }: ProductPromoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const colors = getCategoryColors(product.category);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      // Focus close button for accessibility
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="promo-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
              {/* Close Button */}
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                aria-label="Close promotional modal"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>

              {/* Content */}
              <div className="p-8 sm:p-10">
                {/* Promo Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${colors.badge}`}
                  >
                    Limited Time Offer
                  </span>
                </div>

                {/* Headline */}
                <h2
                  id="promo-title"
                  className="text-4xl sm:text-5xl font-display font-bold mb-2 text-gray-900"
                >
                  {product.name}
                </h2>

                {/* Promo Text */}
                <div
                  className={`inline-block px-4 py-2 rounded-lg ${colors.bg} border ${colors.border} mb-6`}
                >
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{product.promoText}</p>
                </div>

                {/* Product Image */}
                {product.image && (
                  <div className="mb-8 rounded-xl overflow-hidden bg-gray-100 h-64 sm:h-80 relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, 600px"
                    />
                  </div>
                )}

                {/* Benefits Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-brand-500" />
                    Key Benefits
                  </h3>
                  <ul className="space-y-3">
                    {product.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex gap-3 items-start">
                        <span
                          className={`flex-shrink-0 w-5 h-5 rounded-full ${colors.badge} flex items-center justify-center text-xs font-bold mt-0.5`}
                        >
                          ✓
                        </span>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Testimonial */}
                {product.testimonial && (
                  <div className={`mb-8 p-6 rounded-xl ${colors.bg} border ${colors.border}`}>
                    <p className="text-gray-700 italic text-center">"{product.testimonial}"</p>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {product.ctaLink ? (
                    <Button asChild size="lg" className="flex-1">
                      <Link href={product.ctaLink}>{product.ctaText || 'View Product'}</Link>
                    </Button>
                  ) : (
                    <Button size="lg" className="flex-1">
                      {product.ctaText || 'Learn More'}
                    </Button>
                  )}
                  <Button variant="outline" size="lg" onClick={onClose} className="flex-1">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
