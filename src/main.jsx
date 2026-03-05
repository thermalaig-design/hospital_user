import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { NavigationProvider } from './context/ImprovedNavigationProvider'

// Get the last visited route on app boot, or default to '/'
const getSavedRoute = () => {
  const LAST_VISITED_ROUTE_KEY = 'lastVisitedRoute';
  const PUBLIC_ROUTES = ['/login', '/otp-verification', '/special-otp-verification', '/terms-and-conditions', '/privacy-policy'];
  
  try {
    const user = localStorage.getItem('user');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // Only restore route if user is logged in
    if (user && user !== 'null' && user !== 'undefined' && isLoggedIn) {
      const savedRoute = localStorage.getItem(LAST_VISITED_ROUTE_KEY);
      
      // Route must be saved, not a public route, and not empty
      if (savedRoute && !PUBLIC_ROUTES.includes(savedRoute) && savedRoute !== '/') {
        console.log('🔄 Restoring route:', savedRoute);
        return savedRoute;
      }
    }
  } catch (e) {
    console.error('Error getting saved route:', e);
  }
  
  return '/';
};

const initialRoute = getSavedRoute();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MemoryRouter initialEntries={[initialRoute]} initialIndex={0}>
      <NavigationProvider>
        <App />
      </NavigationProvider>
    </MemoryRouter>
  </StrictMode>,
)
