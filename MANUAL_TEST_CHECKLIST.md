# ✅ MANUAL TEST CHECKLIST - FRONTEND
## Smart City Dashboard - Complete Testing

**Tester:** _______________  
**Date:** January 13, 2026  
**Environment:** Production (https://fergana.cdcgroup.uz)

---

## 🔐 TEST 1: AUTHENTICATION & AUTHORIZATION

### 1.1 Login Page
- [ ] URL: https://fergana.cdcgroup.uz loads correctly
- [ ] Logo visible
- [ ] Login form visible (username + password fields)
- [ ] "Kirish" button visible
- [ ] Page responsive on mobile
- [ ] No console errors

### 1.2 Login - Valid Credentials
**Test Data:** `fergan / 123`
- [ ] Enter credentials
- [ ] Click "Kirish"
- [ ] Loading indicator shows
- [ ] Redirects to dashboard (< 2s)
- [ ] Token saved in localStorage
- [ ] User name shown in header

### 1.3 Login - Invalid Credentials
**Test Data:** `wrong / wrong`
- [ ] Enter invalid credentials
- [ ] Click "Kirish"
- [ ] Error message displays
- [ ] Stays on login page
- [ ] No token saved

### 1.4 Login - Empty Fields
- [ ] Leave fields empty
- [ ] Click "Kirish"
- [ ] Validation error shows
- [ ] Form highlights errors

### 1.5 Logout
- [ ] Click logout button (top right)
- [ ] Redirects to login page
- [ ] Token cleared from localStorage
- [ ] Cannot access dashboard without login

**Result:** ⬜ PASS / ⬜ FAIL  
**Notes:** _________________________________

---

## 🏠 TEST 2: DASHBOARD (MARKAZ)

### 2.1 Dashboard Load
- [ ] Dashboard loads in < 3 seconds
- [ ] No console errors
- [ ] All cards visible

### 2.2 Statistics Cards
- [ ] **Card 1: MFY Count**
  - [ ] Number visible
  - [ ] Label: "Barcha MFY"
  - [ ] Icon present
- [ ] **Card 2: Total Bins**
  - [ ] Number matches actual bins
  - [ ] Label correct
- [ ] **Card 3: Full Bins**
  - [ ] Count correct
  - [ ] Red color if > 0
- [ ] **Card 4: Active Modules**
  - [ ] Shows 3 (Markaz, Chiqindi, Issiqlik)

### 2.3 MFY Selector
- [ ] Dropdown opens
- [ ] "Barcha MFY" option (shows all)
- [ ] All MFY names listed (42, 35-Bog'cha, etc.)
- [ ] Select MFY → Data filters correctly
- [ ] Statistics update

### 2.4 Module Cards Grid
- [ ] **Active Modules (3):**
  - [ ] Markaz (Dashboard)
  - [ ] Chiqindi (Waste)
  - [ ] Issiqlik (Climate)
  - [ ] Status: "Faol" (green)
  - [ ] Click opens module
  
- [ ] **Locked Modules (9):**
  - [ ] Namlik
  - [ ] Havo
  - [ ] Xavfsizlik
  - [ ] Eco-Nazorat
  - [ ] Qurilish
  - [ ] Light-AI
  - [ ] Transport
  - [ ] Murojaatlar
  - [ ] Tahlil
  - [ ] Lock icon visible
  - [ ] Status: "Tez orada"
  - [ ] Click shows lock message

### 2.5 Real-time Updates
- [ ] Console shows "Refreshing data..." every 5s
- [ ] Statistics update automatically
- [ ] No flickering
- [ ] No performance issues

**Result:** ⬜ PASS / ⬜ FAIL  
**Notes:** _________________________________

---

## 🗑️ TEST 3: CHIQINDI MODULE (WASTE MANAGEMENT)

### 3.1 Module Load & Layout
- [ ] Click "Chiqindi" from dashboard
- [ ] Module loads in < 3s
- [ ] Title: "CHIQINDI LOGISTIKASI"
- [ ] Subtitle: "AI VISION CONTROL"
- [ ] Map loads correctly
- [ ] Sidebar visible with bins list

### 3.2 Top Tabs
- [ ] **Barchasi Tab:**
  - [ ] Shows all bins
  - [ ] Count displayed: "KONTEYNERLAR (21)"
- [ ] **Maktab Tab:**
  - [ ] Shows only school bins
  - [ ] Count updates
- [ ] **Bog'cha Tab:**
  - [ ] Shows kindergarten bins
- [ ] **Shifozona Tab:**
  - [ ] Shows hospital bins

### 3.3 Bins List (Sidebar)
For each bin in list:
- [ ] Address visible
- [ ] Coordinates shown
- [ ] Status badge (BO'SH/TO'LDI)
  - [ ] Green if < 80%
  - [ ] Red if ≥ 80%
- [ ] Organization name shown
- [ ] Click opens details modal

### 3.4 Map Functionality
- [ ] All bins shown as markers
- [ ] Marker colors:
  - [ ] Green: fillLevel < 80%
  - [ ] Red: fillLevel ≥ 80%
- [ ] Bot-uploaded bins have blue dot indicator
- [ ] Click marker opens details
- [ ] Map zoom works (mouse wheel)
- [ ] Map pan works (drag)
- [ ] Markers update in real-time

### 3.5 Bin Details Modal - Complete Test
Click on "24-maktab orqasi" bin:

**3.5.1 Modal Header:**
- [ ] Bin address in title
- [ ] Bin ID shown (gray text)
- [ ] Organization badge visible
- [ ] Close button (X) works

**3.5.2 Camera/Image Section (Left):**
- [ ] CCTV badge visible (red, animated)
- [ ] Camera placeholder OR actual image
- [ ] If bot image: "TELEGRAM BOT" badge (blue)
- [ ] AI status overlay:
  - [ ] Red if TO'LA
  - [ ] Green if BO'SH
  - [ ] Text: "AI Xulosasi"
  - [ ] Status text correct

**3.5.3 Action Buttons (Below Image):**
- [ ] **"QAYTA TAHLIL (AI)":**
  - [ ] Button visible
  - [ ] Click triggers AI analysis
  - [ ] Loading spinner shows
  - [ ] Status updates after analysis
- [ ] **"MAPS" button:**
  - [ ] Opens Google Maps in new tab
  - [ ] Correct location

**3.5.4 Monitoring Ma'lumotlari (Right):**
- [ ] Title: "Monitoring Ma'lumotlari"
- [ ] **To'lish darajasi:**
  - [ ] Percentage shown
  - [ ] Progress bar matches
  - [ ] Color correct (green/red)
- [ ] **Oxirgi signal:**
  - [ ] Timestamp or message shown
  - [ ] Mono font
- [ ] **Qurilma holati:**
  - [ ] Shows "ONLINE • 100%"
  - [ ] Green badge

**3.5.5 QR Code Section:** ⭐⭐⭐ CRITICAL
- [ ] Section visible BELOW monitoring
- [ ] Title: "🔍 QR KOD - TELEGRAM BOT"
- [ ] **Download Button:**
  - [ ] Text: "📥 Yuklab olish"
  - [ ] Blue background
  - [ ] Click downloads QR code
  - [ ] Filename: `konteyner-{id}-qr.png`
  - [ ] File valid PNG (~800 bytes)
- [ ] **QR Code Image:**
  - [ ] Loads correctly (no broken image)
  - [ ] Size: 192x192 pixels
  - [ ] White background with dashed border
  - [ ] Hover effect: scales up slightly
  - [ ] Hover overlay: blue scan icon appears
- [ ] **Description:**
  - [ ] Text: "📱 Telegram Bot orqali"
  - [ ] Instruction text readable
- [ ] **Badges:**
  - [ ] "@tozafargonabot" badge (blue)
  - [ ] "AI Tahlil" badge (green)
  - [ ] Pulse animation on AI badge
- [ ] **Background:**
  - [ ] Gradient: blue to indigo
  - [ ] Rounded corners
  - [ ] Border visible

**3.5.6 Bottom Action Buttons:**
- [ ] **"O'CHIRISH":**
  - [ ] Red button
  - [ ] Click deletes bin
  - [ ] Confirmation dialog (if any)
  - [ ] Bin removed from list & map
- [ ] **"TAHRIRLASH":**
  - [ ] Black button
  - [ ] Opens edit modal
  - [ ] Form pre-filled with current data

### 3.6 Add New Bin
- [ ] Click "+ KONTEYNER QO'SHISH" button
- [ ] Modal opens
- [ ] Title: "Yangi Konteyner"
- [ ] Form fields:
  - [ ] Mas'ul Korxona (dropdown)
  - [ ] Latitude (number, 6 decimals)
  - [ ] Longitude (number, 6 decimals)
  - [ ] GPS button works (gets current location)
  - [ ] Aniq Manzil (text input)
  - [ ] Kamera IP (optional, mono font)
- [ ] **Validation:**
  - [ ] Empty address → error
  - [ ] Invalid coordinates → error
  - [ ] All required fields checked
- [ ] **Save:**
  - [ ] Click "Saqlash"
  - [ ] Loading state
  - [ ] Bin created successfully
  - [ ] ⭐ QR code auto-generated (check modal after)
  - [ ] Bin appears in list
  - [ ] Bin appears on map
  - [ ] Modal closes

### 3.7 Edit Bin
- [ ] Open bin details
- [ ] Click "TAHRIRLASH"
- [ ] Modal opens with current data
- [ ] Change address
- [ ] Click "Saqlash"
- [ ] Changes saved
- [ ] Modal closes
- [ ] List/map updates

### 3.8 Delete Bin
- [ ] Open bin details
- [ ] Click "O'CHIRISH"
- [ ] Confirm deletion (if prompted)
- [ ] Bin deleted
- [ ] Removed from list
- [ ] Removed from map
- [ ] Cannot access deleted bin

### 3.9 Trucks Tab
- [ ] Switch to "TRUCKS" view (if available)
- [ ] Trucks listed
- [ ] Truck markers on map (blue squares)
- [ ] Click truck opens details:
  - [ ] Driver name
  - [ ] Plate number
  - [ ] Phone
  - [ ] Status (IDLE/BUSY)
  - [ ] Fuel level
  - [ ] Login credentials shown

### 3.10 Add/Edit/Delete Truck
- [ ] Add truck works
- [ ] Edit truck works
- [ ] Delete truck works
- [ ] Validation on all fields

**Result:** ⬜ PASS / ⬜ FAIL  
**Bugs Found:** _________________________________

---

## 🌡️ TEST 4: ISSIQLIK MODULE (CLIMATE CONTROL)

### 4.1 Module Load
- [ ] Click "Issiqlik" from dashboard
- [ ] Module loads
- [ ] Title: "ISSIQLIK NAZORATI"
- [ ] Facilities list visible

### 4.2 Facilities List
For each facility:
- [ ] Name visible
- [ ] Type badge (MAKTAB/BOG'CHA)
- [ ] MFY shown
- [ ] Status color:
  - [ ] Green: OPTIMAL
  - [ ] Yellow: WARNING
  - [ ] Red: CRITICAL
- [ ] Click opens details

### 4.3 Facility Details
**Select "42" (Shakarshablog MFY):**
- [ ] Facility info displayed:
  - [ ] Name: "42"
  - [ ] Type: MAKTAB
  - [ ] MFY: Shakarshablog MFY
- [ ] **Overview Stats:**
  - [ ] Energy usage
  - [ ] Efficiency score
  - [ ] Manager name
  - [ ] Last maintenance date

**Rooms Section:**
- [ ] All rooms listed
- [ ] Each room shows:
  - [ ] Room ID (e.g., "0420101")
  - [ ] Temperature (°C)
  - [ ] Humidity (%)
  - [ ] Status indicator
  - [ ] Target vs actual values
- [ ] Click room opens details

**Boilers Section:**
- [ ] All boilers listed
- [ ] Temperature readings
- [ ] Humidity readings
- [ ] Device health status

**IoT Devices Section:**
- [ ] All sensors listed
- [ ] Device IDs shown (ESP-...)
- [ ] Current temperature
- [ ] Current humidity
- [ ] Last update timestamp
- [ ] Status: ACTIVE/INACTIVE

### 4.4 IoT Real-time Updates
- [ ] Sensor data updates every 10s
- [ ] Temperature changes reflect
- [ ] Humidity changes reflect
- [ ] No lag or freezing
- [ ] Console logs updates

### 4.5 IoT Device Details
Click on device "ESP-1E6CDD":
- [ ] Device modal opens
- [ ] Device ID shown
- [ ] Type shown
- [ ] Current readings displayed
- [ ] Last seen timestamp
- [ ] Status badge
- [ ] Associated room/boiler shown

**Result:** ⬜ PASS / ⬜ FAIL  
**Bugs Found:** _________________________________

---

## 📱 TEST 5: QR CODE + TELEGRAM BOT INTEGRATION

### 5.1 QR Code Generation
- [ ] Create new bin via platform
- [ ] Wait 2 seconds
- [ ] Open bin details
- [ ] QR code section visible
- [ ] QR code image loads
- [ ] QR URL format correct

### 5.2 QR Code Display
- [ ] Title: "QR KOD - TELEGRAM BOT"
- [ ] Download button present
- [ ] QR image size: 192x192px
- [ ] Gradient background (blue/indigo)
- [ ] Dashed border
- [ ] Hover effects work:
  - [ ] QR scales up on hover
  - [ ] Scan icon appears
- [ ] Badges displayed:
  - [ ] @tozafargonabot
  - [ ] AI Tahlil (with pulse)
- [ ] Description text clear

### 5.3 QR Code Download
- [ ] Click "Yuklab olish"
- [ ] File downloads immediately
- [ ] Filename: `konteyner-{id}-qr.png`
- [ ] File opens correctly
- [ ] Valid PNG format
- [ ] Can scan downloaded QR

### 5.4 QR Code Scanning
**Use phone camera:**
- [ ] Scan QR from screen
- [ ] Recognizes QR immediately
- [ ] Opens Telegram
- [ ] Bot: @tozafargonadriversbot
- [ ] Auto-sends: `/start {bin_id}`

### 5.5 Bot Response
After scanning:
- [ ] Bot responds in < 3 seconds ⭐
- [ ] Shows bin information:
  - [ ] Address
  - [ ] Bin ID
  - [ ] Fill level
  - [ ] Status
  - [ ] Organization
- [ ] Prompts for image: "Rasm yuboring iltimos!"
- [ ] Instructions clear

### 5.6 Image Upload to Bot
**Send trash bin image:**
- [ ] Bot receives image
- [ ] "Tahlil qilinmoqda..." message (optional)
- [ ] AI analyzes (5-15 seconds)
- [ ] Bot responds with:
  - [ ] ✅ Confirmation message
  - [ ] Status (TO'LA/BO'SH)
  - [ ] Fill level percentage
  - [ ] AI confidence percentage
  - [ ] Analysis notes
  - [ ] Suggestions (if full)

### 5.7 Platform Real-time Update
After bot upload:
- [ ] Go to platform
- [ ] Find same bin
- [ ] Open details
- [ ] Image updated (< 10s)
- [ ] "TELEGRAM BOT" badge visible (blue)
- [ ] Fill level updated
- [ ] Status updated
- [ ] Last analysis updated

### 5.8 Bot Error Handling
- [ ] **Send non-image:** Error message
- [ ] **Send image without QR scan:** Error prompts to scan
- [ ] **Network error:** Retry or error message
- [ ] **Invalid bin ID:** Error message

**Result:** ⬜ PASS / ⬜ FAIL  
**Critical Issues:** _________________________________

---

## 🚛 TEST 6: TRUCKS & DRIVERS

### 6.1 Trucks List
- [ ] Switch to TRUCKS tab
- [ ] All trucks listed
- [ ] Each shows:
  - [ ] Driver name
  - [ ] Plate number
  - [ ] Status (IDLE/BUSY)
  - [ ] Fuel level
  - [ ] Organization

### 6.2 Truck on Map
- [ ] All trucks shown as blue square markers
- [ ] Click marker opens details
- [ ] Location updates if truck moves

### 6.3 Truck Details
- [ ] Driver name & phone
- [ ] Plate number
- [ ] Status with color
- [ ] Fuel level with icon
- [ ] Login credentials displayed
- [ ] Edit/Delete buttons work

### 6.4 Add New Truck
- [ ] Click add button
- [ ] Form opens
- [ ] Fields:
  - [ ] Driver name
  - [ ] Plate number
  - [ ] Phone
  - [ ] Organization
  - [ ] Login
  - [ ] Password
- [ ] Validation works
- [ ] Save creates truck
- [ ] Appears in list & map

### 6.5 Driver Dashboard (if accessible)
Login as driver: `driver1 / pass` (if exists)
- [ ] Only sees own truck
- [ ] Cannot see other data
- [ ] Limited navigation

**Result:** ⬜ PASS / ⬜ FAIL

---

## 🔒 TEST 7: LOCKED MODULES

Test each locked module:

### 7.1 Namlik (Moisture)
- [ ] Click module
- [ ] Shows lock screen
- [ ] Title correct
- [ ] Message: "Bu modul tez orada faollashtiriladi"
- [ ] Can return to dashboard

### 7.2-7.9 All Other Locked Modules
Repeat for: Havo, Xavfsizlik, Eco-Nazorat, Qurilish, Light-AI, Transport, Murojaatlar, Tahlil
- [ ] Each shows lock screen
- [ ] Titles correct
- [ ] No errors

**Result:** ⬜ PASS / ⬜ FAIL

---

## 🔔 TEST 8: NOTIFICATIONS

### 8.1 Notification Bell
- [ ] Bell icon visible (top right)
- [ ] Badge shows count if any
- [ ] Click opens dropdown
- [ ] Dropdown positioned correctly

### 8.2 Notification List
- [ ] All notifications shown
- [ ] Each notification:
  - [ ] Icon (based on type)
  - [ ] Title
  - [ ] Message
  - [ ] Timestamp
  - [ ] Read/unread indicator
- [ ] Click notification → marks as read
- [ ] Scroll works if many

**Result:** ⬜ PASS / ⬜ FAIL

---

## 📱 TEST 9: RESPONSIVE DESIGN

### 9.1 Desktop (1920x1080)
- [ ] All elements visible
- [ ] No horizontal scroll
- [ ] Layout optimal
- [ ] Maps full-size

### 9.2 Laptop (1366x768)
- [ ] Elements scale correctly
- [ ] Sidebar not too narrow
- [ ] Modals fit screen

### 9.3 Tablet (768x1024)
- [ ] Layout adapts
- [ ] Touch interactions work
- [ ] Modals responsive

### 9.4 Mobile (375x667)
- [ ] Mobile layout activates
- [ ] Navigation accessible
- [ ] Forms usable
- [ ] Maps work on touch

**Result:** ⬜ PASS / ⬜ FAIL

---

## ⚡ TEST 10: PERFORMANCE

### 10.1 Page Load Times
Measure with DevTools (Network tab):
- [ ] Login page: _____ ms (should < 1000ms)
- [ ] Dashboard: _____ ms (should < 3000ms)
- [ ] Chiqindi module: _____ ms (should < 3000ms)
- [ ] Issiqlik module: _____ ms (should < 3000ms)

### 10.2 API Response Times
Check Network tab XHR:
- [ ] /auth/login: _____ ms (should < 500ms)
- [ ] /waste-bins: _____ ms (should < 1000ms)
- [ ] /iot-devices: _____ ms (should < 1000ms)
- [ ] /facilities: _____ ms (should < 1000ms)

### 10.3 Real-time Updates
- [ ] Polling every 5 seconds (check console)
- [ ] No memory leaks (check DevTools Memory)
- [ ] UI remains smooth after 5 minutes
- [ ] No lag when switching modules

### 10.4 Bundle Size
Check Network tab:
- [ ] Main JS bundle: _____ KB (current: ~666KB)
- [ ] CSS bundle: _____ KB (current: ~66KB)
- [ ] Total page size: _____ KB
- [ ] Loads acceptably on 3G

**Result:** ⬜ PASS / ⬜ FAIL

---

## 🔐 TEST 11: SECURITY

### 11.1 Authentication
- [ ] Cannot access dashboard without login
- [ ] Token expires appropriately
- [ ] Logout clears session
- [ ] No token in URL

### 11.2 Authorization
- [ ] Organization user sees only their data
- [ ] Driver sees only driver dashboard
- [ ] No unauthorized access

### 11.3 Data Validation
- [ ] XSS prevented: `<script>alert('xss')</script>` in address
- [ ] SQL injection prevented in login
- [ ] Special characters handled

### 11.4 HTTPS & Cookies
- [ ] Site uses HTTPS
- [ ] Secure cookies
- [ ] CORS configured
- [ ] CSRF protection

**Result:** ⬜ PASS / ⬜ FAIL

---

## 🐛 TEST 12: ERROR HANDLING

### 12.1 Network Errors
- [ ] Disconnect internet → Shows error
- [ ] Reconnect → Data loads
- [ ] Retry mechanism works

### 12.2 API Errors
- [ ] 404 Not Found → Clear message
- [ ] 500 Server Error → User-friendly message
- [ ] Timeout → Retry or error

### 12.3 Invalid Data
- [ ] Invalid form input → Validation error
- [ ] Missing required fields → Highlighted
- [ ] Format errors → Examples shown

**Result:** ⬜ PASS / ⬜ FAIL

---

## 🎨 TEST 13: UI/UX

### 13.1 Visual Consistency
- [ ] Colors consistent across modules
- [ ] Fonts consistent
- [ ] Button styles consistent
- [ ] Card styles consistent
- [ ] Spacing uniform

### 13.2 Animations
- [ ] Module transitions smooth
- [ ] Modal open/close animated
- [ ] Hover effects work
- [ ] Loading spinners visible
- [ ] No jarring movements

### 13.3 Icons & Images
- [ ] All icons load correctly
- [ ] No broken images
- [ ] Icons meaningful
- [ ] Consistent icon set

### 13.4 Text & Labels
- [ ] All text in O'zbek (Lotin)
- [ ] No typos
- [ ] Clear instructions
- [ ] Consistent terminology

**Result:** ⬜ PASS / ⬜ FAIL

---

## 📊 FINAL SUMMARY

### Test Statistics:
- **Total Tests:** _____
- **Passed:** _____ (___%)
- **Failed:** _____ (___%)
- **Warnings:** _____

### Critical Issues Found:
1. _________________________________
2. _________________________________
3. _________________________________

### Medium Issues Found:
1. _________________________________
2. _________________________________
3. _________________________________

### Minor Issues Found:
1. _________________________________
2. _________________________________
3. _________________________________

### Performance Metrics:
- **Average Page Load:** _____ ms
- **Average API Response:** _____ ms
- **Bundle Size:** _____ KB
- **Memory Usage:** _____ MB

### Security Assessment:
- [ ] Authentication: SECURE / VULNERABLE
- [ ] Authorization: SECURE / VULNERABLE
- [ ] Data Validation: SECURE / VULNERABLE
- [ ] HTTPS/CORS: CONFIGURED / NEEDS FIX

### Overall Status:
⬜ **PRODUCTION READY** - All critical tests passed  
⬜ **NEEDS FIXES** - Some issues must be resolved  
⬜ **NOT READY** - Major issues found

### Recommendations:
1. _________________________________
2. _________________________________
3. _________________________________

---

**Tester Signature:** _______________  
**Date:** _______________  
**Approved for Production:** ⬜ YES / ⬜ NO

