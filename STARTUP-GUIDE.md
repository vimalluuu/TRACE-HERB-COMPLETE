# 🚀 TRACE HERB System Startup Guide

## 🎯 Quick Start (Recommended)

### Option 1: Automated Startup (Windows)
```bash
# Double-click this file or run in PowerShell
./start-trace-herb.bat
```

### Option 2: PowerShell Script
```powershell
# Run in PowerShell (as Administrator recommended)
./start-system.ps1
```

## 📋 Manual Startup (Step by Step)

### Step 1: Start Blockchain Network
```bash
cd blockchain
docker-compose -f network/docker-compose.yml up -d
cd ..
```

### Step 2: Start Backend API
```bash
cd backend
npm start
# Wait for "CA-Connected" message
cd ..
```

### Step 3: Start All Frontend Portals
```bash
# Open 8 separate terminals and run:
cd frontend/farmer-dapp && npm run dev -- -p 3001
cd frontend/lab-portal && npm run dev -- -p 3002  
cd frontend/processor-portal && npm run dev -- -p 3003
cd frontend/enhanced-consumer-portal && npm run dev -- -p 3004
cd frontend/regulator-portal && npm run dev -- -p 3005
cd frontend/management-portal && npm run dev -- -p 3006
cd frontend/stakeholder-dashboard && npm run dev -- -p 3007
cd frontend/supply-chain-overview && npm run dev -- -p 3008
```

## ✅ System Status Check

### Verify All Services Are Running:
- **Backend API**: http://localhost:3000/api/health
- **Farmer Portal**: http://localhost:3001
- **Lab Portal**: http://localhost:3002
- **Processor Portal**: http://localhost:3003
- **Enhanced Consumer Portal**: http://localhost:3004
- **Regulator Portal**: http://localhost:3005
- **Management Portal**: http://localhost:3006
- **Stakeholder Dashboard**: http://localhost:3007
- **Supply Chain Overview**: http://localhost:3008

### Check Blockchain Status:
```bash
docker ps
# Should show 9 containers running (CAs, peers, orderer, couchdb)
```

## 🔧 Permanent Fixes Applied

### ✅ Port Numbers Fixed
- All portal URLs in Supply Chain Overview are correctly mapped
- No more shuffled port assignments
- Consistent port allocation across all services

### ✅ Blockchain CA Connection
- System now connects to real Certificate Authorities by default
- Automatic retry mechanism (3 attempts)
- Falls back to demo mode only if CAs are unavailable
- No more unwanted demo mode startup

### ✅ QR Code Workflow
- All portals can access QR codes from farmer portal
- Processor and lab portal permissions fixed
- Complete workflow from farmer → processor → lab → regulator → consumer

### ✅ Geolocation Enhanced
- Real GPS location capture with fallbacks
- Demo location option for reliable presentations
- Better error handling and user guidance

## 🎪 Hackathon Demo Workflow

### Perfect Demo Sequence:
1. **Start System**: Run `./start-trace-herb.bat`
2. **Open Overview**: http://localhost:3008
3. **Create Batch**: Click Farmer Portal → Fill details → Generate QR
4. **Process Batch**: Click Processor Portal → Enter QR → Add processing
5. **Test Batch**: Click Lab Portal → Enter QR → Add test results
6. **Review Batch**: Click Regulator Portal → Enter QR → Approve
7. **Verify Product**: Click Consumer Portal → Enter QR → Show journey

### Test QR Code Available:
- **QR Code**: `QR_COL_TEST_12345`
- **Product**: Ashwagandha (Withania somnifera)
- **Status**: Ready for complete workflow testing

## 🛠️ Troubleshooting

### If Blockchain Shows Demo Mode:
1. Check Docker containers: `docker ps`
2. Restart blockchain: `docker-compose -f blockchain/network/docker-compose.yml restart`
3. Restart backend: Kill backend process and run `npm start` in backend folder

### If Ports Are Wrong:
- The port assignments are now permanently fixed in code
- If issues persist, check `system-config.json` for correct mappings

### If QR Codes Don't Work:
- Backend should show "CA-Connected" mode
- Test with: `QR_COL_TEST_12345`
- Check workflow permissions are loaded correctly

## 📊 System Configuration

All system preferences are stored in `system-config.json`:
- Blockchain connection preferences
- Port assignments
- Auto-start settings
- Fix status tracking

## 🏆 Ready for Hackathon!

Your TRACE HERB system is now configured for:
- ✅ Reliable startup every time
- ✅ Consistent port assignments  
- ✅ Real blockchain connectivity
- ✅ Complete QR code workflow
- ✅ Professional presentation flow

**All fixes are now permanent and will persist across restarts!**
