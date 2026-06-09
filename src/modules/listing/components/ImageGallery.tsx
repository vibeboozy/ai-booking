/**
 * ANCHOR: listing
 * PURPOSE: Галерея фото: hero + thumbnails, lightbox со swipe/arrows.
 * Dependencies: next/image.
 * CRITICAL: Lazy loading, blur placeholder; keyboard navigation in lightbox.
 *
 * DO:
 * - Сохранять порядок images[] из БД
 * DONT:
 * - raw <img> без next/image optimization
 */

type ImageGalleryProps = {
  images: string[];
  title: string;
};

export function ImageGallery(_props: ImageGalleryProps) {
  return null;
}
