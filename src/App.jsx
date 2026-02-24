import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LocalNotifications } from '@capacitor/local-notifications';
import Login from './Login';
import Home from './Home';
import OTPVerification from './OTPVerification';
import SpecialOTPVerification from './SpecialOTPVerification';
import Directory from './Directory';
import Profile from './Profile';
import Appointments from './Appointments';
import Reports from './Reports';
import Referral from './Referral';
import Notices from './Notices';
import Notifications from './Notifications';
import HealthcareTrusteeDirectory from './HealthcareTrusteeDirectory';
import MemberDetails from './MemberDetails';
import CommitteeMembers from './CommitteeMembers';
import ProtectedRoute from './ProtectedRoute';
import SponsorDetails from './SponsorDetails';
import DeveloperDetails from './DeveloperDetails';

import TermsAndConditions from './TermsAndConditions';
import PrivacyPolicy from './PrivacyPolicy';
import Gallery from './Gallery';
import AdminUserProfiles from './admin/AdminUserProfiles';

import {
  useAndroidBackHandler,
  useAndroidStatusBar,
  useAndroidSafeArea,
  useAndroidScreenOrientation,
  useAndroidKeyboard,
  useSwipeBackNavigation
} from './hooks';

const HospitalTrusteeApp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMember] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [previousScreen, setPreviousScreen] = useState(null);
  const [previousScreenName, setPreviousScreenName] = useState(null);

  // Initialize Android features
  useAndroidBackHandler();
  useSwipeBackNavigation();
  useAndroidStatusBar();
  useAndroidSafeArea();
  useAndroidScreenOrientation('PORTRAIT');
  useAndroidKeyboard();

  // ─── Birthday Notification Check (Direct Supabase) ──────────────────────
  useEffect(() => {
    const checkBirthday = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;

        const parsedUser = JSON.parse(userStr);
        const userId = parsedUser['Membership number'] || parsedUser.Mobile || parsedUser.mobile || parsedUser.id;
        if (!userId) return;

        // Avoid showing local notification more than once per day
        const todayIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
        const today = todayIST.toISOString().slice(0, 10); // YYYY-MM-DD
        const localKey = `birthdayNotif_${userId}_${today}`;
        if (localStorage.getItem(localKey)) return;

        // Import supabase dynamically to avoid circular deps
        const { supabase } = await import('./services/supabaseClient');

        // 1. Fetch user profile from Supabase directly
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('name, dob')
          .or(`mobile.eq.${userId},user_identifier.eq.${userId}`)
          .limit(1)
          .single();

        if (profileError || !profile || !profile.dob) return;

        // 2. Compare DOB month+day with today
        const dobParts = profile.dob.split('-');
        if (dobParts.length < 3) return;
        const dobMonth = dobParts[1];
        const dobDay = dobParts[2].substring(0, 2);
        const todayMonth = String(todayIST.getUTCMonth() + 1).padStart(2, '0');
        const todayDay = String(todayIST.getUTCDate()).padStart(2, '0');

        if (dobMonth !== todayMonth || dobDay !== todayDay) return;

        const userName = profile.name || 'Member';
        console.log(`🎉 Birthday detected for: ${userName}`);

        // 3. Check if birthday notification already inserted today in DB
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', String(userId))
          .eq('type', 'birthday')
          .gte('created_at', `${today}T00:00:00.000Z`)
          .limit(1);

        const birthdayMessage = `🎂 Maharaja Agrasen Samiti ki taraf se aapko janamdin ki hardik shubhkamnayein, ${userName} ji! Aapka yeh din bahut khaas ho! 🎉🎊`;

        if (!existing || existing.length === 0) {
          // Insert birthday notification into DB (shows in Notifications screen)
          await supabase.from('notifications').insert({
            user_id: String(userId),
            title: '🎂 Happy Birthday!',
            message: birthdayMessage,
            type: 'birthday',
            is_read: false,
            created_at: new Date().toISOString(),
          });
          console.log('✅ Birthday notification inserted in DB');
        }

        // 4. Mark shown locally so it doesn't repeat today
        localStorage.setItem(localKey, '1');

        // 5. Show Capacitor local push notification on phone
        try {
          const permResult = await LocalNotifications.requestPermissions();
          if (permResult.display === 'granted' || permResult.display === 'prompt-with-rationale') {
            await LocalNotifications.schedule({
              notifications: [
                {
                  id: Math.floor(Math.random() * 100000),
                  title: '🎂 Happy Birthday!',
                  body: `Maharaja Agrasen Samiti ki taraf se aapko janamdin ki hardik shubhkamnayein, ${userName} ji! 🎉🎊`,
                  schedule: { at: new Date(Date.now() + 1000) },
                  sound: 'default',
                  smallIcon: 'ic_launcher',
                  actionTypeId: '',
                  extra: null,
                },
              ],
            });
            console.log('🎂 Birthday push notification scheduled!');
          }
        } catch (notifErr) {
          console.warn('LocalNotifications not available (web mode):', notifErr.message);
        }
      } catch (err) {
        console.error('Birthday check error:', err);
      }
    };

    // Small delay so app fully loads before check
    const timer = setTimeout(checkBirthday, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Appointment state
  const [appointmentForm, setAppointmentForm] = useState({
    patientName: '',
    phone: '',
    doctor: '',
    date: '',
    time: '',
    reason: '',
    // Fields for booking for someone else
    bookingFor: 'self', // 'self' or 'someone'
    patientRelationship: '', // Relationship to the patient
    patientAge: '',
    patientGender: '',
    patientEmail: '',
    relationship: '',
    relationshipText: ''
  });

  // Reference state
  const [referenceView, setReferenceView] = useState('menu'); // menu, addNew, history
  const [newReference, setNewReference] = useState({
    patientName: '',
    age: '',
    gender: '',
    phone: '',
    referredTo: '',
    condition: '',
    category: '',
    notes: ''
  });

  // Navigation handler - supports both route-based and state-based navigation
  const handleNavigate = (screen, data = null) => {
    if (screen === 'appointment' && !isMember) {
      alert('Only members can book appointments.');
      return;
    }
    if (screen === 'member-details' && data) {
      // Store the previous screen info
      setPreviousScreen(location.pathname);
      setPreviousScreenName(data.previousScreenName || location.pathname);
      setSelectedMember(data);
      // Store member data in sessionStorage for route access
      sessionStorage.setItem('selectedMember', JSON.stringify(data));
      sessionStorage.setItem('previousScreen', location.pathname);
      sessionStorage.setItem('previousScreenName', data.previousScreenName || location.pathname);
      navigate('/member-details');
    } else if (screen === 'committee-members' && data) {
      // Store the previous screen info for committee members
      setPreviousScreen(location.pathname);
      setPreviousScreenName(data.previousScreenName || location.pathname);
      setSelectedMember(data);
      // Store committee data in sessionStorage for route access
      sessionStorage.setItem('selectedMember', JSON.stringify(data));
      sessionStorage.setItem('previousScreen', location.pathname);
      sessionStorage.setItem('previousScreenName', data.previousScreenName || location.pathname);
      navigate('/committee-members');
    } else {
      // Map screen names to routes
      const routeMap = {
        'home': '/',
        'login': '/login',
        'profile': '/profile',
        'directory': '/directory',
        'healthcare-trustee-directory': '/healthcare-trustee-directory',
        'appointment': '/appointment',
        'reports': '/reports',
        'reference': '/reference',
        'notices': '/notices',
        'notifications': '/notifications',
        'committee-members': '/committee-members',
        'sponsor-details': '/sponsor-details',
        'developers': '/developers',
        'gallery': '/gallery',
        'admin-profiles': '/admin-profiles',
      };
      const route = routeMap[screen] || '/';
      console.log('Navigating to route:', screen, '->', route);
      navigate(route);
    }
  };

  // Load member data from sessionStorage on mount if on member-details route
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (location.pathname === '/member-details') {
      const storedMember = sessionStorage.getItem('selectedMember');
      const storedPreviousScreen = sessionStorage.getItem('previousScreen');
      const storedPreviousScreenName = sessionStorage.getItem('previousScreenName');

      if (storedMember) {
        try {
          const parsedMember = JSON.parse(storedMember);
          // Only update if different to prevent infinite loops
          if (JSON.stringify(selectedMember) !== JSON.stringify(parsedMember)) {
            setSelectedMember(parsedMember);
          }
        } catch (e) {
          console.error('Error parsing stored member:', e);
        }
      }
      if (storedPreviousScreen) {
        if (previousScreen !== storedPreviousScreen) {
          setPreviousScreen(storedPreviousScreen);
        }
      }
      if (storedPreviousScreenName) {
        if (previousScreenName !== storedPreviousScreenName) {
          setPreviousScreenName(storedPreviousScreenName);
        }
      }
    }
  }, [location.pathname]);


  // Check if user should be on profile page
  const shouldShowProfile = () => {
    const user = localStorage.getItem('user');

    // If user exists in localStorage (just logged in) but no profile saved yet, show profile
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        const userKey = `userProfile_${parsedUser.Mobile || parsedUser.mobile || parsedUser.id || 'default'}`;
        const savedProfile = localStorage.getItem(userKey);

        // If no saved profile exists for this user, show profile page
        if (!savedProfile) {
          return true;
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        // If error parsing user, still show profile
        return true;
      }
    }

    return false;
  };

  return (
    <div className={`bg-white min-h-screen relative shadow-2xl overflow-x-hidden ${(location.pathname === '/login' || location.pathname === '/otp-verification' || location.pathname === '/profile') ? 'overflow-hidden' : 'overflow-y-auto'
      } max-w-full md:max-w-[430px] md:mx-auto pt-2`}>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home
                onNavigate={handleNavigate}
                onLogout={() => {
                  localStorage.removeItem('isLoggedIn');
                  localStorage.removeItem('user');
                  navigate('/login');
                }}
                isMember={isMember}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile
                onNavigate={handleNavigate}
                onNavigateBack={() => navigate('/')}
                onProfileUpdate={() => { }}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/directory"
          element={
            <ProtectedRoute>
              <HealthcareTrusteeDirectory
                onNavigate={handleNavigate}
                onNavigateBack={() => navigate('/')}
                onLogout={() => {
                  localStorage.removeItem('isLoggedIn');
                  localStorage.removeItem('user');
                  navigate('/login');
                }}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/healthcare-trustee-directory"
          element={
            <ProtectedRoute>
              <HealthcareTrusteeDirectory
                onNavigate={handleNavigate}
                onNavigateBack={() => navigate('/')}
                onLogout={() => {
                  localStorage.removeItem('user');
                  localStorage.removeItem('isLoggedIn');
                  navigate('/login');
                }}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointment"
          element={
            <ProtectedRoute>
              <Appointments
                onNavigate={handleNavigate}
                appointmentForm={appointmentForm}
                setAppointmentForm={setAppointmentForm}
                onNavigateBack={() => navigate('/')}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports onNavigate={handleNavigate} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reference"
          element={
            <ProtectedRoute>
              <Referral
                onNavigate={handleNavigate}
                referenceView={referenceView}
                setReferenceView={setReferenceView}
                newReference={newReference}
                setNewReference={setNewReference}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notices"
          element={
            <ProtectedRoute>
              <Notices onNavigate={handleNavigate} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications onNavigate={handleNavigate} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member-details"
          element={
            <ProtectedRoute>
              {selectedMember ? (
                <MemberDetails
                  member={selectedMember}
                  onNavigate={handleNavigate}
                  onNavigateBack={() => {
                    // Navigate back to the specific directory tab, not just main directory
                    if (previousScreenName && (previousScreenName === 'healthcare' || previousScreenName === 'committee' || previousScreenName === 'trustee')) {
                      navigate('/healthcare-trustee-directory');
                      // Store the directory and tab to restore state
                      sessionStorage.setItem('restoreDirectory', previousScreenName);
                    } else if (previousScreenName && (previousScreenName === 'healthcare' || previousScreenName === 'trustees' || previousScreenName === 'patrons' || previousScreenName === 'committee' || previousScreenName === 'doctors' || previousScreenName === 'hospitals' || previousScreenName === 'elected')) {
                      navigate('/directory');
                      // Store the tab to restore state
                      sessionStorage.setItem('restoreDirectoryTab', previousScreenName);
                    } else {
                      const prevScreen = previousScreen || '/directory';
                      navigate(prevScreen);
                    }
                  }}
                  previousScreenName={previousScreenName}
                />
              ) : (
                <Navigate to="/directory" replace />
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/committee-members"
          element={
            <ProtectedRoute>
              {selectedMember ? (
                <CommitteeMembers
                  committeeData={selectedMember}
                  onNavigateBack={() => {
                    // Navigate back to the specific directory tab, not just main directory
                    if (previousScreenName && (previousScreenName === 'healthcare' || previousScreenName === 'committee' || previousScreenName === 'trustee')) {
                      navigate('/healthcare-trustee-directory');
                      // Store the directory and tab to restore state
                      sessionStorage.setItem('restoreDirectory', previousScreenName);
                    } else {
                      const prevScreen = previousScreen || '/directory';
                      navigate(prevScreen);
                    }
                  }}
                  previousScreenName={previousScreenName}
                  onNavigate={handleNavigate}
                />
              ) : (
                <Navigate to="/directory" replace />
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sponsor-details"
          element={
            <ProtectedRoute>
              <SponsorDetails onBack={() => navigate(-1)} onNavigate={handleNavigate} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/developers"
          element={
            <ProtectedRoute>
              <DeveloperDetails
                onNavigateBack={() => navigate(-1)}
                onNavigate={handleNavigate}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gallery"
          element={
            <ProtectedRoute>
              <Gallery
                onNavigate={handleNavigate}
                onNavigateBack={() => navigate('/')}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-profiles"
          element={
            <ProtectedRoute>
              <AdminUserProfiles onNavigate={handleNavigate} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/otp-verification"
          element={<OTPVerification />}
        />
        <Route
          path="/special-otp-verification"
          element={<SpecialOTPVerification />}
        />
        <Route
          path="/terms-and-conditions"
          element={<TermsAndConditions />}
        />
        <Route
          path="/privacy-policy"
          element={<PrivacyPolicy />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default HospitalTrusteeApp;