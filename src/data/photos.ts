import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/people/*.{png,jpg,jpeg,webp}', { eager: true });
const byName = new Map(Object.entries(files).map(([p, mod]) => [p.split('/').pop()!, mod.default]));
const warned = new Set<string>();

/** Portrait for a Sheet "photo" value: exact file name first, then case-insensitive; null if none. */
export function resolvePhoto(fileName: string): ImageMetadata | null {
  const name = fileName.trim();
  if (!name) return null;
  const exact = byName.get(name);
  if (exact) return exact;
  for (const [file, img] of byName) if (file.toLowerCase() === name.toLowerCase()) return img;
  if (!warned.has(name)) {
    warned.add(name);
    console.warn(`People photo not found: ${name}`);
  }
  return null;
}
