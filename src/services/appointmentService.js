// appointmentService.js - Frontend service for appointment booking
import { api } from './api';

const API_URL = 'http://31.97.205.94:5002/api';

/**
 * Book a new appointment
 */
export const bookAppointment = async (appointmentData) => {
  try {
    const response = await api.post('/appointments/book', appointmentData);
    return response.data;
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw error;
  }
};

/**
 * Get user's appointments
 */
export const getUserAppointments = async (phone) => {
  try {
    const response = await api.get(`/appointments/user/${phone}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (appointmentId) => {
  try {
    const response = await api.put(`/appointments/${appointmentId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error canceling appointment:', error);
    throw error;
  }
};
