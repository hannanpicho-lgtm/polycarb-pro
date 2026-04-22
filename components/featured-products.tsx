'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Download, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductPromoModal } from '@/components/product-promo-modal';
import { getFeaturedProducts } from '@/lib/data';
import { getCatalogueLinkProps } from '@/lib/utils';
import type { ProductCategory, Product } from '@/lib/data';

const categoryColorMap: Record<ProductCategory, string> = {
  sheets: 'bg-blue-600 text-white',
  rods: 'bg-slate-600 text-white',
  resins: 'bg-purple-600 text-white',
  specialty: 'bg-orange-500 text-white',
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function FeaturedProducts() {
  const featured = getFeaturedProducts();
  const [promoState, setPromoState] = useState<{ isOpen: boolean; product: Product | null }>({
    isOpen: false,
    product: null,
  });

  const handleOpenPromo = (product: Product) => {
    setPromoState({ isOpen: true, product });
  };

  const handleClosePromo = () => {
    setPromoState({ isOpen: false, product: null });
  };

  return (
    <section className="py-20 bg-background" aria-labelledby="featured-products-heading">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-500 mb-2">Featured Products</p>
            <h2 id="featured-products-heading" className="section-heading font-display">
              Top Grades, Ready to Ship
            </h2>
            <p className="section-subheading mt-2">
              Industry-proven polycarbonate — trusted by OEMs, converters, and fabrication teams worldwide.
            </p>
          </div>
          <Button asChild variant="outline" className="flex-shrink-0">
            <Link href="/products" className="flex items-center gap-2">
              Browse All Products <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Product grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featured.map((product) => (
            <motion.div key={product.id} variants={item}>
              <Card className="group h-full flex flex-col overflow-hidden hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-300">
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white/90 text-steel-900 text-xs font-bold px-3 py-1 rounded">
                        Available to Order
                      </span>
                    </div>
                  )}
                  {product.promo && (
                    <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5" />
                      Special Offer
                    </div>
                  )}
                </div>

                <CardContent className="flex flex-col flex-1 p-5">
                  {/* Category badge */}
                  <span
                    className={`tag-pill ${categoryColorMap[product.category]} self-start mb-3`}
                  >
                    {product.subtype}
                  </span>

                  {/* Brand + Name */}
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                    {product.brand}
                  </p>
                  <h3 className="font-bold text-lg leading-tight text-foreground mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    <Link href={`/products/${product.slug}`} className="stretched-link">
                      {product.name}
                    </Link>
                  </h3>

                  {/* Short desc */}
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {product.shortDescription}
                  </p>

                  {/* Key features */}
                  {product.features.slice(0, 2).map((f) => (
                    <div key={f} className="flex items-start gap-2 mt-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span className="text-xs text-muted-foreground">{f}</span>
                    </div>
                  ))}

                  {/* Divider + actions */}
                  <div className="mt-5 pt-4 border-t border-border flex flex-col gap-3">
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 transition-colors"
                    >
                      View Details <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    
                    {/* Promo Button */}
                    {product.promo && (
                      <Button
                        size="sm"
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold"
                        onClick={() => handleOpenPromo(product)}
                      >
                        <Zap className="h-3.5 w-3.5 mr-1" />
                        View Offer
                      </Button>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      {product.datasheetUrl ? (
                        <Button asChild size="icon" variant="ghost" className="h-8 w-8" aria-label={`Download catalogue for ${product.name}`}>
                          <a {...getCatalogueLinkProps(product.datasheetUrl)}>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : (
                        <Button size="icon" variant="ghost" className="h-8 w-8" disabled aria-label={`Catalogue unavailable for ${product.name}`}>
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link href={`/quote?product=${product.slug}&source=featured-products`}>Request Quote</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Promo Modal */}
      {promoState.product && (
        <ProductPromoModal
          isOpen={promoState.isOpen}
          onClose={handleClosePromo}
          product={{
            id: promoState.product.id,
            name: promoState.product.name,
            image: promoState.product.image,
            category: promoState.product.category,
            promoText: promoState.product.promo?.text || '',
            benefits: promoState.product.promo?.benefits || [],
            testimonial: promoState.product.promo?.testimonial,
            ctaText: promoState.product.promo?.ctaText,
            ctaLink: promoState.product.promo?.ctaLink,
          }}
        />
      )}
    </section>
  );
}
