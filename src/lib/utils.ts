import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes a URL to prevent XSS attacks via javascript: URIs.
 * Only allows http:// and https:// protocols.
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return "#";

  const trimmedUrl = url.trim();
  const lowerUrl = trimmedUrl.toLowerCase();

  if (lowerUrl.startsWith("http://") || lowerUrl.startsWith("https://")) {
    return trimmedUrl;
  }

  return "#";
}
