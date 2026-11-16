import { loadRawTabs } from './source';
import type { SiteData } from './types';
import { validateSheet } from './validate';

let cached: Promise<SiteData> | undefined;

/** Sheet data for this build, downloaded and validated once. */
export function loadSiteData(): Promise<SiteData> {
  cached ??= loadRawTabs(process.env).then(validateSheet);
  return cached;
}
