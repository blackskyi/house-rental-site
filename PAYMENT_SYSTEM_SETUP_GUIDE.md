# Payment Processing System - Setup Guide
**Campus Rentals | Transaction-Based Revenue Model**

---

## 🎯 Business Model

**12% transaction fee on every rent payment processed through the platform**

**Example:**
- Tenant pays: $1,200/month
- Owner receives: $1,056 (88%)
- Platform receives: $144 (12%)
- Payment processor fee: ~$35 (2.9% + $0.30)
- Your net profit: ~$109/month per property

---

## 🏗️ Architecture Overview

### Payment Flow:

```
Tenant → Stripe Checkout → Platform (12%) → Owner (88%)
   ↓
Pays $1,200
   ↓
Stripe processes payment
   ↓
Platform receives $144 (held in Stripe balance)
   ↓
Owner receives $1,056 (transferred via Stripe Connect)
```

### Why Stripe Connect?

✅ **Built for marketplaces** - designed for split payments
✅ **Handles compliance** - PCI compliance, tax reporting (1099s)
✅ **Automated transfers** - splits happen automatically
✅ **Dispute handling** - chargebacks managed by Stripe
✅ **International** - works globally if you expand
✅ **Trusted** - used by Airbnb, Lyft, Shopify

---

## 📋 Setup Steps

### Phase 1: Stripe Account Setup (TODAY)

1. **Create Stripe Account**
   - Go to: https://dashboard.stripe.com/register
   - Use your business email: support@og-rooms.com
   - Select "I'm creating a platform or marketplace"
   - Complete business verification

2. **Get Your API Keys**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy both:
     - Publishable key (starts with pk_test_...)
     - Secret key (starts with sk_test_...)
   - We'll use TEST mode first, then switch to LIVE

3. **Enable Stripe Connect**
   - Go to: https://dashboard.stripe.com/connect/overview
   - Choose "Standard" account type (easiest for owners)
   - Set application name: "Campus Rentals"
   - Set brand icon/logo

4. **Set Platform Fee**
   - Go to: https://dashboard.stripe.com/settings/connect
   - Set application fee: 12% of transaction

---

## 💳 Payment System Components

### Component 1: Tenant Payment Portal
**File:** `pay-rent.html`

**Features:**
- Tenant enters lease details
- Monthly recurring payments
- One-time or autopay options
- Receipt generation
- Payment history

### Component 2: Owner Connect Onboarding
**File:** `owner-connect-stripe.html`

**Features:**
- Connect owner's bank account
- Verify identity (required by Stripe)
- Set payout schedule (instant, daily, weekly)
- Tax information collection

### Component 3: Payment Dashboard
**Added to:** `owner-dashboard.html`

**Features:**
- View all rent payments
- Download payment history
- See upcoming payments
- Dispute/refund management

### Component 4: Backend Payment Processing
**File:** `payment-server.js` (Node.js/Express)

**Features:**
- Process Stripe webhooks
- Handle payment events
- Automatic 88/12 split
- Error handling
- Email notifications

---

## 🔧 Technical Implementation

### Option A: Serverless (Recommended for MVP)
**Using Google Cloud Functions or Vercel**

**Pros:**
- ✅ No server to manage
- ✅ Scales automatically
- ✅ Free tier available
- ✅ Easy deployment

**Cons:**
- ❌ Cold start delays
- ❌ Limited to stateless operations

### Option B: Railway (Current Host)
**Add Express.js backend to existing setup**

**Pros:**
- ✅ Same platform as frontend
- ✅ Easy to manage
- ✅ Can add database easily

**Cons:**
- ❌ Costs ~$5/month
- ❌ Need to maintain server

**Recommendation: Start with Option B (Railway)**

---

## 📝 Stripe Connect Flow

### 1. Owner Signs Up
```javascript
// owner-signup.html
// After basic registration, redirect to Stripe Connect
window.location.href = 'https://connect.stripe.com/oauth/authorize?response_type=code&client_id=YOUR_CLIENT_ID&scope=read_write'
```

### 2. Owner Connects Bank Account
```javascript
// Stripe handles this
// Owner enters bank details on Stripe's secure page
// Stripe verifies identity
// Returns authorization code
```

### 3. Platform Stores Connection
```javascript
// Backend receives authorization code
// Exchange for connected account ID
// Store in database: { ownerId: 'sara-001', stripeAccountId: 'acct_xxx' }
```

### 4. Tenant Makes Payment
```javascript
// pay-rent.html
const stripe = Stripe('pk_test_YOUR_KEY');
const session = await fetch('/create-payment', {
  method: 'POST',
  body: JSON.stringify({
    amount: 1200, // $1,200
    ownerId: 'sara-001',
    propertyId: 'property-1'
  })
});
```

### 5. Backend Processes Payment
```javascript
// payment-server.js
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: { name: 'Monthly Rent - Spacious 3B2B' },
      unit_amount: 120000, // $1,200.00 in cents
    },
    quantity: 1,
  }],
  mode: 'payment',

  // Platform fee (12%)
  payment_intent_data: {
    application_fee_amount: 14400, // $144 in cents (12%)
    transfer_data: {
      destination: ownerStripeAccount, // Owner receives $1,056
    },
  },
});
```

### 6. Automatic Split Happens
```
Total: $1,200
Stripe Fee: ~$35 (2.9% + $0.30)
Platform: $144 (12%)
Owner: $1,021 ($1,056 - Stripe fees on their portion)
```

