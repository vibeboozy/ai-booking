/**
 * ANCHOR: search
 * PURPOSE: Layout wrapper for filter sections.
 */

export function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {children}
    </div>
  );
}
