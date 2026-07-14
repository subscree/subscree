import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/seo';
import { ResetPasswordClient } from './ResetPasswordClient';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations('Auth');
    return {
        title: t('resetTitle'),
        description: t('resetDescription'),
        alternates: buildAlternates('/reset-password', locale),
    };
}

export default async function ResetPasswordPage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    return <ResetPasswordClient />;
}
