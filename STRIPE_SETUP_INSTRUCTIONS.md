# Stripe Setup - Step-by-Step Instructions

**Follow these steps EXACTLY to set up payment processing**

---

## ✅ Step 1: Create Stripe Account (5 minutes)

1. Go to: **https://dashboard.stripe.com/register**

2. Fill in the form:
   - Email: `support@og-rooms.com` (or your LLC email)
   - Full name: Your name
   - Country: United States
   - Password: (create a strong password)

3. Click "Create account"

4. Verify your email (check inbox)

5. **IMPORTANT:** When asked "What best describes your business?"
   - Select: **"I'm creating a platform or marketplace"**
   - This enables Stripe Connect automatically

---

## ✅ Step 2: Enable Test Mode (DO THIS FIRST!)

1. In the top-right corner of Stripe Dashboard, find the toggle switch

2. Make sure it's set to **"Test mode"** (should see "Viewing test data")

3. **We'll use test mode first**, then switch to live mode after testing

---

## ✅ Step 3: Get Your API Keys (2 minutes)

1. Go to: **https://dashboard.stripe.com/test/apikeys**

2. You'll see two keys:

   **Publishable key** (starts with `pk_test_...`)
   - Copy this
   - This goes in your frontend (pay-rent.html)
   - Safe to expose publicly

   **Secret key** (starts with `sk_test_...`)
   - Click "Reveal test key"
   - Copy this
   - This goes in your backend (.env file)
   - NEVER expose this publicly!

3. **SEND ME THESE TWO KEYS** so I can integrate them

---

## ✅ Step 4: Enable Stripe Connect (3 minutes)

1. Go to: **https://dashboard.stripe.com/settings/connect**

2. Click "Get Started"

3. Fill in Connect settings:
   - **Platform name:** Campus Rentals
   - **Platform website:** (your Railway URL)
   - **Support email:** support@og-rooms.com
   - **Account type:** Standard (recommended)

4. Click "Save"

5. Copy your **Client ID** (starts with `ca_...`)
   - This is needed for Connect onboarding
   - Send this to me

---

## ✅ Step 5: Set Up Webhooks (3 minutes)

Webhooks let Stripe notify your server when payments happen.

1. Go to: **https://dashboard.stripe.com/test/webhooks**

2. Click "+ Add endpoint"

3. Endpoint URL:
   ```
   https://YOUR-RAILWAY-URL.up.railway.app/webhook/stripe
   ```
   (Replace YOUR-RAILWAY-URL with your actual Railway domain)

4. Description: "Campus Rentals payment notifications"

5. Events to listen for (click "Select events"):
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated`
   - `charge.refunded`

6. Click "Add endpoint"

7. Copy the **Signing secret** (starts with `whsec_...`)
   - Send this to me

---

## ✅ Step 6: Create .env File (1 minute)

On your computer, in the project folder:

1. Copy `.env.example` to `.env`

2. Fill in your keys:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_FROM_STEP3
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_FROM_STEP3
STRIPE_CLIENT_ID=ca_YOUR_ID_FROM_STEP4
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_FROM_STEP5

PORT=3000
PLATFORM_FEE_PERCENTAGE=12
```

3. **NEVER commit this file to Git!** (already in .gitignore)

---

## ✅ Step 7: Install Dependencies & Test Locally (5 minutes)

```bash
# Install Node.js packages
npm install

# Start the server
npm start
```

You should see:
```
╔═══════════════════════════════════════╗
║   Campus Rentals Payment Server      ║
║   Running on port 3000                ║
╚═══════════════════════════════════════╝

✅ Stripe configured
✅ Stripe Connect configured
❌ Webhook secret configured (will work after deployment)
```

Test it:
- Open http://localhost:3000/health
- Should see: `{"status":"OK", "stripe":true}`

---

## ✅ Step 8: Deploy to Railway (5 minutes)

1. Make sure your `.env` is NOT committed:
   ```bash
   git status
   # Should NOT see .env in the list
   ```

