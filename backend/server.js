const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/database');
const models = require('./models');
const authRoutes = require('./routes/auth');
const storyRoutes = require('./routes/stories');
const bookmarkRoutes = require('./routes/bookmarks');
const shareRoutes = require('./routes/shares');
const seriesRoutes = require('./routes/series');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-frontend-domain.com' 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy for rate limiting with proper IP detection
app.set('trust proxy', 1);

// Connect to PostgreSQL
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api/series', seriesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Story Sharing API is running',
    timestamp: new Date().toISOString(),
    features: [
      'Authentication',
      'Stories',
      'Bookmarks', 
      'Shares',
      'Series',
      'Comments',
      'Likes',
      'User Management'
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    error: {
      message: error.message || 'Internal Server Error'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found'
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Available API routes:');
  console.log('  - /api/auth (Authentication)');
  console.log('  - /api/stories (Story management)');
  console.log('  - /api/bookmarks (Bookmark functionality)');
  console.log('  - /api/shares (Share tracking)');
  console.log('  - /api/series (Story series)');
  console.log('  - /api/health (Health check)');
});