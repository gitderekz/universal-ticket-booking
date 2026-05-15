# Transport Booking Automation Template
> Reusable workflow template for completing transport bookings end-to-end (Bus, Train, Ferry, Airplane)

---

## 📋 TRANSPORT BOOKING WORKFLOW STRUCTURE

```
STEP 1: Dashboard Selection
  ↓
STEP 2: Click "Transport" Category
  ↓
STEP 3: Select Transport Type (Bus, Train, Ferry, Airplane)
  ↓
STEP 4: Select Specific Transport/Company (e.g., Kilimanjaro Express)
  ↓
STEP 5: Select Route (e.g., Dar es Salaam → Mwanza)
  ↓
STEP 6: Select Date & Time
  ↓
STEP 7: Click Next → Navigate to Seat Selection
  ↓
STEP 8: Click Seats (select required number)
  ↓
STEP 9: Click Next → Navigate to Personal Details
  ↓
STEP 10: Fill Form: Full Name, Email, Phone, ID Number
  ↓
STEP 11: Click "Proceed to Payment"
  ↓
STEP 12: Select Payment Method (Mobile Money / Card / Bank)
  ↓
STEP 13: Select Provider (Airtel Money / M-Pesa / etc)
  ↓
STEP 14: Enter Phone Number
  ↓
STEP 15: Click "Pay Now"
  ↓
STEP 16: Wait for Processing → Redirect to /tickets
  ↓
STEP 17: Click "View Receipt" to confirm all details
```

---

## 🔧 ELEMENT SELECTORS & CLICK TARGETS

### Step 1: Dashboard Selection
```javascript
// Navigate to dashboard (if not already there)
page.goto('http://localhost:5173/dashboard')
```

### Step 2: Select Transport Category
```javascript
// Click Transport button on dashboard
button:has-text("Transport")
```

### Step 3: Select Transport Type
```javascript
// Common transport types (select one):
button:has-text("Bus")
button:has-text("Train") 
button:has-text("Ferry")
button:has-text("Airplane")

// Example: For Bus booking
button:has-text("Bus")  // Shows all bus companies/options
```

### Step 4: Select Specific Transport/Company
```javascript
// Click on transport company/vehicle name
button:has-text("Kilimanjaro Express")
// OR
button:has-text("Express 001")
// OR any other transport available

// After selection: Next button becomes enabled
button:has-text("Next")
```

### Step 5: Select Route
```javascript
// Click on route option (FROM → TO format)
button:has-text("Dar es Salaam → Mwanza")
// OR
button:has-text("Arusha → Dar es Salaam")
// OR specific route available

// After selection: Next button becomes enabled
button:has-text("Next")
```

### Step 6: Select Date & Time
```javascript
// Click time slot button (matches HH:MM pattern)
button:has-text(/\d{1,2}:\d{2}/)
// OR specific time
button:has-text("06:00")
button:has-text("14:00")

// Click Next to proceed to seats
button:has-text("Next")
```

### Step 7-8: Seat Selection
```javascript
// Method 1: Click by title attribute (seat code)
button[title="A1"]  // First seat
button[title="A2"]  // Second seat
button[title="B1"]  // Third seat (if needed)

// Method 2: Click by matching seat button pattern
class="w-12 h-12 rounded-lg flex items-center justify-center text-white transition-all bg-blue-500"

// VERIFICATION: Selected seats display as green
// Total price updates based on seat count
// For 2 passengers: Select A1, A2 (example)
// For 3 passengers: Select A1, A2, B1
// Proceed when seats are selected
button:has-text("Next")
```

### Step 9-10: Personal Details Form
```javascript
// Fill all 4 fields (for primary passenger)
document.querySelectorAll('input')[0] → "John Doe"           // Full Name
document.querySelectorAll('input')[1] → "john@example.com"   // Email
document.querySelectorAll('input')[2] → "255754123456"       // Phone
document.querySelectorAll('input')[3] → "ID123456789"        // ID Number

// OR target by placeholder
input[placeholder*="Full Name" i]
input[placeholder*="Email" i]
input[placeholder*="Phone" i]
input[placeholder*="ID" i]
```

