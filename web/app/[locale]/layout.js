import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Analytics } from "@/components/providers/Analytics";
import { ErrorTranslatorBridge } from "@/components/ErrorTranslatorBridge";
import { routing } from "@/i18n/routing";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Absolute base for canonical/OG URLs. Override per environment.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://subscree.app";

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "Subscree — Track all your subscriptions in one place",
        template: "%s · Subscree",
    },
    description: "Track every subscription, see your real monthly spend, and get reminded before each renewal.",
    applicationName: "Subscree",
    keywords: [
        "subscription tracker", "subscription manager", "recurring payments",
        "renewal reminders", "spending tracker", "subscriptions",
    ],
    openGraph: {
        type: "website",
        siteName: "Subscree",
        url: "/",
        title: "Subscree — Track all your subscriptions in one place",
        description: "Track every subscription, see your real monthly spend, and get reminded before each renewal.",
        images: [{ url: "/og.png", width: 1200, height: 630, alt: "Subscree" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Subscree — Track all your subscriptions in one place",
        description: "Track every subscription, see your real monthly spend, and get reminded before each renewal.",
        images: ["/og.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    other: {
        "apple-itunes-app": "app-id=6783733155",
    },
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

// Force per-request rendering: the analytics <Script> tags below read
// UMAMI_SCRIPT_URL / UMAMI_WEBSITE_ID / GA_MEASUREMENT_ID from process.env, and
// this layout is otherwise eligible for static generation (setRequestLocale +
// generateStaticParams above). Without this, Next prerenders it at `next build`
// time — before docker-compose injects those env vars at container start — and
// bakes the "unconfigured" branch into the static HTML, silently disabling both
// GA4 and Umami in production.
export const dynamic = 'force-dynamic';

export default async function RootLayout({ children, params }) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) notFound();

    // Enables static rendering for this locale in nested Server Components.
    setRequestLocale(locale);

    const messages = await getMessages();

    // Read at request time (this layout renders dynamically via next-intl), so
    // the same standalone build/image works in any environment — see the /api
    // proxy for the same runtime-config approach.
    const umamiSrc       = process.env.UMAMI_SCRIPT_URL;
    const umamiWebsiteId = process.env.UMAMI_WEBSITE_ID;
    const gaMeasurementId = process.env.GA_MEASUREMENT_ID;

    return (
        <html
            lang={locale}
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
            suppressHydrationWarning
        >
            <body className="h-full bg-background text-foreground" suppressHydrationWarning>
                <ThemeProvider>
                    <NextIntlClientProvider locale={locale} messages={messages}>
                        <ErrorTranslatorBridge />
                        {gaMeasurementId && <Analytics />}
                        {children}
                    </NextIntlClientProvider>
                </ThemeProvider>
                {umamiSrc && umamiWebsiteId && (
                    <Script
                        src={umamiSrc}
                        data-website-id={umamiWebsiteId}
                        strategy="afterInteractive"
                    />
                )}
                {gaMeasurementId && (
                    <>
                        <Script
                            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
                            strategy="afterInteractive"
                        />
                        <Script id="ga-init" strategy="afterInteractive">
                            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
// send_page_view:false — page_view is sent manually on every route change by
// the Analytics provider so SPA navigations are tracked (and not double-counted).
gtag('config', '${gaMeasurementId}', { send_page_view: false });`}
                        </Script>
                    </>
                )}
            </body>
        </html>
    );
}
