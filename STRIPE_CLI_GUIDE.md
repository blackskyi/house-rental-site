# Stripe CLI - Local Development Guide

## 🎯 Why Use Stripe CLI?

The Stripe CLI makes local development **much easier**:
- ✅ Test webhooks without deploying to Railway
- ✅ Trigger payment events instantly
- ✅ Debug payment flows in real-time
- ✅ View detailed API logs
- ✅ No need to constantly redeploy

---

## 📥 Installation

### macOS:
```bash
brew install stripe/stripe-cli/stripe
```

### Windows (with Scoop):
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

### Linux:
```bash
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_amd64.tar.gz
tar -xvf stripe_linux_amd64.tar.gz
sudo mv stripe /usr/local/bin/
```

### Verify Installation:
```bash
stripe --version
# Should output: stripe version X.X.X
```

---

## 🚀 First-Time Setup (2 minutes)

### 1. Login to Stripe:
```bash
stripe login
```
- Opens browser
- Click "Allow access"
- Returns to terminal: "Done! The Stripe CLI is configured for..."

### 2. Verify Connection:
```bash
stripe config --list
```
Output:
```
test_mode_api_key = sk_test_...
device_name = your-computer
```

---

## 💻 Local Development Workflow

### Setup (one time):

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env` file:**
```bash
cp .env.example .env
```

3. **Add your Stripe test keys to `.env`:**
```env
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_CLIENT_ID=ca_YOUR_ID
STRIPE_WEBHOOK_SECRET=whsec_WILL_GET_FROM_CLI
PORT=3000
PLATFORM_FEE_PERCENTAGE=12
```

---

## 🏃 Daily Development Workflow

### Terminal 1 - Start Server:
```bash
npm start
```
Output:
```
╔═══════════════════════════════════════╗
║   Campus Rentals Payment Server      ║
║   Running on port 3000                ║
╚═══════════════════════════════════════╝
```

### Terminal 2 - Forward Webhooks:
```bash
stripe listen --forward-to localhost:3000/webhook/stripe
```
Output:
```
> Ready! Your webhook signing secret is whsec_abc123xyz...
> 2025-01-10 10:30:15   --> payment_intent.succeeded [evt_abc123]
```

**IMPORTANT:** Copy that `whsec_...` secret to your `.env` file!

### Terminal 3 - Run Commands:
```bash
# Test successful payment
stripe trigger payment_intent.succeeded

# Test failed payment
stripe trigger payment_intent.payment_failed

# Create test customer
stripe customers create --email test@example.com
```

---

## 🧪 Testing Payment Flow Locally

### Complete Test:

1. **Start server + webhook forwarding:**
```bash
# Terminal 1
npm start

# Terminal 2
stripe listen --forward-to localhost:3000/webhook/stripe
```

2. **Open payment page:**
```bash
open http://localhost:3000/pay-rent.html
```

3. **Fill form and pay:**
- Property: Spacious 3B2B
- Room: Shared ($600)
- Name: Test User
- Email: test@example.com
- Card: `4242 4242 4242 4242`
- Expiry: `12/25`
- CVC: `123`

4. **Watch the magic:**
```
Terminal 1 (Server):
  POST /api/create-payment-session 200
  ✅ Payment session created

Terminal 2 (Webhooks):
  --> checkout.session.completed [evt_xxx]
  --> payment_intent.succeeded [evt_yyy]
  --> charge.succeeded [evt_zzz]
```

5. **Verify in Stripe Dashboard:**
```bash
# Or use CLI to check
stripe payment_intents list --limit 1
```

---

## 🎯 Useful Stripe CLI Commands

### Testing:

```bash
# Trigger successful payment
stripe trigger payment_intent.succeeded

# Trigger failed payment
stripe trigger payment_intent.payment_failed

# Trigger refund
stripe trigger charge.refunded

# Trigger Connect account update
stripe trigger account.updated
```

### Data Management:

```bash
# List recent payments
stripe payment_intents list --limit 5

# Get payment details
stripe payment_intents retrieve pi_xxxxx

# List customers
stripe customers list --limit 5

# Create test customer
stripe customers create \
  --email tenant@example.com \
  --name "Test Tenant" \
  --phone "+15555551234"
```

### Connected Accounts:

```bash
# List connected accounts (owners)
stripe accounts list --limit 5

