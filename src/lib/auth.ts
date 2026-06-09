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

export {};
