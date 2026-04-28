import { NextResponse } from 'next/server';

/** Standard client-parseable error payload from App Router `route.ts` handlers. */
export type ApiErrorJson = { error: string } & Record<string, unknown>;

type ApiErrorBody = { error: string } & Record<string, unknown>;

/** Consistent JSON error shape for App Router API routes. Optional `extra` merges after `error` (e.g. `detail`). */
export function apiJsonError(
  message: string,
  status: number,
  extra?: Record<string, unknown>
): NextResponse {
  const body: ApiErrorBody = extra ? { error: message, ...extra } : { error: message };
  return NextResponse.json(body, { status });
}
