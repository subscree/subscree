'use client';

import { useState } from "react";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import { forgotPassword } from "@/lib/api";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
    const t = useTranslations('Auth');

    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError(t('emailRequired'));
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await forgotPassword(email);
            setSent(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md p-8 border rounded-lg">
                {sent ? (
                    <div className="flex flex-col gap-4">
                        <Alert>
                            <AlertTitle>{t('forgotSentTitle')}</AlertTitle>
                            <AlertDescription>{t('forgotSentDescription')}</AlertDescription>
                        </Alert>
                        <Link href="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                            {t('backToLogin')}
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            <FieldSet>
                                <FieldLegend>{t('forgotTitle')}</FieldLegend>
                                <FieldDescription>{t('forgotDescription')}</FieldDescription>
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertTitle>{t('error')}</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="input-email">{t('email')}</FieldLabel>
                                        <Input
                                            id="input-email" type="email"
                                            value={email} onChange={e => setEmail(e.target.value)}
                                        />
                                    </Field>
                                </FieldGroup>
                            </FieldSet>
                        </FieldGroup>
                        <Button type="submit" disabled={loading} className="mt-4 w-full">
                            {loading ? t('sending') : t('sendResetLink')}
                        </Button>
                        <Link href="/login" className="block text-center mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            {t('backToLogin')}
                        </Link>
                    </form>
                )}
            </div>
        </div>
    );
}