2. Add environment variables in Railway Dashboard:
   - Go to your Railway project
   - Click on your service
   - Go to "Variables" tab
   - Click "+ Add Variable"
   - Add all the variables from your .env file:
     - `STRIPE_SECRET_KEY`
     - `STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_CLIENT_ID`
     - `STRIPE_WEBHOOK_SECRET`
     - `PLATFORM_FEE_PERCENTAGE`

3. Deploy:
   ```bash
   git add .
   git commit -m "Add Stripe payment processing"
   git push
   railway up
   ```

4. Get your Railway URL:
   - In Railway dashboard: Settings > Networking
   - Copy your domain (e.g., `campus-rentals.up.railway.app`)

5. **UPDATE WEBHOOK URL** in Stripe:
   - Go back to: https://dashboard.stripe.com/test/webhooks
   - Click on your webhook
   - Update URL to: `https://YOUR-RAILWAY-URL.up.railway.app/webhook/stripe`

---

## ✅ Step 9: Test Payment Flow (10 minutes)

### Test as Tenant:

1. Go to: `https://YOUR-RAILWAY-URL.up.railway.app/pay-rent.html`

2. Fill in the form:
   - Property: Spacious 3B2B
   - Room: Shared
   - Name: Test User
   - Email: test@example.com

3. Click "Pay Securely with Stripe"

4. Use Stripe test card:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

5. You should see payment success!

### Verify Split Payment:

1. Go to: https://dashboard.stripe.com/test/payments

2. You should see the payment

3. Click on it to see details:
   - Total: $600.00
   - Application fee (your 12%): $72.00
   - Transfer to connected account: $528.00

---

## ✅ Step 10: Connect Owner Account (5 minutes)

Before owners can receive payments, they need to connect their bank account.

1. Login as owner: `/owner-login.html`

2. Go to dashboard

3. Click "Connect Bank Account" (or add this button if not there)

4. You'll be redirected to Stripe Connect

5. Fill in business information:
   - Business type: Individual or Company
   - Legal name
   - Date of birth
   - SSN/EIN
   - Bank account details

6. Stripe will verify (takes 1-2 business days)

7. Once verified, owner can receive payments!

---

## 🧪 Stripe Test Cards

Use these for testing different scenarios:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 9995` | Declined (insufficient funds) |
| `4000 0000 0000 9987` | Declined (lost card) |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |

---

## 🚀 Go Live Checklist

**DO NOT switch to live mode until:**

- [ ] Tested all payment flows in test mode
- [ ] Verified split payments work correctly (88/12)
- [ ] Tested owner Connect onboarding
- [ ] Tested failed payments
- [ ] Verified webhook events are received
- [ ] Reviewed Stripe's compliance checklist
- [ ] Added Terms of Service link to payment page
- [ ] Added Privacy Policy link
- [ ] Consulted with lawyer about payment processing compliance

**To go live:**

1. Complete Stripe account verification:
   - Provide business documents
   - Verify bank account
   - Complete compliance questionnaire

2. Switch to LIVE mode:
   - Toggle to "Live mode" in Stripe Dashboard
   - Get LIVE API keys (start with `sk_live_` and `pk_live_`)
   - Update environment variables
   - Update webhook URL

3. **Start small:**
   - Test with 1-2 friendly landlords first
   - Monitor first 10 transactions closely
   - Then scale up

---

## 📞 Need Help?

**Stripe Support:**
- Email: support@stripe.com
- Phone: (888) 926-2289
- Docs: https://stripe.com/docs
- Discord: https://discord.gg/stripe

**Issues?**
- Payment not working? Check Stripe dashboard logs
- Webhook not receiving? Check webhook logs in Stripe
- Split not working? Verify Connect account is set up
- Owner can't receive? Check their Connect verification status

---

## 🎯 Summary

Once all steps are complete, you'll have:

✅ Tenants can pay rent through your website
✅ Payments automatically split 88/12
✅ Owners receive money in their bank account
✅ You earn 12% on every transaction
✅ All payments tracked and documented
✅ Tax forms generated automatically

**Next: Send me your Stripe keys so I can integrate them!**