# Get account details
stripe accounts retrieve acct_xxxxx

# Check account balance
stripe balance retrieve --stripe-account acct_xxxxx
```

### Transfers (Payouts to Owners):

```bash
# List transfers
stripe transfers list --limit 10

# Check specific transfer
stripe transfers retrieve tr_xxxxx
```

### Logs & Debugging:

```bash
# Live tail of all API requests
stripe logs tail

# Filter specific events
stripe logs tail --filter-event payment_intent.succeeded

# Filter by status
stripe logs tail --filter-status 400

# Show last 100 requests
stripe logs tail --limit 100
```

---

## 🐛 Debugging Common Issues

### Issue: "Webhook signature verification failed"

**Solution:**
```bash
# Get new webhook secret
stripe listen --forward-to localhost:3000/webhook/stripe --print-secret

# Copy the whsec_... secret to .env
# Restart your server
```

### Issue: "No such payment_intent"

**Check payment status:**
```bash
stripe payment_intents list --limit 5
stripe payment_intents retrieve pi_xxxxx
```

### Issue: "No such connected account"

**List accounts:**
```bash
stripe accounts list
```

### Issue: "Transfer failed"

**Check transfer:**
```bash
stripe transfers retrieve tr_xxxxx
```

---

## 🚀 Advanced: Simulate Connected Account Flow

### 1. Create Test Connected Account:
```bash
stripe accounts create \
  --type=standard \
  --country=US \
  --email=owner@example.com
```

Output: `acct_xxxxx`

### 2. Update Your Code:
In `server.js`, temporarily hardcode this account ID:
```javascript
const owner = {
  stripeAccountId: 'acct_xxxxx' // from step 1
};
```

### 3. Create Payment with Split:
```bash
stripe payment_intents create \
  --amount=120000 \
  --currency=usd \
  --payment-method-types[]=card \
  --application-fee-amount=14400 \
  --transfer-data[destination]=acct_xxxxx
```

### 4. Simulate Payment:
```bash
# This will show the full split in action
stripe trigger payment_intent.succeeded
```

---

## 📊 Monitor Your Platform

### Real-time Dashboard:
```bash
# Watch all activity
stripe logs tail

# Filter payments only
stripe logs tail --filter-event payment_intent

# Filter Connect events
stripe logs tail --filter-event account
```

### Quick Stats:
```bash
# Today's payments
stripe charges list --created[gte]=$(date -u +%s -d '1 day ago')

# Total revenue (platform fees)
stripe balance_transactions list \
  --type=application_fee \
  --limit=100
```

---

## 🎓 Learning Resources

### Interactive Tutorial:
```bash
# Stripe provides guided tutorials
stripe samples list
stripe samples create
```

### Test Mode Best Practices:

1. **Always use test keys** (start with `sk_test_` and `pk_test_`)
2. **Use test cards:** `4242 4242 4242 4242`
3. **Test failures:** Use card `4000 0000 0000 9995` (declined)
4. **Test 3D Secure:** Use card `4000 0025 0000 3155`
5. **Never mix test and live mode!**

---

## 🔄 Workflow Comparison

### Without Stripe CLI:
```
1. Write code
2. Commit to Git
3. Deploy to Railway
4. Wait for deployment
5. Test on live URL
6. Check Stripe Dashboard
7. Find bug
8. Repeat steps 1-7
⏰ Time per iteration: ~5-10 minutes
```

### With Stripe CLI:
```
1. Write code
2. Test locally with CLI
3. Trigger webhooks instantly
4. See logs in real-time
5. Fix bugs immediately
6. Only deploy when ready
⏰ Time per iteration: ~30 seconds
```

**100x faster development! 🚀**

---

## ✅ Daily Checklist

Every time you work on payments:

```bash
# 1. Start server
npm start

# 2. Forward webhooks
stripe listen --forward-to localhost:3000/webhook/stripe

# 3. Test payment flow
open http://localhost:3000/pay-rent.html

# 4. Monitor logs
stripe logs tail
```

---

## 🎯 Summary

**Stripe CLI gives you:**
- ✅ Instant webhook testing
- ✅ Real-time debugging
- ✅ Faster development
- ✅ Better error messages
- ✅ No need to redeploy constantly

**Install it now:**
```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3000/webhook/stripe
```

Happy coding! 🎉