### Step 11: Proceed to Payment
```javascript
button:has-text("Proceed to Payment")
```

### Step 12-13: Payment Method & Provider Selection
```javascript
// Click Payment Method (if multiple options available)
button:has-text("Mobile Money")
// OR
button:has-text("Credit/Debit Card")
// OR
button:has-text("Bank Transfer")

// Select Provider for Mobile Money
button:has-text("Airtel Money")
// OR
button:has-text("M-Pesa (Vodacom)")
// OR
button:has-text("HaloPesa")
// OR
button:has-text("Tigo Pesa")
```

### Step 14-15: Phone Number & Payment
```javascript
// Fill phone number in payment modal
input[placeholder*="phone" i] → "255754123456"

// Click Pay Now
button:has-text("Pay Now")

// Button will show "Processing..." while processing
// Wait ~3 seconds then check URL should be /tickets
```

### Step 16-17: Receipt Verification
```javascript
// Click View Receipt on the booking
button:has-text("View Receipt")[0]  // First button

// Verify in Receipt Modal:
// - Booking Number (contains "BKG-" prefix)
// - Status (should be "confirmed" or "holding")
// - Journey Details: Route (FROM → TO), Company, Date, Time
// - Seat(s): List of selected seats
// - Passenger Info: Name, Email, Phone
// - Payment Summary: Total Amount, Payment Method
```

---

## 📝 DATA TEMPLATES FOR FORMS

### Personal Details (Always Use These Default Values)
```
Full Name:    John Doe
Email:        john@example.com  OR  john.doe@example.com
Phone:        255754123456      (Tanzania mobile format)
ID Number:    ID123456789       (Any valid format)
```

### Payment Details
```
Payment Method:  Mobile Money (recommended for Tanzania)
Provider:        Airtel Money (preferred) OR M-Pesa
Phone:           255754123456 (same as contact phone)
```

---

## 🎯 QUICK REFERENCE: TRANSPORT TYPES & EXAMPLES

### Transport Types Available
| Type | Examples | Notes |
|------|----------|-------|
| Bus | Kilimanjaro Express, Nairobi Transit | Local/intercity routes |
| Train | Tanzania Railways, SGR Madaraka | Long-distance, scheduled |
| Ferry | Azam Marine, Island Ferries | Coastal/island routes |
| Airplane | Precision Air, Coastal Aviation | Domestic flights |
| Safari Car | Safari Adventures | Specialized tours |

### Example: Bus Booking
```
Transport Type: Bus
Company: Kilimanjaro Express
Transport: Express 001
Route: Dar es Salaam → Mwanza
Date: 2026-05-10
Time: 06:00 AM
Seats: A1, A2 (2 seats)
Price per seat: TSh 30,000
Total: TSh 60,000
Payment: Airtel Money
```

### Example: Ferry Booking
```
Transport Type: Ferry
Company: Azam Marine
Transport: Azam Star
Route: Dar es Salaam → Zanzibar
Date: 2026-05-15
Time: 09:00 AM
Seats: C5, C6, D1 (3 seats)
Price per seat: TSh 25,000
Total: TSh 75,000
Payment: M-Pesa
```

---

## 🚨 TRANSPORT-SPECIFIC ISSUES & SOLUTIONS

### Issue 1: "Transport Type Not Showing"
```
✓ SOLUTION: Click "Transport" on dashboard first
✓ Wait 600ms for page to load transport list
✓ Verify you're on /bookings/transport page
```

### Issue 2: "Routes Not Available for Selected Transport"
```
✓ SOLUTION: Select a transport company first
✓ Wait 400ms before clicking route
✓ Check if routes are available (some dates may be sold out)
✓ Select another date/time if needed
```

### Issue 3: "Seat Layout Different from Facility"
```
✓ SOLUTION: Transport seats use same sitting plan as mockData
✓ Bus usually 2-2 or 2-1 seating arrangement
✓ Train uses 3-2 seating arrangement
✓ Ferry uses 4-4 or 3-3 arrangement
✓ Click seats by their row letter and number (A1, A2, B1, etc)
```

