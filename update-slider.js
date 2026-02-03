const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Play, Pause } from 'lucide-react';

const ImageSlider = ({ images, onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isAutoPlaying || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered, images.length]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const getVisibleImages = () => {
    const visibleCount = 3;
    const result = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % images.length;
      result.push({ ...images[index], originalIndex: index });
    }
    return result;
  };

  return (
    <div 
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-4 sm:p-5 shadow-xl border border-gray-200/50 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100/50 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
        
        <div className="relative flex gap-3 sm:gap-4 h-48 sm:h-56">
          {getVisibleImages().map((image, idx) => (
            <div
              key={\`\${image.id}-\${idx}\`}
              onClick={() => idx === 0 && onNavigate('gallery')}
              className={\`relative rounded-2xl overflow-hidden shadow-lg transition-all duration-500 cursor-pointer \${idx === 0 ? 'flex-[2] z-20 hover:shadow-2xl hover:scale-[1.02]' : idx === 1 ? 'flex-[1] z-10 opacity-90 hover:opacity-100 hidden sm:block' : 'flex-[0.8] z-0 opacity-70 hover:opacity-90 hidden md:block'}\`}
              style={{
                transform: idx === 0 ? 'translateY(0)' : idx === 1 ? 'translateY(8px)' : 'translateY(16px)'
              }}
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const parent = e.target.parentElement;
                  const placeholder = parent.querySelector('.image-placeholder');
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
              <div className="image-placeholder absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center" style={{ display: 'none' }}>
                <div className="text-gray-500 flex flex-col items-center">
                  <ImageIcon className="h-8 w-8 mb-2" />
                  <span className="text-xs">Image not available</span>
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              
              {idx === 0 && (
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                    <span className="text-indigo-300 text-xs font-semibold uppercase tracking-wider">Featured</span>
                  </div>
                  <h3 className="text-white font-bold text-base sm:text-lg leading-tight drop-shadow-lg">{image.title}</h3>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <button
              onClick={goToPrevious}
              className="p-2.5 bg-white rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 border border-gray-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </button>
            <button
              onClick={goToNext}
              className="p-2.5 bg-white rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 border border-gray-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={\`transition-all duration-300 rounded-full \${index === currentIndex ? 'w-6 h-2 bg-indigo-600' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}\`}
                aria-label={\`Go to slide \${index + 1}\`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="p-2.5 bg-white rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 border border-gray-100"
              aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isAutoPlaying ? (
                <Pause className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
              ) : (
                <Play className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;
`;

fs.writeFileSync('src/components/ImageSlider.jsx', content);
console.log('File written successfully');
