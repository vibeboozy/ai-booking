/**
 * ANCHOR: shared
 * PURPOSE: Footer component used across the app.
 * Dependencies: 'lib/auth' (see below for file content).
 *
 * DO:
 * - Render footer information.
 * DONT:
 * - Include authentication logic here.
 */
export default function Footer() {
  return (
    <footer className="bg-gray-100 text-center py-4 mt-8">
      <p className="text-sm text-gray-600">
        © 2026 TripVibe. Все права защищены.
      </p>
    </footer>
  );
}
