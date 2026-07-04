import Script from 'next/script';

/**
 * Reusable JSON-LD injector. Renders <script type="application/ld+json">.
 * Use server-side (don't wrap in 'use client') so it's part of the SSR HTML
 * payload and crawlers see it on first request.
 */
export function JsonLd({ id, data }: { id: string; data: Record<string, unknown> }) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://setupfx24.com';

/** Schema.org Organization — render once per site, ideally in root layout. */
export function OrganizationLd() {
  return (
    <JsonLd
      id="ld-org"
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'SetupFX',
        legalName: 'SetupFX Softtech (OPC) Private Limited',
        url: SITE_URL,
        logo: `${SITE_URL}/images/setupfx-bgremoved.png`,
        image: `${SITE_URL}/og-image.png`,
        description:
          'SetupFX is a complete trading ecosystem: forex, CFDs, crypto, capital funding, IB partnership, and copy trading — under one regulated platform.',
        sameAs: [
          'https://twitter.com/setupfx',
          'https://www.linkedin.com/company/setupfx',
          'https://www.facebook.com/setupfx',
          'https://www.instagram.com/setupfx',
        ],
        contactPoint: [
          {
            '@type': 'ContactPoint',
            email: 'support@setupfx24.com',
            contactType: 'customer support',
            availableLanguage: ['English'],
          },
        ],
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'GB',
          addressLocality: 'Glasgow',
          streetAddress: 'Office 9364hn 3 Fitzroy Place, Sauchiehall Street',
          postalCode: 'G3 7RH',
        },
      }}
    />
  );
}

/** Schema.org WebSite + SearchAction — render once per site, in root layout. */
export function WebsiteLd() {
  return (
    <JsonLd
      id="ld-website"
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'SetupFX',
        description:
          'Trade smarter. Fund faster. Grow globally — forex, CFDs, crypto, copy trading, IB, and capital funding.',
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en-US',
      }}
    />
  );
}

/** Schema.org FAQPage — pass an array of {q, a} pairs. */
export function FaqLd({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <JsonLd
      id="ld-faq"
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((it) => ({
          '@type': 'Question',
          name: it.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: it.a,
          },
        })),
      }}
    />
  );
}

/** Schema.org BreadcrumbList — pass list of {name, url} segments in order. */
export function BreadcrumbLd({ items }: { items: Array<{ name: string; url: string }> }) {
  return (
    <JsonLd
      id="ld-breadcrumb"
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((it, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: it.name,
          item: it.url.startsWith('http') ? it.url : `${SITE_URL}${it.url}`,
        })),
      }}
    />
  );
}
