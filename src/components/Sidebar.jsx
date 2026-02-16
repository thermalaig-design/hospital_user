import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Users, Clock, FileText, UserPlus, ChevronRight, LogOut, Menu, X, Image } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, onNavigate, currentPage }) => {
  const sidebarRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const navigate = useNavigate();

  // Handle swipe gesture to close sidebar
  useEffect(() => {
    if (!isOpen) return;

    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      const swipeDistance = touchStartX.current - touchEndX.current;
      // If swiped left more than 100px, close sidebar
      if (swipeDistance > 100) {
        onClose();
      }
    };

    const sidebar = sidebarRef.current;
    if (sidebar) {
      sidebar.addEventListener('touchstart', handleTouchStart);
      sidebar.addEventListener('touchmove', handleTouchMove);
      sidebar.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (sidebar) {
        sidebar.removeEventListener('touchstart', handleTouchStart);
        sidebar.removeEventListener('touchmove', handleTouchMove);
        sidebar.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

    const menuItems = [
      { id: 'home', label: 'Home', icon: HomeIcon },
      { id: 'directory', label: 'Directory', icon: Users },
      { id: 'appointment', label: 'Appointments', icon: Clock },
      { id: 'reports', label: 'Reports', icon: FileText },
      { id: 'gallery', label: 'Gallery', icon: Image },
      { id: 'reference', label: 'Patient Referral', icon: UserPlus },
    ];

  return (
    <>
      {/* Overlay backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-50 overflow-y-auto flex flex-col"
      >
        <div className="p-6 pt-8 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <img 
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1767090787454.png?width=8000&height=8000&resize=contain" 
                alt="Logo" 
                className="h-10 w-10 object-contain" 
              />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Trustee and Patron Portal</h2>
              <p className="text-xs text-gray-500">Maharaja Agarsen</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                currentPage === item.id
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <item.icon className={`h-5 w-5 ${currentPage === item.id ? 'text-indigo-600' : 'text-gray-600'}`} />
              <span className={`font-medium ${currentPage === item.id ? 'text-indigo-600' : 'text-gray-700'}`}>
                {item.label}
              </span>
            </button>
          ))}

          {/* Logout button inline with nav items */}
          <button
            onTouchEnd={(e) => {
              e.stopPropagation();
              localStorage.removeItem('isLoggedIn');
              navigate('/login');
              if (onClose) onClose();
            }}
            onClick={() => {
              localStorage.removeItem('isLoggedIn');
              navigate('/login');
              if (onClose) onClose();
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors active:scale-[0.98] cursor-pointer touch-manipulation"
          >
            <div className="flex items-center gap-3 pointer-events-none">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </div>
            <ChevronRight className="h-4 w-4 pointer-events-none" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;