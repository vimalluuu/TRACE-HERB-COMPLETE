/**
 * TRACE HERB Backend API Server
 * Main application entry point
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
require('dotenv').config();

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { connectToBlockchain } = require('./services/blockchainService');
const { connectToDatabase } = require('./services/databaseService');
const { connectToRedis } = require('./services/cacheService');

// Import routes
const authRoutes = require('./routes/auth');
const collectionRoutes = require('./routes/collection');
const processingRoutes = require('./routes/processing');
const qualityRoutes = require('./routes/quality');
const provenanceRoutes = require('./routes/provenance');
const dashboardRoutes = require('./routes/dashboard');
const integrationRoutes = require('./routes/integration');
const healthRoutes = require('./routes/health');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
    'http://localhost:3001', // Consumer Portal
    'http://localhost:3002', // Farmer Portal
    'http://localhost:3003', // Stakeholder Dashboard (Legacy)
    'http://localhost:3004', // Processor Portal
    'http://localhost:3005', // Lab Portal
    'http://localhost:3006', // Supply Chain Overview
    'http://localhost:3007', // Regulator Portal
    'http://localhost:3008', // Management Portal
    'http://localhost:3009', // Supply Chain Overview (Alt Port)
    'http://localhost:3010'  // Enhanced Consumer Portal
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Rate limiting - Increased limits for development/testing
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 5) * 60 * 1000, // 5 minutes (reduced window)
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 1000, // 1000 requests (increased limit)
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((process.env.RATE_LIMIT_WINDOW || 5) * 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Slow down repeated requests - More lenient for development
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 500, // allow 500 requests per 15 minutes at full speed (increased)
  delayMs: 100 // slow down subsequent requests by 100ms per request (reduced delay)
});
app.use('/api/', speedLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation
if (process.env.ENABLE_SWAGGER === 'true') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerDocument = require('../docs/swagger.json');
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }'
  }));
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/processing', processingRoutes);
app.use('/api/lab', require('./routes/lab'));
app.use('/api/quality', qualityRoutes);
app.use('/api/provenance', provenanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/integration', integrationRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/workflow', require('./routes/workflow'));
app.use('/api/regulator', require('./routes/regulator'));
app.use('/api/ai', aiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TRACE HERB Blockchain Traceability API',
    version: process.env.npm_package_version || '1.0.0',
    documentation: process.env.ENABLE_SWAGGER === 'true' ? '/api-docs' : 'Not available',
    health: '/health'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: [
      '/api/auth',
      '/api/collection',
      '/api/processing',
      '/api/quality',
      '/api/provenance',
      '/api/dashboard',
      '/api/integration',
      '/api/health'
    ]
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed.');
    
    // Close database connections
    // Close Redis connections
    // Close blockchain connections
    
    process.exit(0);
  });
  
  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Initialize services and start server
async function startServer() {
  try {
    logger.info('Starting TRACE HERB Backend Server...');
    
    // Initialize connections
    await connectToDatabase();
    logger.info('Database connection established');
    
    await connectToRedis();
    logger.info('Redis connection established');
    
    await connectToBlockchain();
    logger.info('Blockchain connection established');
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API Documentation: ${process.env.ENABLE_SWAGGER === 'true' ? `http://localhost:${PORT}/api-docs` : 'Disabled'}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    return server;
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;
