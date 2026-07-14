import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

function splitLocale(pathname) {
    const [, maybe, ...rest] = pathname.split('/');
    if (routing.locales.includes(maybe)) return { locale: maybe, rest: '/' + rest.join('/') };
    return { locale: routing.defaultLocale, rest: pathname };
}

export default function middleware(request) {
    const { pathname } = request.nextUrl;
    const { locale, rest } = splitLocale(pathname);
    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
    const token = request.cookies.get('token');

    const isAuthPage = rest === '/login' || rest === '/register';
    const isDashboard = rest === '/dashboard' || rest.startsWith('/dashboard/');

    if (isAuthPage && token) {
        return NextResponse.redirect(new URL(`${prefix}/dashboard`, request.url));
    }

    if (isDashboard && !token) {
        return NextResponse.redirect(new URL(`${prefix}/login`, request.url));
    }

    return handleI18nRouting(request);
}

export const config = {
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
