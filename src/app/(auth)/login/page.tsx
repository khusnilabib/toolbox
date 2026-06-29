// src/app/(auth)/login/page.tsx — Login page (server component shell).

import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your Toolbox account to track tools, history, and favorites.',
};

export default function LoginPage() {
  return <LoginForm />;
}
