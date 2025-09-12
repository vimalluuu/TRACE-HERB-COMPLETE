# 🚀 TRACE HERB - Complete Deployment Guide

## 📋 **SYSTEM REQUIREMENTS**

### **Minimum Requirements**
- **OS**: Windows 10/11, macOS 10.15+, or Linux Ubuntu 18.04+
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space
- **CPU**: Dual-core processor, Quad-core recommended
- **Network**: Stable internet connection for initial setup

### **Software Prerequisites**
- **Node.js**: Version 16.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: Latest version
- **Docker**: Optional, for blockchain network
- **Docker Compose**: Optional, for blockchain network

## 🎯 **QUICK DEPLOYMENT OPTIONS**

### **Option 1: One-Command Setup (Recommended)**

#### **Windows Users**
```bash
# Clone repository
git clone https://github.com/vimalluuu/TRACE-HERB-COMPLETE.git
cd TRACE-HERB-COMPLETE

# Run automated setup
./start-trace-herb.bat
```

#### **PowerShell Users**
```bash
# Run PowerShell script
./start-system.ps1
```

#### **Mac/Linux Users**
```bash
# Make script executable
chmod +x start-system.sh

# Run setup
./start-system.sh
```

### **Option 2: Manual Step-by-Step Setup**

#### **Step 1: Clone Repository**
```bash
git clone https://github.com/vimalluuu/TRACE-HERB-COMPLETE.git
cd TRACE-HERB-COMPLETE
```

#### **Step 2: Backend Setup**
```bash
cd backend
npm install
npm start
```
*Backend will start on port 3000*

#### **Step 3: Frontend Portals Setup**
Open 8 separate terminal windows/tabs:

**Terminal 1 - Consumer Portal**
```bash
cd frontend/enhanced-consumer-portal
npm install
npm run dev -- -p 3001
```

**Terminal 2 - Farmer Portal**
```bash
cd frontend/farmer-dapp
npm install
npm run dev -- -p 3002
```

**Terminal 3 - Processor Portal**
```bash
cd frontend/processor-portal
npm install
npm run dev -- -p 3003
```

**Terminal 4 - Lab Portal**
```bash
cd frontend/lab-portal
npm install
npm run dev -- -p 3004
```

**Terminal 5 - Regulator Portal**
```bash
cd frontend/regulator-portal
npm install
npm run dev -- -p 3005
```

**Terminal 6 - Stakeholder Dashboard**
```bash
cd frontend/stakeholder-dashboard
npm install
npm run dev -- -p 3006
```

**Terminal 7 - Management Portal**
```bash
cd frontend/management-portal
npm install
npm run dev -- -p 3007
```

**Terminal 8 - Supply Chain Overview**
```bash
cd frontend/supply-chain-overview
npm install
npm run dev -- -p 3008
```

## 🌐 **ACCESS VERIFICATION**

### **Portal Access URLs**
After successful deployment, verify access to all portals:

| Portal | URL | Expected Status |
|--------|-----|----------------|
| Backend API | http://localhost:3000 | API endpoints active |
| Consumer Portal | http://localhost:3001 | QR scanning interface |
| Farmer Portal | http://localhost:3002 | Collection form |
| Processor Portal | http://localhost:3003 | Processing dashboard |
| Lab Portal | http://localhost:3004 | Testing interface |
| Regulator Portal | http://localhost:3005 | Approval dashboard |
| Stakeholder Dashboard | http://localhost:3006 | Multi-role access |
| Management Portal | http://localhost:3007 | Admin interface |
| Supply Chain Overview | http://localhost:3008 | Workflow visualization |

### **Health Check Commands**
```bash
# Check if all services are running
curl http://localhost:3000/api/health
curl http://localhost:3001
curl http://localhost:3002
curl http://localhost:3003
curl http://localhost:3004
curl http://localhost:3005
curl http://localhost:3006
curl http://localhost:3007
curl http://localhost:3008
```

## 🔧 **TROUBLESHOOTING**

### **Common Issues & Solutions**

#### **Issue 1: Port Already in Use**
```bash
# Find process using port
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <process_id> /F

# Kill process (Mac/Linux)
kill -9 <process_id>
```

#### **Issue 2: Node.js Version Issues**
```bash
# Check Node.js version
node --version

# Update Node.js if needed
# Download from https://nodejs.org/
```

#### **Issue 3: npm Install Failures**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

#### **Issue 4: Permission Errors (Mac/Linux)**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

### **Performance Optimization**

#### **For Low-End Systems**
```bash
# Reduce concurrent processes
# Start only essential portals first:
# 1. Backend (3000)
# 2. Consumer Portal (3001)
# 3. Farmer Portal (3002)
# 4. Supply Chain Overview (3008)
```

#### **Memory Management**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

## 🐳 **DOCKER DEPLOYMENT (Optional)**

### **Full Docker Setup**
```bash
# Build all containers
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### **Individual Container Deployment**
```bash
# Backend only
docker build -t trace-herb-backend ./backend
docker run -p 3000:3000 trace-herb-backend

# Frontend portals
docker build -t trace-herb-frontend ./frontend
docker run -p 3001:3001 trace-herb-frontend
```

## 🔒 **SECURITY CONSIDERATIONS**

### **Development Mode**
- All portals run in development mode
- CORS enabled for localhost
- No authentication required for demo
- File-based storage (not production-ready)

### **Production Deployment**
- Enable HTTPS/SSL certificates
- Implement proper authentication
- Use production database
- Configure firewall rules
- Enable logging and monitoring

## 📊 **MONITORING & LOGS**

### **Log Locations**
```bash
# Backend logs
tail -f backend/logs/app.log

# Frontend logs (browser console)
# Open browser developer tools
```

### **System Monitoring**
```bash
# Check system resources
top
htop

# Monitor network connections
netstat -tulpn
```

## 🎪 **DEMO PREPARATION**

### **Pre-Demo Checklist**
- [ ] All 9 services running (1 backend + 8 frontends)
- [ ] All URLs accessible
- [ ] Sample data loaded
- [ ] QR codes generated
- [ ] Workflow tested end-to-end
- [ ] Browser tabs prepared
- [ ] Presentation materials ready

### **Demo Flow Setup**
1. **Prepare Browser Tabs**: Open all 8 portal URLs
2. **Test Workflow**: Create → Process → Test → Approve → Verify
3. **Generate QR Codes**: Have sample QR codes ready
4. **Check Performance**: Ensure smooth operation
5. **Backup Plan**: Have screenshots/videos ready

## 🆘 **EMERGENCY PROCEDURES**

### **Quick Restart**
```bash
# Kill all Node.js processes
pkill -f node

# Restart system
./start-trace-herb.bat
```

### **Reset System**
```bash
# Clear all data
rm -rf backend/data/*
rm -rf backend/logs/*

# Restart fresh
npm run setup
```

### **Backup Important Files**
```bash
# Backup configuration
cp system-config.json system-config.backup.json

# Backup data
cp -r backend/data backend/data.backup
```

## 📞 **SUPPORT**

### **Getting Help**
- **GitHub Issues**: Create issue in repository
- **Documentation**: Check docs/ folder
- **Logs**: Check backend/logs/ for error details
- **Community**: Hyperledger Fabric community for blockchain issues

### **Contact Information**
- **Author**: Vimal (@vimalluuu)
- **Repository**: https://github.com/vimalluuu/TRACE-HERB-COMPLETE
- **Issues**: https://github.com/vimalluuu/TRACE-HERB-COMPLETE/issues

---

**🏆 This deployment guide ensures your TRACE HERB system is ready for demonstration and showcases a complete, professional blockchain-based traceability solution.**
