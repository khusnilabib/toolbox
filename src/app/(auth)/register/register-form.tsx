// src/app/(auth)/register/register-form.tsx — Email/password register form + Google OAuth.

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signUpWithEmail, signInWithGoogle } from '@/identity/actions/auth-actions';
import { isSupabaseConfigured } from '@/shared/config/env';
import { routes } from '@/shared/config/routes';

const registerSchema = z
  .object({
    email: z.string().email('Enter a valid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirm: z.string().min(6, 'Password must be at least 6 characters.'),
  })
  .refine((v) => v.password === v.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match.',
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [googlePending, startGoogle] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirm: '' },
  });

  const onSubmit = (values: RegisterValues) => {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const result = await signUpWithEmail(values.email, values.password);
      if (!result.success) {
        setError(result.error ?? 'Could not create account.');
        return;
      }
      if (result.error) {
        // Email confirmation required.
        setInfo(result.error);
        return;
      }
      router.push(routes.dashboard);
      router.refresh();
    });
  };

  const onGoogle = () => {
    setError(null);
    setInfo(null);
    startGoogle(async () => {
      const result = await signInWithGoogle();
      if (!result.success) {
        setError(result.error ?? 'Could not start Google sign-in.');
        return;
      }
      if (result.url) {
        window.location.assign(result.url);
      }
    });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>
          Free and takes a minute. You can keep using every tool as a guest if you prefer.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!configured ? (
          <Alert>
            <AlertDescription>
              Authentication is not configured on this deployment. You can still browse and use
              every tool as a guest.
            </AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {info ? (
          <Alert>
            <AlertDescription>{info}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!form.formState.errors.email}
              {...form.register('email')}
            />
            {form.formState.errors.email ? (
              <p className="text-xs text-destructive" role="alert">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              aria-invalid={!!form.formState.errors.password}
              {...form.register('password')}
            />
            {form.formState.errors.password ? (
              <p className="text-xs text-destructive" role="alert">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              aria-invalid={!!form.formState.errors.confirm}
              {...form.register('confirm')}
            />
            {form.formState.errors.confirm ? (
              <p className="text-xs text-destructive" role="alert">
                {form.formState.errors.confirm.message}
              </p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={pending || !configured}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
            {pending ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <div className="relative" aria-hidden>
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onGoogle}
          disabled={googlePending || !configured}
        >
          {googlePending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <GoogleIcon className="mr-2 h-4 w-4" aria-hidden />
          )}
          {googlePending ? 'Redirecting…' : 'Continue with Google'}
        </Button>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href={routes.login} className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  );
}
