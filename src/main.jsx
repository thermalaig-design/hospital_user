import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { NavigationProvider } from './context/ImprovedNavigationProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MemoryRouter initialEntries={['/']} initialIndex={0}>
      <NavigationProvider>
        <App />
      </NavigationProvider>
    </MemoryRouter>
  </StrictMode>,
)
