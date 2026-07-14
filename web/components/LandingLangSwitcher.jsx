'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

// Locale is resolved from the URL (see middleware.js / i18n/routing.js).
// Switching navigates to the same page under the target locale's prefix.
const LOCALES = ['en', 'uk'];

export function LandingLangSwitcher() {
    const active = useLocale();
    const pathname = usePathname();
    const router = useRouter();

    return (
        <div className="flex items-center rounded-full border p-0.5" role="group" aria-label="Language">
            {LOCALES.map(locale => (
                <button
                    key={locale}
                    type="button"
                    onClick={() => locale !== active && router.replace(pathname, { locale })}
                    aria-pressed={locale === active}
                    className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-medium uppercase transition-colors',
                        locale === active
                            ? 'bg-foreground text-background'
                            : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    {locale}
                </button>
            ))}
        </div>
    );
}
