import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = credentials.email as string;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        // If passwordHash is set, verify; otherwise allow mock login.
        if (user.passwordHash) {
          const password =
            typeof credentials?.password === 'string'
              ? credentials.password
              : '';
          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;
        }
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatarUrl,
        };
      },
    }),
    // Google OAuth – requires env vars, will work in production.
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      // Attach user id to session for server components.
      if (session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.sub = (user as any).id;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
};

const handlers = NextAuth(authOptions).handlers;
export const GET = process.env.NODE_ENV === 'test' ? undefined : handlers.GET;
export const POST = process.env.NODE_ENV === 'test' ? undefined : handlers.POST;
