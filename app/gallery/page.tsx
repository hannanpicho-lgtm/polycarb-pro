import type { Metadata } from 'next';
import { PicturesMosaic } from '@/components/pictures-mosaic';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Gallery | ${siteConfig.company.shortName}`,
  description:
    'Complete visual gallery of polycarbonate applications, project references, and material imagery from the Covestro PC picture library.',
};

export default function GalleryPage() {
  return (
    <>
      <section className="bg-steel-950 pt-28 pb-12">
        <div className="container mx-auto">
          <span className="tag-pill bg-brand-500 text-white mb-3 inline-block">GALLERY</span>
          <h1 className="text-3xl md:text-4xl font-black text-white">Complete Picture Library</h1>
          <p className="text-white/70 text-sm mt-3 max-w-2xl">
            A full index of project and product imagery used across the website.
          </p>
        </div>
      </section>
      <PicturesMosaic />
    </>
  );
}
