/**
 * Campus Rentals - Payment Processing Server
 * Handles Stripe payments with automated 88/12 split
 *
 * SETUP:
 * 1. npm install express stripe dotenv cors
 * 2. Create .env file with your Stripe keys
 * 3. Deploy to Railway or run locally: node server.js
 */

require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Log environment info
console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: PORT,
    hasStripe: !!process.env.STRIPE_SECRET_KEY
});

// Middleware
app.use(cors());
// Parse JSON for all routes EXCEPT webhook (webhook needs raw body for signature verification)
app.use((req, res, next) => {
    if (req.originalUrl === '/webhook/stripe') {
        next();
    } else {
        express.json()(req, res, next);
    }
});
app.use(express.static('.')); // Serve static files

// In-memory storage (replace with database in production)
// TODO: Move to PostgreSQL or MongoDB
const connectedOwners = {
    'sara-001': {
        stripeAccountId: 'acct_EXAMPLE', // Replace with real Stripe Connected Account ID
        email: 'support@og-rooms.com',
        name: 'Sara'
    }
};

// ===============================
// STRIPE CONNECT ENDPOINTS
// ===============================

/**
 * Redirect owner to Stripe Connect onboarding
 * GET /connect/stripe/authorize?ownerId=sara-001
 */
app.get('/connect/stripe/authorize', (req, res) => {
    const { ownerId } = req.query;

    if (!ownerId) {
        return res.status(400).json({ error: 'Owner ID required' });
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/connect/stripe/callback`;
    const state = Buffer.from(JSON.stringify({ ownerId, timestamp: Date.now() })).toString('base64');

    const stripeConnectUrl = `https://connect.stripe.com/oauth/authorize?` +
        `response_type=code&` +
        `client_id=${process.env.STRIPE_CLIENT_ID}&` +
        `scope=read_write&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${state}`;

    res.redirect(stripeConnectUrl);
});

/**
 * Handle Stripe Connect OAuth callback
 * GET /connect/stripe/callback?code=xxx&state=xxx
 */
app.get('/connect/stripe/callback', async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
        return res.redirect(`/owner-connect-stripe.html?error=${error}`);
    }

    try {
        // Decode state
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        const { ownerId } = stateData;

        // Exchange authorization code for connected account ID
        const response = await stripe.oauth.token({
            grant_type: 'authorization_code',
            code: code,
        });

        const stripeAccountId = response.stripe_user_id;

        // TODO: Save to database
        connectedOwners[ownerId] = {
            ...connectedOwners[ownerId],
            stripeAccountId: stripeAccountId,
            connectedAt: new Date().toISOString()
        };

        console.log(`Owner ${ownerId} connected Stripe account: ${stripeAccountId}`);

        // Redirect back to dashboard with success message
        res.redirect('/owner-dashboard.html?stripe_connected=true');

    } catch (err) {
        console.error('Stripe Connect error:', err);
        res.redirect(`/owner-connect-stripe.html?error=${err.message}`);
    }
});

// ===============================
// PAYMENT PROCESSING ENDPOINTS
// ===============================

/**
 * Create Stripe Checkout session for rent payment
 * POST /api/create-payment-session
 * Body: { propertyId, amount, tenantName, tenantEmail, roomType, paymentMonth, autopay }
 */
