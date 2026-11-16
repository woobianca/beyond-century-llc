import type { Localized } from '../i18n/locales';

export interface Person { order: number; photo: string; name: Localized; title: Localized; bio: Localized<string[]> }
export interface Job { title: Localized; location: Localized; description: Localized<string[]>; howToApply: Localized<string[]> }
export interface ContactFacts { usAddress: Localized; cnAddress: Localized; phone: Localized; email: Localized }
export interface SiteData { people: Person[]; jobs: Job[]; contact: ContactFacts }
export type RawTabs = { people: string; jobs: string; contact: string };
