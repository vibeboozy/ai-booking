/**
 * ANCHOR: SEARCH_FILTERS_COMPONENT
 * PURPOSE: Фильтры поиска (цена, тип жилья, удобства) с синхронизацией в URL.
 *
 * @PreConditions:
 * - useSearchFilters hook доступен и возвращает { params, setParams, clearParams, resetFilters }
 * - shadcn компоненты: Slider, Checkbox, Button, Sheet/Dialog
 *
 * @PostConditions:
 * - При изменении фильтра → setParams вызывается с debounce 300ms (для price slider)
 * - При сбросе → resetFilters сбрасывает только price/propertyType/amenities (city/guests сохраняются)
 * - Desktop: горизонтальная панель над результатами
 * - Mobile: кнопка "Фильтры" открывает drawer
 *
 * @StateManagement:
 * - **UI state (useState):** для мгновенного отклика слайдера без лагов
 * - **Search results:** читают из URL query params через parseSearchParams
 * - Пример: слайдер обновляет local state мгновенно, но search API вызывается после debounce через URL
 *
 * @Invariants:
 * - Price slider: min PRICE_SLIDER_MIN, max PRICE_SLIDER_MAX, step PRICE_SLIDER_STEP (all in kopeks)
 * - Property type: single select (apartment | house | room), toggle on/off
 * - Amenities: multiple select (wifi, kitchen, parking)
 * - Debounce 300ms для price slider
 * - URL sync: router.push(buildSearchUrl(newParams))
 *
 * @SideEffects:
 * - Изменение URL через router.push
 *
 * @ForbiddenChanges:
 * - Нельзя убирать debounce для price slider
 */

// [START SEARCH_FILTERS_COMPONENT]
import { DesktopFilters } from './DesktopFilters';
import { MobileFilters } from './MobileFilters';

export function SearchFilters() {
  console.log('[search][SearchFilters][RENDER]');

  return (
    <div className="space-y-4">
      <DesktopFilters />
      <MobileFilters />
    </div>
  );
}
// [END SEARCH_FILTERS_COMPONENT]