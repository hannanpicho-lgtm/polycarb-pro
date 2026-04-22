'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { blogPosts } from '@/lib/data';

const categoryColorMap: Record<string, string> = {
  AUTOMOTIVE: 'bg-orange-500 text-white',
  SUSTAINABILITY: 'bg-emerald-500 text-white',
  MEDICAL: 'bg-blue-500 text-white',
  CONSTRUCTION: 'bg-cyan-600 text-white',
  PLANET: 'bg-green-600 text-white',
};

export function BlogTeaser() {
  return (
    <section className="py-20 bg-background" aria-labelledby="blog-heading">
      <div className="container mx-auto">
        {/* Header with tab-style navigation like Covestro */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-500 mb-2">Resources</p>
            <h2 id="blog-heading" className="section-heading font-display">Insights & Technical Briefs</h2>
          </div>
          <div className="flex items-center gap-4 border-b border-border pb-1">
            {['Blog', 'Solutions', 'Media'].map((tab, i) => (
              <button
                key={tab}
                className={`pb-2 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                  i === 0
                    ? 'border-brand-500 text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal scroll carousel on mobile, grid on desktop */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4 lg:overflow-visible lg:m-0 lg:p-0">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
            className="flex gap-5 lg:grid lg:grid-cols-4 min-w-max lg:min-w-0"
          >
            {blogPosts.map((post) => {
              const catClass = categoryColorMap[post.category] ?? 'bg-steel-700 text-white';
              return (
                <motion.article
                  key={post.id}
                  variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
                  className="group w-72 lg:w-auto flex-shrink-0 lg:flex-shrink border border-border rounded-lg overflow-hidden bg-card hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 288px, (max-width: 1024px) 50vw, 25vw"
                    />
                    {/* Category tag overlay */}
                    <span className={`absolute top-3 left-3 tag-pill ${catClass}`}>
                      {post.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-sm leading-tight text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-2 line-clamp-2">
                      <Link href={`/resources/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {post.readTime} min read
                      </div>
                      <Link
                        href={`/resources/${post.slug}`}
                        className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 transition-colors"
                      >
                        Read more <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>

        {/* View all */}
        <div className="flex justify-center mt-10">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:gap-4 transition-all duration-200"
          >
            View all resources <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
