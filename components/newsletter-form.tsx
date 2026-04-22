'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { track } from '@vercel/analytics';
import { subscribeNewsletter } from '@/lib/actions';
import type { ActionResult } from '@/lib/actions';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FormHoneypot } from '@/components/form-honeypot';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 px-5 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap flex-shrink-0"
      aria-label={pending ? 'Subscribing…' : 'Subscribe to newsletter'}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>Subscribe <ArrowRight className="h-4 w-4" /></>
      )}
    </button>
  );
}

export function NewsletterForm() {
  const [state, formAction] = useActionState<ActionResult<{ submissionId?: string; webhookDelivered: boolean }> | null, FormData>(subscribeNewsletter, null);

  React.useEffect(() => {
    if (!state) return;

    track('newsletter_subscribe', {
      success: state.success ? 'true' : 'false',
      submissionId: state.success ? (state.data?.submissionId ?? '') : '',
      webhookDelivered: state.success ? (state.data?.webhookDelivered ? 'true' : 'false') : 'false',
    });
  }, [state]);

  if (state?.success) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-400">
        <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
        <div className="flex flex-col">
          <span>{state.message}</span>
          {state.data?.submissionId ? <span className="text-[10px] text-white/40 font-mono">Ref: {state.data.submissionId}</span> : null}
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate>
      <FormHoneypot />

      <div className="flex gap-2">
        <Input
          type="email"
          name="email"
          placeholder="your@company.com"
          required
          aria-label="Email address"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-brand-400"
        />
        <SubmitButton />
      </div>
      {state?.message && !state.success && (
        <p className="text-xs text-red-400 mt-2">{state.message}</p>
      )}
      <p className="text-xs text-white/30 mt-2">No spam. Unsubscribe anytime.</p>
    </form>
  );
}
