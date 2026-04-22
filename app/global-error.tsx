'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-red-600 via-red-700 to-red-900">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-2xl">
            {/* Large Error Icon */}
            <div className="mb-8">
              <AlertTriangle className="h-32 w-32 text-red-200 mx-auto" />
            </div>

            {/* Content */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-xl text-red-100 mb-8 leading-relaxed">
              An unexpected error occurred while processing your request. Our team has been notified. Please try again, or contact us if the issue persists.
            </p>

            {/* Action Buttons */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8">
              <div className="grid md:grid-cols-3 gap-4">
                <Button
                  onClick={reset}
                  size="lg"
                  className="bg-white text-red-600 hover:bg-red-50 font-bold"
                >
                  Try Again
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="bg-red-500 text-white hover:bg-red-600 font-bold"
                >
                  <Link href="/">Return Home</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="bg-red-500 text-white hover:bg-red-600 font-bold"
                >
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 text-red-100">
              <p className="text-sm">
                Error Reference ID: {Math.random().toString(36).substring(2, 11).toUpperCase()}
              </p>
              <p className="text-sm mt-2">
                If this continues, please reach out to{' '}
                <a
                  href="mailto:support@covestroppc.com"
                  className="text-white underline hover:text-red-50"
                >
                  support@covestroppc.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
