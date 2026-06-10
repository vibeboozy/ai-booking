/**
 * ANCHOR: shared
 * PURPOSE: Header component used across the app.
 * Dependencies: 'lib/auth' (see below for file content).
 *
 * DO:
 * - Render navigation links.
 * DONT:
 * - Include authentication logic here.
 */
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-primary-600 text-white py-4 px-6 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold">
        TripVibe
      </Link>
      <nav className="space-x-4">
        <Link href="/search" className="hover:underline">
          Поиск
        </Link>
        <Link href="/profile" className="hover:underline">
          Профиль
        </Link>
      </nav>
    </header>
  );
}
