# TRACE HERB Deployment Guide

This guide provides comprehensive instructions for deploying the TRACE HERB blockchain-based traceability system for Ayurvedic herbs.

## Prerequisites

### System Requirements
- **Operating System**: Ubuntu 20.04 LTS or later, CentOS 8+, or macOS 10.15+
- **Memory**: Minimum 8GB RAM (16GB recommended for production)
- **Storage**: Minimum 100GB SSD (500GB recommended for production)
- **CPU**: 4+ cores (8+ cores recommended for production)
- **Network**: Stable internet connection with minimum 10 Mbps

### Software Dependencies
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **Node.js**: Version 16.0+ (LTS recommended)
- **npm**: Version 8.0+
- **Git**: Latest version
- **Python**: Version 3.8+ (for some build tools)

## Quick Start (Development)

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/trace-herb.git
cd trace-herb
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### 4. Start the Development Environment
```bash
# Start all services with Docker Compose
docker-compose up -d

# Wait for services to be ready (about 2-3 minutes)
sleep 180

# Deploy blockchain network and chaincode
cd blockchain
npm run start:network
npm run deploy:chaincode

# Start backend API
cd ../backend
npm run dev

# Start consumer portal (in new terminal)
cd ../frontend/consumer-portal
npm run dev

# Start dashboard (in new terminal)
cd ../frontend/dashboard
npm run dev
```

### 5. Verify Installation
- **API Health Check**: http://localhost:3000/health
- **Consumer Portal**: http://localhost:3001
- **Dashboard**: http://localhost:3002
- **API Documentation**: http://localhost:3000/api-docs

## Production Deployment

### 1. Server Preparation

#### Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

#### Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker
```

#### Install Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Application Deployment

#### Clone and Setup
```bash
git clone https://github.com/your-org/trace-herb.git
cd trace-herb

# Create production environment file
cp .env.example .env.production
```

#### Configure Environment Variables
Edit `.env.production` with production values:
```bash
NODE_ENV=production
PORT=3000

# Database Configuration
COUCHDB_HOST=couchdb
COUCHDB_USERNAME=admin
COUCHDB_PASSWORD=your-secure-password

# Blockchain Configuration
FABRIC_NETWORK_NAME=trace-herb-network
FABRIC_CHANNEL_NAME=herb-channel

# Security
JWT_SECRET=your-super-secure-jwt-secret-key
CORS_ORIGIN=https://your-domain.com

# External Services
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
SMS_GATEWAY_API_KEY=your-sms-gateway-api-key

# SSL Configuration
SSL_CERT_PATH=/etc/ssl/certs/your-cert.pem
SSL_KEY_PATH=/etc/ssl/private/your-key.pem
```

#### Build and Deploy
```bash
# Build all applications
npm run build

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Deploy blockchain network
cd blockchain
./scripts/start-network.sh
./scripts/deploy-chaincode.sh

# Initialize demo data (optional)
cd ../tests
node scripts/load-demo-data.js
```

### 3. SSL/TLS Configuration

#### Using Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Using Custom Certificates
```bash
# Copy certificates to appropriate locations
sudo cp your-cert.pem /etc/ssl/certs/
sudo cp your-key.pem /etc/ssl/private/
sudo chmod 600 /etc/ssl/private/your-key.pem
```

### 4. Reverse Proxy Configuration (Nginx)

Create `/etc/nginx/sites-available/trace-herb`:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Consumer Portal
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API Endpoints
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Dashboard
    location /dashboard/ {
        proxy_pass http://localhost:3002/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/trace-herb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Database Backup and Monitoring

#### Automated Backups
Create `/opt/trace-herb/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/opt/trace-herb/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup CouchDB
docker exec trace-herb_couchdb_1 couchdb-backup -H localhost:5984 -u admin -p password -d trace_herb > $BACKUP_DIR/couchdb_$DATE.json

# Backup blockchain data
tar -czf $BACKUP_DIR/blockchain_$DATE.tar.gz blockchain/network/crypto-config blockchain/network/channel-artifacts

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.json" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

Add to crontab:
```bash
sudo crontab -e
# Add: 0 2 * * * /opt/trace-herb/backup.sh
```

#### Monitoring Setup
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Setup log rotation
sudo nano /etc/logrotate.d/trace-herb
```

Add to logrotate config:
```
/opt/trace-herb/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}
```

## Mobile App Deployment

### Android APK Build
```bash
cd frontend/mobile-app

# Install Expo CLI
npm install -g @expo/cli

# Build APK
expo build:android --type apk

# Download and distribute APK
expo build:status
```

### iOS App Store Build
```bash
# Build for iOS
expo build:ios --type archive

# Submit to App Store (requires Apple Developer account)
expo upload:ios
```

## Testing the Deployment

### 1. Health Checks
```bash
# API Health
curl https://your-domain.com/api/health

# Database connectivity
curl https://your-domain.com/api/dashboard/stats

# Blockchain connectivity
curl https://your-domain.com/api/blockchain/status
```

### 2. End-to-End Testing
```bash
cd tests
npm test
```

### 3. Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load tests
artillery run load-tests/api-load-test.yml
```

## Maintenance and Updates

### Regular Maintenance Tasks
1. **Daily**: Check system logs and health metrics
2. **Weekly**: Review backup integrity and system performance
3. **Monthly**: Update dependencies and security patches
4. **Quarterly**: Full system backup and disaster recovery testing

### Update Procedure
```bash
# 1. Backup current system
./backup.sh

# 2. Pull latest changes
git pull origin main

# 3. Update dependencies
npm run install:all

# 4. Rebuild applications
npm run build

# 5. Restart services
docker-compose restart

# 6. Verify deployment
npm test
```

## Troubleshooting

### Common Issues

#### Blockchain Network Issues
```bash
# Check peer status
docker logs trace-herb_peer0.org1.trace-herb.com_1

# Restart blockchain network
cd blockchain
./scripts/stop-network.sh
./scripts/start-network.sh
```

#### Database Connection Issues
```bash
# Check CouchDB status
docker logs trace-herb_couchdb_1

# Reset database (WARNING: Data loss)
docker-compose down -v
docker-compose up -d
```

#### API Performance Issues
```bash
# Check API logs
docker logs trace-herb_backend_1

# Monitor resource usage
htop
docker stats
```

### Support and Documentation
- **Technical Documentation**: `/docs` directory
- **API Documentation**: https://your-domain.com/api-docs
- **Issue Tracking**: GitHub Issues
- **Community Support**: Discord/Slack channel

## Security Considerations

### Production Security Checklist
- [ ] SSL/TLS certificates configured
- [ ] Firewall rules configured (ports 22, 80, 443 only)
- [ ] Database passwords changed from defaults
- [ ] JWT secrets are cryptographically secure
- [ ] API rate limiting enabled
- [ ] Regular security updates applied
- [ ] Backup encryption enabled
- [ ] Access logs monitored
- [ ] Intrusion detection system configured

### Blockchain Security
- [ ] Private keys secured in hardware security modules
- [ ] Network access restricted to authorized nodes
- [ ] Regular chaincode audits performed
- [ ] Consensus mechanism properly configured
- [ ] Certificate authority properly secured

This deployment guide ensures a secure, scalable, and maintainable production deployment of the TRACE HERB system.
