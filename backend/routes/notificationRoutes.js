import express from 'express';
import { getNotifications, markAsRead, markAllAsRead, checkBirthdayNotifications } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/check-birthdays', checkBirthdayNotifications);
router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

export default router;
