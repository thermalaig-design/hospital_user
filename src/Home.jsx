import React, { useState, useEffect } from 'react';
import { User, Users, Clock, FileText, UserPlus, Bell, ChevronRight, LogOut, Heart, Shield, Plus, ArrowRight, Pill, ShoppingCart, Calendar, Stethoscope, Building2, Phone, QrCode, Monitor, Brain, Package, FileCheck, Search, Filter, MapPin, Star, HelpCircle, BookOpen, Video, Headphones, Menu, X, Home as HomeIcon, Settings, UserCircle, Image } from 'lucide-react';
import Sidebar from './components/Sidebar';
import TermsModal from './components/TermsModal';
import ImageSlider from './components/ImageSlider';
import { getProfile, getMarqueeUpdates, getSponsors, getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from './services/api';
import { fetchLatestGalleryImages } from './services/galleryService';


/* eslint-disable react-refresh/only-export-components */
const Home = ({ onNavigate, onLogout, isMember }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [marqueeUpdates, setMarqueeUpdates] = useState([
    'Free Cardiac Checkup Camp on March 29, 2026',
    'New Specialist Dr. Neha Kapoor Joined',
    '24x7 Emergency Helpline: 1800-XXX-XXXX',
    'Tele Consultation Services Now Available',
    'Free Health Camp at Main Hospital',
    'New MRI Machine Installed',
    'OPD Timings: 9 AM to 5 PM',
    'Emergency Services Available 24/7',
  ]);
  const [sponsor, setSponsor] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [galleryError, setGalleryError] = useState(null);

  useEffect(() => {
    // Load profile from Supabase first, then fallback to localStorage
    const loadProfile = async () => {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const parsedUser = JSON.parse(user);
          const userId = parsedUser['Membership number'] || parsedUser.mobile || parsedUser.id;
          
          if (userId) {
            // Try to load from Supabase
            try {
              const response = await getProfile();
              if (response.success && response.profile) {
                // Map database fields to profile format
                const mappedProfile = {
                  name: response.profile.name || '',
                  profilePhotoUrl: response.profile.profile_photo_url || ''
                };
                setUserProfile(mappedProfile);
                return;
              }
            } catch (error) {
              console.error('Error loading from Supabase:', error);
            }
          }
          
          // Fallback to localStorage
          const userKey = `userProfile_${parsedUser.Mobile || parsedUser.mobile || parsedUser.id || 'default'}`;
          const savedProfile = localStorage.getItem(userKey);
          if (savedProfile) {
            setUserProfile(JSON.parse(savedProfile));
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    };
    
    loadProfile();
  }, []);

  // Load marquee updates from Supabase
  useEffect(() => {
    const loadMarqueeUpdates = async () => {
      try {
        const response = await getMarqueeUpdates();
        if (response.success && response.data && response.data.length > 0) {
          // Sort by priority (ascending) and map to message text
          const updates = response.data
            .sort((a, b) => (a.priority || 0) - (b.priority || 0))
            .map(item => item.message);
          setMarqueeUpdates(updates);
          console.log('✅ Marquee updates loaded:', updates);
        }
      } catch (error) {
        console.error('Error loading marquee updates:', error);
        // Keep default updates if fetch fails
      }
    };

    loadMarqueeUpdates();
  }, []);

  // Load sponsor data from Supabase
  useEffect(() => {
    const loadSponsor = async () => {
      try {
        const response = await getSponsors();
        if (response.success && response.data && response.data.length > 0) {
          // Get the first active sponsor (highest priority)
          setSponsor(response.data[0]);
          console.log('✅ Sponsor loaded:', response.data[0].name);
        }
      } catch (error) {
        console.error('Error loading sponsor:', error);
        // Keep default sponsor if fetch fails
      }
    };

    loadSponsor();
  }, []);

  // Load gallery images from Supabase storage table
  useEffect(() => {
    const loadGallery = async () => {
      try {
        setIsGalleryLoading(true);
        setGalleryError(null);
        const images = await fetchLatestGalleryImages(6);
        setGalleryImages(images);
      } catch (err) {
        console.error('Error loading gallery images:', err);
        setGalleryError('Could not load gallery photos');
        setGalleryImages([]);
      } finally {
        setIsGalleryLoading(false);
      }
    };

    loadGallery();
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getUserNotifications();
        if (response.success) {
          setNotifications(response.data || []);
          setUnreadCount((response.data || []).filter(n => !n.is_read).length);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    const termsAccepted = localStorage.getItem('terms_accepted');
    if (!termsAccepted) {
      setShowTermsModal(true);
    }
  }, []);

  const handleAcceptTerms = () => {
    localStorage.setItem('terms_accepted', 'true');
    setShowTermsModal(false);
  };

  const formatNotificationTitle = (title, message) => {
    // If it's an appointment update, format it nicely
    if (title.includes('Appointment') && message.includes('appointment')) {
      if (message.includes('date has been changed')) {
        return '📅 Appointment Rescheduled';
      } else if (message.includes('remark')) {
        return '💬 New Message';
      } else {
        return '📋 Appointment Updated';
      }
    }
    return title;
  };

  const formatNotificationMessage = (message) => {
    // Format appointment update messages to be more user-friendly
    if (message.includes('appointment') && message.includes('date has been changed')) {
      // Extract old and new dates
      const dateMatch = message.match(/date has been changed from ([\d-]+) to ([\d-]+)/i);
      if (dateMatch) {
        const oldDate = formatDate(dateMatch[1]);
        const newDate = formatDate(dateMatch[2]);
        return `Hi there! Your appointment has been rescheduled from ${oldDate} to ${newDate}.`;
      }
    } else if (message.includes('appointment') && message.includes('remark')) {
      // Extract remark
      const remarkMatch = message.match(/has a new remark: (.+)/i);
      if (remarkMatch) {
        return `Hi there! New message regarding your appointment: "${remarkMatch[1]}".`;
      } else {
        return `Hi there! New message regarding your appointment.`;
      }
    }
    return message;
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // const recentNotices = [
  //   { id: 1, title: 'Free Cardiac Checkup', date: 'Dec 29, 2024', tag: 'Health Camp' },
  //   { id: 2, title: 'New Specialist Joined', date: 'Dec 28, 2024', tag: 'Hiring' },
  // ];

    const quickActions = [
      { id: 'directory', title: 'Directory', desc: 'Find Doctors & Hospitals', icon: Users, color: 'bg-blue-100', iconColor: 'text-blue-600', screen: 'directory' },
      { id: 'appointment', title: 'Book Appointment', desc: 'Schedule Doctor Visit', icon: Clock, color: 'bg-indigo-100', iconColor: 'text-indigo-600', screen: 'appointment', memberOnly: true },
      { id: 'reports', title: 'Reports', desc: 'Medical Test Results', icon: FileText, color: 'bg-orange-100', iconColor: 'text-orange-600', screen: 'reports' },
      { id: 'reference', title: 'Patient Referral', desc: 'Refer Patient to Doctor', icon: UserPlus, color: 'bg-teal-100', iconColor: 'text-teal-600', screen: 'reference' },
    ];

  // const enquiry = [
  //   { id: 'specialities', title: 'Availability of Specialities', icon: Stethoscope, color: 'bg-purple-500' },
  //   { id: 'lab-tests', title: 'Availability of Lab Tests', icon: Search, color: 'bg-purple-500' },
  //   { id: 'drugs', title: 'Availability of Drugs', icon: Pill, color: 'bg-purple-500' },
  //   { id: 'hcos', title: 'Empanelled HCOs Directory', icon: Building2, color: 'bg-purple-500' },
  //   { id: 'emergency-contacts', title: 'Emergency Contacts', icon: Phone, color: 'bg-purple-500' },
  //   { id: 'helpline', title: '24x7 Emergency Helpline', icon: Phone, color: 'bg-purple-500' },
  //   { id: 'health-info', title: 'Health Information', icon: Heart, color: 'bg-purple-500' },
  // ];

  // const userSupport = [
  //   { id: 'help-desk', title: 'HMIS Help Desk', icon: Headphones, color: 'bg-purple-500' },
  //   { id: 'videos', title: 'Videos', icon: Video, color: 'bg-purple-500' },
  //   { id: 'user-manuals', title: 'User Manuals', icon: BookOpen, color: 'bg-purple-500' },
  //   { id: 'handouts', title: 'Handouts', icon: FileText, color: 'bg-purple-500' },
  // ];

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Navbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          {isMenuOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
        </button>
        <h1 className="text-lg font-bold text-gray-800">Home</h1>
        <div className="flex items-center gap-2">
          {/* Notifications Bell */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="h-6 w-6 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[60] overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <h3 className="font-bold text-gray-900">Notifications ({notifications.length})</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-indigo-600 font-semibold hover:text-indigo-700"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 4).map((notification) => (
                      <div 
                        key={notification.id}
                        onClick={() => {
                          handleMarkAsRead(notification.id);
                          // Store the notification in sessionStorage to open it on the notifications page
                          sessionStorage.setItem('initialNotification', JSON.stringify(notification));
                          setIsNotificationsOpen(false);
                          onNavigate('notifications');
                        }}
                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer relative ${!notification.is_read ? 'bg-indigo-50/30' : ''}`}
                      >
                        {!notification.is_read && (
                          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                        )}
                        <h4 className={`text-sm font-semibold text-gray-900 mb-0.5 ${!notification.is_read ? 'pr-4' : ''}`}>
                          {formatNotificationTitle(notification.title, notification.message)}
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed mb-2">
                          {formatNotificationMessage(notification.message)}
                        </p>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <div className="bg-gray-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                    <button 
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        onNavigate('notifications');
                      }}
                      className="text-xs text-gray-500 font-semibold hover:text-gray-700"
                    >
                      View all {notifications.length} notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={() => onNavigate('profile')}
            className="p-1 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center"
          >
            {userProfile?.profilePhotoUrl ? (
              <img 
                src={userProfile.profilePhotoUrl} 
                alt="Profile" 
                className="h-8 w-8 rounded-lg object-cover border-2 border-indigo-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  // Find the next sibling element with class name containing 'bg-indigo'
                  const nextElement = e.target.parentNode.nextElementSibling;
                  if (nextElement) {
                    nextElement.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            {userProfile?.name && !userProfile?.profilePhotoUrl ? (
              <div className="h-8 w-8 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-xs font-bold border-2 border-indigo-200">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
            ) : !userProfile?.profilePhotoUrl ? (
              <UserCircle className="h-7 w-7 text-gray-700" />
            ) : null}
          </button>
          <button 
            onClick={onLogout}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <LogOut className="h-5 w-5 text-gray-700" />
          </button>

        </div>
      </div>

      <Sidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={onNavigate}
        currentPage="home"
      />

      {/* Header Section - Premium VIP Design */}
      <div className="bg-gradient-to-br from-white to-gray-50 px-4 sm:px-6 pt-6 sm:pt-8 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-lg border-2 border-gray-100 flex-shrink-0">
            <img src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1767090787454.png?width=8000&height=8000&resize=contain" alt="Logo" className="h-12 w-12 sm:h-16 sm:w-16 object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 truncate">Maharaja Agrasen Hospital</h1>
            <p className="text-gray-600 text-sm sm:text-base font-medium">Trustee & Patron Portal</p>
            {userProfile?.name && (
              <p className="text-indigo-600 text-xs sm:text-sm font-semibold mt-1 truncate">Welcome, {userProfile.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Single Marquee Updates - Enhanced */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white overflow-hidden relative shadow-md">
        <div className="py-3">
          <div 
            className="flex whitespace-nowrap" 
            style={{ 
              animation: `marquee ${Math.max(marqueeUpdates.length * 6, 40)}s linear infinite`,
              width: 'max-content'
            }}
          >
            {marqueeUpdates.map((update, index) => (
              <div key={index} className="flex items-center mx-6 sm:mx-8 flex-shrink-0">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base font-semibold">{update}</span>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {marqueeUpdates.map((update, index) => (
              <div key={`dup-${index}`} className="flex items-center mx-6 sm:mx-8 flex-shrink-0">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base font-semibold">{update}</span>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>
      
      {/* Main Content - Flex grow to push banner to bottom */}
        {/* Main Navigation Cards - Premium Design */}
        <div className="px-4 sm:px-6 mt-6 sm:mt-6 ">  {/* Reduced bottom margin to decrease gap */}
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 mt-5 sm:gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => onNavigate(action.screen)}
                disabled={action.memberOnly && !isMember}
                className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-md border-2 border-gray-100 flex flex-col items-center text-center transition-all hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 active:scale-95 group relative overflow-hidden ${action.memberOnly && !isMember ? 'opacity-60' : ''}`}
              >
                <div className={`${action.color} p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
                  <action.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${action.iconColor}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight mb-1 sm:mb-1.5">{action.title}</h3>
                <p className="text-gray-600 text-[10px] sm:text-xs font-medium leading-snug">{action.desc}</p>
                {action.memberOnly && !isMember && (
                  <span className="absolute top-3 right-3 bg-gray-100 text-gray-400 p-1.5 rounded-full shadow-sm"><Shield className="h-3.5 w-3.5" /></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Slider Section */}
        <div className="px-4 sm:px-6 mt-10 sm:mt-12 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-1 bg-indigo-600 rounded-full"></div>
                <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-wider">Visual Tour</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Hospital Gallery</h2>
            </div>
            <button 
              onClick={() => onNavigate('gallery')}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-indigo-600 hover:text-white transition-all group"
            >
              Explore All <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="w-full relative">
            {/* Decorative background elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-50 -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-100 rounded-full blur-3xl opacity-50 -z-10"></div>
            
            {isGalleryLoading ? (
              <div className="w-full h-[190px] sm:h-[230px] rounded-2xl border-2 border-white bg-gray-100 animate-pulse" />
            ) : galleryImages.length > 0 ? (
              <ImageSlider images={galleryImages} onNavigate={onNavigate} />
            ) : (
              <button
                onClick={() => onNavigate('gallery')}
                className="w-full h-[190px] sm:h-[230px] rounded-2xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center text-gray-600 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
              >
                <Image className="h-8 w-8 mb-2" />
                <div className="text-sm font-bold">No gallery photos yet</div>
                <div className="text-xs mt-0.5">{galleryError || 'Tap to open gallery'}</div>
              </button>
            )}
          </div>
        </div>

        {/* Sponsored By Banner - Moved after quick actions */}
        <div className="banner-container w-full mt-5 mb-0 " style={{ marginTop: '3rem' }}>  {/* Added padding for consistency */}
          <button 
            onClick={() => onNavigate('sponsor-details')}
            className="w-full bg-gradient-to-r from-indigo-800 to-indigo-900 p-4 overflow-hidden shadow-2xl border-2 border-indigo-700 text-left"
          >
            <div className="flex items-center justify-between p-0.5 sm:p-1">
              {/* Left Side - Text Content */}
              <div className="flex-1 pr-4">
                {/* Decorative Line */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-px bg-gradient-to-r from-transparent via-indigo-300 to-indigo-300 flex-1"></div>
                  <span className="text-indigo-200 text-[10px] sm:text-xs font-light tracking-widest">SPONSORED BY</span>
                  <div className="h-px bg-gradient-to-r from-indigo-300 to-indigo-300 to-transparent flex-1"></div>
                </div>

                {/* Sponsor Name - Dynamic */}
                <h2 className="text-sm sm:text-base md:text-lg font-serif italic text-white leading-tight">
                  {sponsor ? sponsor.name : 'Dr. Meena Subhash Gupta'}
                </h2>
              </div>

              {/* Right Side - 3D Realistic Image */}
              <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 relative group" style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}>
                {/* Enhanced 3D Shadow Layers */}
                <div className="absolute inset-0 bg-black/30 rounded-2xl transform translate-x-3 translate-y-3 blur-md opacity-50" style={{ transform: 'translateZ(-10px)' }}></div>
                <div className="absolute inset-0 bg-black/15 rounded-2xl transform translate-x-2 translate-y-2 blur-lg opacity-70" style={{ transform: 'translateZ(-5px)' }}></div>
                <div className="absolute inset-0 bg-black/5 rounded-2xl transform translate-x-1 translate-y-1 blur-xl opacity-80" style={{ transform: 'translateZ(-2px)' }}></div>

                {/* Realistic 3D Image Container */}
                <div className="relative flex items-center justify-center overflow-visible transform transition-all duration-700 group-hover:scale-110" style={{ transformStyle: 'preserve-3d' }}>
                  <div className="relative" style={{ transform: 'translateZ(40px) rotateX(10deg) rotateY(-8deg)' }}>
                    <img
                      src={sponsor ? sponsor.photo_url : '/assets/president.png'}
                      alt={sponsor ? sponsor.name : 'Dr. Meena Subhash Gupta'}
                      className="w-full h-full object-cover rounded-2xl shadow-2xl transform transition-all duration-700 group-hover:scale-105"
                      style={{
                        filter: 'drop-shadow(0 20px 35px rgba(0,0,0,0.5)) drop-shadow(0 8px 15px rgba(0,0,0,0.4)) drop-shadow(0 3px 6px rgba(0,0,0,0.3))',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 0 20px rgba(0,0,0,0.3)'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        // Find the next sibling element
                        const nextElement = e.target.parentNode.nextElementSibling;
                        if (nextElement) {
                          nextElement.style.display = 'flex';
                        }
                      }}
                    />
                    {/* Realistic Lighting Overlay */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-black/30 pointer-events-none"></div>
                    {/* Fallback placeholder */}
                    <div className="text-center" style={{ display: 'none' }}>
                      <User className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 mx-auto mb-1" />
                      <p className="text-gray-400 text-[10px] sm:text-xs font-medium">Photo</p>
                    </div>
                  </div>
                </div>

                {/* Enhanced 3D Light Effects */}
                <div className="absolute top-1 left-1 w-4 h-4 bg-white/40 rounded-full blur-lg opacity-80" style={{ transform: 'translateZ(20px)' }}></div>
                <div className="absolute bottom-1 right-1 w-3 h-3 bg-white/20 rounded-full blur-md opacity-60" style={{ transform: 'translateZ(15px)' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 rounded-full blur-xl opacity-50" style={{ transform: 'translateZ(25px) translateX(-50%) translateY(-50%)' }}></div>
              </div>
            </div>
          </button>
        </div>
      
      <style>{`
        .banner-container {
          width: 100%;
          max-width: 100%;
        
        }
        
        .banner-content {
          width: 100%;
          box-sizing: border-box;
          margin: 0 auto;
          }
        `}</style>

        {/* Footer */}
        <footer className="mt-auto py-4 px-6 bg-gray-50 border-t border-gray-200">
          <div className="text-center">
            <button 
              onClick={() => {
                console.log('Navigating to developers page');
                onNavigate('developers');
              }}
              className="text-xs text-gray-500 hover:text-indigo-600 font-medium transition-colors"
            >
              Powered by Developers
            </button>
          </div>
        </footer>

        {/* Terms & Conditions Modal */}
        <TermsModal 
          isOpen={showTermsModal} 
          onAccept={handleAcceptTerms} 
        />
      </div>
    );
  };


export default Home;
