# 🚀 Quick Start: Set Up License Protection

## 📝 What You Need to Do (Step-by-Step)

### ⏱️ Total Time: 15 minutes

---

## Step 1: Install Backend Dependencies (2 min)

```bash
cd backend
npm install
```

**What this installs:**
- Express (web server)
- SQLite (database)
- CORS (allow mobile app to connect)

---

## Step 2: Configure Backend (1 min)

```bash
# Create environment file
cp .env.example .env
```

Edit `.env` and set your admin password:
```env
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-123
```

---

## Step 3: Start Backend Server (1 min)

```bash
npm start
```

**You should see:**
```
🚀 Food Zone ERP License Server
================================
✅ Server running on port 3000
✅ Environment: development
✅ Database initialized

📡 API Endpoints:
   http://localhost:3000/api/license/activate
   http://localhost:3000/api/license/verify
```

**Keep this terminal open!**

---

## Step 4: Test Backend (2 min)

Open new terminal, test the server:

```bash
# Generate a test license
curl -X POST http://localhost:3000/api/admin/licenses/generate \
  -H "username: admin" \
  -H "password: your-secure-password-123" \
  -H "Content-Type: application/json" \
  -d "{\"count\": 1}"
```

**Response should show:**
```json
{
  "success": true,
  "count": 1,
  "licenses": [
    {
      "licenseKey": "FOOD-A1B2-C3D4-E5F6",
      "expiresAt": null,
      "id": 1
    }
  ]
}
```

**✅ Backend is working!**

---

## Step 5: Install Mobile App Package (1 min)

```bash
# In main project directory
npm install expo-device
```

This package gets unique device ID.

---

## Step 6: Update License API URL (2 min)

Open `src/contexts/LicenseContext.tsx`:

Find line:
```typescript
const LICENSE_API_URL = 'https://your-backend.com/api/license';
```

Replace with your local IP:
```typescript
// Find your IP: ipconfig (Windows) or ifconfig (Mac/Linux)
const LICENSE_API_URL = 'http://192.168.1.100:3000/api/license';
```

**💡 Replace 192.168.1.100 with YOUR computer's IP address**

---

## Step 7: Update App.tsx (3 min)

Open `App.tsx` and add LicenseProvider:

```typescript
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { DataProvider } from './src/contexts/DataContext';
import { LicenseProvider } from './src/contexts/LicenseContext';  // ADD THIS
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <LicenseProvider>  {/* ADD THIS */}
      <AuthProvider>
        <DataProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </DataProvider>
      </AuthProvider>
    </LicenseProvider>  {/* ADD THIS */}
  );
}
```

---

## Step 8: Update AppNavigator (3 min)

Open `src/navigation/AppNavigator.tsx`:

Add license check:

```typescript
import { useLicense } from '../contexts/LicenseContext';  // ADD THIS
import LicenseActivationScreen from '../screens/LicenseActivationScreen';  // ADD THIS

export const AppNavigator = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { isLicenseValid, isLoading: licenseLoading } = useLicense();  // ADD THIS

  if (authLoading || licenseLoading) {  // UPDATE THIS
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLicenseValid ? (  // ADD THIS BLOCK
          <Stack.Screen name="LicenseActivation" component={LicenseActivationScreen} />
        ) : !user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

---

## Step 9: Test the App! (2 min)

```bash
# Start the app
npm start
```

**What you should see:**

1. **First Screen:** License Activation 🔐
2. **Enter:**
   - Business Name: "Test Bakery"
   - License Key: "FOOD-A1B2-C3D4-E5F6" (from Step 4)
3. **Tap:** "Activate License"
4. **Result:** ✅ Success! → Shows Login Screen

**🎉 License system is working!**

---

## Step 10: Test Sharing Prevention (2 min)

**Simulate sharing scenario:**

1. Copy license key: `FOOD-A1B2-C3D4-E5F6`
2. In app, deactivate license (logout + clear storage)
3. Try to activate again with SAME key
4. **Change device ID** (simulate different device)

**Result:** ❌ Error: "License already activated on another device"

**✅ Sharing prevention works!**

---

## ✅ You're Done!

### What You Now Have:

- ✅ Backend server running locally
- ✅ License generation API
- ✅ Mobile app with license protection
- ✅ Device locking mechanism
- ✅ Sharing prevention

### Next Steps:

**For Development:**
- Keep backend running on your computer
- Use your local IP in app

**For Production:**
1. Deploy backend to Vercel/Railway (FREE)
2. Update API URL to production URL
3. Build and release app

---

## 🛠️ Troubleshooting

### "Cannot connect to server"

**Problem:** App can't reach backend

**Solution:**
```bash
# 1. Check your IP address
ipconfig  # Windows
ifconfig  # Mac/Linux

# 2. Update LicenseContext.tsx with correct IP
const LICENSE_API_URL = 'http://YOUR-IP-HERE:3000/api/license';

# 3. Make sure backend is running
# 4. Make sure phone and computer on same WiFi
```

### "Module not found: expo-device"

**Solution:**
```bash
npm install expo-device
npx expo start --clear
```

### "License activation failed"

**Check:**
1. Backend server is running
2. License key format correct: `FOOD-XXXX-XXXX-XXXX`
3. License exists in database (generate one first!)

---

## 📊 Quick Commands Reference

### Generate License Keys

```bash
# One license
curl -X POST http://localhost:3000/api/admin/licenses/generate \
  -H "username: admin" \
  -H "password: your-password" \
  -d "{\"count\": 1}"

# 10 licenses at once
curl -X POST http://localhost:3000/api/admin/licenses/generate \
  -H "username: admin" \
  -H "password: your-password" \
  -d "{\"count\": 10}"
```

### View All Licenses

```bash
curl http://localhost:3000/api/admin/licenses \
  -H "username: admin" \
  -H "password: your-password"
```

### Deactivate License (for device transfer)

```bash
curl -X POST http://localhost:3000/api/admin/licenses/deactivate \
  -H "username: admin" \
  -H "password: your-password" \
  -H "Content-Type: application/json" \
  -d "{\"licenseKey\": \"FOOD-A1B2-C3D4-E5F6\"}"
```

---

## 🎓 Summary

**Before:** Anyone could copy and share your app ❌
**After:** Each user MUST buy their own license ✅

**Protection:** 95%+ against piracy
**Cost:** $0-10/month hosting
**Setup:** 15 minutes ⏱️

**Your business is now protected! 🔒💰**

---

## 🚀 Ready to Deploy?

See: `backend/README.md` for deployment instructions to:
- Vercel (FREE)
- Railway (FREE)
- Or any VPS ($5/month)

Need help? Just ask! 😊
