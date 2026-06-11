/**
 * ANCHOR: shared
 * PURPOSE: Route /login — вход (NextAuth).
 * Dependencies: @/lib/auth.
 *
 * DO:
 * - Support callbackUrl query param
 * DONT:
 * - Custom auth without NextAuth
 */

import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { isGoogleOAuthEnabled } from '@/lib/env';
import { LoginForm } from '@/shared/ui/login-form';

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  const safeCallbackUrl =
    callbackUrl?.startsWith('/') && !callbackUrl.startsWith('//')
      ? callbackUrl
      : '/profile';

  if (session?.user) {
    redirect(safeCallbackUrl);
  }

  return (
    <main className="container flex min-h-[calc(100vh-8rem)] items-center py-12">
      <LoginForm
        callbackUrl={safeCallbackUrl}
        googleEnabled={isGoogleOAuthEnabled}
      />
    </main>
  );
}
