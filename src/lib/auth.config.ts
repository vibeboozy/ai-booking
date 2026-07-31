/**
 * ANCHOR: shared
 * PURPOSE: Edge-compatible часть конфигурации NextAuth (middleware).
 * Dependencies: next-auth, @/shared/constants/urls.
 */

import type { NextAuthConfig } from 'next-auth';
import { URL } from '@/shared/constants/urls';

export const authConfig = {
  pages: {
    signIn: URL.LOGIN,
  },
  session: {
    strategy: 'jwt',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const isProtected =
        request.nextUrl.pathname.startsWith('/profile') ||
        request.nextUrl.pathname.startsWith('/checkout');

      if (isProtected) {
        return isLoggedIn;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
