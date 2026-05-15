# Universal Booking Automation Template
> Reusable workflow template for completing facility and transport bookings end-to-end

---

## 📋 BOOKING WORKFLOW STRUCTURE

```
STEP 1: Dashboard Selection
  ↓
STEP 2: Category/Type Selection (Transport Type OR Facility Category)
  ↓
STEP 3: Select Specific Item (Transport/Facility)
  ↓
STEP 4: Select Activity (if facility) OR Route (if transport)
  ↓
STEP 5: Date & Time Selection
  ↓
STEP 6: Click Next → Navigate to Seat Selection
  ↓
STEP 7: Click 3 Seats (or required number)
  ↓
STEP 8: Click Next → Navigate to Personal Details
  ↓
STEP 9: Fill Form: Full Name, Email, Phone, ID Number
  ↓
STEP 10: Click "Proceed to Payment"
  ↓
STEP 11: Select Payment Method (Mobile Money)
  ↓
STEP 12: Select Provider (Airtel Money / M-Pesa / etc)
  ↓
STEP 13: Enter Phone Number
  ↓
STEP 14: Click "Pay Now"
  ↓
STEP 15: Wait for Processing → Redirect to /tickets
  ↓
STEP 16: Click "View Receipt" to confirm all details
```

---

## 🔧 ELEMENT SELECTORS & CLICK TARGETS

### Step 1: Login (if needed)
```javascript
// Fill email and password
textbox[placeholder*="email" i] → "amina.juma@gmail.com"
textbox[placeholder*="password" i] → "SeedPass123!"

// Click Sign In
button:has-text("Sign In")
```

### Step 2: Dashboard Category Selection
```javascript
// For FACILITY BOOKING:
button:has-text("Sports")      // or Entertainment, Events, Outdoor, Housing

// For TRANSPORT BOOKING:
button:has-text("Transport")
```

### Step 3: Select Specific Item (Facility/Transport)
```javascript
// Click facility/transport card by name
button:has-text("Sports Complex Indoor")
// OR
button:has-text("Kilimanjaro Express")

// After click: Next button becomes enabled
button:has-text("Next")
```

### Step 4: Select Activity/Route
```javascript
// Click on activity/route name
button:contains("East Africa Basketball Finals")
// OR
button:contains("Dar es Salaam → Mwanza")

// Next button becomes enabled after selection
button:has-text("Next")
```

### Step 5: Select Date & Time
```javascript
// Click time slot button (matches HH:MM pattern)
button:has-text(/\d{1,2}:\d{2}/) 
// OR specific time
button:has-text("03:15 PM")

// Click Next to proceed to seats
button:has-text("Next")
```

### Step 6-7: Seat Selection (SELECT EXACTLY 3 SEATS)
```javascript
// Method 1: Click by title attribute
button[title="A2"]  // First seat
button[title="A3"]  // Second seat  
button[title="B2"]  // Third seat

// Method 2: Click by matching seat button pattern
class="w-12 h-12 rounded-lg flex items-center justify-center text-white transition-all bg-blue-500"

// VERIFICATION: Selected seats display as green
// Total price should update (e.g., TSh 54,000 for 3 seats)
// Proceed when 3 seats are selected
button:has-text("Next")
```

### Step 8-9: Personal Details Form
```javascript
// Fill all 4 fields in order
document.querySelectorAll('textbox, input[type="text"]')[0] → "John Doe"           // Full Name
document.querySelectorAll('textbox, input[type="text"]')[1] → "john@example.com"   // Email
document.querySelectorAll('textbox, input[type="text"]')[2] → "255754123456"       // Phone
document.querySelectorAll('textbox, input[type="text"]')[3] → "ID123456789"        // ID Number

// OR target by placeholder
input[placeholder*="Full Name" i]
input[placeholder*="Email" i]
input[placeholder*="Phone" i]
input[placeholder*="ID" i]
```

### Step 10: Proceed to Payment
```javascript
button:has-text("Proceed to Payment")
```

