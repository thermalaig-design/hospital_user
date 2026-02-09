import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Android Back Handler Hook
 * Handles all Android back navigation methods:
 * 1. Hardware back button
 * 2. Virtual navigation bar back button  
 * 3. Edge swipe gestures (left/right) - handled by Android system
 * 4. Bottom navigation buttons
 * 
 * Features:
 * - Exits app when on root/home screen
 * - Navigates back in history for other screens
 * - Handles modals/drawers (can be extended)
 * - Works with both gesture navigation and 3-button navigation
 */
export const useAndroidBackHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle Android back button (physical + virtual + gesture)
    const backButtonListener = App.addListener('backButton', () => {
      console.log('Android back button pressed. Current path:', location.pathname);
      
      // Define root/home screens where app should exit
      const rootScreens = ['/', '/home', '/login'];
      
      if (rootScreens.includes(location.pathname)) {
        // On root screen - exit the app
        console.log('On root screen, exiting app...');
        App.exitApp();
      } else {
        // Not on root screen - navigate back
        console.log('Navigating back in history...');
        navigate(-1); // This uses React Router's history stack
        
        // Alternative: window.history.back() - also works
        // window.history.back();
      }
    });

    // Cleanup listener on unmount
    return () => {
      backButtonListener.remove();
    };
  }, [location.pathname, navigate]);

  // Return utility functions if needed
  return {
    // You can expose functions here if you want to manually trigger back
    goBack: () => navigate(-1),
    exitApp: () => App.exitApp()
  };
};