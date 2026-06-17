/**
 * ANCHOR: search
 * PURPOSE: Single-select toggle buttons for property type.
 */

'use client';

import { PROPERTY_TYPES, PROPERTY_TYPE_LABELS } from '@/shared/constants/propertyTypes';
import type { PropertyType } from '@/shared/types/listing';

export function PropertyTypeToggles({
  selected,
  onChange,
}: {
  selected?: PropertyType;
  onChange: (type: PropertyType | undefined) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PROPERTY_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => {
            console.log('[search][SearchFilters][PROPERTY_TYPE_TOGGLE][DECISION]', {
              current: selected,
              clicked: type,
            });
            if (selected === type) {
              onChange(undefined);
            } else {
              onChange(type);
            }
          }}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selected === type
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {PROPERTY_TYPE_LABELS[type]}
        </button>
      ))}
    </div>
  );
}