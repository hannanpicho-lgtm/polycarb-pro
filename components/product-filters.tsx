'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PackageCheck, Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { productCategories, industryOptions, brandOptions } from '@/lib/data';

const productCategoryLabels: Record<string, string> = {
  sheets: 'Sheets',
  rods: 'Rods & Profiles',
  resins: 'Resins',
  specialty: 'Specialty',
};

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get('q') ?? '');
  const [category, setCategory] = React.useState(searchParams.get('category') ?? 'all');
  const [industry, setIndustry] = React.useState(searchParams.get('industry') ?? 'all');
  const [brand, setBrand] = React.useState(searchParams.get('brand') ?? 'all');
  const [sort, setSort] = React.useState(searchParams.get('sort') ?? 'name-asc');
  const [instock, setInstock] = React.useState(searchParams.get('instock') ?? '');

  function apply() {
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (category !== 'all') params.set('category', category);
    if (industry !== 'all') params.set('industry', industry);
    if (brand !== 'all') params.set('brand', brand);
    if (sort !== 'name-asc') params.set('sort', sort);
    if (instock === '1') params.set('instock', '1');
    const qs = params.toString();
    router.push(`/products${qs ? `?${qs}` : ''}`);
  }

  function reset() {
    setSearch('');
    setCategory('all');
    setIndustry('all');
    setBrand('all');
    setSort('name-asc');
    setInstock('');
    router.push('/products');
  }

  const hasFilters = search || category !== 'all' || industry !== 'all' || brand !== 'all' || sort !== 'name-asc' || instock === '1';

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm font-semibold text-foreground">Filter Products</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && apply()}
            placeholder="Search by name, grade, brand…"
            className="pl-9"
            aria-label="Search products"
          />
        </div>

        {/* Category */}
        <div className="w-full lg:w-52">
          <Select value={category} onValueChange={(v) => { setCategory(v); }}>
            <SelectTrigger aria-label="Filter by material type">
              <SelectValue placeholder="All Materials" />
            </SelectTrigger>
            <SelectContent>
              {productCategories.map((opt) => (
                <SelectItem key={opt} value={opt}>{productCategoryLabels[opt] ?? opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Industry */}
        <div className="w-full lg:w-56">
          <Select value={industry} onValueChange={(v) => { setIndustry(v); }}>
            <SelectTrigger aria-label="Filter by industry">
              <SelectValue placeholder="All Industries" />
            </SelectTrigger>
            <SelectContent>
              {industryOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Brand */}
        <div className="w-full lg:w-56">
          <Select value={brand} onValueChange={(v) => { setBrand(v); }}>
            <SelectTrigger aria-label="Filter by brand">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              {brandOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="w-full lg:w-48">
          <Select value={sort} onValueChange={(v) => { setSort(v); }}>
            <SelectTrigger aria-label="Sort products">
              <SelectValue placeholder="Name A-Z" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="brand-asc">Brand</SelectItem>
              <SelectItem value="instock-first">In-Stock First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* In-Stock toggle */}
        <button
          type="button"
          onClick={() => setInstock(instock === '1' ? '' : '1')}
          aria-pressed={instock === '1'}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md border text-sm font-semibold transition-colors whitespace-nowrap ${
            instock === '1'
              ? 'bg-brand-500 text-white border-brand-500'
              : 'bg-background text-muted-foreground border-border hover:border-brand-300 hover:text-brand-700'
          }`}
        >
          <PackageCheck className="h-4 w-4" />
          In Stock
        </button>

        <div className="flex gap-2">
          <Button
            onClick={apply}
            className="bg-brand-500 hover:bg-brand-600 text-white flex-1 lg:flex-none"
          >
            Show Products
          </Button>
          {hasFilters && (
            <Button
              onClick={reset}
              variant="ghost"
              size="icon"
              aria-label="Clear all filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
