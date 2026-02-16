import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, X, ChevronLeft, ChevronRight, Camera, Menu, Home as HomeIcon } from 'lucide-react';
import { fetchAllGalleryImages } from './services/galleryService';
import Sidebar from './components/Sidebar';

export function Gallery({ onNavigate }) {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Scroll locking when sidebar is open
  useEffect(() => {
    if (isMenuOpen) {
      const scrollY = window.scrollY;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.touchAction = 'none';
    } else {
      const scrollY = parseInt(document.body.style.top || '0') * -1;
      document.documentElement.style.overflow = 'unset';
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
      document.body.style.top = 'unset';
      document.body.style.touchAction = 'auto';
      window.scrollTo(0, scrollY);
    }
    return () => {
      document.documentElement.style.overflow = 'unset';
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
      document.body.style.top = 'unset';
      document.body.style.touchAction = 'auto';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const all = await fetchAllGalleryImages();
        setImages(all);
      } catch (err) {
        console.error('Error loading gallery images:', err);
        setError('Could not load gallery photos');
        setImages([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const filteredImages = useMemo(() => images, [images]);

  const openLightbox = (image) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const goToPrevious = () => {
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const prevIndex = currentIndex === 0 ? filteredImages.length - 1 : currentIndex - 1;
    setSelectedImage(filteredImages[prevIndex]);
  };

  const goToNext = () => {
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const nextIndex = currentIndex === filteredImages.length - 1 ? 0 : currentIndex + 1;
    setSelectedImage(filteredImages[nextIndex]);
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Navbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between sticky top-0 z-50 shadow-sm mt-6">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          {isMenuOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
        </button>
        <h1 className="text-lg font-bold text-gray-800">Gallery</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center text-indigo-600"
            title="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center text-indigo-600"
          >
            <HomeIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="px-4 sm:px-6 pb-10 flex justify-center">
        <div className="w-full max-w-5xl">
          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl sm:rounded-3xl bg-gray-100 animate-pulse aspect-[4/3]"
                />
              ))}
            </div>
          )}

          {!isLoading && error && (
            <div className="py-16 flex flex-col items-center justify-center">
              <div className="p-4 rounded-full bg-gray-100 mb-4">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-semibold">{error}</p>
              <p className="text-gray-500 text-sm mt-1">Please try again later.</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {!isLoading && !error && filteredImages.map((image) => (
              <div
                key={image.id}
                onClick={() => openLightbox(image)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-100 aspect-[4/3] shadow-sm hover:shadow-lg transition-shadow"
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Title - Always visible on mobile, hover on desktop */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <div className="sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-4 sm:group-hover:translate-y-0 transition-all duration-300">
                    <h3 className="text-white font-bold text-sm sm:text-base drop-shadow-lg leading-tight">
                      {image.title}
                    </h3>
                  </div>
                </div>

                {/* Mobile tap indicator */}
                <div className="absolute inset-0 flex items-center justify-center sm:hidden">
                  <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-active:opacity-100 transition-opacity">
                    <ImageIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {!isLoading && !error && filteredImages.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center">
              <div className="p-4 rounded-full bg-gray-100 mb-4">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-semibold">No photos uploaded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Overlay - transparent, content visible behind */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-transparent z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <Sidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={(page) => {
          setIsMenuOpen(false);
          // Handle navigation if needed
        }}
        currentPage="gallery"
        topOffset={96}
      />

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation Arrows */}
          <button
            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Image Container */}
          <div 
            className="relative max-w-4xl max-h-[80vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl"
            />
            
            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
              <h3 className="text-white font-bold text-lg">{selectedImage.title}</h3>
              {selectedImage.createdAt && (
                <p className="text-white/70 text-sm">
                  {new Date(selectedImage.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
            <span className="text-white text-sm font-medium">
              {filteredImages.findIndex(img => img.id === selectedImage.id) + 1} / {filteredImages.length}
            </span>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default Gallery;