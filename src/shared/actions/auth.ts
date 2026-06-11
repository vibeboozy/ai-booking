/**
 * ANCHOR: shared
 * PURPOSE: Server Actions для signIn/signOut (NextAuth).
 * Dependencies: @/lib/auth.
 */

'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

import { signIn, signOut } from '@/lib/auth';

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get('email');
  const password = formData.get('password');
  const callbackUrl = formData.get('callbackUrl');

  if (typeof email !== 'string' || typeof password !== 'string') {
    return { error: 'Заполните email и пароль' };
  }

  const redirectTo =
    typeof callbackUrl === 'string' && callbackUrl.startsWith('/')
      ? callbackUrl
      : '/profile';

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Неверный email или пароль' };
    }
    throw error;
  }

  return {};
}

export async function devLoginAction(formData: FormData): Promise<void> {
  const callbackUrl = formData.get('callbackUrl');
  const redirectTo =
    typeof callbackUrl === 'string' && callbackUrl.startsWith('/')
      ? callbackUrl
      : '/profile';

  await signIn('credentials', {
    email: 'dev@tripvibe.dev',
    password: 'devpassword',
    redirectTo,
  });
}

export async function googleLoginAction(formData: FormData): Promise<void> {
  const callbackUrl = formData.get('callbackUrl');
  const redirectTo =
    typeof callbackUrl === 'string' && callbackUrl.startsWith('/')
      ? callbackUrl
      : '/profile';

  await signIn('google', { redirectTo });
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/' });
}
