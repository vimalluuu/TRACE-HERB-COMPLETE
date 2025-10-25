# 🌿 TRACE HERB - Complete Blockchain Supply Chain Traceability System

[![Blockchain](https://img.shields.io/badge/Blockchain-Hyperledger%20Fabric-blue)](https://hyperledger.org/use/fabric)
[![CA-Connected](https://img.shields.io/badge/Mode-CA--Connected-green)](https://hyperledger-fabric.readthedocs.io/en/latest/msp.html)
[![Node.js](https://img.shields.io/badge/Node.js-v16+-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🎯 **HACKATHON READY - SINGLE COMMAND STARTUP**

**For Judges & Demo**: Simply run `start-trace-herb-full-system.bat` and everything will be ready!

```bash
# Windows - Double click or run in Command Prompt
start-trace-herb-full-system.bat

# The script will:
# ✅ Set up Full Hyperledger Fabric Network with Certificate Authorities
# ✅ Start Backend Service with blockchain integration
# ✅ Launch all 8 Frontend Portals (Enhanced Consumer, Farmer, Processor, Lab, Regulator, etc.)
# ✅ Open main demo portals automatically
# ✅ Display all access URLs and blockchain network status
```

---

## 🚀 **OVERVIEW**

TRACE HERB is a **complete blockchain-based supply chain traceability system** specifically designed for **medicinal herbs and Ayurvedic products**. Built with **Hyperledger Fabric** in **CA-Connected mode**, it provides end-to-end traceability from farm to consumer with enterprise-grade security.

### 🎯 **Key Differentiators**
- **CA-Connected Blockchain**: Enterprise Certificate Authority integration
- **Complete Supply Chain**: 8 stakeholder portals covering entire herb journey
- **Advanced Consumer Experience**: Tracking progress + optional gamification
- **Real-time Verification**: Instant QR code authentication
- **Regulatory Compliance**: Built-in approval workflows
- **Rural Connectivity**: SMS-based blockchain gateway for remote areas

---

## 🌐 **SYSTEM ACCESS POINTS**

After running `start-trace-herb-full-system.bat`, access these URLs:

| Portal | URL | Purpose |
|--------|-----|---------|
| 👥 **Enhanced Consumer Portal** | http://localhost:3001 | **MAIN DEMO** - Product verification & tracking |
| 🧑‍🌾 **Enhanced Farmer Portal** | http://localhost:4005 | Multilingual batch creation & collection management |
| 🏭 **Processor Portal** | http://localhost:3003 | Processing workflow management |
| 🔬 **Laboratory Portal** | http://localhost:3004 | Quality testing & certification |
| 🏛️ **Regulatory Portal** | http://localhost:3005 | Compliance & approval workflows |
| 📊 **Stakeholder Dashboard** | http://localhost:3006 | Stakeholder overview & analytics |
| 🏢 **Management Portal** | http://localhost:3007 | System management & administration |
| 🔗 **Supply Chain Overview** | http://localhost:3008 | Complete supply chain visualization |
| 🔧 **Backend API** | http://localhost:3000/api | RESTful API endpoints |

---

## 🎮 **DEMO INSTRUCTIONS FOR JUDGES**

### 🎯 **Main Demo Flow (Enhanced Consumer Portal)**
1. **Visit**: http://localhost:3001
2. **Enter QR Code**: Use any demo code below
3. **View Tracking Progress**: See Amazon-style supply chain tracking
4. **Explore Tabs**: Journey, Quality, Sustainability, Farmer
5. **Optional Advanced Insights**: Click "✨ Advanced Insights" for gamification

### ⚡ **Demo QR Codes**
```
QR_DEMO_ASHWAGANDHA_001  (Ashwagandha Root - Maharashtra)
QR_DEMO_TURMERIC_001     (Turmeric Powder - Kerala)  
QR_DEMO_BRAHMI_001       (Brahmi Leaves - Karnataka)
QR_DEMO_NEEM_001         (Neem Leaves - Tamil Nadu)
```

### 🔄 **Create New Batches**
1. **Visit Enhanced Farmer Portal**: http://localhost:4005
2. **Login**: Use demo credentials (displayed on login page)
3. **Create Collection**: Add new herb batch with multilingual support
4. **Get QR Code**: System generates unique QR code
5. **Test in Consumer Portal**: Verify the new batch

---

## 🏗️ **SYSTEM ARCHITECTURE**

### 🔗 **Blockchain Layer**
- **Network**: Hyperledger Fabric v2.4+
- **Mode**: CA-Connected (Certificate Authority)
- **Consensus**: RAFT ordering service
- **Smart Contracts**: Herb traceability chaincode
- **Security**: TLS encryption + MSP authentication

### 🖥️ **Backend Services**
- **API Server**: Node.js/Express with blockchain integration
- **Database**: MongoDB for off-chain data
- **Authentication**: JWT-based multi-portal auth
- **File Storage**: Multer for document uploads
- **Real-time**: WebSocket for live updates

### 🌐 **Frontend Applications**
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **State Management**: React Hooks + Context
- **Routing**: Next.js App Router
- **UI Components**: Heroicons + Custom components

---

## 📋 **PREREQUISITES**

### 🔧 **Required Software**
- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher  
- **Git**: Latest version
- **Windows**: Windows 10/11 (for .bat script)

### ✅ **Installation Check**
```bash
node --version    # Should show v16+
npm --version     # Should show v8+
git --version     # Should show git version
```

---

## 🚀 **INSTALLATION & STARTUP**

### 🎯 **Option 1: Single Command (Recommended)**
```bash
# Windows - Run this single command
start-trace-herb-full-system.bat
```

### 🔧 **Option 2: Manual Setup**
```bash
# 1. Clone repository
git clone <your-repo-url>
cd TRACE-HERB-COMPLETE

# 2. Install backend dependencies
cd backend
npm install
cd ..

# 3. Install frontend dependencies
cd frontend/enhanced-consumer-portal
npm install
cd ../farmer-dapp
npm install
cd ../supply-chain-overview
npm install
cd ../consumer-portal
npm install
cd ../processor-portal
npm install
cd ../lab-portal
npm install
cd ../regulator-portal
npm install
cd ../..

# 4. Start backend
cd backend
npm start &

# 5. Start all frontend portals (in separate terminals)
cd frontend/enhanced-consumer-portal && npm run dev &
cd frontend/farmer-dapp && npm run dev &
cd frontend/supply-chain-overview && npm run dev &
cd frontend/consumer-portal && npm run dev &
cd frontend/processor-portal && npm run dev &
cd frontend/lab-portal && npm run dev &
cd frontend/regulator-portal && npm run dev &
```

---

## 🎯 **FEATURES SHOWCASE**

### 🔍 **Enhanced Consumer Experience**
- **Tracking Progress Page**: Amazon-style supply chain visualization
- **Interactive Journey**: Click through collection → processing → testing → approval
- **Advanced Insights**: Optional gamification with story maps and trust scores
- **Real-time Verification**: Instant blockchain authentication
- **Multi-herb Support**: Different products show different data

### 🚜 **Farmer Portal Features**
- **Batch Creation**: Easy herb collection recording
- **GPS Integration**: Automatic location capture
- **Photo Upload**: Visual documentation
- **Weather Data**: Environmental condition tracking
- **Blockchain Submission**: Automatic immutable record creation

### 🔬 **Lab Portal Features**
- **Quality Testing**: Comprehensive test parameter recording
- **Certificate Generation**: Automated quality certificates
- **Compliance Checking**: Regulatory standard verification
- **Batch Approval**: Quality-based batch approval workflow

### 🏛️ **Regulator Portal Features**
- **Compliance Dashboard**: Overview of all pending approvals
- **Batch Review**: Detailed regulatory review process
- **Approval Workflow**: Multi-stage approval system
- **Audit Trail**: Complete regulatory decision history

---

## 🔗 **BLOCKCHAIN INTEGRATION**

### 🛡️ **CA-Connected Mode**
- **Certificate Authority**: Enterprise-grade PKI infrastructure
- **Identity Management**: MSP-based user authentication
- **TLS Security**: End-to-end encrypted communication
- **Multi-Org Network**: Support for multiple organizations

### 📊 **Smart Contracts**
- **Herb Traceability**: Core supply chain logic
- **Access Control**: Role-based permissions
- **Event Logging**: Immutable audit trail
- **State Management**: Batch lifecycle tracking

### 🔐 **Security Features**
- **Digital Signatures**: All transactions cryptographically signed
- **Immutable Records**: Blockchain-based tamper protection
- **Access Control**: Role-based portal access
- **Data Encryption**: Sensitive data protection

---

## 🧪 **TESTING & DEMO DATA**

### 📱 **Consumer Portal Testing**
1. Use demo QR codes for instant testing
2. Create new batches in Farmer Portal
3. Process batches through complete workflow
4. Verify end-to-end traceability

### 🔄 **Complete Workflow Testing**
1. **Farmer**: Create collection batch
2. **Processor**: Process the batch  
3. **Lab**: Test and certify quality
4. **Regulator**: Review and approve
5. **Consumer**: Verify final product

### 📊 **API Testing**
```bash
# Test blockchain connection
curl http://localhost:3000/api/health/blockchain

# Test QR code lookup
curl http://localhost:3000/api/provenance/qr/QR_DEMO_ASHWAGANDHA_001

# Test batch creation
curl -X POST http://localhost:3000/api/collection \
  -H "Content-Type: application/json" \
  -d '{"herbType":"Ashwagandha","quantity":5,"location":"Test Farm"}'
```

---

## 📁 **PROJECT STRUCTURE**

```
TRACE-HERB-COMPLETE/
├── 🚀 start-trace-herb-full-system.bat # Full system startup script with blockchain
├── 📖 README.md                     # This comprehensive guide
├── 🔧 backend/                      # Backend API server
│   ├── src/                         # Source code
│   ├── services/                    # Business logic services
│   ├── models/                      # Data models
│   └── package.json                 # Dependencies
├── 🌐 frontend/                     # Frontend applications
│   ├── enhanced-consumer-portal/    # Main demo portal (Port 3001)
│   ├── farmer-dapp/                 # Enhanced farmer portal (Port 4005)
│   ├── processor-portal/            # Processor portal (Port 3003)
│   ├── lab-portal/                  # Laboratory portal (Port 3004)
│   ├── regulator-portal/            # Regulatory portal (Port 3005)
│   ├── stakeholder-dashboard/       # Stakeholder dashboard (Port 3006)
│   ├── management-portal/           # Management portal (Port 3007)
│   └── supply-chain-overview/       # Supply chain overview (Port 3008)
├── 🔗 blockchain/                   # Hyperledger Fabric network
│   ├── chaincode/                   # Smart contracts
│   ├── network/                     # Network configuration
│   └── organizations/               # CA certificates
├── 📱 mobile/                       # Mobile applications
└── 🔧 shared/                       # Shared components
```

---

## 🛠️ **TROUBLESHOOTING**

### ❌ **Common Issues**

#### **Port Already in Use**
```bash
# Kill processes on specific ports
taskkill /F /PID <PID>
# Or restart your computer
```

#### **Node.js Not Found**
```bash
# Install Node.js from https://nodejs.org/
# Ensure it's added to PATH
node --version
```

#### **Dependencies Not Installing**
```bash
# Clear npm cache
npm cache clean --force
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

#### **Blockchain Connection Issues**
- Check if backend is running on port 3000
- Verify CA-Connected mode is active
- Check console logs for detailed error messages

### 🔍 **Debug Mode**
```bash
# Run backend with debug logs
cd backend
DEBUG=* npm start

# Check individual portal logs
cd frontend/enhanced-consumer-portal
npm run dev
```

---

## 🎯 **HACKATHON PRESENTATION TIPS**

### 🏆 **Key Selling Points**
1. **Complete System**: 8 portals covering entire supply chain
2. **Enterprise Blockchain**: CA-Connected Hyperledger Fabric
3. **User Experience**: Consumer-first design with tracking progress
4. **Real Innovation**: SMS blockchain gateway for rural connectivity
5. **Scalable Architecture**: Production-ready microservices design

### 📊 **Demo Flow for Judges**
1. **Start**: Single command startup (`start-trace-herb-full-system.bat`)
2. **Overview**: Show Supply Chain Overview dashboard
3. **Consumer Experience**: Demo Enhanced Consumer Portal
4. **Farmer Journey**: Create batch in Enhanced Farmer Portal with multilingual support
5. **End-to-End**: Show complete workflow across all portals
6. **Blockchain**: Highlight CA-Connected security features with real Certificate Authorities

### 💡 **Technical Highlights**
- **Blockchain**: Hyperledger Fabric with Certificate Authority
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Security**: JWT authentication + TLS encryption
- **UX**: Amazon-style tracking + optional gamification

---

## 📞 **SUPPORT & CONTACT**

### 🐛 **Issues & Bugs**
- Create GitHub issues for bug reports
- Include system information and error logs
- Provide steps to reproduce the issue

### 💬 **Questions & Discussion**
- Use GitHub Discussions for questions
- Check existing issues before creating new ones
- Provide detailed context for better support

### 🤝 **Contributing**
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 **LICENSE**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎉 **READY FOR DEMO!**

Your TRACE HERB system is now ready for hackathon presentation. Simply run `start-trace-herb-full-system.bat` and showcase the complete blockchain-based herb supply chain traceability system with full Certificate Authority integration!

**Main Demo URL**: http://localhost:3001

Good luck with your presentation! 🌿🚀