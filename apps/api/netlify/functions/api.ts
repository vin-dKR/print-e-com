// Netlify serverless function handler
import 'dotenv/config';
import serverlessExpress from '@vendia/serverless-express';
import app from '../../src/index.js';

// Wrap Express app with @vendia/serverless-express for Netlify Functions
export const handler = serverlessExpress({ app });

