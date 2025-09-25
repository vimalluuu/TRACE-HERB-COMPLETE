# 🌿 TRACE HERB - Unified Business Portal

## 🎯 **Overview**

The Unified Business Portal consolidates all TRACE HERB business operations into a single, secure, role-based system. This portal serves **Processor**, **Laboratory**, **Regulatory**, **Stakeholder**, and **Management** teams with dedicated interfaces and controlled access.

---

## 🚀 **Quick Start**

### **Installation**
```bash
cd frontend/unified-business-portal
npm install
```

### **Development**
```bash
npm run dev
# Portal runs on http://localhost:3010
```

### **Production**
```bash
npm run build
npm start
```

---

## 🔐 **Login Credentials**

| Portal | Username | Password |
|--------|----------|----------|
| **Processor** | `processor_admin` | `processor123` |
| **Laboratory** | `lab_analyst` | `lab123` |
| **Regulatory** | `regulator_officer` | `regulatory123` |
| **Stakeholder** | `stakeholder_manager` | `stakeholder123` |
| **Management** | `system_admin` | `admin123` |

---

## 🏗️ **Architecture**

### **Tech Stack**
- **Frontend:** Next.js 13, React 18, Tailwind CSS
- **Authentication:** Cookie-based sessions with role validation
- **Icons:** Heroicons
- **Charts:** Recharts
- **State Management:** React hooks

### **Project Structure**
```
unified-business-portal/
├── components/
│   └── Layout.js          # Shared layout with navigation
├── pages/
│   ├── index.js           # Auto-redirect to appropriate portal
│   ├── login.js           # Unified login page
│   ├── unauthorized.js    # Access denied page
│   ├── processor/
│   │   └── index.js       # Processor dashboard
│   ├── laboratory/
│   │   └── index.js       # Laboratory dashboard
│   ├── regulatory/
│   │   └── index.js       # Regulatory dashboard
│   ├── stakeholder/
│   │   └── index.js       # Stakeholder dashboard
│   └── management/
│       └── index.js       # Management dashboard
├── utils/
│   └── auth.js            # Authentication utilities
└── styles/
    └── globals.css        # Global styles and components
```

---

## 🔒 **Security Features**

### **Role-Based Access Control**
- **Isolated Portals:** Users can only access their designated portal
- **Session Management:** 24-hour session timeout
- **Secure Storage:** Encrypted cookie-based authentication
- **Access Validation:** Server-side role verification

### **Authentication Flow**
1. User enters credentials on unified login page
2. System validates username/password against user database
3. Creates secure session with role information
4. Redirects to appropriate portal based on user role
5. Validates access on every page load

---

## 🎨 **Portal Features**

### 🏭 **Processor Portal**
- **Batch Management:** View and process incoming batches
- **Quality Control:** Monitor processing quality
- **Status Updates:** Update batch processing status
- **Processing Queue:** Manage processing workflow

### 🔬 **Laboratory Portal**
- **Test Management:** Conduct quality tests
- **Analysis Reports:** Generate detailed test reports
- **Quality Approval:** Approve/reject quality standards
- **Test Tracking:** Monitor test progress and results

### 🏛️ **Regulatory Portal**
- **Compliance Review:** Review regulatory compliance
- **Batch Approval:** Approve/reject batches for market
- **Audit Trail:** Maintain compliance audit trails
- **Certificate Generation:** Issue regulatory certificates

### 📊 **Stakeholder Portal**
- **Analytics Dashboard:** Supply chain performance metrics
- **Revenue Tracking:** Monitor financial performance
- **Farmer Network:** Oversee farmer relationships
- **Market Insights:** Track market trends and opportunities

### ⚙️ **Management Portal**
- **User Management:** Add, edit, and manage system users
- **System Configuration:** Configure system settings
- **Security Monitoring:** Monitor system security and access
- **Audit Logs:** Review system activity and changes

---

## 📱 **Mobile Responsiveness**

### **Mobile-First Design**
- **Touch-Friendly:** Optimized for touch interactions
- **Responsive Layout:** Adapts to all screen sizes
- **Fast Loading:** Optimized for mobile networks
- **PWA Ready:** Progressive Web App capabilities

### **Mobile Features**
- **Collapsible Navigation:** Mobile-friendly sidebar
- **Touch Gestures:** Swipe and tap interactions
- **Optimized Forms:** Large touch targets
- **Fast Performance:** Minimal load times

---

## 🔧 **Development**

### **Adding New Portals**
1. **Create Portal Page:**
   ```bash
   mkdir pages/new-portal
   touch pages/new-portal/index.js
   ```

2. **Add User Credentials:**
   ```javascript
   // utils/auth.js
   export const PORTAL_USERS = {
     new_portal: {
       username: 'new_username',
       password: 'new_password',
       role: 'new_portal',
       name: 'New Portal User',
       permissions: ['view_data', 'edit_data']
     }
   };
   ```

3. **Update Navigation:**
   ```javascript
   // components/Layout.js
   const getNavigationItems = (role) => {
     // Add navigation items for new portal
   };
   ```

### **Customizing Styles**
```css
/* styles/globals.css */
.custom-component {
  @apply bg-primary-600 text-white rounded-lg p-4;
}
```

### **Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🧪 **Testing**

### **Manual Testing**
1. **Login Flow:** Test each user role login
2. **Portal Access:** Verify role-based access restrictions
3. **Mobile Testing:** Test on various mobile devices
4. **Session Management:** Test session timeout and logout

### **Automated Testing**
```bash
# Add testing framework
npm install --save-dev jest @testing-library/react
npm run test
```

---

## 🚀 **Deployment**

### **Production Build**
```bash
npm run build
npm run export  # For static deployment
```

### **Environment Setup**
```bash
# Production environment variables
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NODE_ENV=production
```

### **Deployment Options**
- **Vercel:** `vercel --prod`
- **Netlify:** `netlify deploy --prod`
- **Static Export:** Use `npm run export` for static hosting

---

## 📊 **Monitoring**

### **Analytics**
- **User Activity:** Track portal usage by role
- **Performance Metrics:** Monitor page load times
- **Error Tracking:** Log and monitor errors
- **Security Events:** Track login attempts and access

### **Health Checks**
- **Authentication System:** Monitor login success rates
- **Portal Availability:** Check portal accessibility
- **Session Management:** Monitor session handling
- **Database Connectivity:** Verify data access

---

## 🆘 **Troubleshooting**

### **Common Issues**

#### **Login Problems**
```bash
# Clear browser cache and cookies
# Verify credentials in utils/auth.js
# Check console for authentication errors
```

#### **Portal Access Issues**
```bash
# Verify user role in session
# Check route protection in _app.js
# Ensure proper role-based routing
```

#### **Mobile Issues**
```bash
# Test on actual mobile devices
# Check responsive breakpoints
# Verify touch interactions
```

---

## 📞 **Support**

### **Documentation**
- **[Login Credentials](../../UNIFIED_PORTAL_CREDENTIALS.md)**
- **[API Documentation](../../backend/README.md)**
- **[Deployment Guide](../../DEPLOY_FREE_STEP_BY_STEP.md)**

### **Contact**
- **Technical Issues:** System Administrator
- **Access Problems:** Portal Manager
- **Feature Requests:** Development Team

---

## 🎉 **Success!**

Your unified portal system is now ready to serve all TRACE HERB business operations with secure, role-based access and mobile-optimized interfaces! 🌟

**Happy tracing!** 🌿✨
