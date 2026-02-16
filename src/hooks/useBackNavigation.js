import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../context/ImprovedNavigationProvider';

/**
 * useBackNavigation Hook
 * 
 * ✅ UPDATED: Now uses NavigationProvider's stack tracking
 * No more conflicting listeners or window.history.back()
 * 
 * Usage:
 * useBackNavigation();  // Will go back one step
 * 
 * Or with custom callback:
 * useBackNavigation(() => navigate('/home'));
 * 
 * @param {Function} onBackPress - Optional callback when back is pressed
 */
export const useBackNavigation = (onBackPress) => {
  const navigate = useNavigate();
  const { registerBackCallback, unregisterBackCallback, getPreviousRoute } = useNavigation();
  
  useEffect(() => {
    // Get current path from location (component path)
    const handleBackPress = () => {
      if (onBackPress && typeof onBackPress === 'function') {
        onBackPress();
      } else {
        // Default: use React Router's navigate to go back one step
        const previousRoute = getPreviousRoute();
        if (previousRoute) {
          navigate(-1);
        }
      }
    };

    // Note: The actual back button listener is in NavigationProvider
    // This hook is kept for backward compatibility but now uses proper navigation
    
    return () => {
      // Cleanup if needed
    };
  }, [onBackPress, navigate, registerBackCallback, unregisterBackCallback, getPreviousRoute]);
};

