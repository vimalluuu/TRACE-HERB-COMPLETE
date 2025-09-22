# 🚀 TRACE HERB - STARTUP INSTRUCTIONS

## 📋 Quick Start Guide

### ✅ Prerequisites
Before starting the system, ensure you have:
- **Docker Desktop** installed and running
- **Node.js** (v16 or higher)
- **PowerShell** (Windows)
- **Git** (for version control)

### 🎯 ONE-CLICK STARTUP

**Simply run this file to start the complete system:**
```
TRACE-HERB-MASTER-STARTUP.bat
```

This will automatically:
1. ✅ Check all prerequisites
2. ✅ Set up Hyperledger Fabric blockchain network (CA-Connected mode)
3. ✅ Start backend API server
4. ✅ Install dependencies for all portals
5. ✅ Start all frontend portals
6. ✅ Open key portals in your browser

---

## 🌐 Portal Access Points

After startup, access these portals:

| Portal | URL | Purpose |
|--------|-----|---------|
| **🌾 Farmer Portal** | http://localhost:3002 | Create and track batches |
| **🏭 Processor Portal** | http://localhost:3003 | Process and approve batches |
| **🧪 Laboratory Portal** | http://localhost:3005 | Test batches and add results |
| **📋 Regulatory Portal** | http://localhost:3006 | Final approval/rejection |
| **📊 Management Portal** | http://localhost:3007 | System management |
| **👥 Stakeholder Dashboard** | http://localhost:3008 | Stakeholder overview |
| **🛍️ Consumer Portal** | http://localhost:3010 | QR code scanning and tracking |

**Backend API:** http://localhost:3000/api

---

## 🔧 System Components

### 🔗 Blockchain Network (CA-Connected Mode)
- **Certificate Authorities:** Ports 7054, 8054, 9054, 10054
- **Orderer Service:** Port 7050
- **Peer Nodes:** Ports 7051, 9051, 11051, 13051
- **CouchDB Databases:** Ports 5984, 7984, 9984, 11984

### 🖥️ Application Layer
- **Backend API:** Node.js/Express server with blockchain integration
- **Frontend Portals:** Next.js React applications
- **Real-time Sync:** Cross-portal data synchronization

---

## 🧪 Testing the Complete Workflow

### Step-by-Step Testing:
1. **🌾 Farmer Portal** → Create a new herb batch
2. **🏭 Processor Portal** → Review and approve the batch
3. **🧪 Laboratory Portal** → Add test results
4. **📋 Regulatory Portal** → Final approval
5. **🛍️ Consumer Portal** → Scan QR code to track the batch

### Real-time Synchronization:
- Changes in one portal automatically reflect in others
- Timeline updates show actual progress from each stage
- Status changes are synchronized across all portals

---

## 🛑 Stopping the System

To stop the complete system:

1. **Close all terminal windows** that opened during startup
2. **Stop Docker containers:**
   ```bash
   docker-compose -f blockchain/network/docker-compose.yml down
   ```

---

## 🧹 Project Cleanup

If you want to clean up unnecessary files:
```
CLEANUP-UNNECESSARY-FILES.bat
```

This will remove:
- Old startup files
- Test scripts
- Duplicate documentation
- Temporary files

---

## 🔧 Alternative Startup Options

### Option 1: Master Startup (Recommended)
```
TRACE-HERB-MASTER-STARTUP.bat
```

### Option 2: Full System Startup
```
start-trace-herb-full-system.bat
```

### Option 3: Manual PowerShell Setup
```powershell
.\setup-full-blockchain-network.ps1 -Clean
```

---

## 📊 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Blockchain    │
│   Portals       │◄──►│   Server        │◄──►│   Network       │
│   (Next.js)     │    │   (Node.js)     │    │   (Fabric)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Real-time     │    │   REST APIs     │    │   Certificate   │
│   Sync System   │    │   & WebSockets  │    │   Authorities   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🎯 Key Features

- ✅ **CA-Connected Blockchain:** Real Certificate Authorities
- ✅ **Real-time Synchronization:** Cross-portal data updates
- ✅ **Complete Workflow:** From farmer to consumer
- ✅ **QR Code Tracking:** End-to-end traceability
- ✅ **Multi-portal System:** 7 specialized interfaces
- ✅ **Docker Integration:** Containerized blockchain network
- ✅ **Production Ready:** Scalable architecture

---

## 🆘 Troubleshooting

### Common Issues:

**Docker not running:**
- Start Docker Desktop
- Wait for Docker to fully initialize

**Port conflicts:**
- Check if ports 3000-3010, 7050-7054 are available
- Close other applications using these ports

**PowerShell execution policy:**
- Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

**Node.js dependencies:**
- The startup script automatically installs dependencies
- If issues persist, manually run `npm install` in each portal directory

---

## 📞 Support

For issues or questions:
1. Check the console output for error messages
2. Verify all prerequisites are installed
3. Ensure Docker Desktop is running
4. Check port availability

---

**🎉 Your TRACE HERB system is ready for demonstration!**
