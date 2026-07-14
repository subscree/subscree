import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/seo';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations('Auth');
    return {
        title: t('forgotTitle'),
        description: t('forgotDescription'),
        alternates: buildAlternates('/forgot-password', locale),
    };
}

export default async function ForgotPasswordPage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    return <ForgotPasswordForm />;
}
