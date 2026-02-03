import React, { useState } from 'react';
import { ArrowLeft, Image as ImageIcon, X, ChevronLeft, ChevronRight, Camera, Building2, FlaskConical, Heart, Cpu, Microscope } from 'lucide-react';

export function Gallery({ onNavigateBack }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const images = [
    { id: 1, url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800', title: 'Main Hospital Building', category: 'exterior', icon: Building2 },
    { id: 2, url: 'https://images.unsplash.com/photo-1586773860418-d319a39855df?auto=format&fit=crop&q=80&w=800', title: 'Advanced Lab', category: 'diagnostics', icon: FlaskConical },
    { id: 3, url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800', title: 'Patient Care Unit', category: 'wards', icon: Heart },
    { id: 4, url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800', title: 'Medical Research', category: 'innovation', icon: Microscope },
    { id: 5, url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800', title: 'Diagnostics Center', category: 'diagnostics', icon: FlaskConical },
    { id: 6, url: 'https://images.unsplash.com/photo-1504813184591-01592fd03cf7?auto=format&fit=crop&q=80&w=800', title: 'Modern Equipment', category: 'technology', icon: Cpu },
  ];

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'exterior', label: 'Exterior' },
    { id: 'diagnostics', label: 'Diagnostics' },
    { id: 'wards', label: 'Wards' },
    { id: 'innovation', label: 'Innovation' },
    { id: 'technology', label: 'Technology' },
  ];

  const filteredImages = activeFilter === 'all' 
    ? images 
    : images.filter(img => img.category === activeFilter);

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
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center sticky top-0 z-50 shadow-sm">
        <button
          onClick={onNavigateBack}
          className="p-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-600 transition-all active:scale-95 mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100">
              <Camera className="h-4 w-4 text-indigo-600" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">Gallery</h1>
          </div>
          <p className="text-gray-500 text-xs mt-0.5">{filteredImages.length} photos</p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="px-4 sm:px-6 py-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeFilter === filter.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry-style Gallery Grid */}
      <div className="px-4 sm:px-6 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {filteredImages.map((image, index) => {
            const IconComponent = image.icon;
            // Create varying heights for masonry effect
            const isLarge = index % 3 === 0;
            
            return (
              <div
                key={image.id}
                onClick={() => openLightbox(image)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-100 ${
                  isLarge ? 'row-span-2 aspect-[3/4]' : 'aspect-square'
                }`}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-lg">
                    <IconComponent className="h-3 w-3 text-indigo-600" />
                    <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">{image.category}</span>
                  </div>
                </div>

                {/* Title - Always visible on mobile, hover on desktop */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <div className="sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-4 sm:group-hover:translate-y-0 transition-all duration-300">
                    <h3 className="text-white font-bold text-sm sm:text-base drop-shadow-lg leading-tight">{image.title}</h3>
                  </div>
                </div>

                {/* Mobile tap indicator */}
                <div className="absolute inset-0 flex items-center justify-center sm:hidden">
                  <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-active:opacity-100 transition-opacity">
                    <ImageIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredImages.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center">
            <div className="p-4 rounded-full bg-gray-100 mb-4">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No photos in this category</p>
            <button
              onClick={() => setActiveFilter('all')}
              className="mt-3 text-indigo-600 text-sm font-semibold hover:underline"
            >
              View all photos
            </button>
          </div>
        )}
      </div>

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
              <p className="text-white/70 text-sm capitalize">{selectedImage.category}</p>
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