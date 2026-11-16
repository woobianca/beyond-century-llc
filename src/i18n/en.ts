import type { Copy } from './copy';

export const en: Copy = {
  meta: {
    home: { title: 'Beyond Century | Financial advisory for U.S. listings', description: 'Beyond Century advises companies preparing for, and living with, a U.S. listing on SEC financial reporting, accounting, M&A and regulatory compliance.' },
    services: { title: 'Services | Beyond Century', description: 'Accounting advisory, SEC financial reporting, M&A advisory and financial regulatory advisory, from listing preparation to ongoing compliance.' },
    about: { title: 'About | Beyond Century', description: 'Beyond Century is a financial advisory firm based in Diamond Bar, California, with an office in Changsha, China, focused on Chinese companies listing in the U.S.' },
    people: { title: 'People | Beyond Century', description: 'A team of U.S. Certified Public Accountants with audit, accounting and SEC reporting experience in China and the U.S.' },
    contact: { title: 'Contact | Beyond Century', description: 'Reach our Diamond Bar, California headquarters or our Changsha office, or send an enquiry online.' },
    thanks: { title: 'Thank you | Beyond Century', description: 'Thank you for your enquiry. We will be in touch shortly.' },
    notFound: { title: 'Page not found | Beyond Century', description: 'The page you are looking for does not exist.' },
  },
  nav: { home: 'Home', services: 'Services', about: 'About', people: 'People', contact: 'Contact', menu: 'Menu', careers: 'Careers' },
  brand: { wordmark: 'Beyond Century', wordmarkSub: 'Consulting', legalName: 'Beyond Century Consulting, LLC' },
  home: {
    eyebrow: 'IPO advisory · SEC financial reporting',
    headline: 'Taking Chinese companies to U.S. capital markets',
    lede: 'Beyond Century advises companies preparing for, and living with, a U.S. listing on SEC financial reporting, accounting, M&A and regulatory compliance.',
    ctaPrimary: 'Book a consultation',
    ctaSecondary: 'Our services',
    facts: [
      { value: '25+ years', label: 'Partner experience in audit and accounting in China and the U.S.' },
      { value: 'Two offices', label: 'Diamond Bar, California · Changsha, Hunan' },
      { value: 'CPA-led', label: 'Every engagement is led by a U.S. Certified Public Accountant' },
    ],
    servicesHeading: 'Services',
    servicesSub: 'Four practices, from listing preparation to ongoing compliance.',
    quote: '“Our work is to close the gap between the Chinese and U.S. financial and tax systems.”',
    quoteName: 'Susan Woo, CPA',
    quoteTitle: 'Partner',
    contactPrompt: 'Planning a U.S. listing, or need support after one? We would be glad to talk.',
  },
  services: {
    heading: 'Services',
    intro: 'We support the whole path to a U.S. listing: the financial structure and accounting before it, the SEC filings during it, and the reporting and compliance after it.',
    items: [
      {
        id: 'accounting', title: 'Accounting advisory',
        summary: 'U.S. GAAP conversion, technical accounting for complex transactions, and accounting systems.',
        body: [
          'Acquisitions, share-based compensation and financing arrangements can move the financial statements significantly. We analyze these transactions under U.S. GAAP and SEC rules and recommend the right accounting treatment.',
          'We help companies set up accounting systems, budgets and cash flow forecasts; convert between U.S. GAAP, IFRS and Chinese accounting standards; and prepare financial statements and disclosures under U.S. GAAP or IFRS.',
        ],
      },
      {
        id: 'sec-reporting', title: 'SEC financial reporting',
        summary: 'The financial sections of a registration statement, then annual and quarterly filings.',
        body: [
          'We help companies list in the U.S. through a traditional IPO or a De-SPAC: planning the restructuring and pre-IPO work, coordinating sponsors, underwriters, auditors and law firms, and supporting prospectus drafting and due diligence.',
          'We prepare the financial content of Form S-1 or F-1, including MD&A, capitalization and dilution tables. After listing, we prepare periodic filings such as 10-K, 10-Q, 20-F and 6-K.',
        ],
      },
      {
        id: 'ma', title: 'M&A advisory',
        summary: 'Buy-side and sell-side financial due diligence, deal structure and negotiation support.',
        body: [
          'We carry out financial, tax, commercial and operational due diligence so clients understand exactly what they are buying or selling.',
          'On the buy side we help identify and acquire the right business; on the sell side we help complete the transaction at the lowest possible cost. We take part in negotiations, organize the deal team and timetable, and coordinate accountants, lawyers and valuers.',
        ],
      },
      {
        id: 'regulatory', title: 'Financial regulatory advisory',
        summary: 'Meeting SEC rules, Sarbanes-Oxley (SOX 404) and internal control requirements.',
        body: [
          'SEC requirements for listed companies are extensive. We help companies understand the rules and procedures and complete the filings that let them operate normally in U.S. markets.',
          'We provide Sarbanes-Oxley (SOX 404) compliance services, assess, design and implement internal controls, and can step in as interim CFO or controller when those roles are vacant.',
        ],
      },
    ],
  },
  about: {
    heading: 'About',
    sections: [
      {
        heading: 'Financial work between China and the U.S.',
        body: [
          'Beyond Century is a financial advisory firm headquartered in Diamond Bar, California, with an office in Changsha, Hunan. We provide accounting advisory, M&A advisory and U.S. listing services to companies in China and elsewhere, especially Chinese companies.',
          'Our team is led by U.S. Certified Public Accountants who know both countries’ reporting standards and regulators, and who can bridge the two systems for our clients.',
        ],
      },
      {
        heading: 'A network of trusted partners',
        body: [
          'For needs beyond our own practice, we work with long-standing partners in audit, tax, law, investment advisory and private equity, so clients can get everything they need in one place.',
        ],
      },
      {
        heading: 'Our mission',
        body: [
          'To be the financial advisor our clients trust most, and to hold everything we do to the highest standard.',
        ],
      },
    ],
  },
  people: {
    heading: 'People',
    intro: 'Our team are U.S. Certified Public Accountants with public company audit, accounting and SEC reporting experience in China and the U.S.',
    joinHeading: 'Join us',
    joinIntro: 'We are hiring for the following roles.',
    location: 'Location',
    howToApply: 'How to apply',
  },
  contact: {
    heading: 'Contact',
    intro: 'Leave your details and a short note about what you need, and we will reply shortly.',
    form: { name: 'Name', phone: 'Phone', email: 'Email', message: 'How can we help?', submit: 'Send enquiry' },
    offices: { us: 'U.S. headquarters', cn: 'China office', phone: 'Phone', email: 'Email' },
  },
  thanks: { heading: 'Thank you', body: 'We have received your enquiry and will be in touch shortly.', back: 'Back to home' },
  notFound: { heading: 'Page not found', body: 'The page you are looking for does not exist or has moved.' },
  footer: { rights: 'All rights reserved.' },
};
