import { NewsletterForm } from '@/components/newsletter-form';

const benefits = [
  { label: 'New Grade Alerts', desc: 'First to know when new PC grades land in inventory.' },
  { label: 'Regulatory Updates', desc: 'RoHS, REACH, and UL changes that affect your BOM.' },
  { label: 'Technical Resources', desc: 'Processing guides, datasheets, and application notes.' },
];

export function NewsletterStrip() {
  return (
    <section className="bg-steel-950 py-16" aria-labelledby="newsletter-heading">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left – copy */}
          <div>
            <p className="text-brand-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-3">Stay Informed</p>
            <h2
              id="newsletter-heading"
              className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4 font-display"
            >
              The Polycarbonate Industry<br className="hidden md:block" /> Monthly Brief
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-md">
              Join 2,400+ procurement managers, OEM engineers, and fabricators who rely on our monthly
              digest for material intelligence, new inventory, and regulatory news.
            </p>

            <ul className="space-y-4">
              {benefits.map((b) => (
                <li key={b.label} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <span className="text-sm font-semibold text-white">{b.label}</span>
                    <span className="text-sm text-white/50"> — {b.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right – form card */}
          <div className="bg-steel-900 border border-white/10 rounded-xl p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-1">Free subscription</p>
            <h3 className="text-lg font-bold text-white mb-1">Subscribe to the Brief</h3>
            <p className="text-white/50 text-xs mb-6">Monthly. No spam. Unsubscribe anytime.</p>
            <NewsletterForm />
            <p className="text-[11px] text-white/30 mt-4">
              Your email is used only for this newsletter. We don't share subscriber data with third parties.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
