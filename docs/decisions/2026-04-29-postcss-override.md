# ADR: Pin PostCSS via npm override for GHSA-qx2v-qp2m-jg93

## Status

Accepted — implemented in commit `5f0072b` (on `main`).

## Context

- `npm audit` reported **moderate** findings for [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) (**PostCSS** &lt; **8.5.10**: XSS risk in CSS stringify when handling untrusted input).
- The reported count was **six** because the **same advisory** appeared across **multiple dependency paths** (not six unrelated CVEs). The vulnerable copy was **`postcss@8.4.31`** nested under **`next@15.x`**; other packages (`@opennextjs/cloudflare`, `@vercel/analytics`, etc.) only **transitively** referenced `next`.
- **`npm audit fix --force`** was **not** acceptable: it proposed an incompatible **major downgrade** of `next`.

## Decision

1. Add an **`overrides`** entry in `package.json` to force **`postcss`** to **`^8.5.10`** tree-wide (alongside the existing `uuid` override).
2. Align the **direct** devDependency **`postcss`** to **`^8.5.10`** so the override does not conflict with the declared range.
3. Regenerate **`package-lock.json`** and verify **`next`** dedupes to a patched PostCSS (e.g. **8.5.12** at time of fix).

## Consequences

- **Positive:** `npm audit` returns **zero** reported vulnerabilities for this issue; builds stay on the supported **Next 15** line without a bogus forced downgrade.
- **Risk / maintenance:** We depend on npm **overrides** until upstream **`next`** pins a patched PostCSS. **Dependabot** and periodic `npm outdated` / `npm ls postcss` should be used to **re-evaluate** removing the override when nested `next` no longer ships vulnerable PostCSS.
- **Exploitability note:** PostCSS runs in the **build/tooling** path (CSS compilation), not as end-user runtime JS. Residual risk is **low** for a repo that only processes **trusted** first-party CSS; the override is still warranted for **supply-chain and audit hygiene**.

## References

- Advisory: <https://github.com/advisories/GHSA-qx2v-qp2m-jg93>
- Remediation commit: `5f0072b`
