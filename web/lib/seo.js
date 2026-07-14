import { routing } from '@/i18n/routing';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://subscree.app';

// Builds the absolute URL for `path` (locale-agnostic, e.g. '/privacy' or '')
// in the given locale, honoring the "as-needed" prefix (default locale unprefixed).
export function localizedUrl(path, locale) {
    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
    return `${siteUrl}${prefix}${path}`;
}

// Canonical + hreflang alternates for a page, to spread into generateMetadata's
// `alternates` field.
export function buildAlternates(path, locale) {
    return {
        canonical: localizedUrl(path, locale),
        languages: {
            ...Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(path, l)])),
            'x-default': localizedUrl(path, routing.defaultLocale),
        },
    };
}
