'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <AlertCircle className="h-14 w-14 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h2>
        <p className="text-muted-foreground text-sm mb-6">
          {error.message ?? 'We could not load the product catalogue. Please try again.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="outline">Try again</Button>
          <Button asChild className="bg-brand-500 hover:bg-brand-600 text-white">
            <Link href="/contact?source=products-error">Contact support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
