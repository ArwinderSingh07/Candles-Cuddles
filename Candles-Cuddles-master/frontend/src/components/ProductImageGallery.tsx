import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface ProductImageGalleryProps {
  images: string[];
  title: string;
}

export const ProductImageGallery = ({ images, title }: ProductImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Use a generic placeholder instead of product template
  const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f6d5de" width="400" height="400"/%3E%3Ctext fill="%238a3a52" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage Loading...%3C/text%3E%3C/svg%3E';

  const displayImages = images.length > 0 ? images : [placeholderImage];
  const currentImage = displayImages[selectedIndex];
  
  const handleImageError = (index: number) => {
    console.error('Image failed to load:', displayImages[index]);
    setImageErrors((prev) => new Set(prev).add(index));
  };
  
  const getImageUrl = (index: number) => {
    if (imageErrors.has(index)) {
      return placeholderImage;
    }
    return displayImages[index];
  };

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative group">
        <img
          src={getImageUrl(selectedIndex)}
          alt={title}
          className="h-[480px] w-full rounded-3xl object-cover shadow-lg cursor-zoom-in transition-transform"
          onClick={() => setIsZoomed(!isZoomed)}
          onError={() => {
            console.error('Image failed to load:', currentImage);
            handleImageError(selectedIndex);
          }}
        />
        
        {/* Zoom Indicator */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="rounded-full bg-white/90 p-2 shadow-md">
            <MagnifyingGlassIcon className="h-5 w-5 text-brand-dark" />
          </div>
        </div>

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="h-5 w-5 text-brand-dark" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRightIcon className="h-5 w-5 text-brand-dark" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-brand-dark shadow-md">
            {selectedIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`flex-shrink-0 rounded-xl border-2 transition ${
                idx === selectedIndex
                  ? 'border-brand shadow-md'
                  : 'border-transparent hover:border-brand/50'
              }`}
            >
              <img
                src={getImageUrl(idx)}
                alt={`${title} thumbnail ${idx + 1}`}
                className="h-20 w-20 rounded-lg object-cover"
                onError={() => handleImageError(idx)}
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
          >
            ✕
          </button>
          <img
            src={currentImage}
            alt={title}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

