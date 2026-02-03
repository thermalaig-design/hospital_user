import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Maximize2 } from 'lucide-react';

const ImageSlider = ({ images, onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
    setProgress(0);
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
    setProgress(0);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  // Auto-play and Progress bar logic
  useEffect(() => {
    if (!isAutoPlaying) return;

    const intervalTime = 5000; // 5 seconds per slide
    const updateFrequency = 100; // update every 100ms
    const step = (updateFrequency / intervalTime) * 100;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNext();
          return 0;
        }
        return prev + step;
      });
    }, updateFrequency);

    return () => clearInterval(progressInterval);
  }, [isAutoPlaying, goToNext]);

  return (
    <div className="relative w-full h-[180px] sm:h-[220px] overflow-hidden rounded-2xl shadow-xl group border-2 border-white">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-indigo-600/10 blur-3xl -z-10 animate-pulse"></div>

      {/* Slider container */}
      <div className="relative w-full h-full bg-gray-900">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${
              index === currentIndex 
                ? 'opacity-100 scale-100 rotate-0 z-10' 
                : 'opacity-0 scale-110 rotate-1 z-0'
            }`}
          >
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover transform transition-transform duration-[10s] hover:scale-110"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
                const parent = e.target.parentElement;
                const placeholder = parent.querySelector('.image-placeholder');
                if (placeholder) placeholder.style.display = 'flex';
              }}
            />
            
            {/* Overlay Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent"></div>

            {/* Placeholder */}
            <div className="image-placeholder absolute inset-0 bg-gray-800 hidden items-center justify-center">
              <div className="text-gray-400 flex flex-col items-center">
                <ImageIcon className="h-12 w-12 mb-3 opacity-50" />
                <span className="text-sm font-medium">Image not available</span>
              </div>
            </div>

            {/* Content Info */}
            <div className={`absolute bottom-8 left-8 right-8 z-20 transition-all duration-700 delay-300 ${
              index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="flex items-end justify-between gap-4">
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/80 text-[10px] uppercase tracking-[0.2em] font-bold mb-3 border border-white/20">
                    Hospital Gallery
                  </span>
                  <h3 className="text-white font-bold text-2xl sm:text-4xl leading-tight drop-shadow-lg max-w-2xl">
                    {image.title}
                  </h3>
                </div>
                <button 
                  onClick={() => onNavigate('gallery')}
                  className="mb-1 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all hover:scale-110 active:scale-95 group/btn"
                >
                  <Maximize2 className="h-5 w-5 group-hover/btn:rotate-12 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 z-30 flex gap-1 px-8 pt-4">
        {images.map((_, index) => (
          <div key={index} className="h-full flex-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className={`h-full bg-white transition-all duration-100 ease-linear ${
                index === currentIndex ? '' : index < currentIndex ? 'w-full' : 'w-0'
              }`}
              style={{ width: index === currentIndex ? `${progress}%` : undefined }}
            ></div>
          </div>
        ))}
      </div>

      {/* Navigation arrows - Enhanced Glassmorphism */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-6 z-20 pointer-events-none">
        <button
          onClick={goToPrevious}
          className="pointer-events-auto p-4 bg-black/20 backdrop-blur-md text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:text-indigo-600 hover:scale-110 shadow-xl border border-white/10"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={goToNext}
          className="pointer-events-auto p-4 bg-black/20 backdrop-blur-md text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:text-indigo-600 hover:scale-110 shadow-xl border border-white/10"
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-8 right-8 z-30 hidden sm:flex items-baseline gap-1 text-white/50 font-medium">
        <span className="text-white text-lg font-bold">{(currentIndex + 1).toString().padStart(2, '0')}</span>
        <span className="text-xs">/</span>
        <span className="text-xs">{images.length.toString().padStart(2, '0')}</span>
      </div>

      {/* Auto-play status toggle */}
      <button
        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
        className="absolute top-8 right-8 z-30 p-2.5 bg-black/20 backdrop-blur-md text-white rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
      >
        {isAutoPlaying ? (
          <div className="flex gap-1 items-center px-1">
            <div className="w-1 h-3 bg-white rounded-full animate-pulse"></div>
            <div className="w-1 h-3 bg-white rounded-full animate-pulse delay-75"></div>
          </div>
        ) : (
          <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-transparent border-l-[10px] border-l-white ml-0.5"></div>
        )}
      </button>

      <style>{`
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ImageSlider;