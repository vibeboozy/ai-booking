/**
 * ANCHOR: reviews
 * PURPOSE: TypeScript-типы reviews module.
 * Dependencies: none.
 */

export type ReviewInput = {
  bookingId: string;
  rating: number;
  text: string;
  photos?: string[];
};

export type ReviewPublic = {
  id: string;
  rating: number;
  text: string;
  photos: string[];
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
};
