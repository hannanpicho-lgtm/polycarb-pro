import Image from 'next/image';
import Link from 'next/link';
import {
  curatedPictureGalleryItems,
  type GalleryCategory,
  type GalleryComposition,
} from '@/lib/data';

interface PicturesMosaicProps {
  limit?: number;
  showCta?: boolean;
}

export function PicturesMosaic({ limit, showCta = false }: PicturesMosaicProps) {
  const images =
    typeof limit === 'number'
      ? curatedPictureGalleryItems.slice(0, limit)
      : curatedPictureGalleryItems;
  const eagerCount = showCta ? 2 : 1;

  const categoryClassMap: Record<GalleryCategory, string> = {
    automotive: 'bg-cyan-500 text-white',
    architecture: 'bg-steel-700 text-white',
    canopy: 'bg-blue-500 text-white',
    industrial: 'bg-amber-500 text-white',
    medical: 'bg-emerald-500 text-white',
    materials: 'bg-violet-500 text-white',
  };

  const compositionClassMap: Record<GalleryComposition, string> = {
    wide: 'bg-white text-steel-900',
    detail: 'bg-steel-800 text-white',
    product: 'bg-brand-100 text-brand-900',
    material: 'bg-violet-100 text-violet-900',
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <span className="tag-pill bg-brand-500 text-white mb-3 inline-block">
              VISUAL LIBRARY
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-foreground">
              Project & Material Gallery
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Real-world polycarbonate visuals across automotive, architecture, machine guards, and
              canopy systems.
            </p>
          </div>
          {showCta ? (
            <Link
              href="/gallery"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-colors"
            >
              View Full Gallery
            </Link>
          ) : null}
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 [column-fill:_balance]">
          {images.map((item, idx) => (
            <figure
              key={item.src}
              className="mb-4 break-inside-avoid overflow-hidden rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={1200}
                height={900}
                className="w-full h-auto object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                loading={idx < eagerCount ? 'eager' : 'lazy'}
                fetchPriority={idx < eagerCount ? 'high' : 'auto'}
              />
              <figcaption className="flex items-center justify-between gap-2 px-3 py-2 border-t border-border bg-card/95">
                <span className="text-[11px] text-muted-foreground truncate">{item.alt}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`tag-pill ${compositionClassMap[item.composition]}`}>
                    {item.composition}
                  </span>
                  <span className={`tag-pill ${categoryClassMap[item.category]}`}>
                    {item.category}
                  </span>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
