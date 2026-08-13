require('dotenv').config();

// Razorpay Environment Safety Check
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv === 'development') {
    if (razorpayKeyId.startsWith('rzp_live_')) {
        console.error('====================================================');
        console.error('FATAL ERROR: Using LIVE Razorpay credentials in development environment!');
        console.error('Safety abort triggered. Please change RAZORPAY_KEY_ID to a test key.');
        console.error('====================================================');
        process.exit(1);
    }
    if (razorpayKeyId.startsWith('rzp_test_')) {
        console.log('🛡️  Razorpay Environment: TEST');
    }
} else if (nodeEnv === 'production') {
    if (razorpayKeyId.startsWith('rzp_test_')) {
        console.error('====================================================');
        console.error('FATAL ERROR: Using TEST Razorpay credentials in production environment!');
        console.error('Safety abort triggered. Please change RAZORPAY_KEY_ID to a live key.');
        console.error('====================================================');
        process.exit(1);
    }
    if (razorpayKeyId.startsWith('rzp_live_')) {
        console.log('⚠️  Razorpay Environment: LIVE');
    }
}
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(express.json());
const allowedOrigins = [
    "http://localhost:5173",
    "https://nammakada.vercel.app",
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or server-to-server)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS"
    ],
    allowedHeaders: [
        "Content-Type",
        "Authorization"
    ]
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('NammaKada API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
