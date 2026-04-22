import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download, MessageSquare, CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { getDatasheetsForProduct, getProductBySlug, getRelatedProducts, products } from '@/lib/data';
import { getCatalogueLinkProps } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CompareAwareLink } from '@/components/compare-aware-link';
import { ProductCompareSidebarCard } from '@/components/product-compare-sidebar-card';
import { RecentComparisons } from '@/components/recent-comparisons';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'Product not found' };

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} | Covestro PC`,
      description: product.shortDescription,
      images: [{ url: product.image, width: 800, height: 600 }],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  const relatedDatasheets = getDatasheetsForProduct(product).filter((doc) => doc.url !== product.datasheetUrl);
  const similarProducts = getRelatedProducts(product, 4);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: { '@type': 'Brand', name: product.brand },
    image: product.image,
    material: 'Polycarbonate',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/PreOrder',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="bg-steel-950 pt-24 pb-0">
        <div className="container mx-auto py-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/50">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <CompareAwareLink href="/products" className="hover:text-white transition-colors">Products</CompareAwareLink>
            <span>/</span>
            <span className="text-white/80 truncate max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero row */}
      <div className="bg-steel-950 pb-10">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Image */}
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-steel-800">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Product info */}
            <div className="py-4">
              {/* Category label */}
              <span className="tag-pill bg-brand-500 text-white mb-3 inline-block">
                {product.subtype}
              </span>

              {/* Brand */}
              <p className="text-white/50 text-sm font-medium mb-1">
                {product.brand} · {product.grade}
              </p>

              {/* Name */}
              <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4 font-display">
                {product.name}
              </h1>

              {/* Stock badge */}
              <div className="flex items-center gap-2 mb-6">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-sm ${
                    product.inStock
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {product.inStock ? '● In Stock' : '● Available to Order'}
                </span>
              </div>

              {/* Short desc */}
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Key features */}
              <div className="space-y-2 mb-8">
                {product.features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-brand-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm text-white/80">{f}</span>
                  </div>
                ))}
              </div>

              {/* Certifications */}
              <div className="flex flex-wrap gap-2 mb-8">
                {product.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="text-xs border border-white/20 text-white/60 px-2.5 py-1 rounded font-mono"
                  >
                    {cert}
                  </span>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold"
                >
                  <Link href={`/quote?product=${product.slug}&source=product-detail-hero`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Request Quote
                  </Link>
                </Button>
                {product.datasheetUrl ? (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <a {...getCatalogueLinkProps(product.datasheetUrl)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Catalogue
                    </a>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    disabled
                  >
                    <span>
                      <Download className="h-4 w-4 mr-2" />
                      Catalogue Coming Soon
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details tabs */}
      <div className="bg-background py-12">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Technical specifications */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold mb-4 text-foreground font-display">Technical Specifications</h2>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm" aria-label="Technical specifications">
                  <thead>
                    <tr className="bg-muted/60">
                      <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground w-1/2">
                        Property
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value], i) => (
                      <tr key={key} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                        <td className="px-5 py-3 font-medium text-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Full description */}
              <h2 className="text-xl font-bold mt-8 mb-3 text-foreground font-display">Product Description</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>

              {/* Applications */}
              <h2 className="text-xl font-bold mt-8 mb-3 text-foreground font-display">Typical Applications</h2>
              <div className="flex flex-wrap gap-2">
                {product.applications.map((app) => (
                  <span key={app} className="bg-muted text-muted-foreground text-xs px-3 py-1.5 rounded">
                    {app}
                  </span>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Quick quote CTA */}
              <div className="bg-brand-500 rounded-lg p-6 text-white">
                <Package className="h-8 w-8 mb-3 opacity-80" aria-hidden="true" />
                <h3 className="font-bold text-lg mb-2 font-display">Get a Price</h3>
                <p className="text-white/80 text-sm mb-4">
                  Tell us your volume requirements and we'll respond within 1 business day with competitive pricing.
                </p>
                <Button asChild variant="white" size="sm" className="w-full font-bold">
                  <Link href={`/quote?product=${product.slug}&source=product-detail-sidebar`}>Request Quote</Link>
                </Button>
              </div>

              {/* Industries */}
              <div className="bg-muted/50 border border-border rounded-lg p-5">
                <h3 className="font-bold text-sm text-foreground mb-3">Target Industries</h3>
                <div className="flex flex-wrap gap-2">
                  {product.industries.map((ind) => (
                    <Link
                      key={ind}
                      href={`/applications/${ind}`}
                      className="text-xs bg-background border border-border text-muted-foreground px-2.5 py-1 rounded capitalize hover:border-brand-300 hover:text-brand-600 transition-colors"
                    >
                      {ind}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-muted/50 border border-border rounded-lg p-5">
                <h3 className="font-bold text-sm text-foreground mb-3">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <span key={tag} className="text-[11px] bg-background border border-border text-muted-foreground px-2 py-0.5 rounded font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Compare CTA */}
              <ProductCompareSidebarCard productSlug={product.slug} productName={product.name} />

              <RecentComparisons currentPath="/products/compare" currentLabel="Current compare" enabled={false} />

              {/* Related docs */}
              {relatedDatasheets.length > 0 ? (
                <div className="bg-muted/50 border border-border rounded-lg p-5">
                  <h3 className="font-bold text-sm text-foreground mb-3 font-display">Related Technical Documents</h3>
                  <div className="space-y-2">
                    {relatedDatasheets.slice(0, 4).map((doc) => (
                      <a
                        key={doc.id}
                        {...getCatalogueLinkProps(doc.url)}
                        className="flex items-start justify-between gap-3 rounded border border-border bg-background px-3 py-2 hover:border-brand-300 transition-colors"
                      >
                        <span className="text-xs text-muted-foreground leading-relaxed">{doc.title}</span>
                        <Download className="h-3.5 w-3.5 text-brand-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 ? (
            <section className="mt-12 pt-10 border-t border-border">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-brand-500 text-[11px] font-bold uppercase tracking-[0.15em] mb-1">Keep Exploring</p>
                  <h2 className="text-xl font-bold text-foreground font-display">Similar Products</h2>
                </div>
                <CompareAwareLink
                  href={`/products?category=${product.category}`}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  View all {product.category} →
                </CompareAwareLink>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {similarProducts.map((p) => (
                  <article key={p.id} className="group border border-border rounded-lg bg-card overflow-hidden hover:shadow-md hover:border-brand-200 transition-all duration-300">
                    <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 20vw"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">{p.brand} · {p.grade}</p>
                      <h3 className="text-sm font-bold text-foreground leading-snug mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">{p.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.shortDescription}</p>
                      <CompareAwareLink
                        href={`/products/${p.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                      >
                        View <ArrowRight className="h-3 w-3" />
                      </CompareAwareLink>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {/* Back link */}
          <div className="mt-10">
            <CompareAwareLink
              href="/products"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Products
            </CompareAwareLink>
          </div>
        </div>
      </div>
    </>
  );
}
