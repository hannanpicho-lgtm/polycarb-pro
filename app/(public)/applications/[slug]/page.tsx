import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { applications, getApplicationBySlug, getProductsByIndustry } from '@/lib/data';
import type { ProductIndustry } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ViewportVideo } from '@/components/viewport-video';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return applications.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const app = getApplicationBySlug(slug);
  if (!app) return { title: 'Application not found' };

  return {
    title: `${app.title} Applications`,
    description: app.description,
    openGraph: {
      title: `${app.title} | Covestro PC`,
      description: app.description,
      images: [{ url: app.image, width: 1200, height: 800 }],
    },
  };
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { slug } = await params;
  const app = getApplicationBySlug(slug);
  if (!app) notFound();

  const relatedProducts = getProductsByIndustry(app.id as ProductIndustry);

  return (
    <>
      <div className="bg-steel-950 pt-28 pb-12">
        <div className="container mx-auto">
          <Link
            href="/applications"
            className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Applications
          </Link>
          <p className="text-brand-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-2">Industry Focus</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3 font-display">{app.title}</h1>
          <p className="text-white/65 text-base max-w-3xl leading-relaxed">{app.description}</p>
        </div>
      </div>

      <div className="bg-background py-12">
        <div className="container mx-auto grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="relative aspect-[16/7] rounded-lg overflow-hidden border border-border bg-muted">
              {slug === 'construction' ? (
                <ViewportVideo
                  mp4Src="/videos/architecture-walkway.mp4"
                  webmSrc="/videos/architecture-walkway.webm"
                  poster="/video-posters/architecture-walkway.jpg"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              ) : (
                <Image
                  src={app.image}
                  alt={app.title}
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              )}
            </div>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">Typical Use Cases</h2>
              <ul className="grid sm:grid-cols-2 gap-2">
                {app.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-brand-500 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">Recommended Products</h2>
              {relatedProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No products are currently tagged for this industry.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {relatedProducts.map((product) => (
                    <article key={product.id} className="border border-border rounded-lg p-4 bg-card">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
                        {product.brand} - {product.grade}
                      </p>
                      <h3 className="text-sm font-bold text-foreground mb-2">{product.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{product.shortDescription}</p>
                      <Link
                        href={`/products/${product.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                      >
                        View product <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-4">
            <div className="border border-border rounded-lg p-5 bg-muted/30">
              <h2 className="text-sm font-bold uppercase tracking-wide text-foreground mb-2">Need a Technical Recommendation?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Share your mechanical, optical, and compliance requirements and our engineers will suggest suitable grades.
              </p>
              <Button asChild className="w-full bg-brand-500 hover:bg-brand-600 text-white">
                <Link href={`/contact?industry=${app.id}&source=application-detail-sidebar`}>Talk to an Engineer</Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
