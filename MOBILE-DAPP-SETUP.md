# 📱 TRACE HERB Farmer Mobile DApp Setup Guide

## 🚀 Quick Start

### 1. **One-Click Mobile Setup**
```bash
# Run the automated setup script
deploy-mobile-farmer-dapp.bat
```

This script will:
- ✅ Install all dependencies
- ✅ Configure PWA settings
- ✅ Build the mobile-optimized app
- ✅ Start the mobile server
- ✅ Display mobile access URLs

### 2. **Manual Setup** (Alternative)

```bash
# Navigate to farmer DApp
cd frontend/farmer-dapp

# Install dependencies
npm install

# Install PWA dependencies
npm install next-pwa@latest workbox-webpack-plugin@latest

# Start mobile server (accessible on network)
npm run mobile
```

## 📱 Mobile Access

### **Desktop Testing:**
- http://localhost:3002

### **Mobile Testing (Same Network):**
- http://[YOUR-IP]:3002
- Example: http://192.168.1.100:3002

### **Find Your IP Address:**
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

## 🔧 Mobile DApp Features

### **✅ PWA (Progressive Web App)**
- **Offline functionality** - Works without internet
- **Add to Home Screen** - Install like native app
- **Push notifications** - Real-time updates
- **Background sync** - Data syncs when online
- **App-like experience** - Full screen, no browser UI

### **✅ Mobile Optimizations**
- **Touch-friendly UI** - Large buttons, swipe gestures
- **Mobile-first design** - Responsive layout
- **Camera integration** - QR code scanning
- **GPS location** - Automatic location capture
- **Offline storage** - Local data persistence
- **Pull-to-refresh** - Native mobile gestures

### **✅ Enhanced Mobile Components**
- **MobileBatchTracking** - Swipe navigation, touch gestures
- **Mobile-optimized forms** - Larger inputs, better UX
- **Touch-friendly buttons** - 44px minimum touch targets
- **Swipe gestures** - Navigate between tabs
- **Pull-to-refresh** - Update data with pull gesture

## 📲 Installation Instructions

### **Android (Chrome/Edge/Samsung Internet):**
1. Open the farmer portal URL in browser
2. Look for "Add to Home Screen" banner
3. Tap "Add" or "Install"
4. App icon appears on home screen

### **iOS (Safari):**
1. Open the farmer portal URL in Safari
2. Tap the Share button (📤)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm
5. App icon appears on home screen

### **Desktop (Chrome/Edge):**
1. Look for install icon in address bar
2. Click "Install TRACE HERB Farmer"
3. App opens in standalone window

## 🧪 Testing Checklist

### **Basic Functionality:**
- [ ] App loads on mobile browser
- [ ] Login/signup works
- [ ] Dashboard displays correctly
- [ ] Batch creation works
- [ ] Batch tracking works
- [ ] Profile editing works
- [ ] Filtering works

### **PWA Features:**
- [ ] Install prompt appears
- [ ] App installs successfully
- [ ] App works offline
- [ ] Data syncs when back online
- [ ] Push notifications work (if enabled)

### **Mobile UX:**
- [ ] Touch targets are large enough
- [ ] Swipe gestures work
- [ ] Pull-to-refresh works
- [ ] Camera access works (for QR scanning)
- [ ] GPS location works
- [ ] No horizontal scrolling
- [ ] Text is readable without zoom

## 🔧 Configuration Files

### **Key Files Modified:**
- `next.config.js` - Mobile optimizations
- `package.json` - Mobile scripts and PWA dependencies
- `manifest.json` - PWA configuration
- `sw.js` - Service worker for offline functionality
- `_app.js` - PWA meta tags and mobile wrapper
- `globals.css` - Mobile-specific styles

### **New Mobile Components:**
- `MobileDAppWrapper.js` - PWA installation and mobile features
- `MobileBatchTracking.js` - Touch-optimized batch tracking
- `offline.html` - Offline fallback page

## 🌐 Network Configuration

### **For Local Network Access:**
1. Ensure your computer and mobile device are on the same WiFi network
2. Disable Windows Firewall or add exception for port 3002
3. Use your computer's IP address (not localhost) on mobile

### **Firewall Exception (Windows):**
```bash
# Allow port 3002 through Windows Firewall
netsh advfirewall firewall add rule name="TRACE HERB Mobile" dir=in action=allow protocol=TCP localport=3002
```

## 📊 Performance Optimizations

### **Mobile-Specific Optimizations:**
- **Lazy loading** - Components load as needed
- **Image optimization** - Compressed images for mobile
- **Caching strategy** - Aggressive caching for offline use
- **Bundle splitting** - Smaller initial load
- **Touch optimization** - Optimized for touch interactions

### **Offline Strategy:**
- **Cache-first** - Static assets served from cache
- **Network-first** - API calls try network first
- **Background sync** - Data syncs when connection restored
- **Offline fallback** - Graceful offline experience

## 🐛 Troubleshooting

### **Common Issues:**

**1. Can't access from mobile:**
- Check if both devices are on same network
- Try disabling firewall temporarily
- Use computer's IP address, not localhost

**2. Install prompt doesn't appear:**
- Clear browser cache
- Try different browser (Chrome recommended)
- Check if already installed

**3. App doesn't work offline:**
- Ensure service worker is registered
- Check browser developer tools for errors
- Try refreshing the page

**4. Touch gestures don't work:**
- Ensure you're using touch device
- Check if JavaScript is enabled
- Try different browser

### **Debug Mode:**
```bash
# Start with debug logging
npm run dev -- --inspect

# Check service worker in browser
# Chrome: DevTools > Application > Service Workers
```

## 🔄 Updates and Maintenance

### **Updating the Mobile DApp:**
```bash
# Pull latest changes
git pull

# Reinstall dependencies
npm install

# Rebuild
npm run build

# Restart mobile server
npm run mobile
```

### **Version Management:**
- Update version in `package.json`
- Update cache name in `sw.js`
- Test thoroughly before deployment

## 📈 Analytics and Monitoring

### **Mobile Usage Tracking:**
- Monitor PWA installation rates
- Track offline usage patterns
- Monitor performance metrics
- User engagement analytics

### **Performance Monitoring:**
- Page load times on mobile
- Offline functionality usage
- Error rates and crash reports
- Network request patterns

## 🎯 Next Steps

1. **Test thoroughly** on different devices and browsers
2. **Gather user feedback** on mobile experience
3. **Monitor performance** and optimize as needed
4. **Add advanced features** like push notifications
5. **Consider app store deployment** if needed

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Test on different devices/browsers
4. Check network connectivity

---

**🌿 TRACE HERB Farmer Mobile DApp - Bringing blockchain traceability to your mobile device!**
