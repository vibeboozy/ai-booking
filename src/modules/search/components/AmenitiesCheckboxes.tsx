/**
 * ANCHOR: search
 * PURPOSE: Multi-select checkboxes for amenities.
 */

'use client';

import { AMENITIES, AMENITY_LABELS } from '@/shared/constants/amenities';
import { Checkbox } from '@/components/ui/checkbox';

export function AmenitiesCheckboxes({
  selected,
  onChange,
}: {
  selected?: string[];
  onChange: (amenities: string[]) => void;
}) {
  const handleChange = (amenity: string, checked: boolean) => {
    console.log('[search][SearchFilters][AMENITY_CHANGE][DECISION]', {
      amenity,
      checked,
      current: selected,
    });
    const current = selected ?? [];
    if (checked) {
      onChange([...current, amenity]);
    } else {
      onChange(current.filter((a) => a !== amenity));
    }
  };

  return (
    <div className="space-y-2">
      {AMENITIES.map((amenity) => (
        <Checkbox
          key={amenity}
          id={`amenity-${amenity}`}
          checked={selected?.includes(amenity) ?? false}
          onCheckedChange={(checked: boolean) => handleChange(amenity, checked)}
          label={<span className="text-sm">{AMENITY_LABELS[amenity]}</span>}
        />
      ))}
    </div>
  );
}