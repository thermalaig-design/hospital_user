import express from 'express';
import { checkPhone, verifyOTPController } from '../controllers/authController.js';

const router = express.Router();

// Check phone and send OTP
router.post('/check-phone', checkPhone);

// Verify OTP
router.post('/verify-otp', verifyOTPController);

export default router;