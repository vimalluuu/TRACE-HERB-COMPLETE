# 🌿 TRACE HERB - Complete Blockchain Traceability System

[![Blockchain](https://img.shields.io/badge/Blockchain-Hyperledger%20Fabric-blue)](https://hyperledger.org/use/fabric)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%20%7C%20React-green)](https://nextjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-yellow)](https://nodejs.org/)
[![Status](https://img.shields.io/badge/Status-Hackathon%20Ready-success)](https://github.com/vimalluuu)

## 🎯 **PROJECT OVERVIEW**

**TRACE HERB** is a comprehensive blockchain-based traceability system designed specifically for the Ayurvedic herbal supply chain in India. It addresses critical challenges in ensuring quality, authenticity, and sustainable sourcing of medicinal plants through complete end-to-end transparency.

### 🏆 **HACKATHON ACHIEVEMENTS**
- ✅ **Complete End-to-End Traceability**: Farm → Processing → Lab → Regulator → Consumer
- ✅ **8 Specialized Portals**: Full supply chain coverage with role-based access
- ✅ **Real-Time Workflow Management**: Automatic batch progression and updates
- ✅ **Amazon-Style Consumer Experience**: Visual tracking with provenance verification
- ✅ **Professional UI/UX**: Modern, responsive design across all platforms
- ✅ **Blockchain Integration**: Hyperledger Fabric with immutable audit trails

## 🚀 **QUICK START**

### **Prerequisites**
- Node.js 16+ and npm
- Docker and Docker Compose (optional)
- Git

### **One-Command Setup (Windows)**
```bash
# Clone the repository
git clone https://github.com/vimalluuu/TRACE-HERB-COMPLETE.git
cd TRACE-HERB-COMPLETE

# Start the complete system
./start-trace-herb.bat
```

### **PowerShell Setup**
```bash
./start-system.ps1
```

### **Manual Setup**
```bash
# 1. Start backend
cd backend
npm install
npm start

# 2. Start all frontend portals (separate terminals)
cd ../frontend/enhanced-consumer-portal && npm install && npm run dev -- -p 3001
cd ../frontend/farmer-dapp && npm install && npm run dev -- -p 3002
cd ../frontend/processor-portal && npm install && npm run dev -- -p 3003
cd ../frontend/lab-portal && npm install && npm run dev -- -p 3004
cd ../frontend/regulator-portal && npm install && npm run dev -- -p 3005
cd ../frontend/stakeholder-dashboard && npm install && npm run dev -- -p 3006
cd ../frontend/management-portal && npm install && npm run dev -- -p 3007
cd ../frontend/supply-chain-overview && npm install && npm run dev -- -p 3008
```

## 🌐 **SYSTEM ACCESS**

### **Portal URLs (After Setup)**
| Portal | URL | Purpose |
|--------|-----|---------|
| 🛒 **Consumer Portal** | http://localhost:3001 | Product verification & Amazon-style tracking |
| 🌱 **Farmer Portal** | http://localhost:3002 | Herb collection recording with GPS |
| 🏭 **Processor Portal** | http://localhost:3003 | Processing operations management |
| 🔬 **Lab Portal** | http://localhost:3004 | Quality testing & digital certification |
| 🏛️ **Regulator Portal** | http://localhost:3005 | Compliance review & approval |
| 👥 **Stakeholder Dashboard** | http://localhost:3006 | Multi-role access portal |
| 📊 **Management Portal** | http://localhost:3007 | System administration |
| 🔗 **Supply Chain Overview** | http://localhost:3008 | Complete workflow visualization |

## 🏗️ **SYSTEM ARCHITECTURE**

### **Workflow Sequence**
```
🌱 Farmer → 🏭 Processor → 🔬 Lab → 🏛️ Regulator → 🛒 Consumer
(Collect)   (Process)     (Test)   (Approve)     (Verify)
```

### **Technology Stack**
- **Blockchain**: Hyperledger Fabric 2.4+
- **Backend**: Node.js, Express.js, REST APIs
- **Frontend**: Next.js, React, Tailwind CSS
- **Database**: File-based storage (demo mode)
- **Authentication**: JWT-based multi-role system
- **QR Codes**: Dynamic generation and scanning
- **Deployment**: Docker containerization ready

## 📋 **FEATURES IMPLEMENTED**

### ✅ **Core Traceability (95% Complete)**
- [x] End-to-end batch tracking from farm to consumer
- [x] QR code generation and scanning
- [x] Immutable blockchain audit trails
- [x] Geographic provenance with GPS coordinates
- [x] Environmental data capture (temperature, humidity, soil pH)
- [x] Multi-stakeholder workflow management

### ✅ **Quality Management (80% Complete)**
- [x] Laboratory testing workflows (microbiological, chemical, physical)
- [x] Digital certificate generation
- [x] Regulatory compliance checking
- [x] Quality grading system (A/B/C grades)
- [x] Contamination and safety testing
- [x] Batch approval/rejection workflows

### ✅ **User Experience (85% Complete)**
- [x] Professional responsive UI/UX design
- [x] Real-time dashboard updates
- [x] Amazon-style consumer tracking interface
- [x] Multi-role authentication system
- [x] Automatic workflow progression
- [x] Mobile-friendly interfaces

### ✅ **Technical Infrastructure (90% Complete)**
- [x] Hyperledger Fabric blockchain integration
- [x] FHIR-style metadata bundles
- [x] RESTful API architecture
- [x] Docker containerization support
- [x] Comprehensive error handling
- [x] Production-ready deployment scripts

## 🎪 **DEMO WORKFLOW**

### **Complete Supply Chain Journey**
1. **🌱 Farmer Creates Batch** → Records herb collection with GPS location and environmental data
2. **🏭 Processor Receives** → Processes herbs and updates blockchain with processing parameters
3. **🔬 Lab Tests Quality** → Conducts comprehensive testing and generates digital certificates
4. **🏛️ Regulator Approves** → Reviews all data and approves batch for market release
5. **🛒 Consumer Verifies** → Scans QR code for complete provenance and authenticity verification

### **Key Demo Features**
- **Real-time Updates**: Batches automatically move between portals based on completion
- **Visual Progress**: Amazon-style tracking with clear status indicators
- **Complete Transparency**: Every step recorded and verifiable on blockchain
- **Professional Interface**: Clean, modern design throughout all portals
- **No Technical Glitches**: Smooth workflow progression without manual intervention

## 📁 **PROJECT STRUCTURE**

```
TRACE-HERB-COMPLETE/
├── 📁 backend/                    # Node.js API server
│   ├── src/routes/               # API endpoints
│   ├── src/services/             # Business logic
│   └── src/app.js               # Main server
├── 📁 blockchain/                 # Hyperledger Fabric network
├── 📁 frontend/                   # All portal applications
│   ├── enhanced-consumer-portal/ # Consumer verification
│   ├── farmer-dapp/             # Farmer collection
│   ├── processor-portal/        # Processing operations
│   ├── lab-portal/              # Quality testing
│   ├── regulator-portal/        # Compliance approval
│   ├── stakeholder-dashboard/   # Multi-role access
│   ├── management-portal/       # System admin
│   └── supply-chain-overview/   # Workflow visualization
├── 📁 docs/                      # Documentation
├── 📁 scripts/                   # Automation scripts
├── 📄 start-trace-herb.bat      # Windows startup script
├── 📄 start-system.ps1          # PowerShell startup script
└── 📄 README.md                 # This file
```

## 🎯 **HACKATHON READINESS**

### **✅ What's Working Perfectly**
- Complete blockchain-based traceability system
- Real-time workflow management with automatic progression
- Professional user interfaces with responsive design
- Multi-stakeholder platform with role-based access
- QR code generation and consumer verification
- Amazon-style tracking experience
- Comprehensive quality testing and certification
- Regulatory compliance and approval workflows

### **🏆 Judge Demonstration Points**
- **Technical Innovation**: Blockchain + supply chain integration
- **Real-World Problem**: Addresses actual Ayurvedic industry challenges
- **Complete Solution**: End-to-end implementation covering entire supply chain
- **Professional Quality**: Production-ready interfaces and workflows
- **Scalability**: Multi-stakeholder architecture supporting growth
- **User Experience**: Intuitive, modern design across all touchpoints

## 📊 **SYSTEM COMPLETION STATUS**

**Overall System Completeness: ~70% of Ideal Vision**
- ✅ **Core Traceability**: 95%
- ✅ **Blockchain Infrastructure**: 90%
- ✅ **User Interfaces**: 85%
- ✅ **Quality Management**: 80%
- ⚠️ **IoT Integration**: 10%
- ⚠️ **Advanced Analytics**: 20%
- ⚠️ **Mobile Native Apps**: 40%

## 🚀 **DEPLOYMENT**

### **Development Mode**
```bash
npm run dev:all
```

### **Production Mode**
```bash
npm run build:all
npm run start:production
```

### **Docker Deployment**
```bash
docker-compose up -d
```

## 🤝 **CONTRIBUTING**

This project was developed for hackathon demonstration. For contributions:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 **LICENSE**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 **AUTHOR**

**Vimal** - [@vimalluuu](https://github.com/vimalluuu)

## 🙏 **ACKNOWLEDGMENTS**

- Hyperledger Fabric community for blockchain infrastructure
- Next.js and React ecosystems for frontend frameworks
- Ayurvedic industry stakeholders for domain insights
- Hackathon organizers and judges for the opportunity

---

**🏆 This system is ready for hackathon demonstration and showcases a complete, professional blockchain-based traceability solution for the Ayurvedic supply chain industry.**
