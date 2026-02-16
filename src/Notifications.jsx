import React, { useState, useEffect } from 'react';
import { Bell, ChevronRight, Home as HomeIcon, Menu, X, Check, Calendar, User, Stethoscope, Clock, MapPin, Building2, FileText } from 'lucide-react';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from './services/api';
import Sidebar from './components/Sidebar';

const Notifications = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Handle initial notification from sessionStorage
  useEffect(() => {
    const storedNotification = sessionStorage.getItem('initialNotification');
    if (storedNotification) {
      try {
        const notification = JSON.parse(storedNotification);
        if (notification) {
          // Process the notification
          handleNotificationClick(notification);
          // Remove from sessionStorage after processing
          sessionStorage.removeItem('initialNotification');
        }
      } catch (error) {
        console.error('Error parsing stored notification:', error);
      }
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getUserNotifications();
      if (response.success) {
        setNotifications(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      // Update the notification locally
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read when clicked
      if (!notification.is_read) {
        await markNotificationAsRead(notification.id);
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notification.id ? { ...notif, is_read: true } : notif
          )
        );
      }
      
      // Extract appointment ID from notification message
      const appointmentId = extractAppointmentId(notification.message);
      
      // Show detailed modal
      setSelectedNotification({ ...notification, appointmentId });
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error handling notification click:', err);
    }
  };

  const extractAppointmentId = (message) => {
    const match = message.match(/appointment #([0-9]+)/i);
    return match ? match[1] : null;
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedNotification(null);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      // Update all notifications locally
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="bg-gray-50 min-h-screen pb-10 relative">
      {/* Backdrop for sidebar - closes when clicked */}
      {isMenuOpen && (
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 z-25 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
          style={{ pointerEvents: 'auto' }}
        ></div>
      )}

      {/* Navbar */}
      <div className={`${isMenuOpen ? 'bg-gray-900 border-gray-700 shadow-2xl' : 'bg-white border-gray-200 shadow-sm'} border-b px-4 sm:px-6 py-5 flex items-center justify-between sticky top-0 z-50 mt-6 transition-all duration-300`}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          {isMenuOpen ? <X className={`h-6 w-6 ${isMenuOpen ? 'text-white' : 'text-gray-700'}`} /> : <Menu className={`h-6 w-6 ${isMenuOpen ? 'text-white' : 'text-gray-700'}`} />}
        </button>
        <h1 className={`text-lg font-bold ${isMenuOpen ? 'text-white' : 'text-gray-800'} transition-colors`}>Notifications</h1>
        <button
          onClick={() => onNavigate('home')}
          className={`p-2 rounded-xl transition-colors flex items-center justify-center ${isMenuOpen ? 'text-white hover:bg-gray-800' : 'text-indigo-600 hover:bg-gray-100'}`}
        >
          <HomeIcon className="h-5 w-5" />
        </button>
      </div>

      <Sidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={onNavigate}
        currentPage="notifications"
      />

      {/* Header Section */}
      <div className="bg-white px-6 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
            <Bell className="h-12 w-12 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
            <p className="text-gray-500 text-sm font-medium">Stay updated with latest alerts</p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      {notifications.length > 0 && (
        <div className="bg-white px-6 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-xs text-indigo-600 font-semibold hover:text-indigo-700"
            >
              Mark all as read
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="px-6 py-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div className="text-red-600 mb-2">
              <Bell className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="font-bold text-red-800 mb-1">Error Loading Notifications</h3>
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={fetchNotifications}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* No Notifications State */}
      {!loading && !error && notifications.length === 0 && (
        <div className="px-6 py-12">
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">No notifications yet</h3>
            <p className="text-gray-500 text-sm">
              You'll see important updates here when they arrive
            </p>
            <button 
              onClick={() => onNavigate('home')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      {!loading && !error && notifications.length > 0 && (
        <div className="px-6 py-4 space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer ${
                !notification.is_read ? 'border-l-4 border-l-indigo-600 bg-indigo-50/30' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className={`font-semibold text-gray-900 ${!notification.is_read ? 'font-bold' : ''}`}>
                  {notification.title}
                </h4>
                {!notification.is_read && (
                  <div className="flex-shrink-0 ml-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                {notification.message}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">
                  {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                
                {!notification.is_read && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification.id);
                    }}
                    className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    
      {/* Detailed Notification Modal */}
      {showDetailModal && selectedNotification && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Notification Details</h3>
                <button 
                  onClick={closeDetailModal}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50 rounded-xl">
                  <h4 className="font-semibold text-indigo-800 mb-2">{selectedNotification.title}</h4>
                  <p className="text-gray-700 whitespace-pre-line">{selectedNotification.message}</p>
                </div>
                
                {selectedNotification.type === 'appointment_update' && (
                  <div className="border-t border-gray-100 pt-4">
                    <h5 className="font-semibold text-gray-800 mb-3">Appointment Details</h5>
                    
                    <div className="space-y-3">
                      {extractPatientName(selectedNotification.message) && (
                        <div className="flex items-start">
                          <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Patient</p>
                            <p className="text-sm text-gray-800 font-medium">{extractPatientName(selectedNotification.message)}</p>
                          </div>
                        </div>
                      )}
                      
                      {extractDateTime(selectedNotification.message) && (
                        <div className="flex items-start">
                          <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Date & Time</p>
                            <p className="text-sm text-gray-800 font-medium">{extractDateTime(selectedNotification.message)}</p>
                          </div>
                        </div>
                      )}
                      
                      {extractDoctorName(selectedNotification.message) && (
                        <div className="flex items-start">
                          <Stethoscope className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Doctor</p>
                            <p className="text-sm text-gray-800 font-medium">{extractDoctorName(selectedNotification.message)}</p>
                          </div>
                        </div>
                      )}
                      
                      {extractDepartment(selectedNotification.message) && (
                        <div className="flex items-start">
                          <Building2 className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Department</p>
                            <p className="text-sm text-gray-800 font-medium">{extractDepartment(selectedNotification.message)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedNotification.type === 'referral_update' && (
                  <div className="border-t border-gray-100 pt-4">
                    <h5 className="font-semibold text-gray-800 mb-3">Referral Details</h5>
                    
                    <div className="space-y-3">
                      {extractPatientName(selectedNotification.message) && (
                        <div className="flex items-start">
                          <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Patient</p>
                            <p className="text-sm text-gray-800 font-medium">{extractPatientName(selectedNotification.message)}</p>
                          </div>
                        </div>
                      )}
                      
                      {extractDoctorName(selectedNotification.message) && (
                        <div className="flex items-start">
                          <Stethoscope className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Referred To</p>
                            <p className="text-sm text-gray-800 font-medium">{extractDoctorName(selectedNotification.message)}</p>
                          </div>
                        </div>
                      )}
                      
                      {extractDepartment(selectedNotification.message) && (
                        <div className="flex items-start">
                          <Building2 className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Department</p>
                            <p className="text-sm text-gray-800 font-medium">{extractDepartment(selectedNotification.message)}</p>
                          </div>
                        </div>
                      )}
                      
                      {extractCategory(selectedNotification.message) && (
                        <div className="flex items-start">
                          <FileText className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Category</p>
                            <p className="text-sm text-gray-800 font-medium">{extractCategory(selectedNotification.message)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end pt-4">
                  <button
                    onClick={closeDetailModal}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions to extract details from formatted messages
const extractPatientName = (message) => {
  // Pattern: 👤 Patient: [Name]
  const match = message.match(/👤 Patient:\s*([^\n]+)/i);
  if (match) return match[1].trim();
  
  // Pattern: Hello [Name],
  const helloMatch = message.match(/Hello\s+([^,]+),/i);
  if (helloMatch) return helloMatch[1].trim();
  
  return null;
};

const extractDoctorName = (message) => {
  // Pattern: 👨‍⚕️ Doctor: Dr. [Name] or 👨‍⚕️ Referred To: Dr. [Name]
  const doctorMatch = message.match(/👨‍⚕️\s+(?:Doctor|Referred To):\s*Dr\.\s*([^\n]+)/i);
  if (doctorMatch) return 'Dr. ' + doctorMatch[1].trim();
  
  // Pattern: with Dr. [Name]
  const withMatch = message.match(/with\s+Dr\.\s*([^\s]+(?:\s+[^\s]+)*)/i);
  if (withMatch) return 'Dr. ' + withMatch[1].trim();
  
  return null;
};

const formatDate = (dateStr) => {
  try {
    // Handle YYYY-MM-DD format
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('en-IN', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric'
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

const extractDateTime = (message) => {
  // Pattern: 📅 Previous Date & Time: [date] [time]
  // Pattern: ➡️ New Date & Time: [date] [time]
  const previousMatch = message.match(/📅\s*Previous\s+Date\s+&\s+Time:\s*([^\n]+)/i);
  const newMatch = message.match(/➡️\s*New\s+Date\s+&\s+Time:\s*([^\n]+)/i);
  
  if (previousMatch && newMatch) {
    const prevParts = previousMatch[1].trim().split(/\s+/);
    const newParts = newMatch[1].trim().split(/\s+/);
    const prevDate = prevParts[0];
    const prevTime = prevParts.slice(1).join(' ');
    const newDate = newParts[0];
    const newTime = newParts.slice(1).join(' ');
    
    return `Previous: ${formatDate(prevDate)} ${prevTime}\nNew: ${formatDate(newDate)} ${newTime}`;
  }
  
  // Pattern: 📅 Appointment Date: [date]
  // Pattern: 🕐 Appointment Time: [time]
  const dateMatch = message.match(/📅\s*Appointment\s+Date:\s*([^\n]+)/i);
  const timeMatch = message.match(/🕐\s*Appointment\s+Time:\s*([^\n]+)/i);
  
  if (dateMatch && timeMatch) {
    return `${formatDate(dateMatch[1].trim())} at ${timeMatch[1].trim()}`;
  } else if (dateMatch) {
    return formatDate(dateMatch[1].trim());
  }
  
  return null;
};

const extractDepartment = (message) => {
  // Pattern: 🏥 Department: [Department]
  const match = message.match(/🏥\s*Department:\s*([^\n]+)/i);
  if (match) return match[1].trim();
  return null;
};

const extractCategory = (message) => {
  // Pattern: 📋 Category: [Category]
  const match = message.match(/📋\s*Category:\s*([^\n]+)/i);
  if (match) return match[1].trim();
  return null;
};

export default Notifications;