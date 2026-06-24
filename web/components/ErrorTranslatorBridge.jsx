'use client';

import { useTranslations } from 'next-intl';
import { setErrorTranslator } from '@/lib/errors';

// Registers an "Errors" namespace translator with the API client so server
// error codes can be localized. Rendered inside NextIntlClientProvider.
export function ErrorTranslatorBridge() {
    const t = useTranslations('Errors');
    // Register during render so calls fired right after mount are covered.
    setErrorTranslator((code) => (t.has(code) ? t(code) : null));
    return null;
}
