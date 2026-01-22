// Test script to make proper request to the backend
import http from 'http';
import { Buffer } from 'buffer';

const postData = JSON.stringify({
  phoneNumber: '7678417192'
});

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/check-phone',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Sending request to test OTP functionality...');

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response status:', res.statusCode);
    console.log('Response headers:', res.headers);
    console.log('Response body:', data);
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.write(postData);
req.end();