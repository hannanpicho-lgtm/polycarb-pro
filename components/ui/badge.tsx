import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-sm font-bold uppercase tracking-widest text-[10px] px-2.5 py-0.5 transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        outline: 'border border-primary text-primary bg-transparent',
        muted: 'bg-muted text-muted-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        automotive: 'bg-orange-500 text-white',
        construction: 'bg-blue-600 text-white',
        medical: 'bg-emerald-600 text-white',
        electronics: 'bg-violet-600 text-white',
        optical: 'bg-cyan-600 text-white',
        safety: 'bg-red-600 text-white',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
