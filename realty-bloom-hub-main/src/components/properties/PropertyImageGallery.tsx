
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";

interface PropertyImageGalleryProps {
  images: Array<{ image: string } | string>;
}

const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const handleNext = () => {
    setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  };

  const handlePrev = () => {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  // Helper to always get the image URL
  const getImageUrl = (img: { image: string } | string) =>
    typeof img === 'string' ? img : img.image;

  return (
    <>
      <div className="relative overflow-hidden rounded-lg">
        {/* Main image */}
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
          <img
            src={getImageUrl(images[activeIndex])}
            alt={`Property image ${activeIndex + 1}`}
            className="h-full w-full object-cover object-top"
          />
          <button
            onClick={() => setShowModal(true)}
            className="absolute top-4 right-4 bg-white/70 backdrop-blur-sm rounded-full p-2 text-gray-800 hover:bg-white transition-colors"
            aria-label="View full size gallery"
          >
            <Expand className="h-5 w-5" />
          </button>
          
          {/* Navigation arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-sm rounded-full p-2 text-gray-800 hover:bg-white transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-sm rounded-full p-2 text-gray-800 hover:bg-white transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          
          {/* Image counter */}
          <div className="absolute bottom-4 left-4 bg-white/70 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-800">
            {activeIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`image-gallery-thumbnail flex-shrink-0 ${
                index === activeIndex ? "border-primary" : "border-transparent"
              }`}
            >
              <img
                src={getImageUrl(img)}
                alt={`Property thumbnail ${index + 1}`}
                className="h-16 w-24 object-cover object-top rounded-md"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-12 right-0 bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/40 transition-colors"
              aria-label="Close gallery"
            >
              <span className="text-2xl">&times;</span>
            </button>
            
            <div className="relative">
              <img
                src={getImageUrl(images[activeIndex])}
                alt={`Property image ${activeIndex + 1}`}
                className="w-full max-h-[80vh] object-contain object-top"
              />
              
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/40 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/40 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-white">
                {activeIndex + 1} / {images.length}
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 justify-center">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`image-gallery-thumbnail flex-shrink-0 ${
                    index === activeIndex ? "border-white" : "border-transparent"
                  }`}
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`Property thumbnail ${index + 1}`}
                    className="h-16 w-24 object-cover object-top rounded-md"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyImageGallery;
