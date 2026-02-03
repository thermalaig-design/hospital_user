import React from 'react';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';

export function Gallery({ onNavigateBack }) {
  const images = [
    { id: 1, url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800', title: 'Main Hospital Building' },
    { id: 2, url: 'https://images.unsplash.com/photo-1586773860418-d319a39855df?auto=format&fit=crop&q=80&w=800', title: 'Advanced Lab' },
    { id: 3, url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800', title: 'Patient Care Unit' },
    { id: 4, url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800', title: 'Medical Research' },
    { id: 5, url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800', title: 'Diagnostics Center' },
    { id: 6, url: 'https://images.unsplash.com/photo-1504813184591-01592fd03cf7?auto=format&fit=crop&q=80&w=800', title: 'Modern Equipment' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center sticky top-0 z-50 shadow-sm">
        <button
          onClick={onNavigateBack}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors mr-3"
        >
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ImageIcon className="h-6 w-6 text-indigo-600" />
          Gallery
        </h1>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-4">
          {images.map((image) => (
            <div key={image.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-3 bg-white">
                <p className="text-xs font-semibold text-gray-800 truncate">{image.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Gallery;
