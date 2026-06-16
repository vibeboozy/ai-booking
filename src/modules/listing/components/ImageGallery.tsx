'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

type ImageGalleryProps = {
  images: string[];
  title: string;
};

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % images.length : null,
    );
  }, [images.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + images.length) % images.length : null,
    );
  }, [images.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') closeLightbox();
    },
    [goNext, goPrev, closeLightbox],
  );

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 120;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  }, []);

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxIndex]);

  if (!images.length) {
    return (
      <div className="h-48 bg-gray-200 flex items-center justify-center rounded-lg">
        <span className="text-gray-500">Нет изображений</span>
      </div>
    );
  }

  return (
    <>
      <div className="relative flex items-center gap-2">
        <button
          onClick={() => scroll('left')}
          className="shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Прокрутить влево"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              onClick={() => openLightbox(index)}
              onKeyDown={(e) => e.key === 'Enter' && openLightbox(index)}
              role="button"
              tabIndex={0}
              aria-label={`Фото ${index + 1}`}
              className="relative shrink-0 w-96 h-96 cursor-pointer overflow-hidden rounded-lg"
            >
              <Image
                src={image}
                alt={`${title} - фото ${index + 1}`}
                fill
                className="object-cover hover:opacity-80 transition-opacity"
                sizes="384px"
              />
              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1 rounded">
                  Главное
                </span>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Прокрутить вправо"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[2000] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label="Галерея"
          tabIndex={-1}
        >
          <button
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10"
            onClick={closeLightbox}
            aria-label="Закрыть галерею"
          >
            <X size={24} />
          </button>

          <button
            className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Предыдущее фото"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Следующее фото"
          >
            <ChevronRight size={32} />
          </button>

          <div
            className="relative w-full h-full max-w-5xl max-h-[85vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex]}
              alt={`${title} - фото ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          <div className="absolute bottom-4 text-white text-sm bg-black/40 px-3 py-1 rounded-full">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
