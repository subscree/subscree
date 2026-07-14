import { routing } from '@/i18n/routing';
import { localizedUrl } from '@/lib/seo';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://subscree.app';

const PAGES = [
    { path: '', changeFrequency: 'monthly', priority: 1 },
    { path: '/register', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/login', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/delete-account', changeFrequency: 'yearly', priority: 0.2 },
];

export default function sitemap() {
    const lastModified = new Date();

    const alternates = (path) => ({
        languages: Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(path, l)])),
    });

    const entries = PAGES.flatMap(({ path, changeFrequency, priority }) =>
        routing.locales.map((locale) => ({
            url: localizedUrl(path, locale),
            lastModified,
            changeFrequency,
            priority,
            alternates: alternates(path),
        }))
    );

    entries.push({ url: `${siteUrl}/llms.txt`, lastModified, changeFrequency: 'monthly', priority: 0.2 });

    return entries;
}
