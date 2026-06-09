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

export default function LoginPage() {
  return (
    <main>
      <h1>Вход</h1>
      {/* TODO: sign-in form / OAuth buttons */}
    </main>
  );
}
