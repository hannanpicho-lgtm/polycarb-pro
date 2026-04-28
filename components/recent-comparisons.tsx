'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePublicHiddenSlugs } from '@/hooks/usePublicHiddenSlugs';
import { stripHiddenCompareParamsFromPath } from '@/lib/utils';

interface RecentComparison {
  path: string;
  label: string;
  savedAt: string;
}

interface RecentComparisonsProps {
  currentPath: string;
  currentLabel: string;
  enabled: boolean;
}

const STORAGE_KEY = 'polycarb-pro-recent-comparisons';

export function RecentComparisons({ currentPath, currentLabel, enabled }: RecentComparisonsProps) {
  const [items, setItems] = useState<RecentComparison[]>([]);
  const hidden = usePublicHiddenSlugs();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applySanitize = (list: RecentComparison[]) =>
      list.map((item) => ({ ...item, path: stripHiddenCompareParamsFromPath(item.path, hidden) }));

    const before = safeReadItems();
    const parsed = applySanitize(before);
    if (JSON.stringify(before) !== JSON.stringify(parsed)) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }

    if (!enabled) {
      setItems(parsed);
      return;
    }

    const cleanPath = stripHiddenCompareParamsFromPath(currentPath, hidden);
    const nextItems = [
      { path: cleanPath, label: currentLabel, savedAt: new Date().toISOString() },
      ...parsed.filter((item) => item.path !== cleanPath),
    ].slice(0, 5);

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
    setItems(nextItems);
  }, [currentLabel, currentPath, enabled, hidden]);

  function safeReadItems() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as RecentComparison[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function clearItems() {
    window.localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  }

  if (items.length === 0) return null;

  return (
    <div className="print:hidden rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-500 mb-1">
            Recent Comparisons
          </p>
          <h2 className="text-lg font-bold text-foreground font-display flex items-center gap-2">
            <History className="h-4 w-4 text-brand-500" />
            Resume a recently viewed setup
          </h2>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={clearItems}>
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Clear History
        </Button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Link
            key={`${item.path}-${item.savedAt}`}
            href={item.path}
            className="rounded-lg border border-border bg-background px-4 py-3 hover:border-brand-300 transition-colors"
          >
            <p className="text-sm font-semibold text-foreground line-clamp-2">{item.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Saved {new Date(item.savedAt).toLocaleString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