### Step 11-12: Payment Method & Provider Selection
```javascript
// Click Payment Method (if not auto-selected)
button:has-text("Mobile Money")

// Select Provider (scroll in modal if needed)
button:has-text("Airtel Money")
// OR
button:has-text("M-Pesa (Vodacom)")
```

### Step 13-14: Phone Number & Payment
```javascript
// Fill phone number
input[placeholder*="phone" i] → "255754123456"

// Click Pay Now
button:has-text("Pay Now")

// Button will show "Processing..." while payment is being processed
// Wait ~3 seconds then check URL should be /tickets
```

### Step 15-16: Receipt Verification
```javascript
// Click View Receipt on first booking (most recent)
button:has-text("View Receipt")[0]  // First button

// Verify in Receipt Modal:
// - Booking Number (contains "BKG-" prefix)
// - Status (should be "holding" or "confirmed")
// - Journey Details: Route, Company, From, To, Date, Time
// - Seat(s): List of selected seats
// - Passenger Info: Name, Email, Phone
// - Payment Summary: Total Amount
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
Payment Method:  Mobile Money
Provider:        Airtel Money (preferred) OR M-Pesa
Phone:           255754123456 (same as contact phone)
```

---

## 🎯 QUICK REFERENCE: FACILITY BOOKING STEPS

### Category Selection Flow
| Category | Button Text | Notes |
|----------|------------|-------|
| Cinema/Movies | Entertainment | Most entertainment options |
| Sports Events | Sports | East Africa Basketball Finals, etc |
| Conferences | Events | Tech summits, business forums |
| Safari/Outdoor | Outdoor | Tours, trekking, nature experiences |
| Hotels | Housing | Lodges, resorts, hotels |

### Facility Details Example: Sports
```
Category Selected: Sports
Facility: Sports Complex Indoor (Benjamin Mkapa Stadium)
Activity: East Africa Basketball Finals
Date: 5/26/2026
Time: 03:15 PM
Seats: A2, A3, B2 (3 seats)
Price per seat: TSh 18,000
Total: TSh 54,000
Payment: Airtel Money
```

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue 1: "Next Button Disabled"
```
✓ SOLUTION: Select an item/seat first
✓ Wait 300-400ms for button to enable
✓ Verify selection shows in UI (highlight/price update)
```

### Issue 2: "Pay Now Button Disabled"
```
✓ SOLUTION: Fill ALL 4 personal detail fields
✓ Fill phone number field in payment modal
✓ Select payment provider (Airtel Money/M-Pesa)
✓ Wait 500ms after phone entry before clicking
```

### Issue 3: "Page Stays on Booking Page After Payment"
```
✓ SOLUTION: Page redirects to /tickets automatically
✓ Wait 2-3 seconds after clicking Pay Now
✓ Check browser console for errors
✓ Booking status shows as "holding" (not "confirmed" yet)
```

### Issue 4: "Seats Not Showing as Selected"
```
✓ SOLUTION: Use exact button[title="X#"] selector
✓ Verify seat shows GREEN color after click
✓ Price should update to reflect seat count
✓ Click seats one by one with 300ms delays between
```

### Issue 5: "Receipt Shows Complete Booking Info But With Shifted Data"
```
✓ SOLUTION: Backend properly maps booking details
✓ Verify all Journey Details match selected options
✓ Passenger info shows correct name/phone/email
✓ Payment summary shows correct total
```

---

## 🔄 AUTOMATED BOOKING SCRIPT TEMPLATE

