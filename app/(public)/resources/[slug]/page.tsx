import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { blogPosts } from '@/lib/data';
import { Button } from '@/components/ui/button';

interface Props {
  params: Promise<{ slug: string }>;
}

const resourceContentBySlug: Record<
  string,
  {
    intro: string;
    sections: { title: string; body: string[] }[];
    cta: string;
  }
> = {
  'polycarbonate-automotive-lightweighting': {
    intro:
      'Vehicle manufacturers are balancing range targets, crash requirements, and escalating component complexity. Polycarbonate has become one of the most effective levers for cutting mass without sacrificing safety, especially in transparent and semi-structural systems.',
    sections: [
      {
        title: 'Where Lightweighting Delivers the Biggest Return',
        body: [
          'The strongest near-term gains are in glazing systems, panoramic roofs, lamp modules, and interior structural trims where polycarbonate can replace heavier legacy materials.',
          'Even modest mass reductions at subsystem level compound across thermal management, mounting hardware, and battery sizing decisions in EV platforms.',
        ],
      },
      {
        title: 'Design Advantages Beyond Weight',
        body: [
          'Polycarbonate enables deep geometries, integrated clips, and optical features that are difficult or expensive to execute in glass or metal.',
          'This design freedom allows teams to reduce part count and simplify assembly, improving both cycle time and downstream quality consistency.',
        ],
      },
      {
        title: 'Qualification Workflow for OEM Programs',
        body: [
          'A practical validation path includes weathering, impact retention at low temperature, dimensional stability, and coating compatibility checks.',
          'Teams that establish a grade shortlist early in development typically reduce late-stage material changes and launch risk.',
        ],
      },
    ],
    cta: 'Request an automotive grade shortlist',
  },
  'circular-economy-pc-recycling': {
    intro:
      'Circularity in polycarbonate is moving from pilot narrative to procurement criterion. Buyers increasingly ask for traceable recycled-content pathways that preserve performance in demanding applications.',
    sections: [
      {
        title: 'Mechanical vs Chemical Recycling Paths',
        body: [
          'Mechanical recycling can be highly effective for clean and controlled streams, but repeated thermal histories may limit fit for high-spec optical or structural use.',
          'Chemical recycling routes are expanding where recovery of high-purity monomers supports closed-loop programs and broader quality targets.',
        ],
      },
      {
        title: 'How to Evaluate Recycled-Content Claims',
        body: [
          'Procurement and engineering teams should require clear chain-of-custody documentation, method statements, and specification tolerances tied to end-use needs.',
          'Equivalent property performance, process stability, and long-term supply assurance are more valuable than headline recycled percentages alone.',
        ],
      },
      {
        title: 'Implementation Strategy for Manufacturing Teams',
        body: [
          'Start with non-critical or blended-content applications, then expand after validating molding behavior, appearance targets, and reliability thresholds.',
          'A phased qualification approach helps maintain production continuity while building confidence in circular feedstocks.',
        ],
      },
    ],
    cta: 'Talk with our team about circular PC options',
  },
  'medical-pc-sterilisation-guide': {
    intro:
      'Medical-grade polycarbonate selection should begin with sterilization reality, not just room-temperature mechanical data. Exposure method, cycle count, and geometry all influence retained performance.',
    sections: [
      {
        title: 'Method-Specific Material Behavior',
        body: [
          'Gamma, EtO, and steam cycles affect polycarbonate differently. Discoloration tendency, molecular integrity, and dimensional drift must be validated per method.',
          'The same grade may perform well under one protocol and degrade under another, especially under repeated-cycle use cases.',
        ],
      },
      {
        title: 'Critical Validation Parameters',
        body: [
          'Evaluate optical retention, impact resistance, stress cracking risk, and fit-function tolerances after representative sterilization exposure.',
          'Include assembly-level testing because molded part geometry and residual stress distribution strongly affect results.',
        ],
      },
      {
        title: 'Documentation and Regulatory Readiness',
        body: [
          'Maintain lot-level traceability, change-control visibility, and biocompatibility references aligned with your quality system requirements.',
          'Supplier consistency and version-controlled technical data reduce re-validation cycles during scale-up or transfer.',
        ],
      },
    ],
    cta: 'Get medical-grade sterilization support',
  },
  'pc-multiwall-energy-savings': {
    intro:
      'Energy performance in daylighting systems is often determined by the envelope, not equipment upgrades alone. Multiwall polycarbonate can significantly shift the heating-cooling balance while preserving usable daylight.',
    sections: [
      {
        title: 'Insulation and Light Management Trade-Offs',
        body: [
          'As wall structures become more advanced, U-values improve while light transmission varies by geometry and tint.',
          'Project teams should optimize for both thermal target and daylight quality rather than maximizing a single metric.',
        ],
      },
      {
        title: 'Application Fit by Climate and Building Type',
        body: [
          'Commercial atriums, greenhouses, and covered walkways benefit most when high impact resistance and low maintenance are required alongside insulation gains.',
          'Climate zone, orientation, and roof pitch should inform panel choice to avoid over- or under-specification.',
        ],
      },
      {
        title: 'Specification Checklist for Better Outcomes',
        body: [
          'Define UV-side orientation, condensation control, structural span limits, and cleaning protocol in your specification package.',
          'Early alignment between architect, installer, and material supplier reduces installation defects and long-term service issues.',
        ],
      },
    ],
    cta: 'Request a multiwall panel recommendation',
  },
};

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: 'Resource not found' };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | Covestro PC`,
      description: post.excerpt,
      images: [{ url: post.image, width: 1200, height: 630 }],
    },
  };
}

export default async function ResourceDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();
  const articleContent = resourceContentBySlug[slug];

  return (
    <>
      <div className="bg-steel-950 pt-28 pb-12">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Resources
          </Link>
          <p className="text-brand-400 text-xs font-bold uppercase tracking-widest mb-2">
            {post.category}
          </p>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-3">
            {post.title}
          </h1>
          <p className="text-white/65 text-lg">{post.excerpt}</p>
        </div>
      </div>

      <article className="bg-background py-12">
        <div className="container mx-auto max-w-3xl prose prose-slate dark:prose-invert">
          {articleContent ? (
            <>
              <p>{articleContent.intro}</p>
              {articleContent.sections.map((section) => (
                <section key={section.title}>
                  <h2>{section.title}</h2>
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ))}
            </>
          ) : (
            <>
              <p>
                This article is part of the Covestro PC technical resource center. For project
                support, request datasheets, processing guidance, and grade recommendations from our
                team.
              </p>
              <p>
                We can provide grade comparisons, availability guidance, and application-specific
                notes to help your team move faster from design to production.
              </p>
            </>
          )}

          <div className="not-prose mt-8">
            <Button asChild className="bg-brand-500 hover:bg-brand-600 text-white">
              <Link href="/contact?source=resource-detail-cta">
                {articleContent?.cta ?? 'Request Technical Support'}
              </Link>
            </Button>
          </div>
        </div>
      </article>
    </>
  );
}
