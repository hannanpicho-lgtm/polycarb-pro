'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import { DistributorPromoBanner } from '@/components/distributor-promo-banner';
import { DistributorSignupFormComponent } from '@/components/distributor-signup-form';
import Confetti from 'react-confetti';

interface DistributorPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalState = 'form' | 'success' | 'error';

export function DistributorPromoModal({ isOpen, onClose }: DistributorPromoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [modalState, setModalState] = useState<ModalState>('form');
  const [errorMessage, setErrorMessage] = useState('');
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Handle window size for confetti
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
  }, []);

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

  const handleFormSuccess = () => {
    setModalState('success');
    // Auto-close after 5 seconds
    setTimeout(() => {
      onClose();
      setModalState('form');
    }, 5000);
  };

  const handleFormError = (error: string) => {
    setErrorMessage(error);
    setModalState('error');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
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
            aria-labelledby="distributor-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl pointer-events-auto">
              {/* Close Button */}
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Close distributor modal"
              >
                <X className="h-6 w-6 text-slate-600" />
              </button>

              {/* Content */}
              {modalState === 'form' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Banner */}
                  <DistributorPromoBanner />

                  {/* Form Section */}
                  <div className="px-6 py-10 sm:px-8 sm:py-12">
                    <div className="mb-8">
                      <h3
                        id="distributor-title"
                        className="text-2xl sm:text-3xl font-black text-slate-900 mb-2"
                      >
                        Apply Now
                      </h3>
                      <p className="text-slate-600">
                        Complete your application to join Covestro's distributor network. Our team
                        will review and contact you within 24 hours.
                      </p>
                    </div>
                    <DistributorSignupFormComponent
                      onSuccess={handleFormSuccess}
                      onError={handleFormError}
                    />
                  </div>
                </motion.div>
              )}

              {/* Success State */}
              {modalState === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center min-h-[500px] px-6 py-12 sm:px-8"
                >
                  {/* Confetti */}
                  {windowSize.width > 0 && (
                    <Confetti
                      width={windowSize.width}
                      height={windowSize.height}
                      recycle={false}
                      numberOfPieces={150}
                    />
                  )}

                  {/* Success Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 100 }}
                    className="mb-6"
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                      <CheckCircle className="h-12 w-12 text-emerald-600" />
                    </div>
                  </motion.div>

                  {/* Success Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="text-center"
                  >
                    <h2 className="mb-2 text-3xl font-bold text-slate-900">
                      Welcome to the Covestro Network!
                    </h2>
                    <p className="mb-4 text-lg text-slate-600">
                      Your distributor application has been received.
                    </p>
                    <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
                      <p className="text-sm font-semibold text-blue-900">
                        ✓ A Covestro representative will contact you within 24 hours to discuss
                        partnership opportunities.
                      </p>
                    </div>
                    <p className="mt-6 text-sm text-slate-500">
                      In the meantime, explore our{' '}
                      <Link
                        href="/products"
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        complete product portfolio
                      </Link>
                      .
                    </p>
                  </motion.div>
                </motion.div>
              )}

              {/* Error State */}
              {modalState === 'error' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-6 py-10 sm:px-8 sm:py-12"
                >
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 mb-6">
                    <p className="text-sm font-semibold text-red-900">
                      ⚠ {errorMessage || 'An error occurred. Please try again.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setModalState('form')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                  >
                    Back to Form
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
