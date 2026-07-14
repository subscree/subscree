import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/seo';
import { LoginForm } from './LoginForm';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations('Auth');
    return {
        title: t('loginTitle'),
        description: t('loginDescription'),
        alternates: buildAlternates('/login', locale),
    };
}

export default async function LoginPage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    return <LoginForm />;
}
