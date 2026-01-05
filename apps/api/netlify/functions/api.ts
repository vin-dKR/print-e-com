// Netlify serverless function handler
import 'dotenv/config';
import app from '../../src/index.js';

// Netlify Functions handler
export const handler = app;

