// TRACE HERB - Production Security Configuration

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security middleware configuration
const securityConfig = {
  // Helmet configuration for security headers
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        connectSrc: ["'self'", "https:", "wss:"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        manifestSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // API rate limiting (stricter)
  apiRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 API requests per windowMs
    message: {
      error: 'Too many API requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // CORS configuration
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'https://trace-herb-farmer.railway.app',
        'https://trace-herb-consumer.railway.app',
        'https://trace-herb-processor.railway.app',
        'https://trace-herb-lab.railway.app',
        'https://trace-herb-regulator.railway.app',
        'https://trace-herb-stakeholder.railway.app',
        'https://trace-herb-management.railway.app',
        'https://trace-herb-supply-chain.railway.app',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://localhost:3004',
        'http://localhost:3005',
        'http://localhost:3006',
        'http://localhost:3007',
        'http://localhost:3008'
      ];
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'trace-herb-super-secret-key-change-in-production',
    expiresIn: '24h',
    issuer: 'trace-herb-system',
    audience: 'trace-herb-users'
  },

  // File upload security
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/csv',
      'application/json'
    ],
    maxFiles: 5
  },

  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || 'trace-herb-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }
};

module.exports = securityConfig;
