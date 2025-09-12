# Docker Desktop Installation Guide for TRACE HERB Blockchain

## 🐳 Installing Docker Desktop on Windows

### Step 1: Download Docker Desktop
1. Go to: https://www.docker.com/products/docker-desktop/
2. Click **"Download for Windows"**
3. Download the `Docker Desktop Installer.exe` file

### Step 2: System Requirements
- **Windows 10/11** (64-bit)
- **WSL 2** (Windows Subsystem for Linux 2)
- **Virtualization** enabled in BIOS
- **4GB RAM** minimum (8GB recommended)

### Step 3: Installation Process
1. **Run Installer**: Double-click `Docker Desktop Installer.exe`
2. **Configuration Options**:
   - ✅ **Enable WSL 2 integration** (recommended)
   - ✅ **Add shortcut to desktop**
   - ✅ **Start Docker Desktop when you log in**
3. **Install**: Click "Install" and wait for completion
4. **Restart**: Restart your computer when prompted

### Step 4: First Launch
1. **Start Docker Desktop** from Start Menu or Desktop
2. **Accept License Agreement**
3. **Skip Tutorial** (optional)
4. **Wait for Docker Engine to start** (green status indicator)

### Step 5: Verify Installation
Open PowerShell and run:
```powershell
docker --version
docker-compose --version
docker info
```

Expected output:
```
Docker version 24.0.x, build xxxxx
Docker Compose version v2.x.x
...Docker info details...
```

## 🚀 After Docker Installation

Once Docker is installed and running:

### 1. Deploy TRACE HERB Blockchain Network
```powershell
cd c:\TRACE HERB\blockchain
powershell -ExecutionPolicy Bypass -File setup-network.ps1
```

### 2. Verify Network Status
```powershell
docker ps
```
You should see containers like:
- `orderer.trace-herb.com`
- `peer0.farmers.trace-herb.com`
- `peer0.processors.trace-herb.com`
- `ca.farmers.trace-herb.com`
- `ca.processors.trace-herb.com`

### 3. Check Blockchain Status
```powershell
curl http://localhost:3000/api/blockchain/status
```

The response should show `"mode": "blockchain"` instead of `"mode": "demo"`

## 🔧 Troubleshooting

### Common Issues:

**1. WSL 2 Not Installed**
```powershell
# Install WSL 2
wsl --install
# Restart computer
```

**2. Virtualization Not Enabled**
- Enter BIOS/UEFI settings
- Enable Intel VT-x or AMD-V
- Save and restart

**3. Docker Desktop Won't Start**
- Check Windows version (must be Windows 10 build 19041+ or Windows 11)
- Ensure Hyper-V is enabled
- Try running as Administrator

**4. Port Conflicts**
If ports 7050, 7051, 9051 are in use:
```powershell
netstat -ano | findstr :7050
# Kill processes using these ports if needed
```

## 📊 Current System Status

**While Docker is being installed, the TRACE HERB system is fully functional in demo mode:**

- ✅ **Backend API**: Running on port 3000
- ✅ **Consumer Portal**: Running on port 3001
- ✅ **QR Verification**: Working perfectly
- ✅ **All APIs**: Fully functional
- ⚠️ **Mode**: Demo (simulated blockchain)

**After Docker installation:**
- ✅ **Real Blockchain**: Hyperledger Fabric network
- ✅ **Smart Contracts**: Deployed chaincode
- ✅ **Cryptographic Security**: Real digital signatures
- ✅ **Distributed Ledger**: Immutable transaction history

## 🎯 Next Steps

1. **Install Docker Desktop** (15-20 minutes)
2. **Run blockchain setup script** (5-10 minutes)
3. **Restart backend server** (automatic detection)
4. **Verify real blockchain mode** (check API status)

The system will automatically switch from demo mode to real blockchain mode once the Hyperledger Fabric network is running!

## 📞 Support

If you encounter issues:
1. Check Docker Desktop is running (green whale icon in system tray)
2. Verify all containers are running: `docker ps`
3. Check container logs: `docker logs <container-name>`
4. Restart Docker Desktop if needed
