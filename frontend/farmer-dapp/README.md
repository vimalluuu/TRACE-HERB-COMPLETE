# TRACE HERB - Farmer Collection DApp

## 🌿 Overview

The Farmer Collection DApp is a mobile-friendly web application designed for farmers, herb collectors, and wild harvesters to record herb collection events with precise geo-tagging and generate QR codes for blockchain-based traceability.

## ✨ Features

### 📱 **Mobile-First Design**
- Responsive interface optimized for smartphones and tablets
- Touch-friendly controls and large input fields
- Works offline-first with data synchronization

### 👨‍🌾 **Farmer Information Capture**
- Personal details (Name, Phone, Farmer ID)
- Location information (Village, District, State)
- Experience and certification tracking
- Government ID integration

### 🌿 **Comprehensive Herb Data**
- Botanical name, common name, Ayurvedic name
- Part used (Root, Leaf, Stem, Flower, etc.)
- Quantity with units (kg, g, ton)
- Collection method (Wild harvesting, Cultivated, etc.)
- Seasonal information and weather conditions
- Soil type and environmental factors

### 📍 **Precise Geo-Tagging**
- GPS location capture with high accuracy
- Latitude/longitude coordinates
- Location accuracy measurement
- Timestamp recording
- Privacy-conscious location handling

### 🔗 **Blockchain Integration**
- Real-time submission to Hyperledger Fabric network
- Immutable record creation
- Transaction ID and block number tracking
- Smart contract interaction

### 📱 **QR Code Generation**
- Unique QR code for each collection event
- High-quality PNG download
- Printable format for physical labeling
- Scannable by consumer portal

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Running TRACE HERB backend API (port 3000)
- Modern web browser with GPS support

### Installation
```bash
cd frontend/farmer-dapp
npm install
npm run dev
```

### Access
- **Farmer DApp**: http://localhost:3002
- **Backend API**: http://localhost:3000 (must be running)

## 📋 Usage Workflow

### Step 1: Farmer Information
Fill in personal and location details:
- Full name and phone number
- Government farmer ID (optional)
- Village, district, and state
- Years of experience
- Certifications (Organic, Fair Trade, etc.)

### Step 2: Herb Collection Details
Record comprehensive herb information:
- Scientific botanical name
- Common and Ayurvedic names
- Plant part being collected
- Quantity and measurement unit
- Collection method and season
- Environmental conditions

### Step 3: Geo-Location Capture
Capture precise GPS coordinates:
- Click "Get My Location" button
- Allow browser location access
- Verify accuracy and coordinates
- Location stored with timestamp

### Step 4: Blockchain Submission & QR Generation
Submit data and generate QR code:
- Review collection summary
- Submit to blockchain network
- Generate unique QR code
- Download QR code image
- Print for physical labeling

## 🔧 Technical Features

### **Real-Time Blockchain Integration**
```javascript
// Submits to Hyperledger Fabric network
POST /api/collection-events
{
  "id": "COL_1234567890_ABC123",
  "qrCode": "QR_COL_1234567890_ABC123",
  "collector": { /* farmer data */ },
  "herb": { /* herb data */ },
  "location": { /* GPS coordinates */ }
}
```

### **GPS Accuracy**
- High accuracy mode enabled
- 10-second timeout for location
- Accuracy measurement in meters
- Fallback for location errors

### **QR Code Specifications**
- Format: PNG image, 256x256 pixels
- Content: Unique collection ID
- Colors: Green theme matching brand
- Downloadable for printing

### **Data Validation**
- Required field validation
- Format checking (phone, coordinates)
- Real-time form validation
- Error handling and user feedback

## 📊 Data Flow

```
Farmer Input → Form Validation → GPS Capture → Blockchain Submission → QR Generation → Download
     ↓              ↓               ↓              ↓                    ↓            ↓
  Personal      Herb Details    Location      Transaction ID      QR Code      Physical Label
   Data          & Quantity     Coordinates    & Block #          Image        for Product
```

## 🌐 Integration Points

### **Backend API Endpoints**
- `POST /api/collection-events` - Submit collection data
- `GET /api/blockchain/status` - Check blockchain connectivity

### **Consumer Portal Integration**
- Generated QR codes are scannable by consumer portal
- Links to complete provenance information
- Enables end-to-end traceability

### **Blockchain Network**
- Hyperledger Fabric smart contracts
- Immutable record storage
- Multi-organization validation
- Real-time transaction processing

## 📱 Mobile Optimization

### **Responsive Design**
- Mobile-first CSS framework (Tailwind)
- Touch-optimized interface elements
- Readable fonts and contrast
- Efficient data entry flow

### **Performance**
- Lightweight bundle size
- Fast loading times
- Offline capability (future enhancement)
- Progressive Web App features

### **User Experience**
- Step-by-step wizard interface
- Progress indicator
- Clear validation messages
- Success/error feedback

## 🔒 Security & Privacy

### **Data Protection**
- GPS coordinates encrypted in transit
- Personal information handled securely
- Blockchain immutability for integrity
- No sensitive data stored locally

### **Access Control**
- Farmer identity verification
- Role-based permissions
- Secure API communication
- Audit trail maintenance

## 🎯 Use Cases

### **Wild Harvesters**
- Record GPS coordinates of wild collection sites
- Document sustainable harvesting practices
- Track seasonal availability
- Maintain collection quotas

### **Organic Farmers**
- Certify organic growing methods
- Document soil and environmental conditions
- Track harvest quantities and quality
- Maintain certification compliance

### **Cooperative Groups**
- Standardize data collection across members
- Aggregate collection data
- Ensure quality consistency
- Facilitate fair trade practices

## 🚀 Future Enhancements

- **Offline Mode**: Work without internet connectivity
- **Photo Capture**: Add herb and location photos
- **Voice Input**: Voice-to-text for local languages
- **Barcode Scanning**: Integrate with existing systems
- **Analytics Dashboard**: Collection insights and trends
- **Multi-language Support**: Local language interfaces

## 📞 Support

For technical support or questions about the Farmer Collection DApp:
- Check the main TRACE HERB documentation
- Verify backend API is running on port 3000
- Ensure GPS permissions are enabled in browser
- Contact system administrator for blockchain connectivity issues
