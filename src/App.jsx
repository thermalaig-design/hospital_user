import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LocalNotifications } from '@capacitor/local-notifications';
import { initPushNotifications } from './services/pushNotificationService';
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
import { setupDebugFunctions } from './utils/testNotificationHelper';
import { getCurrentNotificationContext, matchesNotificationForContext } from './services/notificationAudience';

// Setup debug functions for development/testing
setupDebugFunctions();

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

  // â”€â”€â”€ Notification Tap â†’ Open Notifications Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    // When user taps a phone notification, navigate to /notifications
    const subscription = LocalNotifications.addListener(
      'localNotificationActionPerformed',
      (action) => {
        console.log('ðŸ”” Notification tapped:', action);
        const notificationId =
          action?.notification?.extra?.notificationId ||
          action?.notification?.extra?.notification_id ||
          action?.notification?.data?.notificationId ||
          action?.notification?.id ||
          null;

        if (notificationId) {
          sessionStorage.setItem('openNotificationId', String(notificationId));
        }

        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn) {
          navigate('/notifications');
        }
      }
    );
    return () => {
      subscription.then(s => s.remove()).catch(() => { });
    };
  }, [navigate]);

  // â”€â”€â”€ FCM Push Registration (Android) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    let cleanup;
    const setupPush = async () => {
      cleanup = await initPushNotifications();
    };
    setupPush();
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);

  // â”€â”€â”€ Push Tap Deep Link Fallback â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const shouldOpen = localStorage.getItem('openNotificationsFromPush');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (shouldOpen === '1' && isLoggedIn) {
      localStorage.removeItem('openNotificationsFromPush');
      navigate('/notifications');
    }
  }, [location.pathname, navigate]);

  // â”€â”€â”€ Birthday Notification Check (Direct Supabase) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const checkBirthday = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          console.log('ðŸŽ‚ [Birthday] No user in localStorage, skipping');
          return;
        }

        const parsedUser = JSON.parse(userStr);
        console.log('ðŸŽ‚ [Birthday] parsedUser keys:', Object.keys(parsedUser));
        console.log('ðŸŽ‚ [Birthday] Mobile:', parsedUser.Mobile || parsedUser.mobile);
        console.log('ðŸŽ‚ [Birthday] Membership number:', parsedUser['Membership number']);

        // Extract mobile number for user_profiles search
        const mobileForSearch = parsedUser.Mobile || parsedUser.mobile || parsedUser.phone || '';
        // Extract membership/identifier for notification user_id storage
        const membershipId = parsedUser['Membership number'] || parsedUser['membership_number'] || '';
        // Primary userId = mobile (most reliable for notifications lookup)
        const userId = mobileForSearch || membershipId || String(parsedUser.id || '');

        if (!userId) {
          console.log('ðŸŽ‚ [Birthday] No userId found in user object, skipping');
          return;
        }
        console.log('ðŸŽ‚ [Birthday] userId (for notifications):', userId);
        console.log('ðŸŽ‚ [Birthday] mobileForSearch:', mobileForSearch);
        console.log('ðŸŽ‚ [Birthday] membershipId:', membershipId);

        // Avoid showing local notification more than once per day
        const todayIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
        const today = todayIST.toISOString().slice(0, 10); // YYYY-MM-DD
        const localKey = `birthdayNotif_${userId}_${today}`;
        if (localStorage.getItem(localKey)) {
          console.log('ðŸŽ‚ [Birthday] Already shown today, skipping');
          return;
        }

        // Import supabase dynamically to avoid circular deps
        const { supabase } = await import('./services/supabaseClient');

        // 1. Build OR condition using all available identifiers
        // user_profiles.mobile = phone number, user_profiles.user_identifier = membership number
        let orCondition = '';
        const orParts = [];
        if (mobileForSearch) {
          orParts.push(`mobile.eq.${mobileForSearch}`);
          // Also try last 10 digits in case stored with/without country code
          const last10 = mobileForSearch.replace(/\D/g, '').slice(-10);
          if (last10 && last10 !== mobileForSearch) {
            orParts.push(`mobile.ilike.%${last10}%`);
          }
        }
        if (membershipId) {
          orParts.push(`user_identifier.eq.${membershipId}`);
        }
        orCondition = orParts.join(',');

        console.log('ðŸŽ‚ [Birthday] Querying user_profiles with OR:', orCondition);

        const { data: profileRows, error: profileError } = await supabase
          .from('user_profiles')
          .select('name, dob, mobile, user_identifier')
          .or(orCondition)
          .limit(5);

        console.log('ðŸŽ‚ [Birthday] profileRows:', JSON.stringify(profileRows), 'error:', profileError?.message);

        let profile = profileRows && profileRows.length > 0 ? profileRows[0] : null;

        // Fallback: if no match, fetch first 50 and search manually (handles name-based IDs)
        if (!profile) {
          console.log('ðŸŽ‚ [Birthday] No direct match, fetching all profiles to search...');
          const { data: allProfiles } = await supabase
            .from('user_profiles')
            .select('name, dob, mobile, user_identifier')
            .limit(50);
          if (allProfiles) {
            profile = allProfiles.find(p =>
              String(p.mobile) === String(userId) ||
              String(p.user_identifier) === String(userId)
            ) || null;
            console.log('ðŸŽ‚ [Birthday] Fallback search result:', profile ? profile.name : 'not found');
          }
        }

        if (!profile) {
          console.log('ðŸŽ‚ [Birthday] No profile found for userId:', userId);
          return;
        }

        if (!profile.dob) {
          console.log('ðŸŽ‚ [Birthday] Profile found but DOB is empty for:', profile.name);
          return;
        }

        console.log('ðŸŽ‚ [Birthday] Profile DOB:', profile.dob);

        // 2. Compare DOB month+day with today
        const dobParts = profile.dob.split('-');
        if (dobParts.length < 3) {
          console.log('ðŸŽ‚ [Birthday] Invalid DOB format:', profile.dob);
          return;
        }
        const dobMonth = dobParts[1];
        const dobDay = dobParts[2].substring(0, 2);
        const todayMonth = String(todayIST.getUTCMonth() + 1).padStart(2, '0');
        const todayDay = String(todayIST.getUTCDate()).padStart(2, '0');

        console.log(`ðŸŽ‚ [Birthday] DOB: ${dobMonth}-${dobDay} | Today: ${todayMonth}-${todayDay}`);

        if (dobMonth !== todayMonth || dobDay !== todayDay) {
          console.log('ðŸŽ‚ [Birthday] Not birthday today, skipping');
          return;
        }

        const userName = profile.name || 'Member';
        console.log(`ðŸŽ‰ [Birthday] BIRTHDAY DETECTED for: ${userName}`);

        // 3. Check if birthday notification already inserted today in DB
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', String(userId))
          .eq('type', 'birthday')
          .gte('created_at', `${today}T00:00:00.000Z`)
          .limit(1);

        const birthdayMessage = `ðŸŽ‚ Maharaja Agrasen Samiti ki taraf se aapko janamdin ki hardik shubhkamnayein, ${userName} ji! Aapka yeh din bahut khaas ho! ðŸŽ‰ðŸŽŠ`;

        if (!existing || existing.length === 0) {
          // Insert birthday notification into DB (shows in Notifications screen)
          const { error: insertErr } = await supabase.from('notifications').insert({
            user_id: String(userId),
            title: 'ðŸŽ‚ Happy Birthday!',
            message: birthdayMessage,
            type: 'birthday',
            is_read: false,
            created_at: new Date().toISOString(),
          });
          if (insertErr) {
            console.error('ðŸŽ‚ [Birthday] DB insert error:', insertErr.message);
          } else {
            console.log('âœ… [Birthday] Notification inserted in DB successfully');
          }
        } else {
          console.log('ðŸŽ‚ [Birthday] Already in DB for today, skipping insert');
        }

        // 4. Mark shown locally so it doesn't repeat today
        localStorage.setItem(localKey, '1');

        // 4b. Dispatch event so Home.jsx re-fetches notifications immediately
        window.dispatchEvent(new Event('birthdayNotifInserted'));

        // 5. Show Capacitor local push notification on phone
        try {
          // Step A: Create notification channel (required on Android 8+)
          await LocalNotifications.createChannel({
            id: 'birthday_channel',
            name: 'Birthday Wishes',
            description: 'Birthday notifications from Mah-Setu app',
            importance: 5,        // IMPORTANCE_HIGH â€” shows as heads-up popup
            visibility: 1,        // VISIBILITY_PUBLIC
            sound: 'default',
            vibration: true,
            lights: true,
            lightColor: '#FF4F46E5',
          });

          // Step B: Request permission (Android 13+)
          const permResult = await LocalNotifications.requestPermissions();
          console.log('ðŸ”” [Birthday] Notification permission result:', permResult.display);

          // Step C: Schedule notification
          const canNotify = permResult.display === 'granted';
          if (canNotify) {
            const notifId = Date.now() % 2147483647;
            await LocalNotifications.schedule({
              notifications: [
                {
                  id: notifId,
                  title: 'ðŸŽ‚ Happy Birthday!',
                  body: `Mah-Setu ki taraf se ${userName} ji ko janamdin ki hardik shubhkamnayein! ðŸŽ‰ðŸŽŠ`,
                  channelId: 'birthday_channel',
                  schedule: { at: new Date(Date.now() + 2000), allowWhileIdle: true },
                  sound: null,
                  attachments: null,
                  actionTypeId: '',
                  extra: null,
                },
              ],
            });
            console.log('ðŸŽ‚ [Birthday] Push notification scheduled! ID:', notifId);
          } else {
            console.warn('ðŸ”• [Birthday] Permission not granted:', permResult.display);
          }
        } catch (notifErr) {
          console.warn('[Birthday] LocalNotifications error:', notifErr.message || notifErr);
        }
      } catch (err) {
        console.error('[Birthday] Unexpected error:', err);
      }
    };

    // Small delay so app fully loads before check
    const timer = setTimeout(checkBirthday, 3000);
    return () => clearTimeout(timer);

  }, []);

  // Notification listener for Supabase -> LocalNotifications (no Firebase required)
  useEffect(() => {
    let pollInterval = null;
    let timer = null;
    let supabaseRef = null;
    let realtimeChannel = null;
    let isDisposed = false;

    const setupNotificationListener = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          console.log('[NotifListener] No user in localStorage, skipping setup');
          return;
        }

        const notificationContext = getCurrentNotificationContext();
        const { userId, userIdVariants, audienceVariants } = notificationContext;

        if (!userId) {
          console.log('[NotifListener] No userId found, skipping setup');
          return;
        }

        console.log('[NotifListener] Setting up for user:', userId, 'variants:', userIdVariants);

        const { supabase } = await import('./services/supabaseClient');
        supabaseRef = supabase;

        const notificationTracker = new Set();
        const trackerKey = `shownNotifications_${userId}`;
        const normalizeId = (value) => String(value || '').trim().toLowerCase();
        const fallbackUserIdSet = new Set();
        const fallbackUserIdRawSet = new Set();

        const refreshFallbackUserIds = async () => {
          try {
            const { data: linkedAppointments } = await supabase
              .from('appointments')
              .select('patient_name, membership_number, user_id')
              .in('patient_phone', userIdVariants)
              .limit(500);

            fallbackUserIdSet.clear();
            fallbackUserIdRawSet.clear();
            (linkedAppointments || []).forEach((row) => {
              const patientName = String(row?.patient_name || '').trim();
              const membershipNumber = String(row?.membership_number || '').trim();
              const appointmentUserId = String(row?.user_id || '').trim();

              if (patientName) {
                fallbackUserIdRawSet.add(patientName);
                fallbackUserIdSet.add(normalizeId(patientName));
              }
              if (membershipNumber) {
                fallbackUserIdRawSet.add(membershipNumber);
                fallbackUserIdSet.add(normalizeId(membershipNumber));
              }
              if (appointmentUserId) {
                fallbackUserIdRawSet.add(appointmentUserId);
                fallbackUserIdSet.add(normalizeId(appointmentUserId));
              }
            });
          } catch (fallbackErr) {
            console.warn('[NotifListener] Fallback user-id refresh failed:', fallbackErr?.message || fallbackErr);
          }
        };

        await refreshFallbackUserIds();
        const existing = localStorage.getItem(trackerKey);
        if (existing) {
          try {
            const existingIds = JSON.parse(existing);
            existingIds.forEach((id) => notificationTracker.add(id));
          } catch {
            console.warn('[NotifListener] Could not parse notification tracker');
          }
        }

        const showPushNotification = async (notification) => {
          if (isDisposed || notificationTracker.has(notification.id)) return;

          try {
            // Keep in-app UI (Home bell/dropdown) in sync immediately.
            window.dispatchEvent(new CustomEvent('pushNotificationArrived', { detail: notification }));

            await LocalNotifications.createChannel({
              id: `notif_channel_${notification.type || 'general'}`,
              name: notification.type === 'appointment_insert' ? 'Appointment Updates'
                : notification.type === 'referral' ? 'Referral Updates'
                  : notification.type === 'birthday' ? 'Birthday Wishes'
                    : notification.type === 'test' ? 'Test Notifications'
                      : 'Hospital Notifications',
              description: 'Updates from Mah-Setu app',
              importance: 5,
              visibility: 1,
              sound: 'default',
              vibration: true,
              lights: true,
              lightColor: '#FF4F46E5',
            });

            const permResult = await LocalNotifications.requestPermissions();
            if (permResult.display !== 'granted') {
              console.warn('[NotifListener] Permission not granted:', permResult.display);
              return;
            }

            const notifId = Date.now() % 2147483647;
            await LocalNotifications.schedule({
              notifications: [
                {
                  id: notifId,
                  title: notification.title || 'New Notification',
                  body: (notification.message || notification.body || 'You have a new notification').substring(0, 200),
                  channelId: `notif_channel_${notification.type || 'general'}`,
                  schedule: { at: new Date(Date.now() + 500), allowWhileIdle: true },
                  sound: null,
                  attachments: null,
                  actionTypeId: '',
                  extra: { notificationId: notification.id },
                },
              ],
            });

            notificationTracker.add(notification.id);
            const recentIds = Array.from(notificationTracker).slice(-100);
            localStorage.setItem(trackerKey, JSON.stringify(recentIds));
          } catch (err) {
            console.error('[NotifListener] Error showing notification:', err.message || err);
          }
        };

        pollInterval = setInterval(async () => {
          try {
            if (isDisposed) return;

            const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();

            const notificationUserIds = [
              ...new Set([
                ...userIdVariants,
                ...Array.from(fallbackUserIdRawSet),
              ]),
            ];

            const { data: userNotifications, error: userNotifError } = await supabase
              .from('notifications')
              .select('*')
              .in('user_id', notificationUserIds)
              .gte('created_at', fiveSecondsAgo)
              .order('created_at', { ascending: false });

            if (userNotifError) {
              console.error('[NotifListener] User polling error:', userNotifError.message);
              return;
            }

            const { data: audienceNotifications, error: audienceError } = await supabase
              .from('notifications')
              .select('*')
              .in('target_audience', audienceVariants)
              .gte('created_at', fiveSecondsAgo)
              .order('created_at', { ascending: false });

            if (audienceError) {
              console.error('[NotifListener] Audience polling error:', audienceError.message);
              return;
            }

            const merged = [...(userNotifications || []), ...(audienceNotifications || [])];
            const uniqueRecent = [...new Map(merged.map((item) => [item.id, item])).values()];

            for (const notif of uniqueRecent) {
              if (notif.type !== 'birthday' && !notificationTracker.has(notif.id)) {
                await showPushNotification(notif);
              }
            }
          } catch (err) {
            console.error('[NotifListener] Polling error:', err.message || err);
          }
        }, 5000);

        try {
          realtimeChannel = supabase
            .channel(`notifications_channel_${userId}`)
            .on(
              'postgres_changes',
              { event: 'INSERT', schema: 'public', table: 'notifications' },
              (payload) => {
                const newNotification = payload.new;
                const directMatch = matchesNotificationForContext(newNotification, notificationContext);
                const fallbackMatch = fallbackUserIdSet.has(normalizeId(newNotification?.user_id));
                const isForThisUser = directMatch || fallbackMatch;

                if (isForThisUser && newNotification.type !== 'birthday') {
                  showPushNotification(newNotification);
                }
              }
            )
            .subscribe();
        } catch (rtErr) {
          console.warn('[NotifListener] Real-time setup warning:', rtErr.message || rtErr);
        }
      } catch (err) {
        console.error('[NotifListener] Setup error:', err);
      }
    };

    timer = setTimeout(setupNotificationListener, 2000);

    return () => {
      isDisposed = true;
      if (timer) clearTimeout(timer);
      if (pollInterval) clearInterval(pollInterval);
      if (supabaseRef && realtimeChannel) {
        supabaseRef.removeChannel(realtimeChannel).catch(() => { });
      }
    };
  }, [location.pathname]);

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
    age: '',
    gender: '',
    patientEmail: '',
    relationship: '',
    relationshipText: '',
    isFirstVisit: '' // 'yes' | 'no' | ''
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

