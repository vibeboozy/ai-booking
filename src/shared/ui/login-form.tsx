/**
 * ANCHOR: shared
 * PURPOSE: Login form — credentials, Google OAuth, dev quick-login.
 * Dependencies: @/shared/actions/auth, @/shared/ui.
 */

'use client';

import { useActionState } from 'react';

import {
  devLoginAction,
  googleLoginAction,
  loginAction,
  type LoginState,
} from '@/shared/actions/auth';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

type LoginFormProps = {
  callbackUrl: string;
  googleEnabled: boolean;
};

const initialState: LoginState = {};

export function LoginForm({ callbackUrl, googleEnabled }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Вход в TripVibe</CardTitle>
        <CardDescription>
          Войдите, чтобы бронировать жильё и управлять поездками
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </div>

          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? 'Вход…' : 'Войти'}
          </Button>
        </form>

        {googleEnabled && (
          <form action={googleLoginAction}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <Button type="submit" variant="outline" className="w-full">
              Войти через Google
            </Button>
          </form>
        )}

        {process.env.NODE_ENV === 'development' && (
          <form action={devLoginAction}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <Button type="submit" variant="secondary" className="w-full">
              Dev: быстрый вход (dev@tripvibe.dev)
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
