/**
 * ANCHOR: search
 * PURPOSE: Shows active filter count with reset button.
 */

const FILTER_LABEL_SINGULAR = 'фильтр';
const FILTER_LABEL_PLURAL = 'фильтра';
const RESET_BUTTON_TEXT = 'Сбросить';

export function ActiveFilterBadges({
  count,
  onReset,
}: {
  count: number;
  onReset: () => void;
}) {
  if (count === 0) return null;

  const filterLabel = count === 1 ? FILTER_LABEL_SINGULAR : FILTER_LABEL_PLURAL;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {count} {filterLabel}
      </span>
      <button
        type="button"
        onClick={onReset}
        className="text-sm text-primary hover:underline"
      >
        {RESET_BUTTON_TEXT}
      </button>
    </div>
  );
}