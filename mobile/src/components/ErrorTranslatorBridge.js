import { useTranslations } from 'use-intl';
import { setErrorTranslator } from '../lib/errors';

// Registers an "Errors" namespace translator with the API client so server
// error codes can be localized. Rendered inside the IntlProvider.
export function ErrorTranslatorBridge() {
  const t = useTranslations('Errors');
  // Register during render so calls fired right after mount are covered.
  setErrorTranslator((code) => (t.has(code) ? t(code) : null));
  return null;
}
