'use client';

import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

// Locale is a `locale` cookie read server-side by next-intl (see i18n/request.js).
// Switching sets the cookie and reloads so the server re-renders in the new language.
const LOCALES = ['en', 'uk'];

function setLocale(locale) {
    document.cookie = `locale=${locale}; path=/; max-age=31536000`;
    window.location.reload();
}

export function LandingLangSwitcher() {
    const active = useLocale();

    return (
        <div className="flex items-center rounded-full border p-0.5" role="group" aria-label="Language">
            {LOCALES.map(locale => (
                <button
                    key={locale}
                    type="button"
                    onClick={() => locale !== active && setLocale(locale)}
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