### Issue 4: "Price Not Calculating Correctly"
```
✓ SOLUTION: Each transport has base_price set in database
✓ Total = base_price × number_of_seats
✓ Service fee usually TSh 0
✓ Verify amount in receipt matches calculation
```

### Issue 5: "Booking Shows Different Status than Facility"
```
✓ SOLUTION: Transport bookings default to "confirmed"
✓ Facility bookings default to "holding" (waiting for arrival)
✓ Both types show correct payment method and amount
✓ Status depends on business rules (not a bug)
```

---

## 🔄 AUTOMATED TRANSPORT BOOKING SCRIPT TEMPLATE

```javascript
// Use this pattern for end-to-end automated transport bookings
(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  
  // STEP 1: Navigate to dashboard
  await page.goto('http://localhost:5173/dashboard');
  await sleep(600);
  
  // STEP 2: Click Transport
  await page.click('button:has-text("Transport")');
  await sleep(600);
  
  // STEP 3: Click Transport Type (Bus example)
  await page.click('button:has-text("Bus")');
  await sleep(600);
  
  // STEP 4: Click Transport Company
  await page.click('button:has-text("Kilimanjaro Express")');
  await sleep(600);
  
  // STEP 5: Click Next to proceed
  await page.click('button:has-text("Next")');
  await sleep(600);
  
  // STEP 6: Click Route
  await page.click('button:has-text("Dar es Salaam → Mwanza")');
  await sleep(600);
  
  // STEP 7: Click Next
  await page.click('button:has-text("Next")');
  await sleep(600);
  
  // STEP 8: Select time slot
  const timeBtn = await page.$('button:has-text(/\\d{1,2}:\\d{2}/)');
  if (timeBtn) await timeBtn.click();
  await sleep(600);
  
  // STEP 9: Click Next to seats
  await page.click('button:has-text("Next")');
  await sleep(600);
  
  // STEP 10: Select 2 seats (for transport example)
  await page.click('button[title="A1"]');
  await sleep(400);
  await page.click('button[title="A2"]');
  await sleep(400);
  
  // STEP 11: Click Next to details
  await page.click('button:has-text("Next")');
  await sleep(600);
  
  // STEP 12: Fill personal details
  const inputs = await page.$$('input');
  await inputs[0].fill('John Doe');
  await inputs[1].fill('john@example.com');
  await inputs[2].fill('255754123456');
  await inputs[3].fill('ID123456789');
  await sleep(300);
  
  // STEP 13: Click Proceed to Payment
  await page.click('button:has-text("Proceed to Payment")');
  await sleep(1000);
  
  // STEP 14: Select Mobile Money (if needed)
  const mobileMoneyBtn = await page.$('button:has-text("Mobile Money")');
  if (mobileMoneyBtn) await mobileMoneyBtn.click();
  await sleep(400);
  
  // STEP 15: Select Airtel Money provider
  await page.click('button:has-text("Airtel Money")');
  await sleep(300);
  
  // STEP 16: Fill phone
  const phoneInput = await page.$('input[placeholder*="phone" i]');
  if (phoneInput) {
    await phoneInput.fill('255754123456');
    await sleep(300);
  }
  
  // STEP 17: Click Pay Now
  await page.click('button:has-text("Pay Now")');
  await sleep(3000);
  
  // STEP 18: Verify redirect to /tickets
  const finalUrl = page.url();
  console.log('Final URL:', finalUrl);
  return { success: finalUrl.includes('/tickets') };
})();
```

---

## ✅ VERIFICATION CHECKLIST - TRANSPORT RECEIPT

After completing transport booking, verify receipt contains:

- [ ] Booking Number starts with "BKG-" or "BK-TRANSPORT-"
- [ ] Status shows "confirmed" or "holding"
- [ ] Route shows correct FROM → TO locations (e.g., "Dar es Salaam → Mwanza")
- [ ] Company shows correct transport operator (e.g., "Kilimanjaro Express")
- [ ] Date matches selected date
- [ ] Time matches selected time slot
- [ ] Seats list contains exactly selected seats (e.g., "A1, A2")
- [ ] Total Amount is correct (seats × price per seat)
- [ ] Passenger Name shows "John Doe"
- [ ] Email is present and correct
- [ ] Phone number is present and correct
- [ ] Payment Method shows "Airtel Money", "M-Pesa", or selected provider
- [ ] Receipt note: "Show this receipt or QR code at the boarding point"

