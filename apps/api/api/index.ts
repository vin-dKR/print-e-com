// Vercel serverless function handler
// This file must be in the 'api/' directory for Vercel to recognize it as a serverless function

import 'dotenv/config';
import app from '../src/index.js';

// Export the Express app - Vercel will handle it as a serverless function
export default app;