---

## 💰 Revenue & Costs Breakdown

### Per Transaction ($1,200 rent):

| Party | Amount | Percentage |
|-------|--------|------------|
| Tenant Pays | $1,200 | 100% |
| Stripe Fee | -$35 | -2.92% |
| Platform (You) | $144 | 12% |
| Owner Receives | $1,021 | 85.08% |

**Your Net Profit per Transaction:** ~$109

### Monthly Revenue Projections:

| Properties | Avg Rent | Your Revenue | Annual |
|-----------|----------|--------------|--------|
| 10 | $1,000 | $1,090/mo | $13,080 |
| 25 | $1,000 | $2,725/mo | $32,700 |
| 50 | $1,000 | $5,450/mo | $65,400 |
| 100 | $1,000 | $10,900/mo | $130,800 |

---

## 🛡️ Anti-Circumvention Strategy

**Problem:** After initial placement, owner & tenant might pay directly to avoid 12%

### Solutions:

1. **Contractual Obligation**
   - Owner signs agreement: ALL rent must go through platform
   - 12-month minimum commitment
   - Breach = penalty fee

2. **Value-Added Services** (Make portal valuable)
   - Automatic late fee calculation
   - Payment reminders
   - Digital receipts for taxes
   - Rental history for credit
   - Maintenance request system
   - Lease renewal automation

3. **Tenant Incentives**
   - Rent reporting to credit bureaus (builds credit)
   - Reward points for on-time payments
   - Renter's insurance integration
   - Moving services discounts

4. **Owner Incentives**
   - 1099 tax form generation (automated)
   - Accounting software integration (QuickBooks)
   - Vacancy insurance
   - Free property marketing for future listings
   - Lower fee for long-term users (10% after 12 months)

5. **Technical Lock-In**
   - Lease agreement signed through platform
   - Security deposit held in escrow
   - Both parties need portal access for lease documents

---

## 📊 Comparison: Your Model vs. Industry

| Service | Transaction Fee | Notes |
|---------|----------------|-------|
| **Your Platform** | **12%** | **Full service + payment** |
| Zillow Rental Manager | 2.95% (CC) | Tenant pays, not owner |
| Apartments.com | 2.75% (CC) | Tenant pays, not owner |
| Cozy (now Apartments.com) | Free | No payment processing |
| Traditional Property Manager | 8-10% | Monthly + management |
| Venmo/Zelle | 0% | No protection |

**Your Positioning:**
> "12% transaction fee covers marketing, tenant placement, payment processing, AND ongoing platform support. Traditional property managers charge 8-10% monthly and you still have to handle applications yourself."

---

## 🚀 Implementation Timeline

### Week 1: Setup & Foundation
- ✅ Create Stripe account
- ✅ Get API keys
- ✅ Enable Stripe Connect
- ✅ Build basic payment form
- ✅ Test with Stripe test cards

### Week 2: Owner Integration
- Build Stripe Connect onboarding flow
- Add owner dashboard payment section
- Test owner payouts
- Create payment history view

### Week 3: Tenant Portal
- Build rent payment page
- Add recurring payment option
- Email notifications
- Receipt generation

### Week 4: Testing & Launch
- Full end-to-end testing
- Switch to LIVE mode
- Update legal agreements
- Soft launch with Sara

---

## 🔐 Security & Compliance

### PCI Compliance
✅ **Stripe handles this** - you never touch card data
- Stripe Checkout handles card input
- All sensitive data stays on Stripe servers
- You only receive payment confirmation

### Data Privacy
- Store minimum payment data
- Never store full card numbers
- Encrypt Stripe account IDs
- GDPR compliant (Stripe is)

### Tax Compliance
- Stripe generates 1099-K forms automatically
- Required when owner receives >$600/year
- Platform generates 1099-MISC for your commission
- Consult tax advisor for your LLC structure

---

## ⚠️ Important: F-1 OPT Compliance

**As F-1 OPT student, ensure:**
1. LLC is set up with green card holder as managing member
2. You're employed by LLC (on W-2)
3. Payment processing is under LLC's name
4. Stripe account registered to LLC (not you personally)
5. Consult immigration attorney before processing payments

---

## 📞 Stripe Support

If you get stuck:
- **Email:** support@stripe.com
- **Docs:** https://stripe.com/docs/connect
- **Discord:** https://discord.gg/stripe
- **Phone:** (888) 926-2289 (US)

---

## ✅ Next Steps - IMMEDIATE

1. **Create Stripe Account NOW**
   - Go to https://dashboard.stripe.com/register
   - Use: support@og-rooms.com (or LLC email if you have it)

2. **Send Me Your API Keys**
   - Publishable key (pk_test_...)
   - Secret key (sk_test_...)
   - I'll integrate them into the code

3. **Decide on Backend**
   - Railway (add Express.js backend)
   - OR Vercel Serverless Functions
   - OR Google Cloud Functions

4. **Review & Sign Off**
   - Confirm 12% fee structure
   - Confirm automated split (88/12)
   - Confirm Stripe as payment processor

---

Once you send me the Stripe keys, I'll build:
1. ✅ Tenant payment portal
2. ✅ Owner Stripe Connect onboarding
3. ✅ Automated split payment system
4. ✅ Payment history dashboard
5. ✅ Email notifications
6. ✅ Receipt generation

Let's get started! 🚀
