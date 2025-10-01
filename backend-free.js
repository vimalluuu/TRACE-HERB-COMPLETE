// TRACE HERB Backend - Optimized for FREE hosting
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// FREE tier optimizations
const FREE_TIER_CONFIG = {
  // Reduce memory usage
  maxMemory: '256MB',
  
  // Optimize for Railway free tier
  maxRequestSize: '1mb',
  
  // Cache settings for free tiers
  cacheEnabled: true,
  cacheTTL: 3600, // 1 hour
  
  // Rate limiting for free tiers
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50 // 50 requests per window
  }
};

// Middleware optimized for free hosting
app.use(helmet({
  contentSecurityPolicy: false, // Simplified for free hosting
}));

app.use(compression()); // Reduce bandwidth usage

app.use(cors({
  origin: [
    'https://trace-herb-farmer.vercel.app',
    'https://trace-herb-consumer.netlify.app',
    'http://localhost:3001',
    'http://localhost:3002'
  ],
  credentials: true
}));

app.use(express.json({ limit: '1mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Simple in-memory storage for free tier (no database needed)
let batches = [];
let users = [];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    hosting: 'free-tier',
    memory: process.memoryUsage(),
    uptime: process.uptime()
  });
});

// Batch endpoints (simplified for free tier)
app.get('/api/batches', (req, res) => {
  res.json({
    success: true,
    data: batches,
    count: batches.length
  });
});

app.post('/api/batches', (req, res) => {
  const batch = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  
  batches.push(batch);
  
  res.json({
    success: true,
    data: batch
  });
});

app.get('/api/batches/:id', (req, res) => {
  const batch = batches.find(b => b.id === req.params.id);
  
  if (!batch) {
    return res.status(404).json({
      success: false,
      message: 'Batch not found'
    });
  }
  
  res.json({
    success: true,
    data: batch
  });
});

// QR Code generation (simplified)
app.post('/api/qr-generate', (req, res) => {
  const { data } = req.body;
  
  // Simple QR data (in production, use proper QR library)
  const qrData = {
    url: `https://trace-herb-consumer.netlify.app/verify/${data}`,
    data: data,
    timestamp: new Date().toISOString()
  };
  
  res.json({
    success: true,
    qr: qrData
  });
});

// Location services (simplified)
app.post('/api/location/reverse-geocode', (req, res) => {
  const { lat, lng } = req.body;
  
  // Simplified geocoding (in production, use proper service)
  const location = {
    address: `Location at ${lat}, ${lng}`,
    city: 'Unknown City',
    state: 'Unknown State',
    country: 'Unknown Country'
  };
  
  res.json({
    success: true,
    location: location
  });
});

// User authentication (simplified)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple authentication (in production, use proper auth)
  if (username && password) {
    const user = {
      id: Date.now().toString(),
      username: username,
      role: 'farmer',
      token: 'simple-token-' + Date.now()
    };
    
    res.json({
      success: true,
      user: user
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// File upload (simplified for free tier)
app.post('/api/upload', (req, res) => {
  // Simplified file handling
  res.json({
    success: true,
    message: 'File upload simulated for free tier',
    url: 'https://via.placeholder.com/300x200'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TRACE HERB Backend (FREE) running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💰 Hosting: FREE tier optimized`);
  console.log(`📊 Memory limit: ${FREE_TIER_CONFIG.maxMemory}`);
});

module.exports = app;
