import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import process from 'process';
import path from 'path';
import { fileURLToPath } from 'url';
import marqueeRoutes from './routes/marqueeRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import memberRoutes from './routes/memberRoutes.js';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import sponsorRoutes from './routes/sponsorRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5002;

// --------------------
// MIDDLEWARE
// --------------------

// CORS configuration
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173', // Vite default port
      'http://localhost:3000', // React default port
      'http://localhost:3001', // Alternative React port
      'http://localhost:5002', // Alternative port
     
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

  app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Handle favicon requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

// --------------------
// HEALTH CHECK ROUTES
// --------------------
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Hospital Management Backend API running 🚀',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      members: '/api/members',
      appointments: '/api/appointments',
      reports: '/api/reports',
      referrals: '/api/referrals',
      profile: '/api/profile',
      sponsors: '/api/sponsors',
      admin: '/api/admin'
    }
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Hospital Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      members: '/api/members',
      appointments: '/api/appointments',
      reports: '/api/reports',
      referrals: '/api/referrals',
      profile: '/api/profile',
      sponsors: '/api/sponsors',
      admin: '/api/admin'
    }
  });
});

// --------------------
// API ROUTES
// --------------------
app.use('/api/auth', authRoutes);
app.use('/api/marquee', marqueeRoutes); // Marquee routes BEFORE member routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/sponsors', sponsorRoutes); // Sponsor routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes); // Admin routes
app.use('/api', memberRoutes); // Member routes last to avoid catching other routes
// --------------------
// ERROR HANDLING
// --------------------
app.use(notFound);
app.use(errorHandler);

// --------------------
// START SERVER
// --------------------
app.listen(PORT, () => {
  console.log('🚀 Server is running on port', PORT);
  console.log(`📍 API URL: https://hospital-trustee-fiwe.vercel.app/`);
  console.log(`📍 API URL: https://hospital-trustee-fiwe.vercel.app/api/auth`);
  console.log('🌐 Production URL:', `https://hospital-trustee-fiwe.vercel.app/`);
});
  