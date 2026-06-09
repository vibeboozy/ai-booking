/**
 * ANCHOR: search
 * PURPOSE: TypeScript-типы модуля search (Location для автокомплита).
 * Dependencies: none.
 */

export type Location = {
  id: string;
  name: string;
  type: 'city' | 'country';
  slug: string;
  lat?: number;
  lng?: number;
};