```javascript
// Use this pattern for end-to-end automated bookings
(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  
  // STEP 1: Navigate to dashboard
  await page.goto('http://localhost:5173/dashboard');
  
  // STEP 2: Click category
  await page.click('button:has-text("Sports")');
  await sleep(600);
  
  // STEP 3: Click facility
  await page.click('button:has-text("Sports Complex Indoor")');
  await sleep(600);
  
  // STEP 4: Click Next
  await page.click('button:has-text("Next")');
  await sleep(600);
  
  // STEP 5: Click activity
  await page.click('button:has-text("East Africa Basketball Finals")');
  await sleep(600);
  
  // STEP 6: Click Next
  await page.click('button:has-text("Next")');
  await sleep(600);
  
  // STEP 7: Click time
  const timeBtn = await page.$('button:has-text(/\\d{1,2}:\\d{2}/)');
  if (timeBtn) await timeBtn.click();
  await sleep(600);
  
  // STEP 8: Click Next to seats
  await page.click('button:has-text("Next")');
  await sleep(600);
  
  // STEP 9: Select 3 seats
  await page.click('button[title="A2"]');
  await sleep(400);
  await page.click('button[title="A3"]');
  await sleep(400);
  await page.click('button[title="B2"]');
  await sleep(400);
  
  // STEP 10: Click Next to details
  await page.click('button:has-text("Next")');
  await sleep(600);
  
  // STEP 11: Fill personal details
  const inputs = await page.$$('input');
  await inputs[0].fill('John Doe');
  await inputs[1].fill('john@example.com');
  await inputs[2].fill('255754123456');
  await inputs[3].fill('ID123456789');
  await sleep(300);
  
  // STEP 12: Click Proceed to Payment
  await page.click('button:has-text("Proceed to Payment")');
  await sleep(1000);
  
  // STEP 13: Select Airtel Money provider
  await page.click('button:has-text("Airtel Money")');
  await sleep(300);
  
  // STEP 14: Fill phone
  const phoneInput = await page.$('input[placeholder*="phone" i]');
  if (phoneInput) {
    await phoneInput.fill('255754123456');
    await sleep(300);
  }
  
  // STEP 15: Click Pay Now
  await page.click('button:has-text("Pay Now")');
  await sleep(3000);
  
  // STEP 16: Verify redirect to /tickets
  const finalUrl = page.url();
  console.log('Final URL:', finalUrl);
  return { success: finalUrl.includes('/tickets') };
})();
```

---

## ✅ VERIFICATION CHECKLIST

After completing booking, verify receipt contains:

- [ ] Booking Number starts with "BKG-"
- [ ] Status shows "holding" or "confirmed"
- [ ] Route matches selected activity
- [ ] Company matches facility/transport provider
- [ ] Date matches selected date
- [ ] Time matches selected time slot
- [ ] Seats list contains exactly 3 seats
- [ ] Total Amount is correct (seats × price)
- [ ] Passenger Name shows "John Doe"
- [ ] Email is present and correct
- [ ] Phone number is present and correct
- [ ] Payment Method shows "Airtel Money" or selected provider

---

## 📚 FILE REFERENCES IN PROJECT

```
Frontend Components:
├── figma-frontend/src/app/pages/Booking/FacilityBooking.tsx
├── figma-frontend/src/app/pages/Booking/TransportBooking.tsx
├── figma-frontend/src/app/components/booking/SeatSelector.tsx
├── figma-frontend/src/app/components/booking/PaymentModal.tsx
└── figma-frontend/src/app/pages/Customer/TicketsPage.tsx

Backend APIs:
├── backend/src/routes/facility.js
├── backend/src/routes/activity.js
├── backend/src/routes/booking.js
├── backend/src/routes/payment.js
└── backend/src/controllers/bookingController.js

Mock Data Source:
└── figma-frontend/src/data/mockData.ts
```

---

## 🎓 EXAMPLE USAGE OF THIS TEMPLATE

When user provides booking request:
1. Copy the **Automated Booking Script** from above
2. Update the selector strings (category, facility, activity names)
3. Paste into `run_playwright_code()` 
4. Adjust `sleep()` delays if needed (usually 300-600ms sufficient)
5. Run and monitor for errors
6. If issue occurs, reference **COMMON ISSUES** section above
7. Verify using **VERIFICATION CHECKLIST**
