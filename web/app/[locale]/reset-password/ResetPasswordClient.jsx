'use client';

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { resetPassword } from "@/lib/api";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

function ResetPasswordForm() {
    const t = useTranslations('Auth');
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') ?? '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
            setError(t('fillAllFields'));
            return;
        }
        if (password !== confirmPassword) {
            setError(t('passwordsDoNotMatch'));
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await resetPassword(token, password);
            setDone(true);
            setTimeout(() => router.push('/login'), 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="flex flex-col gap-4">
                <Alert variant="destructive">
                    <AlertTitle>{t('error')}</AlertTitle>
                    <AlertDescription>{t('resetMissingToken')}</AlertDescription>
                </Alert>
                <Link href="/forgot-password" className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {t('forgotTitle')}
                </Link>
            </div>
        );
    }

    if (done) {
        return (
            <Alert>
                <AlertTitle>{t('resetDoneTitle')}</AlertTitle>
                <AlertDescription>{t('resetDoneDescription')}</AlertDescription>
            </Alert>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <FieldGroup>
                <FieldSet>
                    <FieldLegend>{t('resetTitle')}</FieldLegend>
                    <FieldDescription>{t('resetDescription')}</FieldDescription>
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>{t('error')}</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="input-password">{t('newPassword')}</FieldLabel>
                            <Input
                                id="input-password" type="password" minLength={8}
                                value={password} onChange={e => setPassword(e.target.value)}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="input-confirm">{t('confirmPassword')}</FieldLabel>
                            <Input
                                id="input-confirm" type="password" minLength={8}
                                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </Field>
                    </FieldGroup>
                </FieldSet>
            </FieldGroup>
            <Button type="submit" disabled={loading} className="mt-4 w-full">
                {loading ? t('resetting') : t('resetButton')}
            </Button>
            <Link href="/login" className="block text-center mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('backToLogin')}
            </Link>
        </form>
    );
}

export function ResetPasswordClient() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md p-8 border rounded-lg">
                <Suspense fallback={null}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
