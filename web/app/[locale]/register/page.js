import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/seo';
import { RegisterForm } from './RegisterForm';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations('Auth');
    return {
        title: t('registerTitle'),
        description: t('registerDescription'),
        alternates: buildAlternates('/register', locale),
    };
}

export default async function RegisterPage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    return <RegisterForm />;
}
