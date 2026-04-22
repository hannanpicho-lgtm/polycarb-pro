'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { track } from '@vercel/analytics';
import { submitQuoteRequest } from '@/lib/actions';
import type { ActionResult } from '@/lib/actions';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FormHoneypot } from '@/components/form-honeypot';

type FormErrors = Record<string, string[]>;
type FormState = ActionResult<{ submissionId?: string; webhookDelivered: boolean }> | null;

interface QuoteRequestFormProps {
  initialProduct?: string;
  initialMessage?: string;
  hiddenContext?: {
    leadSource?: string;
    compareSlugs?: string;
    compareNames?: string;
    compareOnlyDiff?: string;
    sourcePath?: string;
    landingPath?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    gclid?: string;
    msclkid?: string;
    fbclid?: string;
  };
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      size="lg"
      className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold"
    >
      {pending ? (
        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…</>
      ) : (
        <><Send className="h-4 w-4 mr-2" /> Submit Quote Request</>
      )}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-destructive text-xs mt-1">{errors[0]}</p>;
}

export function QuoteRequestForm({ initialProduct = '', initialMessage = '', hiddenContext }: QuoteRequestFormProps) {
  const [state, formAction] = useActionState<FormState, FormData>(submitQuoteRequest, null);

  React.useEffect(() => {
    if (!state) return;

    track('quote_form_submit', {
      success: state.success ? 'true' : 'false',
      submissionId: state.success ? (state.data?.submissionId ?? '') : '',
      webhookDelivered: state.success ? (state.data?.webhookDelivered ? 'true' : 'false') : 'false',
    });
  }, [state]);

  if (state?.success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-500" />
        <h3 className="font-bold text-xl text-foreground">Quote Request Sent!</h3>
        <p className="text-muted-foreground text-sm max-w-md">{state.message}</p>
        {state.data?.submissionId ? (
          <p className="text-[11px] text-muted-foreground/80 font-mono">Ref: {state.data.submissionId}</p>
        ) : null}
      </div>
    );
  }

  const errors = (state?.errors ?? {}) as FormErrors;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormHoneypot />
      {hiddenContext?.leadSource ? <input type="hidden" name="leadSource" value={hiddenContext.leadSource} /> : null}
      {hiddenContext?.compareSlugs ? <input type="hidden" name="compareSlugs" value={hiddenContext.compareSlugs} /> : null}
      {hiddenContext?.compareNames ? <input type="hidden" name="compareNames" value={hiddenContext.compareNames} /> : null}
      {hiddenContext?.compareOnlyDiff ? <input type="hidden" name="compareOnlyDiff" value={hiddenContext.compareOnlyDiff} /> : null}
      {hiddenContext?.sourcePath ? <input type="hidden" name="sourcePath" value={hiddenContext.sourcePath} /> : null}
      {hiddenContext?.landingPath ? <input type="hidden" name="landingPath" value={hiddenContext.landingPath} /> : null}
      {hiddenContext?.utmSource ? <input type="hidden" name="utmSource" value={hiddenContext.utmSource} /> : null}
      {hiddenContext?.utmMedium ? <input type="hidden" name="utmMedium" value={hiddenContext.utmMedium} /> : null}
      {hiddenContext?.utmCampaign ? <input type="hidden" name="utmCampaign" value={hiddenContext.utmCampaign} /> : null}
      {hiddenContext?.gclid ? <input type="hidden" name="gclid" value={hiddenContext.gclid} /> : null}
      {hiddenContext?.msclkid ? <input type="hidden" name="msclkid" value={hiddenContext.msclkid} /> : null}
      {hiddenContext?.fbclid ? <input type="hidden" name="fbclid" value={hiddenContext.fbclid} /> : null}

      {state?.message && !state.success ? (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded px-4 py-3">
          {state.message}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input id="firstName" name="firstName" autoComplete="given-name" className="mt-1.5" required />
          <FieldError errors={errors['firstName']} />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input id="lastName" name="lastName" autoComplete="family-name" className="mt-1.5" required />
          <FieldError errors={errors['lastName']} />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Business Email *</Label>
        <Input id="email" name="email" type="email" autoComplete="email" className="mt-1.5" required />
        <FieldError errors={errors['email']} />
      </div>

      <div>
        <Label htmlFor="company">Company *</Label>
        <Input id="company" name="company" autoComplete="organization" className="mt-1.5" required />
        <FieldError errors={errors['company']} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="product">Product(s) Of Interest *</Label>
          <Input id="product" name="product" className="mt-1.5" defaultValue={initialProduct} required />
          <FieldError errors={errors['product']} />
        </div>
        <div>
          <Label htmlFor="quantity">Estimated Quantity</Label>
          <Input id="quantity" name="quantity" className="mt-1.5" placeholder="e.g. 5,000 kg / month" />
          <FieldError errors={errors['quantity']} />
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" autoComplete="tel" className="mt-1.5" />
        <FieldError errors={errors['phone']} />
      </div>

      <div>
        <Label htmlFor="message">Project Details *</Label>
        <Textarea id="message" name="message" className="mt-1.5 min-h-36" defaultValue={initialMessage} required />
        <FieldError errors={errors['message']} />
      </div>

      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input name="acceptTerms" type="checkbox" className="mt-1" required />
        <span>I confirm this request is for legitimate business procurement or technical evaluation.</span>
      </label>
      <FieldError errors={errors['acceptTerms']} />

      <SubmitBtn />
    </form>
  );
}