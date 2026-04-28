import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'FAQ – Polycarbonate Material Questions',
  description:
    'Answers to the most common questions about polycarbonate grades, lead times, datasheets, compliance, and ordering from Covestro PC.',
};

interface FaqItem {
  q: string;
  a: string;
}

interface FaqSection {
  section: string;
  items: FaqItem[];
}

const faqSections: FaqSection[] = [
  {
    section: 'Material & Grades',
    items: [
      {
        q: 'What is the difference between solid sheet, multiwall sheet, and corrugated polycarbonate?',
        a: 'Solid sheet (monolithic) is a single continuous layer offering the highest clarity, impact strength, and UV resistance — ideal for machine guards, optical lenses, and architectural glazing. Multiwall (twin-wall, triple-wall, or X-structured) panels trap insulating air chambers, making them lightweight and thermally efficient for roofing, greenhouses, and rooflights. Corrugated polycarbonate combines structural rigidity with lightness, commonly used in agricultural buildings and industrial roofing.',
      },
      {
        q: 'What is the difference between general-purpose and optical-grade polycarbonate?',
        a: 'Optical-grade polycarbonate is polymerised and compounded under tighter tolerances to achieve exceptional light transmission (typically ≥89%), very low haze (<1%), and minimal birefringence. It is required for lenses, diffusers, and screens where colour neutrality and clarity are critical. General-purpose grades sacrifice a little optical performance for lower cost and easier processing, and are perfectly suited for safety guards, glazing, and housings.',
      },
      {
        q: 'What does UL94 flame rating mean and which grades carry it?',
        a: "UL94 is Underwriters Laboratories' standard for polymer flammability. V-0 is the most stringent level — the material must self-extinguish within 10 seconds and not drip flaming particles. V-2 allows dripping but still self-extinguishes. Many of our Covestro Makrolon, SABIC Lexan, and Trinseo EMERGE grades carry V-0 ratings at relevant thicknesses; specific certification data is noted in each product datasheet.",
      },
      {
        q: 'Can polycarbonate be used outdoors without UV degradation?',
        a: 'Uncoated polycarbonate is UV-sensitive and will yellow and embrittle over time when exposed to direct sunlight. Virtually all sheet grades we stock include a co-extruded UV-stabilised cap layer on one or both faces, which provides 10–15 years of outdoor performance depending on geographic UV index. For resin or injection-moulding grades, UV stabiliser additives are compounded into the pellet.',
      },
      {
        q: 'What is the continuous service temperature of polycarbonate?',
        a: 'Polycarbonate has a glass transition temperature (Tg) of approximately 147 °C and a heat deflection temperature (HDT) at 1.82 MPa typically between 125 °C and 140 °C depending on grade. Continuous service in still air is generally rated to 115–125 °C. Certain high-heat copolymer grades extend this range. Always verify the specific HDT value in the product datasheet for your application.',
      },
      {
        q: 'Is polycarbonate chemical resistant?',
        a: 'Polycarbonate has good resistance to dilute acids, aliphatic hydrocarbons, and alcohols, but is attacked by strong alkalis, ketones (acetone), esters, aromatic hydrocarbons (toluene), and chlorinated solvents. Always check a chemical resistance guide specific to the grade before specifying PC in contact with process fluids or cleaning agents.',
      },
    ],
  },
  {
    section: 'Ordering & Availability',
    items: [
      {
        q: 'What is the minimum order quantity?',
        a: 'Minimum order quantities vary by product form. For sheet products we typically supply from 1 sheet upward for stocked grades, with no minimum on sample requests. For resin pellets, typical minimums are 25 kg bags for development quantities and 500 kg for production runs. Contact our sales team for exact MOQs and pricing for your specific grade and thickness.',
      },
      {
        q: 'What lead times should I expect?',
        a: 'In-stock sheet products typically ship within 1–3 business days from our regional warehouses. Specialty grades, custom thicknesses, or resin compounds that are not held in stock usually carry lead times of 3–8 weeks depending on the supplier and volume. We will confirm lead time when your quote is reviewed.',
      },
      {
        q: 'Do you supply samples for qualification testing?',
        a: 'Yes. We can provide sample coupons or small-quantity sheets for qualification at no or minimal charge for genuine development projects. Please describe your application and required quantity in your contact request.',
      },
      {
        q: 'Can you supply to ISO 9001 / IATF 16949 requirements?',
        a: 'All materials we supply originate from ISO 9001-certified manufacturing facilities. IATF 16949 supply-chain documentation, including PPAPs, material certifications, and lot traceability records, can be arranged for automotive customers — contact your account manager to discuss documentation requirements before order placement.',
      },
    ],
  },
  {
    section: 'Technical Documentation',
    items: [
      {
        q: 'How do I obtain a Certificate of Conformance (CoC)?',
        a: "A CoC is provided with every shipment at no additional charge. For critical applications or regulated industries, we can also provide the manufacturer's original mill certificate and lot traceability documentation. Requests for supplemental documentation should be noted on your purchase order.",
      },
      {
        q: 'Where can I download product datasheets and technical data sheets (TDS)?',
        a: "Product-specific datasheets are available directly on each product page and from our Technical Downloads library at /resources. If you cannot find the datasheet for a specific grade or lot, contact our technical team and we will supply the manufacturer's current version.",
      },
      {
        q: 'Do your products carry RoHS and REACH compliance?',
        a: 'The polycarbonate grades we stock are generally compliant with RoHS Directive 2011/65/EU (as amended) and REACH Regulation (EC) No 1907/2006. Compliance statements are available on request. Note that SVHC (Substances of Very High Concern) candidate list status should be re-verified periodically as the list is updated by ECHA twice yearly.',
      },
      {
        q: 'Is medical-grade polycarbonate biocompatible?',
        a: 'Selected PC grades are compounded specifically for medical device applications and have been tested under ISO 10993 or USP Class VI protocols. These grades are noted in the product description and relevant test reports are available from the manufacturer. We do not make biocompatibility claims for general-purpose grades in medical device contact applications.',
      },
    ],
  },
  {
    section: 'Processing & Fabrication',
    items: [
      {
        q: 'Does polycarbonate need to be dried before injection moulding?',
        a: 'Yes — polycarbonate is hygroscopic and will absorb atmospheric moisture. Processing without drying causes splay marks, bubbles, and molecular weight degradation. Dry pellets at 120 °C for 4–6 hours in a desiccant hopper dryer to below 0.02% moisture content before moulding. Never use a vented barrel as a substitute for proper pre-drying.',
      },
      {
        q: 'What are typical injection moulding parameters for polycarbonate?',
        a: 'Barrel temperatures for standard PC grades are typically 280–320 °C, mould temperatures 80–100 °C. Injection speed should be moderate to avoid shear degradation; pack pressure is typically 50–70% of injection pressure. Specific parameters vary significantly by grade, part geometry, and machine — always consult the grade-specific processing guide provided in the datasheet.',
      },
      {
        q: 'Can polycarbonate sheets be cold-bent or thermoformed?',
        a: 'Solid PC sheet can be cold-bent in a single axis with a minimum bend radius of approximately 150× the sheet thickness (e.g., a 3 mm sheet requires a 450 mm radius). For tighter radii or compound curves, thermoforming at 160–200 °C is required. Multiwall and corrugated sheets can generally be cold-bent along their length with the channels (not across them) at a radius specified in the product technical data.',
      },
      {
        q: 'What adhesives and solvents are compatible with polycarbonate?',
        a: 'Methylene chloride (dichloromethane) and ethylene dichloride are the traditional solvent cements for PC-to-PC bonds, but both are regulated substances requiring adequate ventilation and PPE. Acrylic-based structural adhesives (e.g., Weld-On, Scigrip) and UV-curable adhesives designed for polycarbonates are viable alternatives. Cyanoacrylates perform poorly on PC. Avoid all ketone and aromatic solvent-based adhesives.',
      },
    ],
  },
  {
    section: 'Sustainability',
    items: [
      {
        q: 'Is recycled-content polycarbonate available?',
        a: 'Post-consumer recycled (PCR) and post-industrial recycled (PIR) polycarbonate grades are becoming commercially available through leading producers. We stock select recycled-content grades and can source others on request. Note that mechanical properties, colour, and clarity can differ from virgin grades — we recommend qualification testing before switching.',
      },
      {
        q: 'How long does polycarbonate last in service?',
        a: "When correctly specified and installed, UV-stabilised polycarbonate sheet can perform for 15–25+ years in outdoor applications. In protected or indoor environments, service life commonly exceeds 30 years. Polycarbonate's long service life is one of its key sustainability advantages over glass alternatives in terms of whole-life carbon.",
      },
    ],
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqSections.flatMap((section) =>
    section.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    }))
  ),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="bg-steel-950 pt-28 pb-12">
        <div className="container mx-auto">
          <p className="text-brand-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-2">
            Knowledge Base
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3 font-display">
            Frequently Asked Questions
          </h1>
          <p className="text-white/65 text-base max-w-3xl leading-relaxed">
            Engineering-grade answers to common questions about polycarbonate materials, ordering,
            documentation, processing, and sustainability.
          </p>
        </div>
      </div>

      <div className="bg-background py-12">
        <div className="container mx-auto max-w-4xl">
          {/* Quick section nav */}
          <div className="flex flex-wrap gap-2 mb-10">
            {faqSections.map((section) => (
              <a
                key={section.section}
                href={`#${section.section
                  .toLowerCase()
                  .replace(/\s+&\s+/g, '-')
                  .replace(/\s+/g, '-')}`}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-brand-300 hover:text-brand-700 transition-colors"
              >
                {section.section}
              </a>
            ))}
          </div>

          <div className="space-y-14">
            {faqSections.map((section) => (
              <section
                key={section.section}
                id={section.section
                  .toLowerCase()
                  .replace(/\s+&\s+/g, '-')
                  .replace(/\s+/g, '-')}
              >
                <div className="flex items-center gap-3 mb-6">
                  <ChevronDown className="h-5 w-5 text-brand-500" aria-hidden="true" />
                  <h2 className="text-xl font-bold text-foreground font-display">
                    {section.section}
                  </h2>
                </div>

                <div className="space-y-4">
                  {section.items.map((item) => (
                    <details
                      key={item.q}
                      className="group border border-border rounded-lg bg-card overflow-hidden"
                    >
                      <summary className="flex items-start justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none hover:bg-muted/40 transition-colors">
                        <span className="text-sm font-semibold text-foreground leading-snug">
                          {item.q}
                        </span>
                        <ChevronDown
                          className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5 transition-transform duration-200 group-open:rotate-180"
                          aria-hidden="true"
                        />
                      </summary>
                      <div className="px-5 pb-5 pt-1 border-t border-border">
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-14 rounded-xl bg-brand-500 p-8 text-center text-white">
            <h2 className="text-xl font-bold mb-2 font-display">Still have questions?</h2>
            <p className="text-white/80 text-sm mb-5 max-w-md mx-auto">
              Our applications engineers are available {siteConfig.contact.businessHours} to answer
              technical grade-selection and processing questions.
            </p>
            <Button asChild variant="white" size="lg" className="font-bold">
              <Link href="/contact?source=faq-cta">Talk to an Engineer</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