---

## 🔀 KEY DIFFERENCES: Transport vs Facility Booking

| Aspect | Transport | Facility |
|--------|-----------|----------|
| **Step 2** | Click "Transport" | Click category (Sports, Entertainment, etc) |
| **Step 3** | Select transport type (Bus, Train, etc) | N/A - skip directly to facility |
| **Step 4** | Select specific transport/company | Select facility by name |
| **Step 5** | Select route (FROM → TO) | Select activity/event |
| **Step 6** | Select date & time | Select date & time |
| **Default Status** | "confirmed" | "holding" |
| **Seat Layout** | Varies by transport type | Varies by facility |
| **Route Label** | "Route: FROM → TO" | "Route: FACILITY → ACTIVITY" |

---

## 📚 FILE REFERENCES IN PROJECT

```
Frontend Components:
├── figma-frontend/src/app/pages/Booking/TransportBooking.tsx
├── figma-frontend/src/app/pages/Booking/FacilityBooking.tsx
├── figma-frontend/src/app/components/booking/SeatSelector.tsx
├── figma-frontend/src/app/components/booking/PaymentModal.tsx
└── figma-frontend/src/app/pages/Customer/TicketsPage.tsx

Backend APIs:
├── backend/src/routes/transport.js
├── backend/src/routes/route.js
├── backend/src/routes/booking.js
├── backend/src/routes/payment.js
└── backend/src/controllers/bookingController.js

Mock Data Source:
└── figma-frontend/src/data/mockData.ts
```

---

## 🎓 COMMON BOOKING SCENARIOS

### Scenario 1: Quick Bus Booking (2 seats)
```
Time: ~2-3 minutes
Transport: Bus
Seats: A1, A2
Amount: ~TSh 60,000

Steps: Transport → Bus → Kilimanjaro Express → Next → 
Dar es Salaam → Mwanza → Next → 06:00 → Next → 
A1, A2 → Next → Details → Proceed → Mobile Money → 
Airtel Money → Phone → Pay Now → ✓ Receipt
```

### Scenario 2: Ferry Booking (3 seats)
```
Time: ~2-3 minutes
Transport: Ferry
Seats: C5, C6, D1
Amount: ~TSh 75,000

Steps: Transport → Ferry → Azam Marine → Next →
Dar es Salaam → Zanzibar → Next → 09:00 → Next →
C5, C6, D1 → Next → Details → Proceed → Mobile Money →
M-Pesa → Phone → Pay Now → ✓ Receipt
```

### Scenario 3: Train Booking (1 seat)
```
Time: ~2 minutes
Transport: Train
Seats: A1
Amount: ~TSh 45,000

Steps: Transport → Train → Tanzania Railways → Next →
Dar es Salaam → Kigoma → Next → 18:00 → Next →
A1 → Next → Details → Proceed → Mobile Money →
HaloPesa → Phone → Pay Now → ✓ Receipt
```

---

## 📌 USAGE NOTES

- **Always wait 400-600ms** between major steps for page loading
- **Phone number format** must be Tanzania format (255XXXXXXXXX)
- **Seat selection** varies by transport sitting plan (Bus 2-2, Train 3-2, Ferry 4-4)
- **Payment defaults** to Airtel Money (change if needed)
- **Receipt verification** confirms booking is registered in system
- **Multiple passengers** require separate bookings (not multi-passenger in single booking)

---

## 🚀 QUICK START

1. Copy the **Automated Transport Booking Script** from above
2. Update transport type, company, and route names as needed
3. Adjust seat selections based on booking requirements
4. Modify personal details if different from defaults
5. Run in `run_playwright_code()` terminal
6. Monitor console for success message
7. Verify booking appears in /tickets page
