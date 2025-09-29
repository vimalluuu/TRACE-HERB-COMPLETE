# 🔐 TRACE HERB - Unified Portal Login Credentials

## 🌐 **Unified Business Portal Access**

The TRACE HERB system now features a **unified login system** for all business portals. Users can access their respective portals through a single login page with role-based authentication.

### 📍 **Portal URL**
```
http://localhost:3010
```

---

## 👥 **Login Credentials by Portal**

### 🏭 **Processor Portal**
- **Username:** `processor_admin`
- **Password:** `processor123`
- **Role:** Processor Administrator
- **Access Level:** Batch processing, quality control, status updates
- **Portal Features:**
  - View incoming batches from farmers
  - Process herb collections
  - Update processing status
  - Quality control management
  - Processing queue management

---

### 🔬 **Laboratory Portal**
- **Username:** `lab_analyst`
- **Password:** `lab123`
- **Role:** Laboratory Analyst
- **Access Level:** Quality testing, analysis reports, test approvals
- **Portal Features:**
  - Conduct quality tests
  - Generate test reports
  - Approve/reject quality standards
  - Contamination checks
  - Purity analysis

---

### 🏛️ **Regulatory Portal**
- **Username:** `regulator_officer`
- **Password:** `regulatory123`
- **Role:** Regulatory Officer
- **Access Level:** Compliance review, batch approvals, regulatory oversight
- **Portal Features:**
  - Review compliance applications
  - Approve/reject batches
  - Regulatory compliance checks
  - Export certificate generation
  - Audit trail management

---

### 📊 **Stakeholder Portal**
- **Username:** `stakeholder_manager`
- **Password:** `stakeholder123`
- **Role:** Stakeholder Manager
- **Access Level:** Analytics, reports, supply chain monitoring
- **Portal Features:**
  - Supply chain analytics
  - Performance metrics
  - Revenue tracking
  - Farmer network overview
  - Market insights

---

### ⚙️ **Management Portal**
- **Username:** `system_admin`
- **Password:** `admin123`
- **Role:** System Administrator
- **Access Level:** Full system access, user management, system configuration
- **Portal Features:**
  - User management
  - System configuration
  - Security settings
  - System monitoring
  - Audit logs

---

## 🔒 **Security Features**

### ✅ **Authentication Security**
- **Session Management:** 24-hour session timeout
- **Role-based Access:** Users can only access their designated portal
- **Secure Storage:** Credentials stored in encrypted cookies
- **Access Control:** Unauthorized access redirects to login

### ✅ **Portal Isolation**
- **Processor users** cannot access Laboratory, Regulatory, Stakeholder, or Management portals
- **Laboratory users** cannot access Processor, Regulatory, Stakeholder, or Management portals
- **Regulatory users** cannot access Processor, Laboratory, Stakeholder, or Management portals
- **Stakeholder users** cannot access Processor, Laboratory, Regulatory, or Management portals
- **Management users** have full access to all system functions

---

## 🚀 **How to Access**

### **Step 1: Navigate to Portal**
```
Open browser → http://localhost:3010
```

### **Step 2: Login with Credentials**
1. Enter your **username** (e.g., `processor_admin`)
2. Enter your **password** (e.g., `processor123`)
3. Click **"Sign in"**

### **Step 3: Automatic Redirection**
- System automatically redirects you to your designated portal
- **Processor** → `/processor` dashboard
- **Laboratory** → `/laboratory` dashboard
- **Regulatory** → `/regulatory` dashboard
- **Stakeholder** → `/stakeholder` dashboard
- **Management** → `/management` dashboard

---

## 📱 **Mobile Access**

All portals are **fully responsive** and work perfectly on mobile devices:
- **Touch-friendly** interface
- **Mobile-optimized** layouts
- **Responsive** navigation
- **Fast loading** on mobile networks

---

## 🔄 **Session Management**

### **Automatic Logout**
- Sessions expire after **24 hours** of inactivity
- Users are automatically redirected to login page
- Secure session cleanup on logout

### **Manual Logout**
- Click **"Sign out"** in the sidebar
- Clears all session data
- Redirects to login page

---

## 🆘 **Troubleshooting**

### **Can't Access Portal?**
1. **Check credentials** - Ensure username/password are correct
2. **Clear browser cache** - Refresh the page
3. **Check URL** - Make sure you're on `http://localhost:3010`
4. **Try different browser** - Test with Chrome, Firefox, Safari

### **Wrong Portal Access?**
- Each user can only access their designated portal
- Contact system administrator for role changes
- Use correct credentials for your assigned role

### **Session Issues?**
- **Clear cookies** and login again
- **Refresh browser** and retry
- **Check network connection**

---

## 🔧 **For Developers**

### **Adding New Users**
Edit `frontend/unified-business-portal/utils/auth.js`:

```javascript
export const PORTAL_USERS = {
  // Add new user
  new_role: {
    username: 'new_username',
    password: 'new_password',
    role: 'new_role',
    name: 'Display Name',
    permissions: ['permission1', 'permission2']
  }
};
```

### **Changing Passwords**
Update the password field in the `PORTAL_USERS` object and restart the application.

### **Adding New Roles**
1. Add role to `PORTAL_USERS`
2. Create new portal page in `/pages/[role]/index.js`
3. Update navigation in `components/Layout.js`

---

## 📞 **Support**

### **Need Help?**
- **Technical Issues:** Contact system administrator
- **Access Problems:** Verify credentials with your manager
- **Feature Requests:** Submit through management portal

### **Emergency Access**
- **Management Portal:** Use `system_admin` / `admin123` for emergency access
- **System Recovery:** Contact technical support team

---

## 🎯 **Quick Reference**

| Portal | Username | Password | Access URL |
|--------|----------|----------|------------|
| **Processor** | `processor_admin` | `processor123` | `/processor` |
| **Laboratory** | `lab_analyst` | `lab123` | `/laboratory` |
| **Regulatory** | `regulator_officer` | `regulatory123` | `/regulatory` |
| **Stakeholder** | `stakeholder_manager` | `stakeholder123` | `/stakeholder` |
| **Management** | `system_admin` | `admin123` | `/management` |

---

## ⚠️ **Important Notes**

1. **Keep credentials secure** - Don't share login information
2. **Change default passwords** in production environments
3. **Regular security audits** recommended
4. **Monitor access logs** through management portal
5. **Update credentials periodically** for security

**Your unified portal system is now ready for secure, role-based access!** 🌟
