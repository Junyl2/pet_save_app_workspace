import { AxiosHeaders, type AxiosRequestConfig } from 'axios';

/**
 * Make sure headers are an AxiosHeaders instance so we can use set/get/delete safely.
 */
export function ensureAxiosHeaders(
  headers: AxiosRequestConfig['headers']
): AxiosHeaders {
  if (headers instanceof AxiosHeaders) {
    return headers;
  }
  // Convert to a plain object that AxiosHeaders.from can handle
  const plainHeaders = headers as Record<string, string> | undefined;
  return AxiosHeaders.from(plainHeaders ?? {});
}

/**
 * Get a header in a case-insensitive way (returns undefined if missing)
 */
export function getHeader(
  headers: AxiosHeaders,
  key: string
): string | undefined {
  const v = headers.get(key);
  return typeof v === 'string' ? v : undefined;
}
