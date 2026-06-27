const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://subscree.app';

// Served at /llms.txt — see https://llmstxt.org/
export function GET() {
    const body = `# Subscree

> Subscree is a subscription tracker that helps you manage all your recurring subscriptions in one place. Track exactly what you spend, see when renewals hit, get reminders before payments are due, and decide what to cancel. Available on web, iOS, and Android. Free to start, privacy-focused, open source, and self-hostable.

## Pages

- [Home](${siteUrl}): Product overview, features, and how it works.
- [Sign up](${siteUrl}/register): Create a free Subscree account.
- [Sign in](${siteUrl}/login): Log in to an existing account.
- [Privacy Policy](${siteUrl}/privacy): How Subscree collects, uses, and protects your data.
- [Terms of Use](${siteUrl}/terms): The terms governing use of the website and mobile apps.
- [Delete account](${siteUrl}/delete-account): Request deletion of your account and data.

## Features

- Track everything: streaming, SaaS, memberships, and any other recurring subscription.
- Spending overview: see your monthly total at a glance, grouped by category and billing cycle.
- Renewal reminders: alerts before and on the day a payment is due, delivered each morning in your timezone.
- Multi-currency: mix currencies freely; everything is converted into your preferred currency for a true total.
- Team sharing: invite colleagues or family to a shared team where everyone sees the same subscriptions and gets their own reminders.
- Private and secure: your data is yours — no ads, never sold, self-hostable.

## Resources

- [GitHub repository](https://github.com/subscree/subscree): Open-source source code and self-hosting instructions.
- [Sitemap](${siteUrl}/sitemap.xml): Full list of indexable pages.
`;

    return new Response(body, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        },
    });
}
