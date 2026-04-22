'use client';

import * as React from 'react';

export function FormHoneypot() {
  const [submittedAt] = React.useState(() => Date.now());

  return (
    <>
      <input type="hidden" name="submittedAt" value={String(submittedAt)} />
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="companyWebsite">Company website</label>
        <input id="companyWebsite" name="companyWebsite" type="text" tabIndex={-1} autoComplete="off" />
      </div>
    </>
  );
}
