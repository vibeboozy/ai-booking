/**
 * ANCHOR: shared
 * PURPOSE: Конфигурация NextAuth.js v5 (Auth.js): providers, callbacks, session.
 * Dependencies: next-auth, @/lib/prisma.
 * CRITICAL: Protected routes проверяют session через auth() helper.
 *
 * DO:
 * - Экспортировать auth(), signIn, signOut handlers
 * DONT:
 * - Хранить passwordHash или sensitive data в JWT/session
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { compare } from 'bcryptjs';
import { z } from 'zod';

import { authConfig } from '@/lib/auth.config';
import { env, isGoogleOAuthEnabled } from '@/lib/env';
import { prisma } from '@/lib/prisma';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const valid = await compare(parsed.data.password, user.passwordHash);
        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl ?? undefined,
        };
      },
    }),
    ...(isGoogleOAuthEnabled
      ? [
          Google({
            clientId: env.GOOGLE_CLIENT_ID!,
            clientSecret: env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
});
