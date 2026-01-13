# ⚡ QUICK 5-MINUTE TEST SCRIPT
## Critical Functionality Test

**Goal:** Test all critical paths in 5 minutes

---

## 🔥 1. AUTHENTICATION (1 min)

```
✅ Go to: https://fergana.cdcgroup.uz
✅ Login: fergan / 123
✅ Dashboard loads
✅ User name shown: "Farg'ona"
```

---

## 🔥 2. CHIQINDI MODULE (2 min)

```
✅ Click "Chiqindi"
✅ Module loads, map visible
✅ 21 bins in sidebar
✅ Click "24-maktab orqasi"
✅ Modal opens
✅ Check sections:
   • Camera/image
   • Monitoring ma'lumotlari
   • QR CODE (⭐ MUST BE VISIBLE)
   • Download button
   • Delete/Edit buttons
✅ Download QR code → File downloads
✅ Scan QR → Bot opens
✅ Send image → Bot analyzes
```

---

## 🔥 3. ISSIQLIK MODULE (1 min)

```
✅ Click "Issiqlik"
✅ Facilities listed
✅ Click "42"
✅ Rooms shown with temp/humidity
✅ IoT devices listed
✅ Data updates (wait 10s, check console)
```

---

## 🔥 4. CREATE NEW BIN + AUTO QR (1 min)

```
✅ Chiqindi → "+ KONTEYNER QO'SHISH"
✅ Fill form:
   • Address: "TEST QA"
   • Coordinates: 40.3833, 71.7833
✅ Click "Saqlash"
✅ Bin created
✅ Open new bin
✅ QR CODE AUTO-GENERATED ⭐
✅ Download QR → Works
✅ Scan QR → Bot opens with correct bin
```

---

## ✅ PASS CRITERIA

All of the above must work without errors!

If ANY fails → NEEDS FIX

