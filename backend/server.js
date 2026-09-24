import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Serve static frontend in production if built
const distPath = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('ARIYAAN Backend API is running. Frontend dev server should be running on port 5173.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  ARIYAAN AI Assistant Backend Server`);
  console.log(`  Running on: http://localhost:${PORT}`);
  console.log(`  API Health: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