app.post('/api/create-payment-session', async (req, res) => {
    try {
        const {
            propertyId,
            propertyName,
            amount,
            tenantName,
            tenantEmail,
            tenantPhone,
            roomType,
            paymentMonth,
            autopay
        } = req.body;

        // Validate required fields
        if (!propertyId || !amount || !tenantEmail) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get property owner's Stripe account
        // TODO: Fetch from database based on propertyId
        const ownerId = 'sara-001'; // Hardcoded for MVP
        const owner = connectedOwners[ownerId];

        // TEMPORARY: Skip Connect requirement for testing basic payments
        // if (!owner || !owner.stripeAccountId) {
        //     return res.status(400).json({
        //         error: 'Property owner has not connected their bank account yet'
        //     });
        // }

        // Calculate platform fee (12% of rent)
        const platformFeeAmount = Math.round(amount * 0.12 * 100); // Convert to cents
        const totalAmountCents = amount * 100; // Convert to cents

        // Create Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: autopay ? 'subscription' : 'payment',

            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Rent Payment - ${propertyName}`,
                        description: `${roomType.charAt(0).toUpperCase() + roomType.slice(1)} room for ${paymentMonth}`,
                    },
                    unit_amount: totalAmountCents,
                    ...(autopay && { recurring: { interval: 'month' } })
                },
                quantity: 1,
            }],

            // TEMPORARY: Disabled platform fee split until Connect is set up
            // Platform fee - 12% goes to us, 88% to owner
            payment_intent_data: {
                // application_fee_amount: platformFeeAmount,
                // transfer_data: {
                //     destination: owner.stripeAccountId,
                // },
                metadata: {
                    propertyId,
                    propertyName,
                    tenantName,
                    tenantEmail,
                    tenantPhone,
                    roomType,
                    paymentMonth,
                    ownerId,
                    platformFee: platformFeeAmount / 100,
                }
            },

            customer_email: tenantEmail,

            success_url: `${req.protocol}://${req.get('host')}/payment-success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.protocol}://${req.get('host')}/pay-rent.html?canceled=true`,

            metadata: {
                propertyId,
                ownerId,
                tenantName,
                tenantEmail,
                paymentMonth,
            }
        });

        res.json({
            id: session.id,
            url: session.url
        });

    } catch (error) {
        console.error('Error creating payment session:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Retrieve payment session details
 * GET /api/payment-session/:sessionId
 */
app.get('/api/payment-session/:sessionId', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
        res.json(session);
    } catch (error) {
        console.error('Error retrieving session:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===============================
// WEBHOOK ENDPOINTS
// ===============================

/**
 * Stripe webhook handler
 * POST /webhook/stripe
 *
 * Handles events like:
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - account.updated (when owner completes Connect onboarding)
 */
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('✅ Payment succeeded:', paymentIntent.id);
            // TODO: Send confirmation emails to tenant and owner
            // TODO: Update payment records in database
            break;

        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('❌ Payment failed:', failedPayment.id);
            // TODO: Send failure notification to tenant
            break;

        case 'account.updated':
            const account = event.data.object;
            console.log('🔄 Connected account updated:', account.id);
            // TODO: Update owner verification status in database
            break;

        case 'charge.refunded':
            const refund = event.data.object;
            console.log('💸 Payment refunded:', refund.id);
            // TODO: Handle refund logic
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

// ===============================
// DASHBOARD API ENDPOINTS
// ===============================

/**
 * Get payment history for owner
 * GET /api/owner/:ownerId/payments
 */
app.get('/api/owner/:ownerId/payments', async (req, res) => {
    try {
        const { ownerId } = req.params;
        const owner = connectedOwners[ownerId];

        if (!owner || !owner.stripeAccountId) {
            return res.status(404).json({ error: 'Owner not found' });
        }

        // Fetch transfers to owner's account
        const transfers = await stripe.transfers.list({
            destination: owner.stripeAccountId,
            limit: 100,
        });

        res.json({ payments: transfers.data });

    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===============================
// HEALTH CHECK
// ===============================

app.get('/health', (req, res) => {
    console.log('Health check received');
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        stripe: !!process.env.STRIPE_SECRET_KEY,
        uptime: process.uptime()
    });
});

// ===============================
// START SERVER
// ===============================

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ╔═══════════════════════════════════════╗
    ║   Campus Rentals Payment Server      ║
    ║   Running on port ${PORT}              ║
    ╚═══════════════════════════════════════╝

    🔗 Endpoints:
       - POST /api/create-payment-session
       - GET  /connect/stripe/authorize
       - POST /webhook/stripe
       - GET  /api/owner/:id/payments
       - GET  /health

    ${process.env.STRIPE_SECRET_KEY ? '✅' : '❌'} Stripe configured
    ${process.env.STRIPE_CLIENT_ID ? '✅' : '❌'} Stripe Connect configured
    ${process.env.STRIPE_WEBHOOK_SECRET ? '✅' : '❌'} Webhook secret configured
    `);
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

module.exports = app;
