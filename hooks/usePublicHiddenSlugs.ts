'use client';

import { useSyncExternalStore } from 'react';

const EMPTY = new Set<string>();
let cache: Set<string> | null = null;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function load(): void {
  if (cache !== null || inFlight) return;
  inFlight = fetch('/api/catalog/hidden-slugs')
    .then((r) => r.json() as Promise<{ slugs?: string[] }>)
    .then((d) => {
      inFlight = null;
      if (cache !== null) return;
      cache = new Set(d?.slugs ?? []);
      listeners.forEach((l) => l());
    })
    .catch(() => {
      inFlight = null;
      if (cache !== null) return;
      cache = new Set();
      listeners.forEach((l) => l());
    });
}

function subscribe(onChange: () => void): () => void {
  load();
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function getSnapshot(): Set<string> {
  return cache ?? EMPTY;
}

function getServerSnapshot(): Set<string> {
  return EMPTY;
}

/**
 * When `GET /api/catalog/prices` is loaded, `publicHiddenSlugs` matches this store. Call as soon
 * as you parse that response so components using `usePublicHiddenSlugs` avoid a second request.
 */
export function hydratePublicHiddenSlugsFromCatalogApi(slugs: string[] | undefined): void {
  if (!Array.isArray(slugs)) return;
  cache = new Set(slugs);
  listeners.forEach((l) => l());
}

/**
 * D1 `product_settings` rows with `isActive = 0`, shared across the page after one fetch.
 * Fails open (empty) until the request completes, `hydratePublicHiddenSlugsFromCatalogApi` runs, or on error.
 */
export function usePublicHiddenSlugs(): Set<string> {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
