const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://subscree.app';

export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            // The app itself is auth-gated and has nothing to index.
            disallow: ['/dashboard', '/api'],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
    };
}
