/**
 * ANCHOR: search
 * PURPOSE: Shows active filter count with reset button.
 */

export function ActiveFilterBadges({
  count,
  onReset,
}: {
  count: number;
  onReset: () => void;
}) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {count} {count === 1 ? 'фильтр' : 'фильтра'}
      </span>
      <button
        type="button"
        onClick={onReset}
        className="text-sm text-primary hover:underline"
      >
        Сбросить
      </button>
    </div>
  );
}