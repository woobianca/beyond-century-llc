import type { Locale } from './locales';
import { zh } from './zh';
import { en } from './en';

export type PageKey = 'home' | 'services' | 'about' | 'people' | 'contact' | 'thanks' | 'notFound';
export type ServiceId = 'accounting' | 'sec-reporting' | 'ma' | 'regulatory';

export interface Copy {
  meta: Record<PageKey, { title: string; description: string }>;
  nav: { home: string; services: string; about: string; people: string; contact: string; menu: string; careers: string };
  brand: { wordmark: string; wordmarkSub: string; legalName: string };
  home: {
    eyebrow: string; headline: string; lede: string; ctaPrimary: string; ctaSecondary: string;
    facts: { value: string; label: string }[]; servicesHeading: string; servicesSub: string;
    quote: string; quoteName: string; quoteTitle: string; contactPrompt: string;
  };
  services: {
    heading: string; intro: string;
    items: { id: ServiceId; title: string; summary: string; body: string[] }[];
  };
  about: { heading: string; sections: { heading: string; body: string[] }[] };
  people: { heading: string; intro: string; joinHeading: string; joinIntro: string; location: string; howToApply: string };
  contact: {
    heading: string; intro: string;
    form: { name: string; phone: string; email: string; message: string; submit: string };
    offices: { us: string; cn: string; phone: string; email: string };
  };
  thanks: { heading: string; body: string; back: string };
  notFound: { heading: string; body: string };
  footer: { rights: string };
}

const COPY: Record<Locale, Copy> = { zh, en };

export function getCopy(l: Locale): Copy {
  return COPY[l];
}
