# TRACE HERB - Multi-stage Production Dockerfile
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache libc6-compat curl git

# Set working directory
WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install root dependencies
RUN npm ci --only=production

# Backend build stage
FROM base AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

# Frontend build stage
FROM base AS frontend-build
WORKDIR /app

# Build all frontend portals
COPY frontend/ ./frontend/

# Build farmer portal
WORKDIR /app/frontend/farmer-dapp
COPY frontend/farmer-dapp/package*.json ./
RUN npm ci --only=production
RUN npm run build

# Build consumer portal
WORKDIR /app/frontend/enhanced-consumer-portal
COPY frontend/enhanced-consumer-portal/package*.json ./
RUN npm ci --only=production
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache curl

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy backend
COPY --from=backend-build --chown=nextjs:nodejs /app/backend ./backend

# Copy built frontend portals
COPY --from=frontend-build --chown=nextjs:nodejs /app/frontend ./frontend

# Create necessary directories
RUN mkdir -p logs uploads temp
RUN chown -R nextjs:nodejs logs uploads temp

# Switch to non-root user
USER nextjs

# Expose ports
EXPOSE 3000 3001 3002 3003 3004 3005 3006 3007 3008

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start script
COPY start-production.sh ./
RUN chmod +x start-production.sh

CMD ["./start-production.sh"]
