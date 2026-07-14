import { setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/seo';
import { InviteClient } from './InviteClient';

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return { alternates: buildAlternates('/invite', locale) };
}

export default async function InvitePage({ params }) {
    const { locale } = await params;
    setRequestLocale(locale);
    return <InviteClient />;
}
