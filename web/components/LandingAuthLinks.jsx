'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

// Cookie is only readable client-side, so logged-in state starts false (matching
// the server-rendered markup) and flips after mount — same pattern as the
// isLoggedIn() check in the invite flow.
function useIsLoggedIn() {
    const [loggedIn, setLoggedIn] = useState(false);
    useEffect(() => {
        setLoggedIn(document.cookie.split('; ').some(r => r.startsWith('token=')));
    }, []);
    return loggedIn;
}

export function HeaderAuthLinks() {
    const loggedIn = useIsLoggedIn();
    const tAuth = useTranslations('Auth');
    const tInvite = useTranslations('Invite');

    if (loggedIn) {
        return (
            <Link href="/dashboard" className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90">
                {tInvite('toDashboard')}
            </Link>
        );
    }

    return (
        <>
            <Link href="/login" className="hidden px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline">
                {tAuth('login')}
            </Link>
            <Link href="/register" className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90">
                {tAuth('register')}
            </Link>
        </>
    );
}

export function FooterAuthLink() {
    const loggedIn = useIsLoggedIn();
    const tAuth = useTranslations('Auth');
    const tInvite = useTranslations('Invite');

    return (
        <Link href={loggedIn ? '/dashboard' : '/login'} className="transition-colors hover:text-foreground">
            {loggedIn ? tInvite('toDashboard') : tAuth('login')}
        </Link>
    );
}
