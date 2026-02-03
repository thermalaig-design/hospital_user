import React from 'react';
import { ArrowLeft, Image as ImageIcon, Maximize2, ZoomIn } from 'lucide-react';

export function Gallery({ onNavigateBack }) {
  const images = [
    { id: 1, url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800', title: 'Main Hospital Building', category: 'Exterior' },
    { id: 2, url: 'https://images.unsplash.com/photo-1586773860418-d319a39855df?auto=format&fit=crop&q=80&w=800', title: 'Advanced Lab', category: 'Diagnostics' },
    { id: 3, url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800', title: 'Patient Care Unit', category: 'Wards' },
    { id: 4, url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800', title: 'Medical Research', category: 'Innovation' },
    { id: 5, url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800', title: 'Diagnostics Center', category: 'Facility' },
    { id: 6, url: 'https://images.unsplash.com/photo-1504813184591-01592fd03cf7?auto=format&fit=crop&q=80&w=800', title: 'Modern Equipment', category: 'Technology' },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-5 flex items-center sticky top-0 z-50">
        <button
          onClick={onNavigateBack}
          className="p-3 rounded-2xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all active:scale-95 mr-4 shadow-sm"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            Gallery
          </h1>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">A glimpse into our excellence</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {images.map((image, index) => (
            <div 
              key={image.id} 
              className="group relative bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image Container */}
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <div className="p-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white scale-50 group-hover:scale-100 transition-transform duration-500">
                    <ZoomIn className="h-6 w-6" />
                  </div>
                </div>

                {/* Category Tag */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-indigo-600 text-[10px] font-bold uppercase tracking-wider shadow-lg">
                    {image.category}
                  </span>
                </div>
              </div>

              {/* Info Area */}
              <div className="p-6 bg-white relative">
                <div className="absolute -top-6 right-6 p-3 rounded-2xl bg-indigo-600 text-white shadow-xl transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <Maximize2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{image.title}</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">Active Department</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="py-12 flex flex-col items-center justify-center opacity-30">
        <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm font-medium text-gray-400 italic">Showing 6 of 6 photographs</p>
      </div>
    </div>
  );
}

export default Gallery;