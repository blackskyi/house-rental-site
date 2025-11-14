# Payment System - Quick Start

## 🎯 What You Have Now

✅ **Tenant Payment Portal** (`pay-rent.html`)
✅ **Owner Bank Connection** (`owner-connect-stripe.html`)
✅ **Payment Backend** (`server.js` with Express + Stripe)
✅ **Automated 88/12 Split** (Owner gets 88%, you get 12%)
✅ **Complete Documentation** (setup guides, architecture docs)

---

## ⚡ To Make It Work - 3 Steps:

### 1. Create Stripe Account (5 min)
```
Go to: https://dashboard.stripe.com/register
Select: "I'm creating a platform or marketplace"
Email: support@og-rooms.com
```

### 2. Get Your Keys (2 min)
```
Test Mode Keys (use these first):
- Publishable: pk_test_...
- Secret: sk_test_...
- Client ID: ca_...
- Webhook Secret: whsec_...

Get them from: https://dashboard.stripe.com/test/apikeys
```

### 3. Deploy to Railway (5 min)
```bash
# Install dependencies locally first
npm install

# Test locally
npm start
# Visit: http://localhost:3000/health

# Add environment variables in Railway Dashboard:
Railway → Your Service → Variables → Add:
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_CLIENT_ID=ca_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  PLATFORM_FEE_PERCENTAGE=12

# Deploy
git push
railway up
```

---

## 🧪 Test It:

### Test Payment (as Tenant):
1. Go to: `your-railway-url.com/pay-rent.html`
2. Select property and room
3. Enter details
4. Use test card: `4242 4242 4242 4242`
5. See payment success!

### Verify Split:
1. Go to: https://dashboard.stripe.com/test/payments
2. Click on the payment
3. See: Total $600 → Platform $72 (12%) → Owner $528 (88%)

---

## 📊 Your Business Model

**12% transaction fee on every rent payment**

### Example Revenue:
- Property #1: $1,200/month → You earn $144/month
- Property #2: $800/month → You earn $96/month
- Property #3: $1,000/month → You earn $120/month
- **Total: $360/month from 3 properties**

### Scale:
- 10 properties @ $1,000 avg = **$1,200/month**
- 25 properties = **$3,000/month**
- 50 properties = **$6,000/month**
- 100 properties = **$12,000/month**

---

## 📁 Files You Need to Know:

| File | Purpose |
|------|---------|
| `pay-rent.html` | Where tenants pay rent |
| `owner-connect-stripe.html` | Where owners connect bank |
| `server.js` | Backend that processes payments |
| `package.json` | Node.js dependencies |
| `.env` | Your secret keys (create this!) |

---

## 🚨 Important:

1. **Use TEST mode first!**
   - Test with fake cards
   - Don't collect real money yet
   - Verify split payments work

2. **Never commit .env file**
   - Already in .gitignore
   - Keep your keys secret!

3. **Add keys to Railway**
   - Don't deploy without environment variables
   - Railway Dashboard → Variables

4. **Update webhook URL**
   - After Railway deploy
   - Stripe Dashboard → Webhooks → Update URL

---

## 🎬 Watch It Work:

### Flow:
```
1. Tenant visits pay-rent.html
     ↓
2. Selects property & enters details
     ↓
3. Clicks "Pay with Stripe"
     ↓
4. Stripe processes payment
     ↓
5. Webhook notifies your server
     ↓
6. Server splits payment:
   - 88% to owner's bank
   - 12% to your Stripe balance
     ↓
7. Both get email receipts
```

---

## ✅ Checklist:

- [ ] Created Stripe account
- [ ] Got test API keys
- [ ] Created `.env` file with keys
- [ ] Installed dependencies (`npm install`)
- [ ] Tested locally (`npm start`)
- [ ] Added keys to Railway
- [ ] Deployed to Railway
- [ ] Updated webhook URL in Stripe
- [ ] Tested payment with test card
- [ ] Verified 88/12 split in Stripe dashboard

---

## 🆘 Stuck?

**Common Issues:**

1. **"Stripe is not defined"**
   - Add keys to pay-rent.html (line 157)
   - Update STRIPE_PUBLISHABLE_KEY

2. **"Payment not working"**
   - Check Railway logs
   - Verify environment variables are set
   - Check Stripe dashboard for errors

3. **"Owner can't receive payment"**
   - Owner must connect bank account first
   - Visit: owner-connect-stripe.html
   - Complete Stripe Connect onboarding

4. **"Webhook not working"**
   - Update webhook URL in Stripe Dashboard
   - Use your Railway URL + `/webhook/stripe`

---

## 📖 Full Docs:

- **STRIPE_SETUP_INSTRUCTIONS.md** - Detailed Stripe setup
- **PAYMENT_SYSTEM_SETUP_GUIDE.md** - Technical architecture
- **LAUNCH_STRATEGY.md** - Business model & marketing

---

## 🚀 Ready?

**Do this NOW:**
1. Create Stripe account
2. Send me your keys
3. I'll integrate them
4. Test payment
5. Go live!

Let's make money! 💰
