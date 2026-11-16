import type { Locale } from '../i18n/locales';
import { getCopy } from '../i18n/copy';
import type { Job, Person, SiteData } from './types';

const ORIGIN = 'https://www.beyondcenturyllc.com';
const address = (text: string, country: 'US' | 'CN') => ({ '@type': 'PostalAddress', streetAddress: text, addressCountry: country });

export function organization(data: SiteData, locale: Locale) {
  const c = getCopy(locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'AccountingService',
    '@id': `${ORIGIN}/#organization`,
    name: c.brand.wordmark,
    alternateName: locale === 'zh' ? 'Beyond Century' : '卓越世纪',
    legalName: c.brand.legalName,
    url: `${ORIGIN}/${locale}/`,
    telephone: data.contact.phone.en,
    email: data.contact.email.en,
    address: [address(data.contact.usAddress[locale], 'US'), address(data.contact.cnAddress[locale], 'CN')],
    areaServed: ['US', 'CN'],
    knowsLanguage: ['zh', 'en'],
  };
}

export function person(p: Person, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: p.name[locale],
    jobTitle: p.title[locale],
    description: p.bio[locale].join(' '),
    worksFor: { '@id': `${ORIGIN}/#organization` },
  };
}

export function jobPosting(j: Job, locale: Locale, datePosted: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: j.title[locale],
    description: [...j.description[locale], ...j.howToApply[locale]].join('\n\n'),
    datePosted,
    hiringOrganization: { '@type': 'Organization', name: getCopy(locale).brand.legalName, sameAs: ORIGIN },
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', streetAddress: j.location[locale] } },
  };
}
