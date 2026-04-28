'use client';

import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { productCategories, industryOptions } from '@/lib/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import * as React from 'react';
import { useRouter } from 'next/navigation';

const productCategoryLabels: Record<string, string> = {
  sheets: 'Sheets',
  rods: 'Rods & Profiles',
  resins: 'Resins',
  specialty: 'Specialty',
};

export function FilterSection() {
  const router = useRouter();
  const [category, setCategory] = React.useState('all');
  const [industry, setIndustry] = React.useState('all');

  function handleShowProducts() {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (industry !== 'all') params.set('industry', industry);
    const qs = params.toString();
    router.push(`/products${qs ? `?${qs}` : ''}`);
  }

  return (
    <section className="py-14 bg-steel-100 dark:bg-steel-900/60" aria-labelledby="filter-heading">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <SlidersHorizontal className="h-5 w-5 text-foreground" aria-hidden="true" />
            <h2 id="filter-heading" className="text-xl font-bold text-foreground font-display">
              Find Your Grade
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
            {/* Material selector */}
            <div className="flex-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1.5">
                Material Type
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Materials" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {productCategoryLabels[opt] ?? opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Industry selector */}
            <div className="flex-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1.5">
                Target Industry
              </label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* CTA */}
            <Button
              onClick={handleShowProducts}
              size="default"
              className="bg-brand-500 hover:bg-brand-600 text-white h-11 px-8 font-bold sm:flex-shrink-0"
            >
              Show Products
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
